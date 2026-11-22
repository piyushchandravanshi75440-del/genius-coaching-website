import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import {
  type BoardContext,
  type ChatHistoryTurn,
  GEMINI_TEACHER_MODEL,
  runTeacherAssistantTurn,
} from './server/geminiTeacher.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8')) as {
  projectId: string;
  apiKey: string;
  firestoreDatabaseId: string;
};

const AUTHORIZED_ADMIN_EMAIL = 'piyushchandravanshi75440@gmail.com';
const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
function normalizeSupabaseOrigin(rawUrl: string | undefined): string {
  const fallback = 'https://ippgqaxdoiowkogowejp.supabase.co';
  const trimmed = (rawUrl || fallback).trim().replace(/\/+$/, '');
  if (!trimmed) return fallback;
  // If user configured only the Supabase project ref (e.g. "ippgqaxdoiowkogowejp")
  if (/^[a-z0-9-]+$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (!parsed.hostname.includes('.')) {
      return `https://${parsed.hostname}.supabase.co`;
    }
    return parsed.origin;
  } catch {
    return fallback;
  }
}

const SUPABASE_URL = normalizeSupabaseOrigin(process.env.SUPABASE_URL);
const SUPABASE_BUCKET = (process.env.SUPABASE_STORAGE_BUCKET || 'gcc-study-materials').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

function isValidMaterialId(id: unknown): id is string {
  return (
    typeof id === 'string' &&
    id.length >= 4 &&
    id.length <= 128 &&
    /^[a-zA-Z0-9_-]+$/.test(id)
  );
}

function isValidStoragePath(p: unknown): p is string {
  return (
    typeof p === 'string' &&
    /^study-materials\/[a-zA-Z0-9_-]{4,128}\/document\.pdf$/.test(p)
  );
}

interface VerifiedAdmin {
  uid: string;
  email: string;
}

/**
 * Verifies a Firebase ID token via Google Identity Toolkit and strictly enforces
 * that the user is the single authorized admin with a verified email.
 */
async function verifyFirebaseAdminToken(
  authHeader: string | undefined,
  firebaseTokenHeader?: string | undefined
): Promise<VerifiedAdmin | null> {
  const rawToken =
    firebaseTokenHeader?.trim() ||
    (authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '');
  if (!rawToken) return null;
  const idToken = rawToken;

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      users?: Array<{ localId?: string; email?: string; emailVerified?: boolean }>;
    };
    const user = data.users?.[0];
    if (!user?.email || user.emailVerified !== true) return null;
    if (user.email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) return null;
    return { uid: user.localId || '', email: user.email };
  } catch {
    return null;
  }
}

/**
 * Reads a studyMaterial document from Firestore REST API to verify status & storagePath.
 */
