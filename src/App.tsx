import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Bookmark,
  Check,
  Copy,
  Download,
  Edit3,
  Eye,
  FileJson,
  FilePlus2,
  FolderHeart,
  FolderKanban,
  Globe,
  Grid,
  HelpCircle,
  LayoutDashboard,
  LayoutList,
  Library,
  LogIn,
  LogOut,
  Palette,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  AppSettings,
  CertificateCategory,
  CertificateDesign,
  UILanguage,
} from './types/certificate';
import {
  ARTISTIC_STYLES,
  BUILTIN_LOGOS,
  CERTIFICATE_CATEGORIES,
  DIVIDER_CATALOG,
  FONT_LIBRARY,
  ORNAMENT_CATALOG,
  SEAL_CATALOG,
} from './data/stylesAndAssets';
import { createBlankCertificate, INITIAL_TEMPLATES } from './data/templates';
import { CertificateRenderer } from './components/CertificateRenderer';
import { EditorWorkspace } from './components/EditorWorkspace';
import { ExportModal } from './components/ExportModal';
import { BatchGenerator } from './components/BatchGenerator';
import { AuthPage, AuthenticatedUser } from './components/AuthPage';
import { verifySessionToken, logoutSession } from './utils/authService';
import { exportDesignAsJson } from './utils/exportCertificate';

type NavSection =
  | 'dashboard'
  | 'library'
  | 'editor'
  | 'my_templates'
  | 'saved_projects'
  | 'elements_library'
  | 'batch'
  | 'settings'
  | 'help';

const STORAGE_KEYS = {
  SAVED_PROJECTS: 'cert_studio_saved_projects_v3',
  USER_TEMPLATES: 'cert_studio_user_templates_v1',
  CUSTOM_CATEGORIES: 'cert_studio_custom_categories_v1',
  FAVORITE_IDS: 'cert_studio_favorite_ids_v1',
  SETTINGS: 'cert_studio_settings_v1',
  ACTIVE_DRAFT: 'cert_studio_active_draft_v3',
  AUTH_TOKEN: 'cert_studio_auth_token_v1',
  AUTH_USER: 'cert_studio_auth_user_v1',
};

