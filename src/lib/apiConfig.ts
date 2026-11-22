/**
 * Shared API & Runtime Bridge for GCC Website and future GCC AI Android App (Capacitor).
 *
 * - On normal web deployments, VITE_API_BASE_URL is empty so all /api/* requests
 *   use relative same-origin paths (100% preserving existing Cloud Run web behavior).
 * - On Android Capacitor builds, VITE_API_BASE_URL points to the deployed Cloud Run
 *   HTTPS origin so the WebView communicates securely over HTTPS without bundling secrets.
 */

const LOCAL_DEV_HOSTS = new Set(['localhost', '127.0.0.1', '10.0.2.2']);

function normalizeApiBaseUrl(rawUrl: string | undefined): string {
  const trimmed = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    const isLocalHost = LOCAL_DEV_HOSTS.has(parsed.hostname.toLowerCase());
    if (parsed.protocol === 'https:') {
      return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
    }
    if (parsed.protocol === 'http:' && isLocalHost) {
      return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
    }
    console.warn(
      `[apiConfig] Ignoring non-HTTPS VITE_API_BASE_URL "${trimmed}". Only HTTPS remote backends are permitted.`
    );
    return '';
  } catch {
    console.warn(`[apiConfig] Invalid VITE_API_BASE_URL "${trimmed}", falling back to same-origin.`);
    return '';
  }
}

const RESOLVED_API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

export function getApiBaseUrl(): string {
  return RESOLVED_API_BASE_URL;
}

export function isCrossOriginApi(): boolean {
  return RESOLVED_API_BASE_URL.length > 0;
}

export function buildApiUrl(routePath: string): string {
  const normalizedPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
  return RESOLVED_API_BASE_URL ? `${RESOLVED_API_BASE_URL}${normalizedPath}` : normalizedPath;
}

export function getFetchCredentialsMode(): RequestCredentials {
  return RESOLVED_API_BASE_URL ? 'omit' : 'same-origin';
}

export function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (
    window as unknown as {
      Capacitor?: {
        isNativePlatform?: () => boolean;
      };
    }
  ).Capacitor;
  return Boolean(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
}

export function getAppTarget(): 'web' | 'android-assistant' {
  const raw = (import.meta.env.VITE_APP_TARGET || '').trim().toLowerCase();
  if (raw === 'android-assistant') return 'android-assistant';
  return 'web';
}

/**
 * Returns true when running inside the dedicated GCC AI Android shell
 * (either built with VITE_APP_TARGET=android-assistant or executed inside Capacitor).
 */
export function isAndroidAssistantShell(): boolean {
  return getAppTarget() === 'android-assistant' || isCapacitorNative();
}
