import type { User } from 'firebase/auth';

export const SCOPES = ['https://www.googleapis.com/auth/gmail.send'] as const;

// Keep OAuth access token strictly in memory (never in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedAuthInstance: import('firebase/auth').Auth | null = null;

async function getFirebaseAuth(): Promise<import('firebase/auth').Auth | null> {
  if (cachedAuthInstance) return cachedAuthInstance;
  try {
    const [{ getApp, getApps, initializeApp }, { getAuth }, configMod] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('../../firebase-applet-config.json'),
    ]);
    const firebaseConfig = configMod.default;
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    cachedAuthInstance = getAuth(app);
    return cachedAuthInstance;
  } catch {
    return null;
  }
}

export const initAuth = (
  _onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: (user: User | null) => void
) => {
  // Avoid eager Firebase initialization on static page loads (e.g. GitHub Pages)
  onAuthFailure?.(null);
  return () => {};
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  const auth = await getFirebaseAuth();
  if (!auth) {
    throw new Error('Google Sign-In is unavailable in this hosting environment.');
  }
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  for (const scope of SCOPES) {
    provider.addScope(scope);
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Gmail access token from Google Sign-In.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => (isSigningIn ? null : cachedAccessToken);

export const logout = async (): Promise<void> => {
  cachedAccessToken = null;
  if (!cachedAuthInstance) return;
  try {
    await cachedAuthInstance.signOut();
  } catch {
    // Ignore sign-out errors
  }
};
