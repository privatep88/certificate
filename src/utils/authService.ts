import type { AuthenticatedUser } from '../components/AuthPage';

interface LocalStoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  organization?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface LocalStoredSession {
  token: string;
  userId: string;
  expiresAt: number;
}

interface LocalStoredResetCode {
  email: string;
  code: string;
  expiresAt: number;
}

interface LocalAuthDatabase {
  users: LocalStoredUser[];
  sessions: LocalStoredSession[];
  resetCodes: LocalStoredResetCode[];
}

const LOCAL_AUTH_DB_KEY = 'cert_studio_local_auth_db_v1';

const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

function apiUrl(path: string): string {
  if (!API_BASE) return path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`cert_studio_salt_v1:${input}`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback deterministic hash if SubtleCrypto is unavailable in non-HTTPS local preview
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

function generateRandomToken(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint8Array(24);
    window.crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

async function getLocalAuthDb(): Promise<LocalAuthDatabase> {
  let db: LocalAuthDatabase = { users: [], sessions: [], resetCodes: [] };
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalAuthDatabase>;
      db = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        resetCodes: Array.isArray(parsed.resetCodes) ? parsed.resetCodes : [],
      };
    }
  } catch {
    // ignore corrupted storage
  }

  // Ensure default user ("user" / "user") is always present
  const hasDefault = db.users.some((u) => u.email.toLowerCase() === 'user');
  if (!hasDefault) {
    const defaultHash = await sha256Hex('user');
    db.users.unshift({
      id: 'usr_default_user',
      fullName: 'الأستاذ / خالد أحمد عبدالله الهاشمي',
      email: 'user',
      passwordHash: defaultHash,
      organization: 'استوديو الشهادات الذكي',
      createdAt: new Date().toISOString(),
    });
    saveLocalAuthDb(db);
  }

  return db;
}

function saveLocalAuthDb(db: LocalAuthDatabase): void {
  try {
    localStorage.setItem(LOCAL_AUTH_DB_KEY, JSON.stringify(db));
  } catch {
    // ignore quota error
  }
}

/**
 * Helper that attempts a backend JSON request first.
 * If the app is hosted on a static server (like GitHub Pages) where `/api/*` returns 404 HTML
 * or network failure, it returns `{ backendAvailable: false }` so the caller can use the
 * local Web Crypto auth engine seamlessly instead of failing or crashing.
 */
async function tryBackendJson<T>(
  path: string,
  init?: RequestInit
): Promise<{ backendAvailable: true; ok: boolean; status: number; data: T } | { backendAvailable: false }> {
  try {
    const res = await fetch(apiUrl(path), init);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { backendAvailable: false };
    }
    const data = (await res.json()) as T;
    return {
      backendAvailable: true,
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch {
    return { backendAvailable: false };
  }
}

export async function checkAuthProviders(): Promise<{
  emailPassword: boolean;
  googleOAuthConfigured: boolean;
  mode: 'server' | 'static';
}> {
  const result = await tryBackendJson<{ emailPassword?: boolean; googleOAuthConfigured?: boolean }>(
    '/api/auth/providers'
  );
  if (result.backendAvailable && result.ok) {
    return {
      emailPassword: true,
      googleOAuthConfigured: Boolean(result.data.googleOAuthConfigured),
      mode: 'server',
    };
  }
  return {
    emailPassword: true,
    googleOAuthConfigured: false,
    mode: 'static',
  };
}

export async function verifySessionToken(
  token: string
): Promise<{ authenticated: boolean; user?: AuthenticatedUser }> {
  const result = await tryBackendJson<{ authenticated?: boolean; user?: AuthenticatedUser }>(
    '/api/auth/session',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (result.backendAvailable) {
    if (result.ok && result.data.authenticated && result.data.user) {
      return { authenticated: true, user: result.data.user };
    }
    // Also check local fallback session in case token was issued in static mode
  }

  const db = await getLocalAuthDb();
  const now = Date.now();
  db.sessions = db.sessions.filter((s) => s.expiresAt > now);
  const session = db.sessions.find((s) => s.token === token);
  if (!session) {
    saveLocalAuthDb(db);
    // If neither backend nor local session matched, check if cached user exists in storage
    return { authenticated: false };
  }

  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return { authenticated: false };

  return {
    authenticated: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      organization: user.organization || '',
      createdAt: user.createdAt,
    },
  };
}

export async function loginWithCredentials(params: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<{
  ok: boolean;
  message?: string;
  error?: string;
  user?: AuthenticatedUser;
  token?: string;
}> {
  const cleanEmail = params.email.trim().toLowerCase();
  const rawPassword = params.password;

  const backendRes = await tryBackendJson<{
    message?: string;
    error?: string;
    user?: AuthenticatedUser;
    token?: string;
  }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (backendRes.backendAvailable) {
    if (backendRes.ok && backendRes.data.user && backendRes.data.token) {
      return {
        ok: true,
        message: backendRes.data.message || 'تم تسجيل الدخول بنجاح!',
        user: backendRes.data.user,
        token: backendRes.data.token,
      };
    }
    return {
      ok: false,
      error:
        backendRes.data.error ||
        'بيانات الدخول غير صحيحة. تأكد من اسم المستخدم أو البريد الإلكتروني وكلمة المرور.',
    };
  }

  // Static Hosting / GitHub Pages Local Auth Engine
  const db = await getLocalAuthDb();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  const passwordHash = await sha256Hex(rawPassword);

  if (!user || user.passwordHash !== passwordHash) {
    return {
      ok: false,
      error:
        'بيانات الدخول غير صحيحة. تأكد من اسم المستخدم (user) أو البريد الإلكتروني وكلمة المرور.',
    };
  }

  user.lastLoginAt = new Date().toISOString();
  const token = generateRandomToken();
  const ttlMs = params.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  db.sessions = db.sessions.filter((s) => s.expiresAt > Date.now());
  db.sessions.push({ token, userId: user.id, expiresAt: Date.now() + ttlMs });
  saveLocalAuthDb(db);

  return {
    ok: true,
    message: 'تم تسجيل الدخول بنجاح. مرحبًا بعودتك!',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      organization: user.organization || '',
      createdAt: user.createdAt,
    },
  };
}

export async function registerUserAccount(params: {
  fullName: string;
  email: string;
  organization?: string;
  password: string;
  rememberMe: boolean;
}): Promise<{
  ok: boolean;
  message?: string;
  error?: string;
  user?: AuthenticatedUser;
  token?: string;
}> {
  const backendRes = await tryBackendJson<{
    message?: string;
    error?: string;
    user?: AuthenticatedUser;
    token?: string;
  }>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (backendRes.backendAvailable) {
    if (backendRes.ok && backendRes.data.user && backendRes.data.token) {
      return {
        ok: true,
        message: backendRes.data.message || 'تم إنشاء الحساب بنجاح!',
        user: backendRes.data.user,
        token: backendRes.data.token,
      };
    }
    return {
      ok: false,
      error: backendRes.data.error || 'تعذر إنشاء الحساب.',
    };
  }

  // Static Hosting / GitHub Pages Local Registration
  const db = await getLocalAuthDb();
  const cleanEmail = params.email.trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return {
      ok: false,
      error: 'اسم المستخدم أو البريد الإلكتروني مسجّل بالفعل. يرجى تسجيل الدخول.',
    };
  }

  const passwordHash = await sha256Hex(params.password);
  const nowIso = new Date().toISOString();
  const newUser: LocalStoredUser = {
    id: `usr_${Date.now()}`,
    fullName: params.fullName.trim(),
    email: cleanEmail,
    passwordHash,
    organization: (params.organization || '').trim(),
    createdAt: nowIso,
    lastLoginAt: nowIso,
  };

  const token = generateRandomToken();
  const ttlMs = params.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  db.users.push(newUser);
  db.sessions.push({ token, userId: newUser.id, expiresAt: Date.now() + ttlMs });
  saveLocalAuthDb(db);

  return {
    ok: true,
    message: 'تم إنشاء حسابك بنجاح وتسجيل الدخول إلى المنصة.',
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      organization: newUser.organization || '',
      createdAt: newUser.createdAt,
    },
  };
}

