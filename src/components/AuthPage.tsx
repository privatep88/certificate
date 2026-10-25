import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Palette,
  ShieldCheck,
  Sparkles,
  User,
  Building2,
} from 'lucide-react';

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  organization?: string;
  createdAt: string;
}

interface AuthPageProps {
  onAuthenticated: (user: AuthenticatedUser, token: string, rememberMe: boolean) => void;
  onContinueAsGuest?: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthenticated,
  onContinueAsGuest,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);

  // Form fields (defaulting to user / user as requested)
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('user');
  const [password, setPassword] = useState('user');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [generatedResetCodeHint, setGeneratedResetCodeHint] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Request & validation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    resetCode?: string;
  }>({});
  const [statusBanner, setStatusBanner] = useState<{
    type: 'error' | 'success' | 'info';
    message: string;
  } | null>(null);

  const [googleOAuthConfigured, setGoogleOAuthConfigured] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/providers')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (mounted && data) {
          setGoogleOAuthConfigured(Boolean(data.googleOAuthConfigured));
        }
      })
      .catch(() => {
        // ignore network check error
      });
    return () => {
      mounted = false;
    };
  }, []);

  const switchMode = (nextMode: 'login' | 'register' | 'forgot' | 'reset') => {
    setMode(nextMode);
    setFieldErrors({});
    setStatusBanner(null);
    if (nextMode !== 'reset') {
      setGeneratedResetCodeHint(null);
    }
  };

  const validateIdentifier = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    // Allow either a username (>= 3 chars) or a valid email address
    if (trimmed.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
    }
    return trimmed.length >= 3;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: typeof fieldErrors = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      errors.email = 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني.';
    } else if (!validateIdentifier(cleanEmail)) {
      errors.email = 'يرجى إدخال اسم مستخدم أو بريد إلكتروني صحيح.';
    }

    if (!password) {
      errors.password = 'يرجى إدخال كلمة المرور.';
    } else if (password.length < 4) {
      errors.password = 'كلمة المرور يجب ألا تقل عن 4 أحرف.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatusBanner({
        type: 'error',
        message: 'يرجى التحقق من الحقول المطلوبة وتصحيح الأخطاء الموضحة.',
      });
      return;
    }

    setFieldErrors({});
    setStatusBanner(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusBanner({
          type: 'error',
          message:
            data.error ||
            'تعذر تسجيل الدخول. يرجى التأكد من صحة البريد الإلكتروني وكلمة المرور.',
        });
        return;
      }

      setStatusBanner({
        type: 'success',
        message: data.message || 'تم تسجيل الدخول بنجاح! جاري تحويلك إلى المنصة...',
      });

      setTimeout(() => {
        onAuthenticated(data.user, data.token, rememberMe);
      }, 350);
    } catch {
      setStatusBanner({
        type: 'error',
        message: 'تعذر الاتصال بخادم المصادقة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: typeof fieldErrors = {};
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      errors.fullName = 'يرجى إدخال الاسم الكامل (حرفين على الأقل).';
    }
    if (!cleanEmail) {
      errors.email = 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني.';
    } else if (!validateIdentifier(cleanEmail)) {
      errors.email = 'يرجى إدخال اسم مستخدم أو بريد إلكتروني صحيح.';
    }
    if (!password || password.length < 4) {
      errors.password = 'يجب أن تتكون كلمة المرور من 4 أحرف أو أرقام على الأقل.';
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = 'كلمتا المرور غير متطابقتين.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatusBanner({
        type: 'error',
        message: 'يرجى استكمال بيانات إنشاء الحساب بشكل صحيح.',
      });
      return;
    }

    setFieldErrors({});
    setStatusBanner(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          organization: organization.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusBanner({
          type: 'error',
          message: data.error || 'تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.',
        });
        return;
      }

      setStatusBanner({
        type: 'success',
        message: data.message || 'تم إنشاء الحساب بنجاح! جاري فتح المنصة...',
      });

      setTimeout(() => {
        onAuthenticated(data.user, data.token, rememberMe);
      }, 350);
    } catch {
      setStatusBanner({
        type: 'error',
        message: 'حدث خطأ في الاتصال بالخادم أثناء إنشاء الحساب.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanEmail = email.trim();
    if (!cleanEmail || !validateIdentifier(cleanEmail)) {
      setFieldErrors({ email: 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني لاستعادة كلمة المرور.' });
      return;
    }

    setFieldErrors({});
    setStatusBanner(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatusBanner({
          type: 'error',
          message: data.error || 'تعذر العثور على الحساب.',
        });
        return;
      }

      if (data.recoveryCode) {
        setGeneratedResetCodeHint(String(data.recoveryCode));
        setResetCode(String(data.recoveryCode));
      }
      setMode('reset');
      setStatusBanner({
        type: 'info',
        message: data.message,
      });
    } catch {
      setStatusBanner({
        type: 'error',
        message: 'تعذر الاتصال بالخادم لاستعادة كلمة المرور.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: typeof fieldErrors = {};
    if (!resetCode.trim() || resetCode.trim().length !== 6) {
      errors.resetCode = 'يرجى إدخال رمز التحقق المكون من 6 أرقام.';
    }
    if (!password || password.length < 4) {
      errors.password = 'يجب أن تتكون كلمة المرور الجديدة من 4 أحرف على الأقل.';
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = 'كلمتا المرور غير متطابقتين.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStatusBanner(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: resetCode.trim(),
          newPassword: password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatusBanner({
          type: 'error',
          message: data.error || 'تعذر إعادة تعيين كلمة المرور.',
        });
        return;
      }

      setGeneratedResetCodeHint(null);
      setPassword('');
      setConfirmPassword('');
      setMode('login');
      setStatusBanner({
        type: 'success',
        message: data.message || 'تم تحديث كلمة المرور بنجاح! يمكنك تسجيل الدخول الآن.',
      });
    } catch {
      setStatusBanner({
        type: 'error',
        message: 'حدث خطأ أثناء الاتصال بالخادم.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLoginClick = () => {
    if (isSubmitting) return;
    if (!googleOAuthConfigured) {
      setStatusBanner({
        type: 'info',
        message:
          'تسجيل الدخول عبر Google يتطلب ضبط معرف العميل (GOOGLE_CLIENT_ID) في إعدادات بيئة المشروع. يمكنك تسجيل الدخول بالبريد الإلكتروني أو إنشاء حساب جديد فورًا.',
      });
      return;
    }
    window.location.href = '/api/auth/google';
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-gradient-to-br from-[#E8F1FC] via-[#F4F8FE] to-[#DCE9FA] text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-x-hidden selection:bg-blue-600 selection:text-white"
    >
      {/* Soft Ambient Background Lighting Orbs */}
      <div
        className="pointer-events-none fixed -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-blue-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/3 -left-32 w-[520px] h-[520px] rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-40 right-1/4 w-[460px] h-[460px] rounded-full bg-amber-100/35 blur-3xl"
        aria-hidden="true"
      />

      {/* Main 12-Column Responsive Container (Right: Auth Card | Left: Visual Showcase in RTL) */}
      <div className="relative z-10 w-full max-w-[1340px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* ==================== RIGHT COLUMN (IN RTL): LUXURY LOGIN CARD ==================== */}
        <div className="lg:col-span-5 w-full max-w-[500px] mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_24px_60px_-15px_rgba(11,35,75,0.12)] border border-white/90 px-6 py-8 sm:px-10 sm:py-10 transition-all">
            {/* Brand Emblem & Title */}
            <div className="flex flex-col items-center text-center mb-7">
              {/* Custom SVG Certificate + Gold Star Ribbon Emblem matching Reference */}
              <div className="relative mb-3.5">
                <svg
                  width="76"
                  height="76"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-sm"
                >
                  {/* Soft Blue Glow Base */}
                  <rect x="8" y="6" width="52" height="60" rx="10" fill="#EBF3FF" />
                  {/* Main Blue Certificate Sheet Outline */}
                  <path
                    d="M18 10H52C56.4183 10 60 13.5817 60 18V54C60 58.4183 56.4183 62 52 62H18C13.5817 62 10 58.4183 10 54V18C10 13.5817 13.5817 10 18 10Z"
                    fill="white"
                    stroke="#0A58CA"
                    strokeWidth="4.5"
                  />
                  {/* Top Folded Accent Corner */}
                  <path d="M10 22C10 15.3726 15.3726 10 22 10H50V17H10V22Z" fill="#0061DF" />
                  {/* Certificate Text Bars */}
                  <rect x="20" y="25" width="28" height="4.5" rx="2.25" fill="#0061DF" />
                  <rect x="20" y="34" width="22" height="4" rx="2" fill="#3B82F6" />
                  <rect x="20" y="43" width="16" height="4" rx="2" fill="#93C5FD" />
                  {/* Bottom Scroll Wave */}
                  <path
                    d="M16 56C16 53.7909 17.7909 52 20 52H36C38.2091 52 40 53.7909 40 56V60H16V56Z"
                    fill="#1D4ED8"
                  />
                  {/* Gold Seal Ribbons */}
                  <path d="M51 54L46 71L54 67L57 72L60 55" fill="#0052CC" />
                  <path d="M59 54L64 71L56 67L53 72L50 55" fill="#2563EB" />
                  {/* Gold Seal Circle */}
                  <circle cx="55" cy="48" r="13" fill="url(#goldGrad)" stroke="white" strokeWidth="2.5" />
                  {/* Star inside Gold Seal */}
                  <path
                    d="M55 39.5L57.3 44.2L62.5 44.9L58.7 48.6L59.6 53.8L55 51.3L50.4 53.8L51.3 48.6L47.5 44.9L52.7 44.2L55 39.5Z"
                    fill="#FFFBEB"
                  />
                  <defs>
                    <linearGradient id="goldGrad" x1="42" y1="35" x2="68" y2="61" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FBBF24" />
                      <stop offset="1" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div
                dir="ltr"
                className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#0C1B33] font-sans"
              >
                Certificate Studio <span className="text-[#0061DF]">AI</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                اصنع شهاداتك .. بسرعة واحترافية
              </p>
            </div>

            {/* Welcome Heading */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0C1B33]">
                {mode === 'login' && 'مرحبًا بعودتك'}
                {mode === 'register' && 'إنشاء حساب جديد'}
                {(mode === 'forgot' || mode === 'reset') && 'استعادة كلمة المرور'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
                {mode === 'login' && 'سجّل الدخول إلى حسابك للمتابعة'}
                {mode === 'register' && 'أنشئ حسابك مجانًا لحفظ وتصدير شهاداتك الاحترافية'}
                {mode === 'forgot' && 'أدخل بريدك الإلكتروني لإرسال رمز استعادة كلمة المرور'}
                {mode === 'reset' && 'أدخل رمز التحقق المكون من 6 أرقام وكلمة المرور الجديدة'}
              </p>
            </div>

            {/* Status Feedback Alert (Error / Success / Info) */}
            {statusBanner && (
              <div
                role="alert"
                className={`mb-5 p-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-start gap-2.5 leading-relaxed ${
                  statusBanner.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : statusBanner.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                {statusBanner.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      statusBanner.type === 'success' ? 'text-emerald-600' : 'text-blue-600'
                    }`}
                  />
                )}
                <div className="flex-1">
                  <span>{statusBanner.message}</span>
                  {generatedResetCodeHint && mode === 'reset' && (
                    <div className="mt-2 p-2 rounded-lg bg-white border border-blue-200 text-center font-mono text-base font-extrabold tracking-widest text-[#0061DF]">
                      رمز الاستعادة: {generatedResetCodeHint}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== FORM MODE 1: LOGIN ==================== */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                {/* Username / Email Field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs sm:text-sm font-bold text-[#0C1B33] mb-1.5 text-right"
                  >
                    اسم المستخدم أو البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="login-email"
                      name="email"
                      type="text"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                      }}
                      placeholder="أدخل اسم المستخدم (user) أو بريدك الإلكتروني"
                      className={`w-full pr-10 pl-4 py-3 text-sm bg-[#F8FAFC] border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-colors ${
                        fieldErrors.email
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-slate-200 focus:border-[#0061DF]'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs sm:text-sm font-bold text-[#0C1B33] mb-1.5 text-right"
                  >
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password)
                          setFieldErrors({ ...fieldErrors, password: undefined });
                      }}
                      placeholder="أدخل كلمة المرور"
                      className={`w-full pr-10 pl-11 py-3 text-sm bg-[#F8FAFC] border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-colors ${
                        fieldErrors.password
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-slate-200 focus:border-[#0061DF]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0061DF] focus:ring-[#0061DF] accent-[#0061DF] cursor-pointer"
                    />
                    <span>تذكرني</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs sm:text-sm font-bold text-[#0061DF] hover:text-[#004BB5] hover:underline transition-colors cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                {/* Primary Login Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#0061DF] hover:bg-[#0051BD] active:bg-[#0044A0] text-white font-bold text-sm sm:text-base shadow-[0_10px_25px_-5px_rgba(0,97,223,0.45)] hover:shadow-[0_14px_30px_-5px_rgba(0,97,223,0.55)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-65 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </>
                  ) : (
                    <>
                      <span>تسجيل الدخول</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Visual Divider with "أو" */}
                <div className="relative flex py-2 items-center">
                  <div className="grow border-t border-slate-200" />
                  <span className="shrink mx-4 text-xs font-bold text-slate-400">أو</span>
                  <div className="grow border-t border-slate-200" />
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleGoogleLoginClick}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
                >
                  <span>الدخول باستخدام Google</span>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6C4.6 19.8 8 22 12 22z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.4l3.3-2.6z"
                    />
                    <path
                      fill="#4285F4"
                      d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.6 4.2 2.9 7.6l3.3 2.6c.8-2.5 3.1-4.3 5.8-4.3z"
                    />
                  </svg>
                </button>

                {/* Create New Account Link */}
                <div className="pt-3 text-center text-xs sm:text-sm text-slate-600 font-medium">
                  <span>ليس لديك حساب؟ </span>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-extrabold text-[#0061DF] hover:text-[#004BB5] hover:underline transition-colors cursor-pointer"
                  >
                    إنشاء حساب جديد
                  </button>
                </div>
              </form>
            )}

            {/* ==================== FORM MODE 2: REGISTER ==================== */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
                <div>
                  <label
                    htmlFor="reg-fullname"
                    className="block text-xs sm:text-sm font-bold text-[#0C1B33] mb-1 text-right"
                  >
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-fullname"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName)
                          setFieldErrors({ ...fieldErrors, fullName: undefined });
                      }}
                      placeholder="أدخل اسمك الكامل"
                      className={`w-full pr-10 pl-4 py-2.5 text-sm bg-[#F8FAFC] border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                        fieldErrors.fullName
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-slate-200 focus:border-[#0061DF]'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-xs sm:text-sm font-bold text-[#0C1B33] mb-1 text-right"
                  >
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                      }}
                      placeholder="أدخل بريدك الإلكتروني"
                      className={`w-full pr-10 pl-4 py-2.5 text-sm bg-[#F8FAFC] border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                        fieldErrors.email
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-slate-200 focus:border-[#0061DF]'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reg-org"
                    className="block text-xs sm:text-sm font-bold text-[#0C1B33] mb-1 text-right"
                  >
                    الجهة أو المؤسسة <span className="text-slate-400 font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-org"
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="اسم الشركة أو الأكاديمية أو المدرسة"
                      className="w-full pr-10 pl-4 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0061DF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-xs font-bold text-[#0C1B33] mb-1 text-right"
                    >
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password)
                            setFieldErrors({ ...fieldErrors, password: undefined });
                        }}
                        placeholder="6 أحرف على الأقل"
                        className={`w-full pr-3.5 pl-9 py-2.5 text-sm bg-[#F8FAFC] border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                          fieldErrors.password
                            ? 'border-rose-400 focus:border-rose-600'
                            : 'border-slate-200 focus:border-[#0061DF]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="reg-confirm"
                      className="block text-xs font-bold text-[#0C1B33] mb-1 text-right"
                    >
                      تأكيد كلمة المرور
                    </label>
                    <input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword)
                          setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                      }}
                      placeholder="أعد كتابة كلمة المرور"
                      className={`w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                        fieldErrors.confirmPassword
                          ? 'border-rose-400 focus:border-rose-600'
                          : 'border-slate-200 focus:border-[#0061DF]'
                      }`}
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 mt-2 rounded-xl bg-[#0061DF] hover:bg-[#0051BD] text-white font-bold text-sm sm:text-base shadow-[0_10px_25px_-5px_rgba(0,97,223,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-65 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري إنشاء الحساب...</span>
                    </>
                  ) : (
                    <>
                      <span>إنشاء الحساب والمتابعة</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-xs sm:text-sm text-slate-600 font-medium">
                  <span>لديك حساب بالفعل؟ </span>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-extrabold text-[#0061DF] hover:text-[#004BB5] hover:underline cursor-pointer"
                  >
                    تسجيل الدخول
                  </button>
                </div>
              </form>
            )}

            {/* ==================== FORM MODE 3: FORGOT PASSWORD ==================== */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs sm:text-sm font-bold text-[#0C1B33] mb-1.5 text-right"
                  >
                    البريد الإلكتروني المسجّل
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                      }}
                      placeholder="أدخل بريدك الإلكتروني"
                      className="w-full pr-10 pl-4 py-3 text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0061DF]"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">{fieldErrors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#0061DF] hover:bg-[#0051BD] text-white font-bold text-sm sm:text-base shadow-[0_10px_25px_-5px_rgba(0,97,223,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-65 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري التحقق من الحساب...</span>
                    </>
                  ) : (
                    <>
                      <span>إرسال رمز الاستعادة</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-xs sm:text-sm text-slate-600 font-medium">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-extrabold text-[#0061DF] hover:text-[#004BB5] hover:underline cursor-pointer"
                  >
                    العودة إلى تسجيل الدخول
                  </button>
                </div>
              </form>
            )}

            {/* ==================== FORM MODE 4: RESET PASSWORD ==================== */}
            {mode === 'reset' && (
              <form onSubmit={handleResetPasswordSubmit} noValidate className="space-y-3.5">
                <div>
                  <label
                    htmlFor="reset-code"
                    className="block text-xs sm:text-sm font-bold text-[#0C1B33] mb-1 text-right"
                  >
                    رمز التحقق (6 أرقام)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      id="reset-code"
                      type="text"
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="أدخل الرمز المكون من 6 أرقام"
                      className="w-full pr-10 pl-4 py-2.5 text-sm font-mono tracking-widest bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-[#0061DF]"
                    />
                  </div>
                  {fieldErrors.resetCode && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">
                      {fieldErrors.resetCode}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reset-new-password"
                    className="block text-xs sm:text-sm font-bold text-[#0C1B33] mb-1 text-right"
                  >
                    كلمة المرور الجديدة
                  </label>
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة"
                    className="w-full px-4 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-[#0061DF]"
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs sm:text-sm font-bold text-[#0C1B33] mb-1 text-right"
                  >
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    id="reset-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    className="w-full px-4 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-[#0061DF]"
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#0061DF] hover:bg-[#0051BD] text-white font-bold text-sm sm:text-base shadow-[0_10px_25px_-5px_rgba(0,97,223,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-65 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري تحديث كلمة المرور...</span>
                    </>
                  ) : (
                    <span>حفظ كلمة المرور الجديدة</span>
                  )}
                </button>

                <div className="pt-2 text-center text-xs sm:text-sm text-slate-600 font-medium">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-extrabold text-[#0061DF] hover:text-[#004BB5] hover:underline cursor-pointer"
                  >
                    العودة إلى تسجيل الدخول
                  </button>
                </div>
              </form>
            )}

            {/* Optional Quick Studio Access Link to preserve instant workflow testing */}
            {onContinueAsGuest && (
              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0C1B33] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>المتابعة المباشرة إلى استوديو الشهادات (وضع المعاينة السريعة)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==================== LEFT COLUMN (IN RTL): VISUAL SHOWCASE SECTION ==================== */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-7 px-2 sm:px-4">
          {/* Top-Left Security Trust Badge */}
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-3 bg-white/85 backdrop-blur-md border border-white rounded-2xl px-4 py-2.5 shadow-[0_8px_24px_-6px_rgba(14,42,84,0.08)]">
              <div className="text-right">
                <div className="text-xs font-extrabold text-[#0C1B33]">منصة آمنة وموثوقة</div>
                <div className="text-[11px] font-medium text-slate-500">لحفظ بياناتك وتصاميمك</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0061DF] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Hero Title & Subtitle */}
          <div className="text-right space-y-4 max-w-2xl">
            <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold leading-[1.22] tracking-tight text-balance">
              <span className="block text-[#0C1B33]">صانع الشهادات</span>
              <span className="block text-[#0061DF] mt-1">بذكاء اصطناعي</span>
            </h2>
            <p className="text-sm sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
              أنشئ شهاداتك الاحترافية بسهولة واحترافية تامة، مع مجموعة متنوعة من القوالب والتصاميم
              وأدوات التخصيص الذكية.
            </p>
          </div>

          {/* 4 Feature Highlights Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x sm:divide-x-reverse sm:divide-slate-200/90 bg-white/60 lg:bg-transparent rounded-2xl p-4 sm:p-0 border border-white/80 lg:border-0">
            {/* Feature 1: قوالب احترافية */}
            <div className="flex flex-col items-center text-center px-3">
              <div className="w-11 h-11 rounded-2xl bg-[#F3EEFF] border border-purple-100 flex items-center justify-center text-[#7C3AED] shadow-2xs mb-2.5">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-[#0C1B33]">قوالب احترافية</div>
              <div className="text-[11px] font-medium text-slate-500 mt-0.5">متنوعة ومميزة</div>
            </div>

            {/* Feature 2: تخصيص كامل */}
            <div className="flex flex-col items-center text-center px-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E8F3FF] border border-sky-100 flex items-center justify-center text-[#0284C7] shadow-2xs mb-2.5">
                <Palette className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-[#0C1B33]">تخصيص كامل</div>
              <div className="text-[11px] font-medium text-slate-500 mt-0.5">لكل العناصر</div>
            </div>

            {/* Feature 3: جودة عالية */}
            <div className="flex flex-col items-center text-center px-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E6FAF0] border border-emerald-100 flex items-center justify-center text-[#10B981] shadow-2xs mb-2.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-[#0C1B33]">جودة عالية</div>
              <div className="text-[11px] font-medium text-slate-500 mt-0.5">للطباعة والمشاركة</div>
            </div>

            {/* Feature 4: حفظ وتنزيل */}
            <div className="flex flex-col items-center text-center px-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF4E5] border border-amber-100 flex items-center justify-center text-[#F59E0B] shadow-2xs mb-2.5">
                <Download className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-[#0C1B33]">حفظ وتنزيل</div>
              <div className="text-[11px] font-medium text-slate-500 mt-0.5">بسهولة وأمان</div>
            </div>
          </div>

          {/* Studio Laptop Illustration Showing Luxury Arabic Certificate */}
          <div className="hidden sm:block relative pt-2">
            <div className="relative mx-auto max-w-[620px]">
              {/* Laptop Screen Lid */}
              <div className="relative mx-auto w-[88%] rounded-t-2xl bg-[#0F172A] p-2.5 sm:p-3 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.38)] border-2 border-slate-700/80">
                {/* Camera Notch */}
                <div className="w-2 h-2 rounded-full bg-slate-600 mx-auto mb-1.5" />

                {/* Simulated Studio Interface inside Laptop Screen */}
                <div className="rounded-lg overflow-hidden bg-[#1E293B] border border-slate-700 grid grid-cols-12 h-[250px] sm:h-[285px]">
                  {/* Right Mini Toolbar inside Laptop */}
                  <div className="col-span-1 bg-[#0F172A] border-l border-slate-800 flex flex-col items-center py-3 gap-3">
                    <div className="w-4 h-4 rounded bg-[#0061DF]" />
                    <div className="w-3.5 h-3.5 rounded bg-slate-700" />
                    <div className="w-3.5 h-3.5 rounded bg-slate-700" />
                    <div className="w-3.5 h-3.5 rounded bg-slate-700" />
                    <div className="w-3.5 h-3.5 rounded bg-slate-700" />
                  </div>

                  {/* Center Certificate Canvas inside Laptop */}
                  <div className="col-span-8 bg-slate-800/80 p-3 sm:p-4 flex items-center justify-center">
                    <div className="w-full h-full bg-[#FFFDF8] rounded shadow-lg border-2 border-[#D4AF37] p-2.5 relative flex flex-col items-center justify-between text-center overflow-hidden">
                      {/* Inner Ornate Gold Frame */}
                      <div className="pointer-events-none absolute inset-1.5 border border-[#D4AF37]/60 rounded-xs" />
                      {/* Corner Gold Flourishes */}
                      <div className="w-4 h-4 border-t-2 border-r-2 border-[#B8860B] absolute top-2.5 right-2.5" />
                      <div className="w-4 h-4 border-t-2 border-l-2 border-[#B8860B] absolute top-2.5 left-2.5" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-[#B8860B] absolute bottom-2.5 right-2.5" />
                      <div className="w-4 h-4 border-b-2 border-l-2 border-[#B8860B] absolute bottom-2.5 left-2.5" />

                      <div className="mt-2 space-y-1 z-10">
                        <div
                          className="text-lg sm:text-xl font-extrabold text-[#0A3D7A]"
                          style={{ fontFamily: 'Amiri, Cairo, serif' }}
                        >
                          شهادة تقدير
                        </div>
                        <div className="text-[10px] sm:text-xs font-semibold text-slate-600">
                          تمنح هذه الشهادة إلى
                        </div>
                        <div className="text-xs sm:text-sm font-extrabold text-[#0C1B33] pt-0.5 border-b border-[#D4AF37]/60 pb-1 px-4">
                          الأستاذ / خالد أحمد عبدالله الهاشمي
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-medium text-slate-600 pt-1">
                          لجهوده المتميزة وإسهاماته القيمة
                        </div>
                      </div>

                      {/* Bottom Seal & Twin Signatures */}
                      <div className="w-full flex items-end justify-between px-4 pb-1 z-10">
                        <div className="text-center">
                          <div className="text-[9px] text-slate-400 italic">توقيع معتمد</div>
                          <div className="w-12 h-px bg-slate-300 my-0.5" />
                          <div className="text-[8px] font-bold text-slate-600">مدير الأكاديمية</div>
                        </div>

                        {/* Gold Wax Ribbon Seal */}
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-2 border-amber-100 shadow flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full border border-white/60" />
                          </div>
                          <div className="flex gap-0.5 -mt-1">
                            <div className="w-1.5 h-3 bg-amber-600 rotate-12" />
                            <div className="w-1.5 h-3 bg-amber-700 -rotate-12" />
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-[9px] text-slate-400 italic">توقيع معتمد</div>
                          <div className="w-12 h-px bg-slate-300 my-0.5" />
                          <div className="text-[8px] font-bold text-slate-600">رئيس المجلس</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Left Color & Style Inspector inside Laptop */}
                  <div className="col-span-3 bg-[#0F172A] border-r border-slate-800 p-2.5 space-y-2.5">
                    <div className="h-2.5 w-14 bg-slate-700 rounded" />
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="h-3.5 rounded bg-[#0061DF]" />
                      <div className="h-3.5 rounded bg-[#D4AF37]" />
                      <div className="h-3.5 rounded bg-[#10B981]" />
                      <div className="h-3.5 rounded bg-[#F59E0B]" />
                      <div className="h-3.5 rounded bg-[#7C3AED]" />
                      <div className="h-3.5 rounded bg-slate-500" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div className="h-2 w-full bg-slate-800 rounded" />
                      <div className="h-2 w-4/5 bg-slate-800 rounded" />
                      <div className="h-5 w-full bg-[#0061DF]/80 rounded mt-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Metallic Laptop Base & Hinge */}
              <div className="relative mx-auto w-[96%] h-4 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 rounded-b-2xl shadow-[0_16px_30px_-6px_rgba(15,23,42,0.28)] border-t border-white flex items-center justify-center">
                <div className="w-20 h-1.5 rounded-full bg-slate-400/70" />
              </div>

              {/* Calligraphic Bottom-Left Tagline matching Reference ("إبداعك .. شهادة تميز") */}
              <div className="mt-4 flex items-center justify-end pl-4">
                <div className="text-center">
                  <div
                    className="text-base sm:text-lg font-bold text-[#0A3D7A]"
                    style={{ fontFamily: 'Aref Ruqaa, Amiri, serif' }}
                  >
                    إبداعك .. شهادة تميز
                  </div>
                  <svg
                    width="145"
                    height="14"
                    viewBox="0 0 145 14"
                    fill="none"
                    className="mx-auto -mt-0.5"
                  >
                    <path
                      d="M4 11C42 2 98 2 141 9"
                      stroke="#0061DF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
