// Optional Supabase Edge Function mirror of /api/storage/*
// Deploy with: supabase functions deploy study-material-storage --project-ref ippgqaxdoiowkogowejp
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_DATABASE_ID

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const AUTHORIZED_ADMIN_EMAIL = 'piyushchandravanshi75440@gmail.com';
const SUPABASE_URL = (Deno.env.get('SUPABASE_URL') || 'https://ippgqaxdoiowkogowejp.supabase.co').replace(/\/+$/, '');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SUPABASE_BUCKET = 'gcc-study-materials';
const FIREBASE_API_KEY = Deno.env.get('FIREBASE_API_KEY') || '';
const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') || 'long-airline-bv9wh';
const FIREBASE_DATABASE_ID =
  Deno.env.get('FIREBASE_DATABASE_ID') ||
  'ai-studio-geniuscoachingce-6b6bad87-0d61-49d7-aed3-85940c1bf243';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-firebase-token, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function verifyAdmin(req: Request): Promise<boolean> {
  const customToken = req.headers.get('x-firebase-token')?.trim();
  const authHeader = req.headers.get('authorization');
  const idToken =
    customToken ||
    (authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '');
  if (!idToken || !FIREBASE_API_KEY) return false;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!res.ok) return false;
  const data = await res.json();
  const user = data.users?.[0];
  return (
    user?.emailVerified === true &&
    typeof user?.email === 'string' &&
    user.email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { status: 200, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: 'SUPABASE_SERVICE_ROLE_KEY secret is not configured on Edge Function.' }, 503);
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const body = await req.json().catch(() => ({}));

  if (action === 'sign-upload') {
    if (!(await verifyAdmin(req))) {
      return json({ error: 'Access Denied.' }, 403);
    }
    const materialId = String(body.materialId || '');
    if (!/^[a-zA-Z0-9_-]{4,128}$/.test(materialId)) {
      return json({ error: 'Invalid materialId' }, 400);
    }
    const storagePath = `study-materials/${materialId}/document.pdf`;
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/upload/sign/${SUPABASE_BUCKET}/${storagePath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          'x-upsert': 'true',
        },
      }
    );
    const data = await res.json();
    if (!res.ok) return json({ error: data.message || 'Sign upload failed' }, res.status);
    return json({
      signedUrl: `${SUPABASE_URL}/storage/v1${data.url}`,
      storagePath,
    });
  }

  if (action === 'delete') {
    if (!(await verifyAdmin(req))) {
      return json({ error: 'Access Denied.' }, 403);
    }
    const storagePath = String(body.storagePath || '');
    if (!/^study-materials\/[a-zA-Z0-9_-]{4,128}\/document\.pdf$/.test(storagePath)) {
      return json({ error: 'Invalid storagePath' }, 400);
    }
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${storagePath}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
        },
      }
    );
    if (!res.ok && res.status !== 404) {
      return json({ error: 'Delete failed' }, res.status);
    }
    return json({ deleted: true, storagePath });
  }

  if (action === 'sign-download') {
    const materialId = String(body.materialId || '');
    if (!/^[a-zA-Z0-9_-]{4,128}$/.test(materialId)) {
      return json({ error: 'Invalid materialId' }, 400);
    }
    const isAdmin = await verifyAdmin(req);
    const fsRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIREBASE_DATABASE_ID}/documents/studyMaterials/${materialId}`,
      isAdmin && req.headers.get('authorization')
        ? { headers: { Authorization: req.headers.get('authorization')! } }
        : undefined
    );
    if (!fsRes.ok) return json({ error: 'Material not found' }, 404);
    const doc = await fsRes.json();
    const status = doc.fields?.status?.stringValue || '';
    const storagePath =
      doc.fields?.storagePath?.stringValue || `study-materials/${materialId}/document.pdf`;
    if (status !== 'published' && !isAdmin) {
      return json({ error: 'Material is not published' }, 403);
    }
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/${SUPABASE_BUCKET}/${storagePath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 300 }),
      }
    );
    const data = await res.json();
    if (!res.ok) return json({ error: data.message || 'Sign download failed' }, res.status);
    return json({
      signedUrl: `${SUPABASE_URL}/storage/v1${data.signedURL}`,
      expiresIn: 300,
    });
  }

  return json({ error: 'Unknown action' }, 400);
});
