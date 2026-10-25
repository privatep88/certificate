import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  organization?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface StoredResetCode {
  email: string;
  codeHash: string;
  expiresAt: number;
}

interface StoredSession {
  token: string;
  userId: string;
  expiresAt: number;
}

interface AuthDatabase {
  users: StoredUser[];
  sessions: StoredSession[];
  resetCodes: StoredResetCode[];
}

const DATA_DIR = path.join(os.tmpdir(), 'cert-studio-data');
const AUTH_DB_PATH = path.join(DATA_DIR, 'auth-store.json');

function ensureDefaultUser(db: AuthDatabase): AuthDatabase {
  const hasDefaultUser = db.users.some((u) => u.email.toLowerCase() === 'user');
  if (!hasDefaultUser) {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync('user', salt, 64).toString('hex');
    db.users.unshift({
      id: 'usr_default_user',
      fullName: 'الأستاذ / خالد أحمد عبدالله الهاشمي',
      email: 'user',
      passwordHash,
      passwordSalt: salt,
      organization: 'استوديو الشهادات الذكي',
      createdAt: new Date().toISOString(),
    });
    saveAuthDb(db);
  }
  return db;
}

function loadAuthDb(): AuthDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(AUTH_DB_PATH)) {
      const raw = fs.readFileSync(AUTH_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<AuthDatabase>;
      return ensureDefaultUser({
        users: Array.isArray(parsed.users) ? parsed.users : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        resetCodes: Array.isArray(parsed.resetCodes) ? parsed.resetCodes : [],
      });
    }
  } catch (err) {
    console.error('Failed to read auth store:', err);
  }
  return ensureDefaultUser({ users: [], sessions: [], resetCodes: [] });
}

