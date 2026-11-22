import { buildApiUrl, getFetchCredentialsMode } from './apiConfig';

export const SUPABASE_PROJECT_URL = 'https://ippgqaxdoiowkogowejp.supabase.co';
export const SUPABASE_STORAGE_BUCKET = 'gcc-study-materials';

function buildEndpoint(action: 'sign-upload' | 'delete' | 'sign-download'): string {
  return buildApiUrl(`/api/storage/${action}`);
}

function buildHeaders(idToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (idToken) {
    headers['x-firebase-token'] = idToken;
    headers.Authorization = `Bearer ${idToken}`;
  }
  return headers;
}

async function safeFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      credentials: getFetchCredentialsMode(),
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    console.error(`[supabaseStorage] Browser -> Express fetch failed for ${url}:`, raw);
    throw new Error(
      `[Browser -> Express] Unable to reach ${url}: ${raw}. If you are on a published/shared URL, please republish the app so the latest Express backend routes are deployed.`
    );
  }
}

async function parseJsonError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `${fallback} (HTTP ${res.status})`;
  } catch {
    return `${fallback} (HTTP ${res.status})`;
  }
}

export interface UploadPdfParams {
  materialId: string;
  file: File;
  idToken: string;
  onProgress?: (percent: number) => void;
}

/**
 * Requests a server-authorized Supabase signed upload URL (after verifying the Firebase admin token),
 * then uploads the PDF directly to Supabase Storage with real-time XMLHttpRequest progress.
 */
export async function uploadPdfToSupabase({
  materialId,
  file,
  idToken,
  onProgress,
}: UploadPdfParams): Promise<{ storagePath: string }> {
  const signRes = await safeFetch(buildEndpoint('sign-upload'), {
    method: 'POST',
    headers: buildHeaders(idToken),
    body: JSON.stringify({
      materialId,
      contentType: 'application/pdf',
      fileSize: file.size,
    }),
  });

  if (!signRes.ok) {
    throw new Error(await parseJsonError(signRes, 'Failed to authorize PDF upload'));
  }

  const { signedUrl, storagePath } = (await signRes.json()) as {
    signedUrl: string;
    storagePath: string;
  };

  if (!signedUrl || !storagePath) {
    throw new Error('Server did not return a valid Supabase signed upload URL.');
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/pdf');
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.timeout = 120000; // 2 minutes for large PDFs up to 20 MB

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const pct = Math.min(100, Math.round((event.loaded / event.total) * 100));
        onProgress?.(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(
          new Error(
            `Supabase Storage upload failed (HTTP ${xhr.status}). Please verify bucket "${SUPABASE_STORAGE_BUCKET}" exists and try again.`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          'Network error while uploading PDF to Supabase Storage. Please check your internet connection and retry.'
        )
      );
    };

    xhr.ontimeout = () => {
      reject(new Error('PDF upload timed out. Please check your connection and click Retry Upload.'));
    };

    xhr.send(file);
  });

  return { storagePath };
}

/**
 * Deletes a PDF from the private Supabase Storage bucket using a verified Firebase admin token.
 */
export async function deletePdfFromSupabase(storagePath: string, idToken: string): Promise<void> {
  const res = await safeFetch(buildEndpoint('delete'), {
    method: 'POST',
    headers: buildHeaders(idToken),
    body: JSON.stringify({ storagePath }),
  });

  if (!res.ok) {
    throw new Error(await parseJsonError(res, 'Failed to delete PDF from Supabase Storage'));
  }
}

/**
 * Generates a temporary (5-minute) signed download URL for a published study material
 * (or any material when called by the verified admin).
 */
export async function getTemporaryPdfUrl(
  materialId: string,
  idToken?: string
): Promise<{ signedUrl: string; expiresIn: number }> {
  const res = await safeFetch(buildEndpoint('sign-download'), {
    method: 'POST',
    headers: buildHeaders(idToken),
    body: JSON.stringify({ materialId }),
  });

  if (!res.ok) {
    throw new Error(await parseJsonError(res, 'Unable to generate secure PDF download link'));
  }

  return (await res.json()) as { signedUrl: string; expiresIn: number };
}