async function fetchMaterialFromFirestore(
  materialId: string,
  idToken?: string
): Promise<{ status: string; storagePath: string } | null> {
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    firebaseConfig.projectId
  )}/databases/${encodeURIComponent(dbId)}/documents/studyMaterials/${encodeURIComponent(
    materialId
  )}`;

  const headers: Record<string, string> = {};
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) return null;

  const doc = (await res.json()) as {
    fields?: {
      status?: { stringValue?: string };
      storagePath?: { stringValue?: string };
    };
  };
  const status = doc.fields?.status?.stringValue || '';
  const storagePath =
    doc.fields?.storagePath?.stringValue || `study-materials/${materialId}/document.pdf`;

  return { status, storagePath };
}

function buildAbsoluteSupabaseUrl(relativeOrAbsolute: string): string {
  if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
    return relativeOrAbsolute;
  }
  const normalizedPath = relativeOrAbsolute.startsWith('/')
    ? relativeOrAbsolute
    : `/${relativeOrAbsolute}`;
  if (normalizedPath.startsWith('/storage/v1')) {
    return `${SUPABASE_URL}${normalizedPath}`;
  }
  return `${SUPABASE_URL}/storage/v1${normalizedPath}`;
}

const CAPACITOR_AND_LOCAL_ORIGINS = new Set([
  'https://localhost',
  'capacitor://localhost',
  'http://localhost',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const EXTRA_CORS_ORIGINS = new Set(
  (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean)
);

function isAllowedCorsOrigin(originHeader: string | undefined, hostHeader: string | undefined): string | null {
  if (!originHeader) return null;
  const normalized = originHeader.trim().replace(/\/+$/, '');
  if (!normalized) return null;

  if (CAPACITOR_AND_LOCAL_ORIGINS.has(normalized) || EXTRA_CORS_ORIGINS.has(normalized)) {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);
    if (hostHeader && parsed.host.toLowerCase() === hostHeader.toLowerCase()) {
      return parsed.origin;
    }
    if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.run.app')) {
      return parsed.origin;
    }
  } catch {
    return null;
  }

  return null;
}

function createCorsMiddleware(allowedMethods: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const origin = isAllowedCorsOrigin(req.headers.origin, req.headers.host);
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', allowedMethods);
    res.setHeader(
      'Access-Control-Allow-Headers',
      'authorization, x-firebase-token, content-type, apikey'
    );
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // CORS & OPTIONS preflight support for /api/storage/* and /api/ai/*
  app.use('/api/storage', createCorsMiddleware('GET, POST, OPTIONS'));
  app.use('/api/ai', createCorsMiddleware('GET, POST, OPTIONS'));

  // Safe health/config diagnostic endpoint (never exposes secrets or tokens)
  app.get('/api/storage/health', (_req, res) => {
    res.json({
      ok: true,
      backend: 'express',
      supabaseOrigin: SUPABASE_URL,
      bucket: SUPABASE_BUCKET,
      serviceRoleConfigured: Boolean(SUPABASE_SERVICE_ROLE_KEY),
    });
  });

  // 1. Admin-only: Generate a signed upload URL for Supabase private bucket
  app.post('/api/storage/sign-upload', async (req, res) => {
    try {
      const admin = await verifyFirebaseAdminToken(
        req.headers.authorization,
        req.headers['x-firebase-token'] as string | undefined
      );
      if (!admin) {
        res.status(403).json({
          error: 'Access Denied. Only the authorized GCC administrator can upload study materials.',
        });
        return;
      }

      if (!SUPABASE_SERVICE_ROLE_KEY) {
        res.status(503).json({
          error:
            'Supabase Storage is not yet configured on the server. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
        });
        return;
      }

      const { materialId, contentType, fileSize } = req.body as {
        materialId?: string;
        contentType?: string;
        fileSize?: number;
      };

      if (!isValidMaterialId(materialId)) {
        res.status(400).json({ error: 'Invalid materialId format.' });
        return;
      }

      if (contentType && contentType !== 'application/pdf') {
        res.status(400).json({ error: 'Only PDF files (application/pdf) are allowed.' });
        return;
      }

      if (typeof fileSize === 'number' && (fileSize <= 0 || fileSize > MAX_PDF_SIZE_BYTES)) {
        res.status(400).json({ error: 'PDF file size must be between 1 byte and 20 MB.' });
        return;
      }

      const storagePath = `study-materials/${materialId}/document.pdf`;
      const signEndpoint = `${SUPABASE_URL}/storage/v1/object/upload/sign/${encodeURIComponent(
        SUPABASE_BUCKET
      )}/${storagePath}`;

      const supaRes = await fetch(signEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          'x-upsert': 'true',
        },
      });

      const supaText = await supaRes.text();
      console.log(
        `[storage:sign-upload] supabase status=${supaRes.status} bucket=${SUPABASE_BUCKET} path=${storagePath}`
      );
      if (!supaRes.ok) {
        console.error(`[storage:sign-upload] supabase error body: ${supaText.slice(0, 300)}`);
        res.status(supaRes.status).json({
          error: `Supabase Storage sign-upload failed (${supaRes.status}): ${supaText}`,
        });
        return;
      }

      const supaData = JSON.parse(supaText) as { url?: string; signedURL?: string; token?: string };
      const rawUrl = supaData.url || supaData.signedURL;
      if (!rawUrl) {
        res.status(502).json({ error: 'Supabase did not return a signed upload URL.' });
        return;
      }

      const signedUrl = buildAbsoluteSupabaseUrl(rawUrl);
      res.json({
        signedUrl,
        storagePath,
        bucket: SUPABASE_BUCKET,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected server error during sign-upload.';
      const cause =
        err instanceof Error && 'cause' in err && err.cause
          ? ` (cause: ${String(err.cause)})`
          : '';
      console.error(`[storage:sign-upload] exception: ${msg}${cause}`);
      res.status(500).json({ error: `[Express -> Supabase] ${msg}${cause}` });
    }
  });

  // 2. Admin-only: Safely delete a PDF from Supabase private bucket
  app.post('/api/storage/delete', async (req, res) => {
    try {
      const admin = await verifyFirebaseAdminToken(
        req.headers.authorization,
        req.headers['x-firebase-token'] as string | undefined
      );
      if (!admin) {
        res.status(403).json({
          error: 'Access Denied. Only the authorized GCC administrator can delete study materials.',
        });
        return;
      }

      if (!SUPABASE_SERVICE_ROLE_KEY) {
        res.status(503).json({
          error:
            'Supabase Storage is not yet configured on the server. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
        });
        return;
      }

      const { storagePath } = req.body as { storagePath?: string };
      if (!isValidStoragePath(storagePath)) {
        res.status(400).json({ error: 'Invalid storagePath.' });
        return;
      }

      const deleteEndpoint = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(
        SUPABASE_BUCKET
      )}/${storagePath}`;

      const supaRes = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
        },
      });

      // 404 is safe to treat as already deleted
      if (!supaRes.ok && supaRes.status !== 404) {
        const supaText = await supaRes.text();
        res.status(supaRes.status).json({
          error: `Supabase Storage delete failed (${supaRes.status}): ${supaText}`,
        });
        return;
      }

      res.json({ deleted: true, storagePath });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected server error during delete.';
      res.status(500).json({ error: msg });
    }
  });

  // 3. Public (published only) & Admin (all): Generate a temporary signed download URL
  app.post('/api/storage/sign-download', async (req, res) => {
    try {
      if (!SUPABASE_SERVICE_ROLE_KEY) {
        res.status(503).json({
          error:
            'Supabase Storage is not yet configured on the server. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
        });
        return;
      }

      const { materialId } = req.body as { materialId?: string };
      if (!isValidMaterialId(materialId)) {
        res.status(400).json({ error: 'Invalid materialId.' });
        return;
      }

      const rawAuth = req.headers.authorization;
      const firebaseTokenHeader = req.headers['x-firebase-token'] as string | undefined;
      const bearerToken =
        firebaseTokenHeader?.trim() ||
        (rawAuth?.startsWith('Bearer ') ? rawAuth.slice('Bearer '.length).trim() : undefined);
      const admin = await verifyFirebaseAdminToken(rawAuth, firebaseTokenHeader);

      const material = await fetchMaterialFromFirestore(materialId, admin ? bearerToken : undefined);
      if (!material) {
        res.status(404).json({ error: 'Study material not found or not published.' });
        return;
      }

      if (material.status !== 'published' && !admin) {
        res.status(403).json({ error: 'This study material is not published for public access.' });
        return;
      }

      if (!isValidStoragePath(material.storagePath)) {
        res.status(400).json({ error: 'Invalid storage path stored on material record.' });
        return;
      }

      const expiresIn = 300; // 5 minutes temporary link
      const signEndpoint = `${SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(
        SUPABASE_BUCKET
      )}/${material.storagePath}`;

      const supaRes = await fetch(signEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn }),
      });

      const supaText = await supaRes.text();
      if (!supaRes.ok) {
        res.status(supaRes.status).json({
          error: `Unable to generate temporary PDF link (${supaRes.status}): ${supaText}`,
        });
        return;
      }

      const supaData = JSON.parse(supaText) as { signedURL?: string; signedUrl?: string };
      const rawSignedUrl = supaData.signedURL || supaData.signedUrl;
      if (!rawSignedUrl) {
        res.status(502).json({ error: 'Supabase did not return a signed download URL.' });
        return;
      }

      res.json({
        signedUrl: buildAbsoluteSupabaseUrl(rawSignedUrl),
        expiresIn,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected server error generating PDF link.';
      res.status(500).json({ error: msg });
    }
  });

  // 4. Teacher-Only: GCC AI Teacher Assistant health & Gemini turn endpoints
  app.get('/api/ai/health', async (req, res) => {
    const admin = await verifyFirebaseAdminToken(
      req.headers.authorization,
      req.headers['x-firebase-token'] as string | undefined
    );
    if (!admin) {
      res.status(403).json({
        error: 'Access Denied. Teacher authentication required.',
      });
      return;
    }

    res.json({
      ok: true,
      model: GEMINI_TEACHER_MODEL,
      geminiConfigured: Boolean((process.env.GEMINI_API_KEY || '').trim()),
    });
  });

  app.post('/api/ai/teacher-assistant', async (req, res) => {
    try {
      const admin = await verifyFirebaseAdminToken(
        req.headers.authorization,
        req.headers['x-firebase-token'] as string | undefined
      );
      if (!admin) {
        res.status(403).json({
          error: 'Access Denied. Only the authorized GCC teacher can use the AI Assistant.',
        });
        return;
      }

      const body = (req.body || {}) as {
        message?: unknown;
        language?: unknown;
        history?: unknown;
        boardContext?: unknown;
      };

      const message = typeof body.message === 'string' ? body.message : '';
      if (!message.trim()) {
        res.status(400).json({ error: 'Please enter or speak a teaching question or command.' });
        return;
      }

      const language: 'hi-IN' | 'en-IN' = body.language === 'en-IN' ? 'en-IN' : 'hi-IN';
      const history: ChatHistoryTurn[] = Array.isArray(body.history)
        ? body.history
            .filter(
              (item): item is ChatHistoryTurn =>
                Boolean(item) &&
                typeof item === 'object' &&
                (item.role === 'user' || item.role === 'model') &&
                typeof item.text === 'string'
            )
            .slice(-10)
        : [];

      const rawContext =
        body.boardContext && typeof body.boardContext === 'object'
          ? (body.boardContext as Partial<BoardContext>)
          : {};
      const allowedViews = new Set(['empty', 'lesson', 'formula', 'diagram', 'mcq']);
      const boardContext: BoardContext = {
        activeView:
          typeof rawContext.activeView === 'string' && allowedViews.has(rawContext.activeView)
            ? (rawContext.activeView as BoardContext['activeView'])
            : 'empty',
        lessonTitle: typeof rawContext.lessonTitle === 'string' ? rawContext.lessonTitle : undefined,
        chapter: typeof rawContext.chapter === 'string' ? rawContext.chapter : undefined,
        subject: typeof rawContext.subject === 'string' ? rawContext.subject : undefined,
        classLevel: typeof rawContext.classLevel === 'string' ? rawContext.classLevel : undefined,
        currentSlideIndex:
          typeof rawContext.currentSlideIndex === 'number' ? rawContext.currentSlideIndex : 0,
        totalSlides: typeof rawContext.totalSlides === 'number' ? rawContext.totalSlides : 0,
      };

      const result = await runTeacherAssistantTurn({
        message,
        language,
        history,
        boardContext,
      });

      res.json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate Gemini teaching response.';
      const status = msg.includes('GEMINI_API_KEY') ? 503 : 500;
      console.error(`[ai:teacher-assistant] error (${status}): ${msg}`);
      res.status(status).json({ error: msg });
    }
  });

  // Vite middleware for development; static dist serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`GCC server running on http://0.0.0.0:${port}`);
  });
}

startServer();