function cloneDesignForEditing(source: CertificateDesign, language: UILanguage): CertificateDesign {
  const cloned: CertificateDesign = JSON.parse(JSON.stringify(source));
  return {
    ...cloned,
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: source.isTemplate
      ? language === 'ar'
        ? `${source.name} (نسخة قابلة للتعديل)`
        : `${source.name} (Editable Copy)`
      : source.name,
    isTemplate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function App() {
  // App Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {
      language: 'ar',
      platformNameAr: 'استوديو الشهادات الذكي',
      platformNameEn: 'Certificate Studio AI',
      brandPrimaryColor: '#0B192C',
      brandAccentColor: '#D4AF37',
      autoSave: true,
      defaultExportDpi: 300,
      defaultPageFormat: 'A4',
    };
  });

  const isAr = settings.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = isAr ? 'ar' : 'en';
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [isAr, settings]);

  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEYS.AUTH_USER) ||
        sessionStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  });

  const [showAuthView, setShowAuthView] = useState<boolean>(() => {
    const token =
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !token;
  });

  // Verify token against backend or local store on boot
  useEffect(() => {
    const token =
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;

    verifySessionToken(token)
      .then((session) => {
        if (!session.authenticated || !session.user) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
          sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
          setCurrentUser(null);
          setShowAuthView(true);
          return;
        }
        setCurrentUser(session.user);
      })
      .catch(() => {
        // Keep cached user if offline
      });
  }, []);

  const handleAuthenticated = (
    user: AuthenticatedUser,
    token: string,
    rememberMe: boolean
  ) => {
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
    setCurrentUser(user);
    setShowAuthView(false);
    setActiveSection('dashboard');
    showToast(`مرحبًا بعودتك، ${user.fullName}`);
  };

  const handleLogout = async () => {
    const token =
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      await logoutSession(token);
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setCurrentUser(null);
    setShowAuthView(true);
  };

  // Navigation Section
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');

  // Categories (10 built-in + custom user categories)
  const [customCategories, setCustomCategories] = useState<CertificateCategory[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  const allCategories = useMemo(
    () => [...CERTIFICATE_CATEGORIES, ...customCategories],
    [customCategories]
  );

  // Templates State
  const [templates, setTemplates] = useState<CertificateDesign[]>(INITIAL_TEMPLATES);

  // User Custom Templates State
  const [userTemplates, setUserTemplates] = useState<CertificateDesign[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_TEMPLATES);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  // Saved Projects State (seeded with 2 initial realistic projects if none exist)
  const [savedProjects, setSavedProjects] = useState<CertificateDesign[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PROJECTS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [
      cloneDesignForEditing(INITIAL_TEMPLATES[0], 'ar'),
      cloneDesignForEditing(INITIAL_TEMPLATES[2], 'ar'),
    ];
  });

  // Favorites Set
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FAVORITE_IDS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return ['tpl-01-royal-appreciation', 'tpl-02-luxury-honor', 'tpl-03-course-pass', 'tpl-06-academic-excellence'];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_PROJECTS, JSON.stringify(savedProjects));
  }, [savedProjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_TEMPLATES, JSON.stringify(userTemplates));
  }, [userTemplates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITE_IDS, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Active Design in Studio Editor + Undo/Redo History
  const [activeDesign, setActiveDesign] = useState<CertificateDesign>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return cloneDesignForEditing(INITIAL_TEMPLATES[0], 'ar');
  });

  const [originalTemplateSnapshot, setOriginalTemplateSnapshot] = useState<CertificateDesign>(
    () => INITIAL_TEMPLATES[0]
  );
  const [history, setHistory] = useState<CertificateDesign[]>([]);
  const [redoStack, setRedoStack] = useState<CertificateDesign[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>('الآن');

  // Modals & UI States
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [previewModalTemplate, setPreviewModalTemplate] = useState<CertificateDesign | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<string>('all');
  const [selectedOrientationFilter, setSelectedOrientationFilter] = useState<'all' | 'landscape' | 'portrait'>('all');
  const [selectedLangFilter, setSelectedLangFilter] = useState<'all' | 'ar' | 'en'>('all');
  const [librarySort, setLibrarySort] = useState<'popular' | 'featured' | 'favorites'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Custom Category Creation
  const [newCategoryNameAr, setNewCategoryNameAr] = useState('');
  const [newCategoryDescAr, setNewCategoryDescAr] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Auto-save active draft
  useEffect(() => {
    if (!settings.autoSave) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(activeDesign));
    const now = new Date();
    setLastSavedAt(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
  }, [activeDesign, settings.autoSave]);

  const handleUpdateActiveDesign = (updated: CertificateDesign, pushHistory = true) => {
    if (pushHistory) {
      setHistory((prev) => [...prev.slice(-24), activeDesign]);
      setRedoStack([]);
    }
    setActiveDesign(updated);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack((r) => [activeDesign, ...r]);
    setHistory((h) => h.slice(0, -1));
    setActiveDesign(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((h) => [...h, activeDesign]);
    setRedoStack((r) => r.slice(1));
    setActiveDesign(next);
  };

  const handleUseTemplate = (tpl: CertificateDesign) => {
    // Increment usage count on template
    setTemplates((prev) =>
      prev.map((t) => (t.id === tpl.id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t))
    );
    const editableCopy = cloneDesignForEditing(tpl, settings.language);
    setOriginalTemplateSnapshot(tpl);
    setHistory([]);
    setRedoStack([]);
    setActiveDesign(editableCopy);
    setActiveSection('editor');
    showToast(
      isAr
        ? `تم فتح نسخة قابلة للتحرير من «${tpl.name}» داخل المحرر.`
        : `Opened an editable copy of "${tpl.name}" in the Studio Editor.`
    );
  };

  const handleStartBlank = (orientation: 'landscape' | 'portrait' = 'landscape') => {
    const blank = createBlankCertificate(orientation, settings.language);
    setOriginalTemplateSnapshot(blank);
    setHistory([]);
    setRedoStack([]);
    setActiveDesign(blank);
    setActiveSection('editor');
    showToast(
      isAr
        ? `تم إنشاء شهادة جديدة قابلة للتخصيص الكامل (${orientation === 'landscape' ? 'أفقي' : 'عمودي'}).`
        : `Created a new customizable blank certificate (${orientation}).`
    );
  };

  const handleSaveCurrentProject = () => {
    setSavedProjects((prev) => {
      const exists = prev.some((p) => p.id === activeDesign.id);
      if (exists) {
        return prev.map((p) =>
          p.id === activeDesign.id ? { ...activeDesign, updatedAt: new Date().toISOString() } : p
        );
      }
      return [{ ...activeDesign, updatedAt: new Date().toISOString() }, ...prev];
    });
    showToast(
      isAr
        ? 'تم حفظ التصميم بنجاح ضمن «تصاميمي المحفوظة» على هذا الجهاز.'
        : 'Project saved to your Saved Designs.'
    );
  };

  const handleSaveCurrentAsUserTemplate = () => {
    const templateCopy: CertificateDesign = {
      ...JSON.parse(JSON.stringify(activeDesign)),
      id: `usr-tpl-${Date.now()}`,
      name: `${activeDesign.name} (${isAr ? 'قالب خاص' : 'Custom Template'})`,
      isTemplate: true,
      isCustomUserTemplate: true,
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUserTemplates((prev) => [templateCopy, ...prev]);
    showToast(
      isAr
        ? 'تم حفظ التصميم كقالب خاص في قسم «قوالبي الخاصة» لإعادة استخدامه.'
        : 'Saved design to "My Custom Templates".'
    );
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleImportJsonProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result !== 'string') return;
        const parsed = JSON.parse(reader.result) as CertificateDesign;
        if (parsed && parsed.pageConfig && Array.isArray(parsed.elements)) {
          const imported: CertificateDesign = {
            ...parsed,
            id: `imp-${Date.now()}`,
            updatedAt: new Date().toISOString(),
          };
          setSavedProjects((prev) => [imported, ...prev]);
          setActiveDesign(imported);
          setActiveSection('editor');
          showToast(
            isAr ? 'تم استيراد ملف المشروع JSON بنجاح وفتحه في المحرر.' : 'Successfully imported JSON project.'
          );
        }
      } catch {
        showToast(isAr ? 'ملف JSON غير صالح.' : 'Invalid JSON project file.');
      }
    };
    reader.readAsText(file);
  };

  const allCombinedTemplates = useMemo(
    () => [...userTemplates, ...templates],
    [userTemplates, templates]
  );

  const filteredTemplates = useMemo(() => {
    return allCombinedTemplates
      .filter((tpl) => {
        if (selectedCategoryFilter !== 'all' && tpl.categoryId !== selectedCategoryFilter) {
          return false;
        }
        if (selectedStyleFilter !== 'all' && tpl.styleId !== selectedStyleFilter) {
          return false;
        }
        if (
          selectedOrientationFilter !== 'all' &&
          tpl.pageConfig.orientation !== selectedOrientationFilter
        ) {
          return false;
        }
        if (selectedLangFilter !== 'all' && tpl.language !== selectedLangFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = tpl.name.toLowerCase().includes(q);
          const matchSub = (tpl.subtypeAr || '').toLowerCase().includes(q);
          const matchText = tpl.elements.some(
            (el) => el.type === 'text' && el.content.toLowerCase().includes(q)
          );
          return matchName || matchSub || matchText;
        }
        return true;
      })
      .sort((a, b) => {
        if (librarySort === 'favorites') {
          return (favoriteIds.includes(b.id) ? 1 : 0) - (favoriteIds.includes(a.id) ? 1 : 0);
        }
        if (librarySort === 'featured') {
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
        return (b.usageCount || 0) - (a.usageCount || 0);
      });
  }, [
    allCombinedTemplates,
    selectedCategoryFilter,
    selectedStyleFilter,
    selectedOrientationFilter,
    selectedLangFilter,
    searchQuery,
    librarySort,
    favoriteIds,
  ]);

  const activeCategoryObj = useMemo(
    () => allCategories.find((c) => c.id === selectedCategoryFilter),
    [allCategories, selectedCategoryFilter]
  );

  // Reusable Template Card Component
  const renderTemplateCard = (tpl: CertificateDesign) => {
    const isFav = favoriteIds.includes(tpl.id);
    const cat = allCategories.find((c) => c.id === tpl.categoryId);
    const styleObj = ARTISTIC_STYLES.find((s) => s.id === tpl.styleId);

    if (viewMode === 'list') {
      return (
        <div
          key={tpl.id}
          className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-amber-500/70 transition-colors"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div
              onClick={() => setPreviewModalTemplate(tpl)}
              className="w-36 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 cursor-pointer"
            >
              <CertificateRenderer design={tpl} interactive={false} exportMode={true} />
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{tpl.name}</h4>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span>{isAr ? cat?.nameAr : cat?.nameEn}</span>
                <span aria-hidden="true">·</span>
                <span>{isAr ? styleObj?.nameAr : styleObj?.nameEn}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {tpl.pageConfig.orientation === 'landscape'
                    ? isAr
                      ? 'أفقي'
                      : 'Landscape'
                    : isAr
                    ? 'عمودي'
                    : 'Portrait'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => toggleFavorite(tpl.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isFav
                  ? 'border-amber-300 bg-amber-50 text-amber-600'
                  : 'border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title={isAr ? 'إضافة للمفضلة' : 'Favorite'}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewModalTemplate(tpl)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              {isAr ? 'معاينة' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={() => handleUseTemplate(tpl)}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              {isAr ? 'استخدام هذا القالب' : 'Use Template'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={tpl.id}
        className="group bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-amber-500/80 transition-colors"
      >
        {/* Live Miniature Certificate Preview */}
        <div
          onClick={() => setPreviewModalTemplate(tpl)}
          className="relative w-full bg-slate-100 border-b border-slate-200 p-3 flex items-center justify-center cursor-pointer overflow-hidden"
          style={{ height: '215px' }}
        >
          <div
            className="h-full shadow-md rounded-xs overflow-hidden bg-white transition-transform duration-200 group-hover:scale-[1.02]"
            style={{
              aspectRatio: `${tpl.pageConfig.widthPx} / ${tpl.pageConfig.heightPx}`,
              maxWidth: '100%',
            }}
          >
            <CertificateRenderer design={tpl} interactive={false} exportMode={true} />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(tpl.id);
            }}
            title={isAr ? 'إضافة للمفضلة' : 'Favorite'}
            className={`absolute top-2.5 left-2.5 p-1.5 rounded-lg border backdrop-blur-xs transition-colors ${
              isFav
                ? 'bg-amber-50/90 border-amber-300 text-amber-500'
                : 'bg-white/80 border-slate-200 text-slate-400 hover:text-amber-500'
            }`}
          >
            <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Card Content & Unboxed Metadata */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{tpl.name}</h4>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>{isAr ? cat?.nameAr : cat?.nameEn}</span>
              <span aria-hidden="true">·</span>
              <span>
                {tpl.pageConfig.orientation === 'landscape'
                  ? isAr
                    ? 'أفقي'
                    : 'Landscape'
                  : isAr
                  ? 'عمودي'
                  : 'Portrait'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {tpl.usageCount || 1} {isAr ? 'استخدام' : 'uses'}
              </span>
            </div>

            {/* Color Swatches & Style Name */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                {isAr ? styleObj?.nameAr : styleObj?.nameEn}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className="w-3 h-3 rounded-full border border-slate-300"
                  style={{ backgroundColor: tpl.pageConfig.frameColor }}
                />
                <span
                  className="w-3 h-3 rounded-full border border-slate-300"
                  style={{ backgroundColor: tpl.pageConfig.frameAccentColor }}
                />
                <span
                  className="w-3 h-3 rounded-full border border-slate-300"
                  style={{ backgroundColor: tpl.pageConfig.backgroundColor }}
                />
              </div>
            </div>
          </div>

          {/* Card Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleUseTemplate(tpl)}
              className="flex-1 py-2 px-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap text-center"
            >
              {isAr ? 'استخدام هذا القالب' : 'Use Template'}
            </button>
            <button
              type="button"
              onClick={() => setPreviewModalTemplate(tpl)}
              title={isAr ? 'معاينة مكبرة' : 'Preview'}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const dup: CertificateDesign = {
                  ...JSON.parse(JSON.stringify(tpl)),
                  id: `usr-tpl-${Date.now()}`,
                  name: `${tpl.name} (${isAr ? 'نسخة مكررة' : 'Copy'})`,
                  isCustomUserTemplate: true,
                };
                setUserTemplates((prev) => [dup, ...prev]);
                showToast(isAr ? 'تم تكرار القالب وإضافته إلى قوالبي الخاصة.' : 'Template duplicated.');
              }}
              title={isAr ? 'تكرار القالب' : 'Duplicate Template'}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showAuthView) {
    return (
      <AuthPage
        onAuthenticated={handleAuthenticated}
        onContinueAsGuest={() => setShowAuthView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: Zone 1 (Single Brand Wordmark) — Zone 2 (Concise Nav Links) — Zone 3 (1 Primary CTA) */}
      <header className="sticky top-0 z-30 bg-slate-950 text-white border-b border-slate-800 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title */}
        <button
          type="button"
          onClick={() => setActiveSection('dashboard')}
          className="text-lg font-extrabold tracking-tight text-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isAr ? settings.platformNameAr : settings.platformNameEn}
        </button>

        {/* Zone 2: 5 Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {(
            [
              ['dashboard', isAr ? 'الرئيسية' : 'Dashboard'],
              ['library', isAr ? 'مكتبة الشهادات' : 'Templates'],
              ['editor', isAr ? 'محرر التصميم' : 'Studio Editor'],
              ['saved_projects', isAr ? 'تصاميمي المحفوظة' : 'Saved Projects'],
              ['batch', isAr ? 'إنشاء جماعي' : 'Batch Studio'],
            ] as const
          ).map(([secId, label]) => (
            <button
              key={secId}
              type="button"
              onClick={() => setActiveSection(secId)}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeSection === secId
                  ? 'text-white border-amber-400 font-bold'
                  : 'border-transparent text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('editor')}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            {isAr ? 'إنشاء شهادة جديدة' : 'Create Certificate'}
          </button>
        </div>
      </header>

      {/* Secondary Workspace Section Bar (Provides instant access to all 9 sections + Language switch + Auth status) */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {(
            [
              ['dashboard', LayoutDashboard, isAr ? '1. الرئيسية' : '1. Dashboard'],
              ['library', Library, isAr ? '2. مكتبة الشهادات' : '2. Library'],
              ['editor', Edit3, isAr ? '3. محرر التصميم' : '3. Editor'],
              ['my_templates', Bookmark, isAr ? '4. قوالبي الخاصة' : '4. My Templates'],
              ['saved_projects', FolderKanban, isAr ? '5. تصاميمي المحفوظة' : '5. Saved Designs'],
              ['elements_library', Palette, isAr ? '6. عناصر التصميم' : '6. Design Elements'],
              ['batch', Users, isAr ? '7. إنشاء جماعي' : '7. Batch Generator'],
              ['settings', Settings, isAr ? '8. الإعدادات' : '8. Settings'],
              ['help', HelpCircle, isAr ? '9. المساعدة' : '9. Help'],
            ] as const
          ).map(([sec, Icon, label]) => (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveSection(sec)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeSection === sec
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Account & Language Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 px-2.5 py-1 bg-slate-100 rounded-lg whitespace-nowrap">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentUser.fullName}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthView(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0061DF] hover:bg-[#0051BD] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>
          )}

          {/* Language Switcher Button */}
          <button
            type="button"
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                language: prev.language === 'ar' ? 'en' : 'ar',
              }))
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>{isAr ? 'English (LTR)' : 'العربية (RTL)'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold">
          <Check className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {/* ==================== SECTION 1: DASHBOARD ==================== */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero Welcome Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs font-semibold text-amber-400 tracking-wide">
                  {isAr
                    ? 'Certificate Studio AI · منصة صناعة وتصميم الشهادات الاحترافية'
                    : 'Certificate Studio AI · Professional Certificate Design Platform'}
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight text-balance">
                  {isAr
                    ? 'صمّم شهادات شكر وتكريم ودورات تدريبية فاخرة خلال دقائق بجودة طباعية 300 DPI'
                    : 'Design Luxury Appreciation, Honor & Training Certificates in Minutes at 300 DPI'}
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {isAr
                    ? `انطلق من مكتبة غنية تضم (${allCombinedTemplates.length}) قالبًا عربيًا وإنجليزيًا قابلًا للتحرير الكامل، أو ابدأ من صفحة فارغة مع (${ARTISTIC_STYLES.length}) نمطًا فنيًا ومؤسسيًا للأعمال، (${FONT_LIBRARY.length}) خطًا عربيًا مزخرفًا ولاتينيًا، أختام وتوقيعات حية، وتصدير فوري بصيغ PDF وPNG وSVG.`
                    : `Start from ${allCombinedTemplates.length} fully editable Arabic & English templates or a blank canvas with ${ARTISTIC_STYLES.length} artistic & corporate styles, ${FONT_LIBRARY.length} fonts, live signatures, and print-ready PDF/PNG/SVG export.`}
                </p>

                {/* Primary Dashboard Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('editor')}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isAr ? 'إنشاء شهادة جديدة' : 'Create New Certificate'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection('library')}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
                  >
                    <Library className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'استعراض جميع القوالب' : 'Browse All Templates'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartBlank('landscape')}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800/70 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    <FilePlus2 className="w-4 h-4" />
                    <span>{isAr ? 'البدء من صفحة فارغة' : 'Start from Blank Page'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection('saved_projects')}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800/70 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    <FolderKanban className="w-4 h-4" />
                    <span>{isAr ? 'شهاداتي المحفوظة' : 'My Saved Certificates'}</span>
                  </button>
                </div>
              </div>

              {/* Hero Live Interactive Certificate Preview */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div
                  onClick={() => setActiveSection('editor')}
                  className="w-full rounded-xl overflow-hidden shadow-2xl border-2 border-amber-400/40 bg-white cursor-pointer hover:scale-[1.01] transition-transform"
                  style={{
                    aspectRatio: `${activeDesign.pageConfig.widthPx} / ${activeDesign.pageConfig.heightPx}`,
                  }}
                >
                  <CertificateRenderer design={activeDesign} interactive={false} exportMode={true} />
                </div>
                <span className="text-[11px] text-slate-400 mt-2">
                  {isAr ? 'انقر على المعاينة لمتابعة تحرير تصميمك النشط في الاستوديو' : 'Click preview to continue editing active design'}
                </span>
              </div>
            </div>

            {/* Real Dynamic Platform Statistics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                {
                  label: isAr ? 'إجمالي القوالب المتاحة' : 'Available Templates',
                  value: allCombinedTemplates.length,
                  sub: isAr ? 'قوالب عربية وإنجليزية' : 'Editable vector templates',
                },
                {
                  label: isAr ? 'الأنماط الفنية المستقلة' : 'Artistic Styles',
                  value: ARTISTIC_STYLES.length,
                  sub: isAr ? 'إطارات وزخارف متنوعة' : 'Independent style themes',
                },
                {
                  label: isAr ? 'التصاميم المحفوظة' : 'Saved Projects',
                  value: savedProjects.length,
                  sub: isAr ? 'محفوظة محليًا بأمان' : 'Stored locally on device',
                },
                {
                  label: isAr ? 'قوالبي الخاصة' : 'Custom Templates',
                  value: userTemplates.length,
                  sub: isAr ? 'قابلة لإعادة الاستخدام' : 'Created by you',
                },
                {
                  label: isAr ? 'التصاميم المفضلة' : 'Favorite Templates',
                  value: favoriteIds.length,
                  sub: isAr ? 'وصول سريع' : 'Bookmarked designs',
                },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1">{stat.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Main Certificate Categories Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {isAr ? 'التصنيفات الرئيسية للشهادات (10 فئات شاملة)' : 'Main Certificate Categories'}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {isAr
                      ? 'اختر التصنيف لاستعراض القوالب المصممة خصيصًا لكل مناسبة أو غرض مؤسسي وتعليمي'
                      : 'Select a category to explore tailored templates'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter('all');
                    setActiveSection('library');
                  }}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  {isAr ? 'عرض المكتبة الكاملة ←' : 'View Full Library →'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {allCategories.map((cat) => {
                  const count = allCombinedTemplates.filter((t) => t.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryFilter(cat.id);
                        setActiveSection('library');
                      }}
                      className="bg-white rounded-xl border border-slate-200 p-4 text-right hover:border-amber-500 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {isAr ? cat.nameAr : cat.nameEn}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {isAr ? cat.descriptionAr : cat.descriptionEn}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                        <span className="tabular-nums">
                          {count} {isAr ? 'قالب جاهز' : 'templates'}
                        </span>
                        <span className="tabular-nums">
                          {cat.subtypesAr.length} {isAr ? 'نوع فرعي' : 'subtypes'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Featured & New Templates Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {isAr ? 'القوالب الجديدة والمميزة' : 'Featured & New Templates'}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {isAr
                      ? 'نماذج مختارة بعناية بتكوينات بصرية متنوعة وإطارات ملكية وهندسية'
                      : 'Hand-picked templates with distinct frames and typography'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('library')}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900"
                >
                  {isAr ? 'استعراض الكل' : 'Browse All'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {templates
                  .filter((t) => t.featured)
                  .slice(0, 4)
                  .map(renderTemplateCard)}
              </div>
            </section>

            {/* Most Used Templates Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {isAr ? 'القوالب الأكثر استخدامًا' : 'Most Popular Templates'}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {isAr
                      ? 'الشهادات الأعلى إقبالًا في الدورات التدريبية والشكر والتفوق الدراسي'
                      : 'Top templates used for training, appreciation, and academic honors'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...templates]
                  .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
                  .slice(0, 4)
                  .map(renderTemplateCard)}
              </div>
            </section>

            {/* Recently Edited Designs & Favorites Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recently Edited Certificates */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    {isAr ? 'الشهادات التي تم تعديلها مؤخرًا' : 'Recently Edited Certificates'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSection('saved_projects')}
                    className="text-xs font-semibold text-amber-700 hover:underline"
                  >
                    {isAr ? 'إدارة المشاريع' : 'Manage All'}
                  </button>
                </div>

                <div className="space-y-3">
                  {savedProjects.slice(0, 3).map((proj) => (
                    <div
                      key={proj.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-24 h-16 rounded border border-slate-200 bg-white overflow-hidden shrink-0">
                          <CertificateRenderer design={proj} interactive={false} exportMode={true} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{proj.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {proj.pageConfig.format} · {new Date(proj.updatedAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDesign(proj);
                          setActiveSection('editor');
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shrink-0"
                      >
                        {isAr ? 'استكمال التحرير' : 'Edit'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favorite Templates */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    {isAr ? 'التصاميم والقوالب المفضلة' : 'Favorite Templates'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setLibrarySort('favorites');
                      setActiveSection('library');
                    }}
                    className="text-xs font-semibold text-amber-700 hover:underline"
                  >
                    {isAr ? 'عرض المفضلة' : 'View Favorites'}
                  </button>
                </div>

                <div className="space-y-3">
                  {allCombinedTemplates
                    .filter((t) => favoriteIds.includes(t.id))
                    .slice(0, 3)
                    .map((fav) => (
                      <div
                        key={fav.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/60"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-24 h-16 rounded border border-slate-200 bg-white overflow-hidden shrink-0">
                            <CertificateRenderer design={fav} interactive={false} exportMode={true} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">{fav.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{fav.subtypeAr}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUseTemplate(fav)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 rounded-lg hover:bg-amber-300 shrink-0"
                        >
                          {isAr ? 'استخدام' : 'Use'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SECTION 2: TEMPLATE LIBRARY ==================== */}
        {activeSection === 'library' && (
          <div className="space-y-6">
            {/* Search & Multi-Filter Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {isAr ? 'مكتبة قوالب الشهادات الاحترافية' : 'Certificate Template Library'}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {isAr
                      ? `إجمالي (${filteredTemplates.length}) قالب حقيقي قابل للتحرير الكامل للنصوص والإطارات والزخارف`
                      : `Showing ${filteredTemplates.length} fully editable certificate templates`}
                  </p>
                </div>

                {/* Search Box & Grid/List View Toggle */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        isAr ? 'ابحث عن شهادة (شكر، دورة، تفوق، معلم...)' : 'Search templates...'
                      }
                      className="w-full pr-9 pl-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded ${
                        viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded ${
                        viewMode === 'list' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isAr ? `جميع التصنيفات (${allCombinedTemplates.length})` : `All Categories (${allCombinedTemplates.length})`}
                </button>
                {allCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isAr ? cat.nameAr : cat.nameEn}
                  </button>
                ))}
              </div>

              {/* Secondary Filters: Style, Orientation, Language, Sort */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                <select
                  value={selectedStyleFilter}
                  onChange={(e) => setSelectedStyleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">
                    {isAr
                      ? `جميع الأنماط الفنية والرسمية (${ARTISTIC_STYLES.length} نمطًا)`
                      : `All ${ARTISTIC_STYLES.length} Artistic & Business Styles`}
                  </option>
                  {ARTISTIC_STYLES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.number}. {isAr ? st.nameAr : st.nameEn}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedOrientationFilter}
                  onChange={(e) => setSelectedOrientationFilter(e.target.value as 'all' | 'landscape' | 'portrait')}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">{isAr ? 'جميع الاتجاهات (أفقي وعمودي)' : 'All Orientations'}</option>
                  <option value="landscape">{isAr ? 'أفقي (Landscape)' : 'Landscape'}</option>
                  <option value="portrait">{isAr ? 'عمودي (Portrait)' : 'Portrait'}</option>
                </select>

                <select
                  value={selectedLangFilter}
                  onChange={(e) => setSelectedLangFilter(e.target.value as 'all' | 'ar' | 'en')}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">{isAr ? 'جميع اللغات (العربية والإنجليزية)' : 'All Languages'}</option>
                  <option value="ar">{isAr ? 'شهادات باللغة العربية (RTL)' : 'Arabic Certificates'}</option>
                  <option value="en">{isAr ? 'شهادات باللغة الإنجليزية (LTR)' : 'English Certificates'}</option>
                </select>

                <select
                  value={librarySort}
                  onChange={(e) => setLibrarySort(e.target.value as 'popular' | 'featured' | 'favorites')}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="popular">{isAr ? 'الترتيب: الأكثر استخدامًا' : 'Sort: Most Used'}</option>
                  <option value="featured">{isAr ? 'الترتيب: القوالب المميزة' : 'Sort: Featured'}</option>
                  <option value="favorites">{isAr ? 'الترتيب: المفضلة أولًا' : 'Sort: Favorites First'}</option>
                </select>
              </div>

              {/* Subtypes list & Disclaimer when a specific category is selected */}
              {activeCategoryObj && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900">
                    {isAr
                      ? `النماذج المشمولة في ${activeCategoryObj.nameAr}:`
                      : `Included Subtypes in ${activeCategoryObj.nameEn}:`}
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {activeCategoryObj.subtypesAr.join('  ·  ')}
                  </div>
                  {activeCategoryObj.disclaimerAr && (
                    <div className="text-[11px] font-medium text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2">
                      {isAr ? activeCategoryObj.disclaimerAr : activeCategoryObj.disclaimerEn}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Templates Grid / List */}
            {filteredTemplates.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
                <p className="text-sm font-bold text-slate-800">
                  {isAr ? 'لا توجد قوالب مطابقة لمعايير التصفية الحالية' : 'No templates match your current filters'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter('all');
                    setSelectedStyleFilter('all');
                    setSelectedOrientationFilter('all');
                    setSelectedLangFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg"
                >
                  {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                    : 'space-y-3'
                }
              >
                {filteredTemplates.map(renderTemplateCard)}
              </div>
            )}
          </div>
        )}

        {/* ==================== SECTION 3: STUDIO EDITOR ==================== */}
        {activeSection === 'editor' && (
          <EditorWorkspace
            design={activeDesign}
            language={settings.language}
            onChangeDesign={handleUpdateActiveDesign}
            onSaveProject={handleSaveCurrentProject}
            onSaveAsTemplate={handleSaveCurrentAsUserTemplate}
            onOpenExportModal={() => setExportModalOpen(true)}
            onResetToOriginal={() => {
              const resetCopy = cloneDesignForEditing(originalTemplateSnapshot, settings.language);
              handleUpdateActiveDesign(resetCopy, true);
              showToast(isAr ? 'تمت إعادة ضبط الشهادة إلى حالة القالب الأصلي.' : 'Reset to original template.');
            }}
            canUndo={history.length > 0}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            lastSavedAt={lastSavedAt}
          />
        )}

        {/* ==================== SECTION 4: MY CUSTOM TEMPLATES ==================== */}
        {activeSection === 'my_templates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {isAr ? 'قوالبي الخاصة والتصنيفات المخصصة' : 'My Custom Templates & Categories'}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {isAr
                    ? 'احفظ أي شهادة تصممها كقالب خاص لإعادة استخدامها لاحقًا، أو أضف تصنيفات خاصة بمؤسستك.'
                    : 'Save your custom certificate designs as reusable templates or create new categories.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveCurrentAsUserTemplate}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'حفظ التصميم النشط حاليًا كقالب خاص' : 'Save Active Design as Template'}</span>
              </button>
            </div>

            {userTemplates.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
                <FolderHeart className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-800">
                  {isAr ? 'لم تقم بحفظ قوالب خاصة بعد' : 'No custom templates saved yet'}
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {isAr
                    ? 'يمكنك فتح أي شهادة في المحرر وتعديلها ثم الضغط على زر «حفظ كقالب» لتظهر هنا.'
                    : 'Customize any certificate in the Editor and click "Save Template" to add it here.'}
                </p>
                <button
                  type="button"
                  onClick={handleSaveCurrentAsUserTemplate}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300"
                >
                  {isAr ? 'حفظ الشهادة الحالية كأول قالب خاص' : 'Save Current Design as First Template'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {userTemplates.map(renderTemplateCard)}
              </div>
            )}

            {/* Add New Custom Category Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                {isAr ? 'إضافة تصنيف شهادات مخصص جديد للمنصة' : 'Create Custom Certificate Category'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newCategoryNameAr}
                  onChange={(e) => setNewCategoryNameAr(e.target.value)}
                  placeholder={isAr ? 'اسم التصنيف الجديد (مثال: شهادات العضوية الشرفية)' : 'Category Name'}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={newCategoryDescAr}
                  onChange={(e) => setNewCategoryDescAr(e.target.value)}
                  placeholder={isAr ? 'وصف مختصر للتصنيف...' : 'Short description...'}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  disabled={!newCategoryNameAr.trim()}
                  onClick={() => {
                    const newCat: CertificateCategory = {
                      id: `custom-cat-${Date.now()}`,
                      nameAr: newCategoryNameAr.trim(),
                      nameEn: newCategoryNameAr.trim(),
                      descriptionAr: newCategoryDescAr.trim() || 'تصنيف مخصص أنشأه المستخدم',
                      descriptionEn: newCategoryDescAr.trim() || 'User-defined category',
                      subtypesAr: [newCategoryNameAr.trim()],
                      isCustom: true,
                    };
                    setCustomCategories((prev) => [...prev, newCat]);
                    setNewCategoryNameAr('');
                    setNewCategoryDescAr('');
                    showToast(isAr ? 'تمت إضافة التصنيف الجديد بنجاح.' : 'Custom category added.');
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40"
                >
                  {isAr ? 'إضافة التصنيف إلى المكتبة' : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SECTION 5: SAVED PROJECTS ==================== */}
        {activeSection === 'saved_projects' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {isAr ? 'تصاميمي ومشاريعي المحفوظة' : 'My Saved Certificate Projects'}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {isAr
                    ? 'حالة التخزين: محفوظ محليًا على هذا الجهاز (Local Storage). يمكنك أيضًا تصدير أي مشروع كملف JSON أو استيراده.'
                    : 'Storage status: Saved locally on this device. You can also export or import JSON project files.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <label className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? 'استيراد ملف مشروع (JSON)' : 'Import JSON Project'}</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportJsonProject}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => handleStartBlank('landscape')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'إنشاء مشروع جديد' : 'New Project'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between"
                >
                  <div
                    onClick={() => {
                      setActiveDesign(proj);
                      setActiveSection('editor');
                    }}
                    className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-center cursor-pointer"
                    style={{ height: '200px' }}
                  >
                    <div
                      className="h-full shadow-sm bg-white rounded-xs overflow-hidden"
                      style={{
                        aspectRatio: `${proj.pageConfig.widthPx} / ${proj.pageConfig.heightPx}`,
                      }}
                    >
                      <CertificateRenderer design={proj} interactive={false} exportMode={true} />
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setSavedProjects((prev) =>
                            prev.map((p) => (p.id === proj.id ? { ...p, name: newName } : p))
                          );
                        }}
                        className="w-full text-sm font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-amber-600 focus:outline-none pb-0.5"
                      />
                      <div className="text-[11px] text-slate-500 mt-1">
                        {isAr ? 'آخر تعديل:' : 'Updated:'}{' '}
                        {new Date(proj.updatedAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDesign(proj);
                          setActiveSection('editor');
                        }}
                        className="flex-1 py-2 px-3 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 text-center"
                      >
                        {isAr ? 'فتح واستكمال التصميم' : 'Open in Editor'}
                      </button>

                      <button
                        type="button"
                        onClick={() => exportDesignAsJson(proj)}
                        title={isAr ? 'تصدير كملف JSON' : 'Export JSON'}
                        className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      >
                        <FileJson className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const copy = cloneDesignForEditing(proj, settings.language);
                          copy.name = `${proj.name} (${isAr ? 'نسخة' : 'Copy'})`;
                          setSavedProjects((prev) => [copy, ...prev]);
                        }}
                        title={isAr ? 'إنشاء نسخة' : 'Duplicate'}
                        className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(proj.id)}
                        title={isAr ? 'حذف التصميم' : 'Delete'}
                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {deleteConfirmId === proj.id && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                        <span className="font-semibold text-rose-900">
                          {isAr ? 'تأكيد حذف هذا المشروع؟' : 'Confirm delete?'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSavedProjects((prev) => prev.filter((p) => p.id !== proj.id));
                              setDeleteConfirmId(null);
                            }}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold"
                          >
                            {isAr ? 'نعم، احذف' : 'Delete'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== SECTION 6: DESIGN ELEMENTS LIBRARY ==================== */}
        {activeSection === 'elements_library' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-extrabold text-slate-900">
                {isAr
                  ? `مكتبة عناصر التصميم (${FONT_LIBRARY.length} خطًا مزخرفًا، ${ARTISTIC_STYLES.length} نمطًا رسميًا، الأوسمة، الأختام، والشعارات)`
                  : `Design Elements Library (${FONT_LIBRARY.length} Fonts, ${ARTISTIC_STYLES.length} Styles, Ornaments, Seals & Logos)`}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isAr
                  ? 'انقر على أي عنصر أو نمط أو خط لإضافته أو تطبيقه مباشرة على شهادتك النشطة في المحرر.'
                  : 'Click any asset or style below to insert or apply it directly to your active certificate in the Studio Editor.'}
              </p>
            </div>

            {/* Arabic & Latin Fonts Showcase */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? '1. مكتبة الخطوط العربية واللاتينية الاحترافية' : '1. Arabic & Latin Font Library'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {FONT_LIBRARY.map((f) => (
                  <div
                    key={f.family}
                    className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-amber-700">
                        {isAr ? f.categoryAr : f.categoryEn}
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {isAr ? f.labelAr : f.labelEn}
                      </div>
                      <div
                        className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-center"
                        style={{ fontFamily: f.family, fontSize: '20px' }}
                      >
                        {f.script === 'ar'
                          ? 'شهادة شكر وتقدير وتميز'
                          : 'Certificate of Excellence'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDesign((prev) => ({
                          ...prev,
                          elements: prev.elements.map((el) =>
                            el.type === 'text' && el.fieldRole === 'title'
                              ? { ...el, fontFamily: f.family }
                              : el
                          ),
                        }));
                        setActiveSection('editor');
                        showToast(
                          isAr
                            ? `تم تطبيق خط (${f.family}) على عنوان الشهادة في المحرر.`
                            : `Applied font ${f.family} to certificate title.`
                        );
                      }}
                      className="w-full py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg transition-colors"
                    >
                      {isAr ? 'تطبيق على عنوان الشهادة' : 'Apply to Title'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Vector Ornaments & Badges */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? '2. التيجان والأوسمة والزخارف المتجهة (SVG)' : '2. Vector Ornaments & Medals'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {ORNAMENT_CATALOG.map((orn) => (
                  <button
                    key={orn.variant}
                    type="button"
                    onClick={() => {
                      const newOrn = {
                        id: `orn-${Date.now()}`,
                        type: 'ornament' as const,
                        name: isAr ? orn.nameAr : orn.nameEn,
                        variant: orn.variant,
                        color: orn.defaultColor,
                        secondaryColor: activeDesign.pageConfig.frameColor,
                        x: Math.round(activeDesign.pageConfig.widthPx / 2 - 40),
                        y: Math.round(activeDesign.pageConfig.heightPx / 2 - 40),
                        width: 80,
                        height: 80,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        visible: true,
                        zIndex: activeDesign.elements.length + 1,
                      };
                      handleUpdateActiveDesign({
                        ...activeDesign,
                        elements: [...activeDesign.elements, newOrn],
                      });
                      setActiveSection('editor');
                    }}
                    className="bg-white rounded-xl border border-slate-200 p-3.5 text-center hover:border-amber-500 transition-colors flex flex-col items-center justify-between gap-2"
                  >
                    <Award className="w-7 h-7" style={{ color: orn.defaultColor }} />
                    <div className="text-xs font-bold text-slate-800">
                      {isAr ? orn.nameAr : orn.nameEn}
                    </div>
                    <span className="text-[10px] text-slate-500">{orn.categoryAr}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Institutional Emblems & Seals */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? '3. الشعارات المؤسسية والأختام التصميمية' : '3. Institutional Emblems & Design Seals'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {BUILTIN_LOGOS.map((logo) => (
                  <button
                    key={logo.id}
                    type="button"
                    onClick={() => {
                      const newLogo = {
                        id: `logo-${Date.now()}`,
                        type: 'image' as const,
                        name: isAr ? logo.nameAr : logo.nameEn,
                        src: logo.src,
                        objectFit: 'contain' as const,
                        borderRadius: 0,
                        isLogo: true,
                        x: Math.round(activeDesign.pageConfig.widthPx / 2 - 42),
                        y: 60,
                        width: 84,
                        height: 84,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        visible: true,
                        zIndex: activeDesign.elements.length + 1,
                      };
                      handleUpdateActiveDesign({
                        ...activeDesign,
                        elements: [...activeDesign.elements, newLogo],
                      });
                      setActiveSection('editor');
                    }}
                    className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center gap-3 hover:border-amber-500 transition-colors"
                  >
                    <img
                      src={logo.src}
                      alt={logo.nameAr}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-contain"
                    />
                    <span className="text-xs font-bold text-slate-800 text-center">
                      {isAr ? logo.nameAr : logo.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== SECTION 7: BATCH GENERATOR ==================== */}
        {activeSection === 'batch' && (
          <BatchGenerator
            language={settings.language}
            activeDesign={activeDesign}
            templates={allCombinedTemplates}
            onOpenIndividualInEditor={(design) => {
              handleUpdateActiveDesign(design, true);
              setActiveSection('editor');
            }}
          />
        )}

        {/* ==================== SECTION 8: SETTINGS ==================== */}
        {activeSection === 'settings' && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {isAr ? 'إعدادات المنصة والتفضيلات' : 'Platform Settings & Preferences'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isAr
                  ? 'تحكم في لغة الواجهة، اسم المنصة، الحفظ التلقائي، ودقة التصدير الافتراضية.'
                  : 'Configure UI language, platform branding, auto-save, and default export resolution.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'لغة واجهة التطبيق واتجاهها' : 'Application UI Language'}
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, language: e.target.value as UILanguage }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ar">العربية (اتجاه من اليمين إلى اليسار RTL)</option>
                  <option value="en">English (Left-to-Right LTR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'دقة التصدير الافتراضية (DPI)' : 'Default Export Resolution'}
                </label>
                <select
                  value={settings.defaultExportDpi}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      defaultExportDpi: Number(e.target.value) as 96 | 150 | 300 | 400,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value={96}>96 DPI (دقة الشاشة القياسية)</option>
                  <option value={150}>150 DPI (مناسب للمشاركة الرقمية)</option>
                  <option value={300}>300 DPI (جودة طباعية احترافية قياسية)</option>
                  <option value={400}>400 DPI (جودة طباعية فائقة الدقة)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'اسم المنصة (بالعربية)' : 'Platform Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={settings.platformNameAr}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, platformNameAr: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'اسم المنصة (بالإنجليزية)' : 'Platform Name (English)'}
                </label>
                <input
                  type="text"
                  value={settings.platformNameEn}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, platformNameEn: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, autoSave: e.target.checked }))
                  }
                  className="rounded accent-amber-600"
                />
                <span>
                  {isAr
                    ? 'تفعيل الحفظ التلقائي الفوري أثناء العمل داخل محرر الشهادات'
                    : 'Enable automatic saving while working in the Certificate Studio Editor'}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ==================== SECTION 9: HELP & GUIDE ==================== */}
        {activeSection === 'help' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                {isAr
                  ? 'دليل الاستخدام السريع — استوديو الشهادات الذكي'
                  : 'Quick Start Guide — Certificate Studio AI'}
              </h2>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'خطوات مبسطة لتصميم شهادة احترافية وتخصيصها وتصديرها للطباعة الفاخرة.'
                  : 'Simple steps to design, customize, and export print-ready certificates.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: isAr ? '1. اختيار القالب أو البدء من الصفر' : '1. Choose a Template or Start Blank',
                  desc: isAr
                    ? `استعرض «مكتبة الشهادات» التي تضم 10 تصنيفات رئيسية و${allCombinedTemplates.length} قالبًا جاهزًا بتكوينات متنوعة، واضغط «استخدام هذا القالب» لفتح نسخة مستقلة قابلة للتحرير دون المساس بالقالب الأصلي.`
                    : `Browse the Library across 10 categories and ${allCombinedTemplates.length} templates, and click "Use Template" to open an editable copy.`,
                },
                {
                  title: isAr ? '2. تحرير النصوص والخطوط العربية المزخرفة' : '2. Edit Text & Decorative Arabic Fonts',
                  desc: isAr
                    ? `جميع النصوص في الشهادة هي عناصر حية مستقلة. انقر على أي نص في اللوحة لتعديل الاسم والعنوان، وتغيير الخط من بين ${FONT_LIBRARY.length} خطًا عربيًا مزخرفًا ورسميًا، مع أدوات الكشيدة والأقواس الزخرفية.`
                    : 'Every text field is an independent element. Click any text to edit content, decorative font family, Kashida elongation, size, and alignment.',
                },
                {
                  title: isAr
                    ? `3. تبديل الأنماط الـ${ARTISTIC_STYLES.length} (شركات، أعمال، دبلوماسي، ملكي)`
                    : `3. Swap Between ${ARTISTIC_STYLES.length} Business & Artistic Styles`,
                  desc: isAr
                    ? `من تبويب «الأنماط (${ARTISTIC_STYLES.length})» في المحرر، يمكنك تغيير الإطار المعماري والخلفية والألوان بضغطة واحدة مع الاحتفاظ الكامل باسم المستفيد وجميع النصوص والتوقيعات.`
                    : `Switch between ${ARTISTIC_STYLES.length} artistic & corporate styles at any time without losing your recipient name, text, or signatures.`,
                },
                {
                  title: isAr ? '4. إضافة التوقيعات المرسومة والأختام والشعارات' : '4. Signatures, Seals & Logos',
                  desc: isAr
                    ? 'ارفع شعار مؤسستك من جهازك، وارسم توقيعك الحي بالفأرة أو اللمس، أو أدرج أختامًا تصميمية قابلة لتعديل النصوص والألوان.'
                    : 'Upload your organization logo, draw a live signature with mouse/touch, or insert vector design seals.',
                },
                {
                  title: isAr ? '5. الإنشاء الجماعي من قائمة أو ملف CSV' : '5. Batch Generation via List or CSV',
                  desc: isAr
                    ? 'انتقل إلى قسم «إنشاء جماعي» للصق قائمة أسماء أو رفع ملف CSV، وعاين جميع الشهادات ثم حمّلها دفعة واحدة كملف ZIP أو ملف PDF متعدد الصفحات.'
                    : 'Use the Batch Generator to paste names or upload a CSV file and export all certificates as a ZIP or multi-page PDF.',
                },
                {
                  title: isAr ? '6. التصدير بجودة طباعية 300 DPI' : '6. High-Resolution 300 DPI Export',
                  desc: isAr
                    ? 'اضغط «تصدير الشهادة» لاختيار صيغة PDF للطباعة بمقاسات A4/A3/A5 الدقيقة، أو صورة PNG بدقة 300 DPI مع خيار الخلفية الشفافة، أو متجهات SVG.'
                    : 'Click "Export Certificate" to download print-ready PDF, 300 DPI PNG (with optional transparency), or vector SVG.',
                },
              ].map((step, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Template Preview Modal */}
      {previewModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <h3 className="text-base font-bold">{previewModalTemplate.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {previewModalTemplate.subtypeAr} · {previewModalTemplate.pageConfig.format}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalTemplate(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-100 flex items-center justify-center">
              <div
                className="w-full max-h-[65vh] bg-white shadow-xl rounded overflow-hidden flex items-center justify-center"
                style={{
                  aspectRatio: `${previewModalTemplate.pageConfig.widthPx} / ${previewModalTemplate.pageConfig.heightPx}`,
                }}
              >
                <CertificateRenderer
                  design={previewModalTemplate}
                  interactive={false}
                  exportMode={true}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
              <button
                type="button"
                onClick={() => toggleFavorite(previewModalTemplate.id)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                <Star
                  className={`w-4 h-4 ${
                    favoriteIds.includes(previewModalTemplate.id)
                      ? 'text-amber-500 fill-current'
                      : 'text-slate-400'
                  }`}
                />
                <span>
                  {favoriteIds.includes(previewModalTemplate.id)
                    ? isAr
                      ? 'محفوظ في المفضلة'
                      : 'In Favorites'
                    : isAr
                    ? 'إضافة للمفضلة'
                    : 'Add to Favorites'}
                </span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewModalTemplate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tpl = previewModalTemplate;
                    setPreviewModalTemplate(null);
                    handleUseTemplate(tpl);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                >
                  {isAr ? 'استخدام هذا القالب وتعديله في المحرر' : 'Use & Customize Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High-Resolution Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        design={activeDesign}
        language={settings.language}
        defaultDpi={settings.defaultExportDpi}
        onClose={() => setExportModalOpen(false)}
        onChangeDesign={(updated) => handleUpdateActiveDesign(updated, true)}
      />

      {/* Dynamic @page CSS & Dedicated Print Root for Native Direct Printing */}
      <style>{`
        @media print {
          @page {
            size: ${activeDesign.pageConfig.widthMm}mm ${activeDesign.pageConfig.heightMm}mm;
            margin: 0mm;
          }
        }
      `}</style>
      <div id="certificate-print-root" className="hidden print:flex">
        <div
          style={{
            width: `${activeDesign.pageConfig.widthMm}mm`,
            height: `${activeDesign.pageConfig.heightMm}mm`,
            margin: 0,
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <CertificateRenderer design={activeDesign} interactive={false} exportMode={true} />
        </div>
      </div>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <span>
          {isAr
            ? `${settings.platformNameAr} — منصة تصميم وتحرير الشهادات الاحترافية`
            : `${settings.platformNameEn} — Professional Certificate Design Platform`}
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveSection('library')}
            className="hover:text-slate-900"
          >
            {isAr ? 'مكتبة القوالب' : 'Template Library'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('batch')}
            className="hover:text-slate-900"
          >
            {isAr ? 'الإنشاء الجماعي' : 'Batch Generator'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('help')}
            className="hover:text-slate-900"
          >
            {isAr ? 'دليل الاستخدام' : 'Help Guide'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