export async function requestPasswordRecovery(email: string): Promise<{
  ok: boolean;
  message?: string;
  error?: string;
  recoveryCode?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const backendRes = await tryBackendJson<{
    message?: string;
    error?: string;
    recoveryCode?: string;
  }>('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail }),
  });

  if (backendRes.backendAvailable) {
    if (backendRes.ok) {
      return {
        ok: true,
        message: backendRes.data.message,
        recoveryCode: backendRes.data.recoveryCode,
      };
    }
    return {
      ok: false,
      error: backendRes.data.error || 'تعذر العثور على الحساب.',
    };
  }

  const db = await getLocalAuthDb();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return {
      ok: false,
      error: 'لم يتم العثور على حساب مرتبط بهذا المعرف. يمكنك إنشاء حساب جديد الآن.',
    };
  }

  const recoveryCode = String(Math.floor(100000 + Math.random() * 900000));
  db.resetCodes = db.resetCodes.filter((r) => r.email !== cleanEmail && r.expiresAt > Date.now());
  db.resetCodes.push({
    email: cleanEmail,
    code: recoveryCode,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });
  saveLocalAuthDb(db);

  return {
    ok: true,
    message:
      'تم إنشاء رمز استعادة كلمة المرور لحسابك (صالح لمدة 15 دقيقة). تم عرض الرمز أدناه لإتمام الاستعادة فورًا.',
    recoveryCode,
  };
}

export async function resetPasswordWithCode(params: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<{ ok: boolean; message?: string; error?: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const backendRes = await tryBackendJson<{ message?: string; error?: string }>(
    '/api/auth/reset-password',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        code: params.code.trim(),
        newPassword: params.newPassword,
      }),
    }
  );

  if (backendRes.backendAvailable) {
    if (backendRes.ok) {
      return { ok: true, message: backendRes.data.message };
    }
    return { ok: false, error: backendRes.data.error || 'تعذر تحديث كلمة المرور.' };
  }

  const db = await getLocalAuthDb();
  const record = db.resetCodes.find(
    (r) => r.email === cleanEmail && r.code === params.code.trim() && r.expiresAt > Date.now()
  );
  if (!record) {
    return { ok: false, error: 'رمز التحقق غير صحيح أو منتهي الصلاحية.' };
  }

  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { ok: false, error: 'الحساب غير موجود.' };
  }

  user.passwordHash = await sha256Hex(params.newPassword);
  db.resetCodes = db.resetCodes.filter((r) => r.email !== cleanEmail);
  saveLocalAuthDb(db);

  return {
    ok: true,
    message: 'تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.',
  };
}

export async function logoutSession(token: string | null): Promise<void> {
  if (!token) return;
  const backendRes = await tryBackendJson('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!backendRes.backendAvailable) {
    const db = await getLocalAuthDb();
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveLocalAuthDb(db);
  }
}