function saveAuthDb(db: AuthDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(AUTH_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write auth store:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const actualHash = hashPassword(password, salt);
  const a = Buffer.from(actualHash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isValidIdentifier(identifier: string): boolean {
  const clean = identifier.trim();
  if (clean.length < 3) return false;
  return true;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // ==================== AUTHENTICATION API ====================

  // 1. Check configured auth providers
  app.get('/api/auth/providers', (_req, res) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
    res.json({
      emailPassword: true,
      googleOAuthConfigured: Boolean(googleClientId.trim()),
    });
  });

  // 2. Validate active session token
  app.get('/api/auth/session', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      res.status(401).json({ authenticated: false, error: 'لا توجد جلسة نشطة.' });
      return;
    }

    const db = loadAuthDb();
    const now = Date.now();
    // Clean expired sessions
    db.sessions = db.sessions.filter((s) => s.expiresAt > now);
    const session = db.sessions.find((s) => s.token === token);
    if (!session) {
      saveAuthDb(db);
      res.status(401).json({ authenticated: false, error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا.' });
      return;
    }

    const user = db.users.find((u) => u.id === session.userId);
    if (!user) {
      res.status(401).json({ authenticated: false, error: 'المستخدم غير موجود.' });
      return;
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        organization: user.organization || '',
        createdAt: user.createdAt,
      },
    });
  });

  // 3. Register new account
  app.post('/api/auth/register', (req, res) => {
    const { fullName = '', email = '', password = '', organization = '', rememberMe = true } = req.body || {};
    const cleanName = String(fullName).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const rawPassword = String(password);

    if (!cleanName || cleanName.length < 2) {
      res.status(400).json({ error: 'يرجى إدخال الاسم الكامل بشكل صحيح (حرفين على الأقل).' });
      return;
    }
    if (!cleanEmail || !isValidIdentifier(cleanEmail)) {
      res.status(400).json({ error: 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني بشكل صحيح.' });
      return;
    }
    if (!rawPassword || rawPassword.length < 4) {
      res.status(400).json({ error: 'يجب أن تتكون كلمة المرور من 4 أحرف أو أرقام على الأقل.' });
      return;
    }

    const db = loadAuthDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      res.status(409).json({
        error: 'اسم المستخدم أو البريد الإلكتروني مسجّل بالفعل. يرجى تسجيل الدخول أو استعادة كلمة المرور.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(rawPassword, salt);
    const nowIso = new Date().toISOString();

    const newUser: StoredUser = {
      id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      fullName: cleanName,
      email: cleanEmail,
      passwordHash,
      passwordSalt: salt,
      organization: String(organization || '').trim(),
      createdAt: nowIso,
      lastLoginAt: nowIso,
    };

    const token = crypto.randomBytes(32).toString('hex');
    const ttlMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = Date.now() + ttlMs;

    db.users.push(newUser);
    db.sessions.push({ token, userId: newUser.id, expiresAt });
    saveAuthDb(db);

    res.status(201).json({
      message: 'تم إنشاء حسابك بنجاح وتسجيل الدخول إلى المنصة.',
      token,
      expiresAt,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        organization: newUser.organization || '',
        createdAt: newUser.createdAt,
      },
    });
  });

  // 4. Login with Username or Email & Password
  app.post('/api/auth/login', (req, res) => {
    const { email = '', password = '', rememberMe = false } = req.body || {};
    const cleanEmail = String(email).trim().toLowerCase();
    const rawPassword = String(password);

    if (!cleanEmail) {
      res.status(400).json({ error: 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني.' });
      return;
    }
    if (!isValidIdentifier(cleanEmail)) {
      res.status(400).json({ error: 'يرجى إدخال اسم مستخدم أو بريد إلكتروني صحيح.' });
      return;
    }
    if (!rawPassword) {
      res.status(400).json({ error: 'يرجى إدخال كلمة المرور.' });
      return;
    }

    const db = loadAuthDb();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user || !verifyPassword(rawPassword, user.passwordSalt, user.passwordHash)) {
      res.status(401).json({
        error:
          'بيانات الدخول غير صحيحة. تأكد من اسم المستخدم أو البريد الإلكتروني وكلمة المرور.',
      });
      return;
    }

    user.lastLoginAt = new Date().toISOString();
    const token = crypto.randomBytes(32).toString('hex');
    const ttlMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = Date.now() + ttlMs;

    db.sessions = db.sessions.filter((s) => s.expiresAt > Date.now());
    db.sessions.push({ token, userId: user.id, expiresAt });
    saveAuthDb(db);

    res.json({
      message: 'تم تسجيل الدخول بنجاح. مرحبًا بعودتك!',
      token,
      expiresAt,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        organization: user.organization || '',
        createdAt: user.createdAt,
      },
    });
  });

  // 5. Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (token) {
      const db = loadAuthDb();
      db.sessions = db.sessions.filter((s) => s.token !== token);
      saveAuthDb(db);
    }
    res.json({ message: 'تم تسجيل الخروج بنجاح.' });
  });

  // 6. Request Password Recovery Code
  app.post('/api/auth/forgot-password', (req, res) => {
    const { email = '' } = req.body || {};
    const cleanEmail = String(email).trim().toLowerCase();

    if (!cleanEmail || !isValidIdentifier(cleanEmail)) {
      res.status(400).json({ error: 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني لاستعادة كلمة المرور.' });
      return;
    }

    const db = loadAuthDb();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      res.status(404).json({
        error: 'لم يتم العثور على حساب مرتبط بهذا المعرف. يمكنك إنشاء حساب جديد الآن.',
      });
      return;
    }

    const recoveryCode = String(crypto.randomInt(100000, 999999));
    const codeHash = crypto.createHash('sha256').update(recoveryCode).digest('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    db.resetCodes = db.resetCodes.filter((r) => r.email !== cleanEmail && r.expiresAt > Date.now());
    db.resetCodes.push({ email: cleanEmail, codeHash, expiresAt });
    saveAuthDb(db);

    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    res.json({
      message: smtpConfigured
        ? 'تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني.'
        : 'تم إنشاء رمز استعادة كلمة المرور لحسابك (صالح لمدة 15 دقيقة). نظرًا لعدم إعداد خادم بريد خارجي (SMTP) في بيئة التشغيل، تم عرض الرمز أدناه لإتمام الاستعادة فورًا.',
      recoveryCode: smtpConfigured ? undefined : recoveryCode,
      expiresInMinutes: 15,
    });
  });

  // 7. Reset Password with Recovery Code
  app.post('/api/auth/reset-password', (req, res) => {
    const { email = '', code = '', newPassword = '' } = req.body || {};
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();
    const rawNewPassword = String(newPassword);

    if (!cleanEmail || !isValidIdentifier(cleanEmail)) {
      res.status(400).json({ error: 'اسم المستخدم أو البريد الإلكتروني غير صالح.' });
      return;
    }
    if (!cleanCode || cleanCode.length !== 6) {
      res.status(400).json({ error: 'يرجى إدخال رمز التحقق المكون من 6 أرقام.' });
      return;
    }
    if (!rawNewPassword || rawNewPassword.length < 4) {
      res.status(400).json({ error: 'يجب أن تتكون كلمة المرور الجديدة من 4 أحرف على الأقل.' });
      return;
    }

    const db = loadAuthDb();
    const now = Date.now();
    const codeHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
    const record = db.resetCodes.find(
      (r) => r.email === cleanEmail && r.codeHash === codeHash && r.expiresAt > now
    );

    if (!record) {
      res.status(400).json({ error: 'رمز التحقق غير صحيح أو منتهي الصلاحية.' });
      return;
    }

    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      res.status(404).json({ error: 'الحساب غير موجود.' });
      return;
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    user.passwordSalt = newSalt;
    user.passwordHash = hashPassword(rawNewPassword, newSalt);
    db.resetCodes = db.resetCodes.filter((r) => r.email !== cleanEmail);
    saveAuthDb(db);

    res.json({
      message: 'تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.',
    });
  });

  // ==================== AI WORDING API ====================

  app.get('/api/ai/status', (_req, res) => {
    const configured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    res.json({
      configured,
      model: 'gemini-3.8-flash',
    });
  });

  app.post('/api/ai/generate-text', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || !apiKey.trim()) {
        res.status(503).json({
          error: 'خدمة الذكاء الاصطناعي غير مهيأة حاليًا في بيئة التشغيل (GEMINI_API_KEY غير متوفر). يمكنك استخدام الصياغات الاحترافية الجاهزة أو تحرير النص مباشرة.',
          code: 'AI_NOT_CONFIGURED',
        });
        return;
      }

      const {
        certificateType = 'شهادة شكر وتقدير',
        recipientName = 'اسم المستفيد',
        organizationName = 'الجهة المانحة',
        occasionOrCourse = '',
        tone = 'رسمي فاخر',
        language = 'ar',
      } = req.body || {};

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt =
        language === 'en'
          ? `Generate 3 distinct, prestigious certificate wordings for a "${certificateType}" issued by "${organizationName}" to "${recipientName}"${
              occasionOrCourse ? ` for "${occasionOrCourse}"` : ''
            }. Tone: ${tone}. Return JSON with an array of suggestions containing title, subtitle, introText, bodyText, and closingText.`
          : `أنشئ 3 صياغات عربية فصيحة، راقية، وموزونة لشهادة من نوع "${certificateType}" صادرة من "${organizationName}" إلى "${recipientName}"${
              occasionOrCourse ? ` بمناسبة / لدورة "${occasionOrCourse}"` : ''
            }. الأسلوب المطلوب: ${tone}. أعد النتيجة بصيغة JSON تحتوي على قائمة suggestions وكل عنصر يضم: title (العنوان الرئيسي)، subtitle (العنوان الفرعي)، introText (عبارة الاستهلال قبل الاسم)، bodyText (النص الأساسي للشهادة)، و closingText (عبارة الختام).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    introText: { type: Type.STRING },
                    bodyText: { type: Type.STRING },
                    closingText: { type: Type.STRING },
                  },
                  required: ['title', 'subtitle', 'introText', 'bodyText', 'closingText'],
                },
              },
            },
            required: ['suggestions'],
          },
        },
      });

      const rawText = response.text || '{"suggestions":[]}';
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي';
      res.status(500).json({
        error: `تعذر توليد الصياغة عبر النموذج: ${message}`,
        code: 'AI_ERROR',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Certificate Studio AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
