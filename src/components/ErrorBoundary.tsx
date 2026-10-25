import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء عرض الواجهة.';
    return {
      hasError: true,
      errorMessage: message,
    };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
    console.error('[Certificate Studio AI Runtime Error]:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleResetLocalCacheAndReload = (): void => {
    try {
      localStorage.removeItem('cert_studio_active_draft_v3');
      localStorage.removeItem('cert_studio_settings_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6"
        >
          <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                تعذر عرض الواجهة بشكل كامل
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                حدث خطأ غير متوقع أثناء تحميل أحد مكونات المنصة. بياناتك المحفوظة آمنة ويمكنك إعادة
                تحميل الصفحة للمتابعة.
              </p>
            </div>

            {this.state.errorMessage && (
              <div
                dir="ltr"
                className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 text-left overflow-x-auto"
              >
                {this.state.errorMessage}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0061DF] hover:bg-[#0051BD] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل التطبيق</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetLocalCacheAndReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة ضبط المسودة المؤقتة</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
