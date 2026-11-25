export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
] as const;

export interface GoogleAuthUser {
  email: string | null;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleAccountsApi {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: {
        access_token?: string;
        error?: string;
        error_description?: string;
      }) => void;
    }) => GoogleTokenClient;
    revoke: (token: string, done?: () => void) => void;
  };
}

declare global {
  interface Window {
    google?: {
      accounts?: GoogleAccountsApi;
    };
  }
}

// Keep OAuth access token strictly in memory (never in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let gsiLoadPromise: Promise<void> | null = null;

function isStaticGitHubPagesHost(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.location.hostname.endsWith('.github.io')
  );
}

async function fetchOAuthClientId(): Promise<string | null> {
  if (isStaticGitHubPagesHost()) return null;
  try {
    const res = await fetch('/api/auth-config');
    if (!res.ok) return null;
    const data = (await res.json()) as { googleOAuthClientId?: string | null };
    return typeof data.googleOAuthClientId === 'string' &&
      data.googleOAuthClientId.trim().length > 0
      ? data.googleOAuthClientId.trim()
      : null;
  } catch {
    return null;
  }
}

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In requires a browser environment.'));
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (gsiLoadPromise) return gsiLoadPromise;

  gsiLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Could not load Google Sign-In script.')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Google Sign-In script.'));
    document.head.appendChild(script);
  });

  return gsiLoadPromise;
}

export const initAuth = (
  _onAuthSuccess?: (user: GoogleAuthUser, token: string) => void,
  onAuthFailure?: (user: GoogleAuthUser | null) => void
) => {
  onAuthFailure?.(null);
  return () => {};
};

export const googleSignIn = async (): Promise<{
  user: GoogleAuthUser;
  accessToken: string;
} | null> => {
  const clientId = await fetchOAuthClientId();
  if (!clientId) {
    throw new Error('Google Sign-In is unavailable in this hosting environment.');
  }

  await loadGoogleIdentityScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Google Sign-In failed to initialize.');
  }

  isSigningIn = true;
  try {
    const token = await new Promise<string>((resolve, reject) => {
      const client = oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES.join(' '),
        callback: (resp) => {
          if (resp.error || !resp.access_token) {
            reject(new Error(resp.error_description || resp.error || 'Google Sign-In cancelled.'));
            return;
          }
          resolve(resp.access_token);
        },
      });
      client.requestAccessToken({ prompt: 'consent' });
    });

    cachedAccessToken = token;

    let email: string | null = null;
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const profile = (await userRes.json()) as { email?: string };
        email = typeof profile.email === 'string' ? profile.email : null;
      }
    } catch {
      // Proceed even if email profile lookup is unavailable
    }

    return { user: { email }, accessToken: token };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => (isSigningIn ? null : cachedAccessToken);

export const logout = async (): Promise<void> => {
  const token = cachedAccessToken;
  cachedAccessToken = null;
  if (!token) return;
  try {
    window.google?.accounts?.oauth2.revoke(token);
  } catch {
    // Ignore revoke errors
  }
};
