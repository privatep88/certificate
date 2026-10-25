import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignHorizontalJustifyCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Award,
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  Frame,
  Grid,
  Image as ImageIcon,
  Layers,
  Loader2,
  Lock,
  Maximize2,
  Palette,
  PenTool,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  Stamp,
  Trash2,
  Type as TypeIcon,
  Undo2,
  Unlock,
  Upload,
  Wand2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  ArtisticStyle,
  BackgroundPatternType,
  CertificateDesign,
  CertificateElement,
  DividerVariant,
  FrameType,
  OrnamentVariant,
  PageFormat,
  PageOrientation,
  SealVariant,
  SignatureCertificateElement,
  TextCertificateElement,
  UILanguage,
} from '../types/certificate';
import {
  ARTISTIC_STYLES,
  BUILTIN_LOGOS,
  COLOR_PALETTES,
  DECORATED_ARABIC_CALLIGRAPHY_PRESETS,
  DIVIDER_CATALOG,
  FONT_LIBRARY,
  FORMAL_WORDING_PRESETS,
  ORNAMENT_CATALOG,
  SEAL_CATALOG,
} from '../data/stylesAndAssets';
import { CertificateRenderer } from './CertificateRenderer';
import { SignatureModal } from './SignatureModal';
import { getExportPixelDimensions, resolvePaperDimensions } from '../utils/pageDimensions';

interface EditorWorkspaceProps {
  design: CertificateDesign;
  language: UILanguage;
  onChangeDesign: (updated: CertificateDesign, pushHistory?: boolean) => void;
  onSaveProject: () => void;
  onSaveAsTemplate: () => void;
  onOpenExportModal: () => void;
  onResetToOriginal: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  lastSavedAt: string | null;
}

type EditorTab =
  | 'fields'
  | 'typography'
  | 'styles'
  | 'ornaments'
  | 'media'
  | 'signatures'
  | 'page'
  | 'layers';

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  design,
  language,
  onChangeDesign,
  onSaveProject,
  onSaveAsTemplate,
  onOpenExportModal,
  onResetToOriginal,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  lastSavedAt,
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<EditorTab>('fields');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(0.78);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [snapLines, setSnapLines] = useState<{ x?: number; y?: number }>({});
  const [signatureModalOpen, setSignatureModalOpen] = useState<boolean>(false);
  const [editingSignature, setEditingSignature] = useState<SignatureCertificateElement | null>(null);

  // AI Smart Wording Assistant state
  const [aiTone, setAiTone] = useState('رسمي فاخر وبليغ');
  const [aiOccasion, setAiOccasion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<
    { title: string; subtitle: string; introText: string; bodyText: string; closingText: string }[]
  >([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStateRef = useRef<{
    mode: 'move' | 'resize';
    elementId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    handle?: 'nw' | 'ne' | 'sw' | 'se';
    hasPushedHistory?: boolean;
  } | null>(null);

  const selectedElement = useMemo(
    () => design.elements.find((e) => e.id === selectedElementId) || null,
    [design.elements, selectedElementId]
  );

  // Detect out-of-bounds elements & empty required fields
  const outOfBoundsElements = useMemo(() => {
    const { widthPx, heightPx } = design.pageConfig;
    return design.elements.filter(
      (el) =>
        el.visible &&
        (el.x < 12 ||
          el.y < 12 ||
          el.x + el.width > widthPx - 12 ||
          el.y + el.height > heightPx - 12)
    );
  }, [design]);

  const emptyRequiredFields = useMemo(() => {
    return design.elements.filter(
      (el) =>
        el.type === 'text' &&
        el.visible &&
        (el.fieldRole === 'recipientName' || el.fieldRole === 'title') &&
        !el.content.trim()
    );
  }, [design.elements]);

  // Pointer & Touch drag & resize handling on the SVG canvas
  useEffect(() => {
    const handlePointerMove = (clientX: number, clientY: number) => {
      const st = dragStateRef.current;
      if (!st || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scaleX = design.pageConfig.widthPx / rect.width;
      const scaleY = design.pageConfig.heightPx / rect.height;

      const dx = (clientX - st.startX) * scaleX;
      const dy = (clientY - st.startY) * scaleY;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

      const shouldPushHistory = !st.hasPushedHistory;
      st.hasPushedHistory = true;

      if (st.mode === 'move') {
        let nextX = Math.round(st.origX + dx);
        let nextY = Math.round(st.origY + dy);

        const pageCenterX = design.pageConfig.widthPx / 2;
        const pageCenterY = design.pageConfig.heightPx / 2;
        const elCenterX = nextX + st.origW / 2;
        const elCenterY = nextY + st.origH / 2;

        const newSnap: { x?: number; y?: number } = {};
        if (Math.abs(elCenterX - pageCenterX) < 8) {
          nextX = Math.round(pageCenterX - st.origW / 2);
          newSnap.x = pageCenterX;
        }
        if (Math.abs(elCenterY - pageCenterY) < 8) {
          nextY = Math.round(pageCenterY - st.origH / 2);
          newSnap.y = pageCenterY;
        }
        setSnapLines(newSnap);

        const appliedDx = nextX - st.origX;
        const appliedDy = nextY - st.origY;
        const draggedEl = design.elements.find((el) => el.id === st.elementId);
        const activeGroupId = draggedEl?.groupId;

        onChangeDesign(
          {
            ...design,
            elements: design.elements.map((el) => {
              if (el.id === st.elementId) {
                return { ...el, x: nextX, y: nextY };
              }
              if (activeGroupId && el.groupId === activeGroupId && !el.locked) {
                return { ...el, x: Math.round(el.x + appliedDx), y: Math.round(el.y + appliedDy) };
              }
              return el;
            }),
            updatedAt: new Date().toISOString(),
          },
          shouldPushHistory
        );
      } else if (st.mode === 'resize' && st.handle) {
        let nextX = st.origX;
        let nextY = st.origY;
        let nextW = st.origW;
        let nextH = st.origH;

        if (st.handle.includes('e')) nextW = Math.max(36, Math.round(st.origW + dx));
        if (st.handle.includes('s')) nextH = Math.max(24, Math.round(st.origH + dy));
        if (st.handle.includes('w')) {
          const possibleW = Math.max(36, Math.round(st.origW - dx));
          nextX = Math.round(st.origX + (st.origW - possibleW));
          nextW = possibleW;
        }
        if (st.handle.includes('n')) {
          const possibleH = Math.max(24, Math.round(st.origH - dy));
          nextY = Math.round(st.origY + (st.origH - possibleH));
          nextH = possibleH;
        }

        onChangeDesign(
          {
            ...design,
            elements: design.elements.map((el) =>
              el.id === st.elementId ? { ...el, x: nextX, y: nextY, width: nextW, height: nextH } : el
            ),
            updatedAt: new Date().toISOString(),
          },
          shouldPushHistory
        );
      }
    };

    const handleMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (!dragStateRef.current || e.touches.length === 0) return;
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handlePointerUp = () => {
      if (dragStateRef.current) {
        dragStateRef.current = null;
        setSnapLines({});
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [design, onChangeDesign]);

  const updateElement = (id: string, patch: Partial<CertificateElement>, pushHistory = true) => {
    onChangeDesign(
      {
        ...design,
        elements: design.elements.map((el) =>
          el.id === id ? ({ ...el, ...patch } as CertificateElement) : el
        ),
        updatedAt: new Date().toISOString(),
      },
      pushHistory
    );
  };

  const applyArabicKashida = (text: string): string => {
    // Insert Arabic Tatweel (ـ) after connectable Arabic letters inside words
    const connectable = 'بتثجحخسشصضطظعغفقكلمنهي';
    return text
      .split(' ')
      .map((word) => {
        if (word.includes('ـ') || word.length < 3) return word;
        for (let i = 0; i < word.length - 1; i++) {
          if (connectable.includes(word[i])) {
            return word.slice(0, i + 1) + 'ــ' + word.slice(i + 1);
          }
        }
        return word;
      })
      .join(' ');
  };

  const removeArabicKashida = (text: string): string => {
    return text.replace(/ـ+/g, '').replace(/^[﴿❖«✦\s]+|[﴾❖»✦\s]+$/g, '').trim();
  };

  const wrapWithOrnamentalBrackets = (text: string, leftBracket: string, rightBracket: string): string => {
    const clean = text.replace(/^[﴿❖«✦\s]+|[﴾❖»✦\s]+$/g, '').trim();
    return `${leftBracket}  ${clean}  ${rightBracket}`;
  };

  const handleApplyArtisticStyle = (style: ArtisticStyle) => {
    const updatedElements = design.elements.map((el) => {
      if (el.type === 'text') {
        if (el.fieldRole === 'title' || el.fieldRole === 'courseName') {
          return { ...el, color: style.primaryColor };
        }
        if (el.fieldRole === 'recipientName' || el.fieldRole === 'organization' || el.fieldRole === 'subtitle') {
          return { ...el, color: style.secondaryColor };
        }
        return { ...el, color: style.textColor };
      }
      if (el.type === 'divider') {
        return { ...el, color: style.accentColor };
      }
      if (el.type === 'ornament') {
        return { ...el, color: style.accentColor, secondaryColor: style.secondaryColor };
      }
      if (el.type === 'seal') {
        return { ...el, color: style.secondaryColor, accentColor: style.accentColor };
      }
      if (el.type === 'signature') {
        return { ...el, color: style.primaryColor };
      }
      return el;
    });

    onChangeDesign({
      ...design,
      styleId: style.id,
      pageConfig: {
        ...design.pageConfig,
        frameType: style.frameType,
        backgroundPattern: style.backgroundPattern,
        backgroundColor: style.backgroundColor,
        backgroundGradientEnd: style.backgroundGradientEnd,
        frameColor: style.primaryColor,
        frameSecondaryColor: style.secondaryColor,
        frameAccentColor: style.accentColor,
        borderThickness: style.borderThickness,
        cornerOrnament: style.cornerOrnament,
      },
      elements: updatedElements,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCyclePalette = () => {
    const currentIdx = COLOR_PALETTES.findIndex((p) => p.primary === design.pageConfig.frameColor);
    const nextPalette = COLOR_PALETTES[(currentIdx + 1) % COLOR_PALETTES.length];

    const updatedElements = design.elements.map((el) => {
      if (el.type === 'text') {
        if (el.fieldRole === 'title') return { ...el, color: nextPalette.primary };
        if (el.fieldRole === 'recipientName' || el.fieldRole === 'organization') {
          return { ...el, color: nextPalette.secondary };
        }
        return { ...el, color: nextPalette.text };
      }
      if (el.type === 'divider' || el.type === 'ornament') {
        return { ...el, color: nextPalette.accent };
      }
      if (el.type === 'seal') {
        return { ...el, color: nextPalette.secondary, accentColor: nextPalette.accent };
      }
      return el;
    });

    onChangeDesign({
      ...design,
      pageConfig: {
        ...design.pageConfig,
        backgroundColor: nextPalette.bg,
        backgroundGradientEnd: nextPalette.bgEnd,
        frameColor: nextPalette.primary,
        frameSecondaryColor: nextPalette.secondary,
        frameAccentColor: nextPalette.accent,
      },
      elements: updatedElements,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCycleVisualStyle = () => {
    const currentIdx = ARTISTIC_STYLES.findIndex((s) => s.id === design.styleId);
    const nextStyle = ARTISTIC_STYLES[(currentIdx + 1) % ARTISTIC_STYLES.length];
    handleApplyArtisticStyle(nextStyle);
  };

  // Smart Auto-Format & Layout Harmonizer
  const handleSmartAutoFormat = () => {
    const { widthPx, heightPx, frameType, orientation } = design.pageConfig;
    const isRightSidebar = frameType === 'corporate-sidebar-right';
    const isLeftSidebar = frameType === 'corporate-sidebar-left';
    const centerX = isRightSidebar ? 484 : isLeftSidebar ? 639 : Math.round(widthPx / 2);
    const sidebarCenterX = isRightSidebar ? widthPx - 139 : 139;

    const updated = design.elements.map((el) => {
      const safeX = Math.max(55, Math.min(widthPx - el.width - 55, el.x));
      const safeY = Math.max(55, Math.min(heightPx - el.height - 55, el.y));

      if (el.type === 'text') {
        if (
          el.fieldRole === 'title' ||
          el.fieldRole === 'subtitle' ||
          el.fieldRole === 'intro' ||
          el.fieldRole === 'recipientName' ||
          el.fieldRole === 'body' ||
          el.fieldRole === 'organization' ||
          el.fieldRole === 'courseName'
        ) {
          return {
            ...el,
            align: 'center' as const,
            x: Math.round(centerX - el.width / 2),
            y: safeY,
          };
        }
        if (el.fieldRole === 'issueDate') {
          if (isRightSidebar || isLeftSidebar) {
            return { ...el, align: 'center' as const, x: sidebarCenterX - 66, y: 540, width: 132 };
          }
          return {
            ...el,
            align: 'center' as const,
            x: orientation === 'landscape' ? widthPx - 340 : widthPx - 300,
            y: orientation === 'landscape' ? 550 : 790,
            width: orientation === 'landscape' ? 230 : 210,
          };
        }
        if (el.fieldRole === 'certificateId') {
          if (isRightSidebar || isLeftSidebar) {
            return { ...el, align: 'center' as const, x: sidebarCenterX - 66, y: 584, width: 132 };
          }
          return {
            ...el,
            align: 'center' as const,
            x: orientation === 'landscape' ? 110 : 90,
            y: orientation === 'landscape' ? 550 : 790,
            width: orientation === 'landscape' ? 230 : 210,
          };
        }
      }
      if (el.type === 'divider') {
        return {
          ...el,
          x: Math.round(centerX - el.width / 2),
          y: safeY,
        };
      }
      return { ...el, x: safeX, y: safeY };
    });

    onChangeDesign({
      ...design,
      elements: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  // Dedicated Architectural Placement for Issue Date & Certificate Reference ID
  const handlePositionDateAndRef = (
    mode: 'above-signatures' | 'top-corners' | 'bottom-corners' | 'center-inline'
  ) => {
    const { widthPx, heightPx, orientation } = design.pageConfig;
    const isLand = orientation === 'landscape';
    const centerX = Math.round(widthPx / 2);

    const updated = design.elements.map((el) => {
      if (el.type !== 'text') return el;
      if (el.fieldRole === 'issueDate') {
        if (mode === 'top-corners') {
          return {
            ...el,
            align: 'right' as const,
            x: widthPx - 310,
            y: 74,
            width: 220,
            height: 28,
            fontSize: 13,
            fontWeight: 700,
          };
        }
        if (mode === 'bottom-corners') {
          return {
            ...el,
            align: 'right' as const,
            x: widthPx - 310,
            y: heightPx - 92,
            width: 220,
            height: 28,
            fontSize: 13,
            fontWeight: 700,
          };
        }
        if (mode === 'center-inline') {
          return {
            ...el,
            align: 'center' as const,
            x: centerX + 10,
            y: isLand ? 545 : 785,
            width: 240,
            height: 28,
            fontSize: 13,
            fontWeight: 700,
          };
        }
        // Default: 'above-signatures'
        return {
          ...el,
          align: 'center' as const,
          x: isLand ? widthPx - 340 : widthPx - 300,
          y: isLand ? 550 : 790,
          width: isLand ? 230 : 210,
          height: 28,
          fontSize: 14,
          fontWeight: 700,
        };
      }
      if (el.fieldRole === 'certificateId') {
        if (mode === 'top-corners') {
          return {
            ...el,
            align: 'left' as const,
            x: 90,
            y: 74,
            width: 220,
            height: 28,
            fontSize: 13,
            fontWeight: 700,
          };
        }
        if (mode === 'bottom-corners') {
          return {
            ...el,
            align: 'left' as const,
            x: 90,
            y: heightPx - 92,
            width: 220,
            height: 28,
            fontSize: 13,
            fontWeight: 700,
          };
        }
        if (mode === 'center-inline') {
          return {
            ...el,
            align: 'center' as const,
            x: centerX - 250,
            y: isLand ? 545 : 785,
            width: 240,
            height: 28,
            fontSize: 13,
            fontWeight: 700,
          };
        }
        // Default: 'above-signatures'
        return {
          ...el,
          align: 'center' as const,
          x: isLand ? 110 : 90,
          y: isLand ? 550 : 790,
          width: isLand ? 230 : 210,
          height: 28,
          fontSize: 14,
          fontWeight: 700,
        };
      }
      return el;
    });

    onChangeDesign({
      ...design,
      elements: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCenterSelected = (axis: 'h' | 'v') => {
    if (!selectedElement) return;
    const { widthPx, heightPx } = design.pageConfig;
    if (axis === 'h') {
      updateElement(selectedElement.id, {
        x: Math.round((widthPx - selectedElement.width) / 2),
      });
    } else {
      updateElement(selectedElement.id, {
        y: Math.round((heightPx - selectedElement.height) / 2),
      });
    }
  };

  const handleAddTextElement = () => {
    const { widthPx, heightPx } = design.pageConfig;
    const newEl: TextCertificateElement = {
      id: `txt-${Date.now()}`,
      type: 'text',
      fieldRole: 'custom',
      name: isAr ? 'نص إضافي جديد' : 'New Custom Text',
      content: isAr ? 'نص جديد قابل للتعديل والتنسيق' : 'New Editable Certificate Text',
      fontFamily: design.language === 'ar' ? 'Cairo' : 'Plus Jakarta Sans',
      fontSize: 22,
      fontWeight: 600,
      italic: false,
      color: design.pageConfig.frameColor || '#0B192C',
      align: 'center',
      direction: design.language === 'ar' ? 'rtl' : 'ltr',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: Math.round(widthPx / 2 - 220),
      y: Math.round(heightPx / 2 - 25),
      width: 440,
      height: 50,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: design.elements.length + 1,
    };
    onChangeDesign({
      ...design,
      elements: [...design.elements, newEl],
      updatedAt: new Date().toISOString(),
    });
    setSelectedElementId(newEl.id);
    setActiveTab('typography');
  };

  const handleDuplicateElement = (id: string) => {
    const target = design.elements.find((e) => e.id === id);
    if (!target) return;
    const copy: CertificateElement = {
      ...target,
      id: `${target.type}-${Date.now()}`,
      name: `${target.name} (نسخة)`,
      x: target.x + 24,
      y: target.y + 24,
      zIndex: design.elements.length + 1,
    };
    onChangeDesign({
      ...design,
      elements: [...design.elements, copy],
      updatedAt: new Date().toISOString(),
    });
    setSelectedElementId(copy.id);
  };

  const handleDeleteElement = (id: string) => {
    onChangeDesign({
      ...design,
      elements: design.elements.filter((e) => e.id !== id),
      updatedAt: new Date().toISOString(),
    });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleAddOrnament = (variant: OrnamentVariant, defaultColor: string, label: string) => {
    const { widthPx, heightPx } = design.pageConfig;
    const newOrn: CertificateElement = {
      id: `orn-${Date.now()}`,
      type: 'ornament',
      name: label,
      variant,
      color: defaultColor,
      secondaryColor: design.pageConfig.frameColor,
      x: Math.round(widthPx / 2 - 40),
      y: Math.round(heightPx / 2 - 40),
      width: 80,
      height: 80,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: design.elements.length + 1,
    };
    onChangeDesign({
      ...design,
      elements: [...design.elements, newOrn],
      updatedAt: new Date().toISOString(),
    });
    setSelectedElementId(newOrn.id);
  };

  const handleAddDivider = (variant: DividerVariant, label: string) => {
    const { widthPx, heightPx } = design.pageConfig;
    const newDiv: CertificateElement = {
      id: `div-${Date.now()}`,
      type: 'divider',
      name: label,
      variant,
      color: design.pageConfig.frameAccentColor || '#D4AF37',
      thickness: 2,
      x: Math.round(widthPx / 2 - 200),
      y: Math.round(heightPx / 2),
      width: 400,
      height: 24,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: design.elements.length + 1,
    };
    onChangeDesign({
      ...design,
      elements: [...design.elements, newDiv],
      updatedAt: new Date().toISOString(),
    });
    setSelectedElementId(newDiv.id);
  };

  const handleAddSeal = (
    variant: SealVariant,
    primaryText: string,
    secondaryText: string,
    color: string,
    accentColor: string,
    label: string
  ) => {
    const { widthPx, heightPx } = design.pageConfig;
    const newSeal: CertificateElement = {
      id: `seal-${Date.now()}`,
      type: 'seal',
      name: label,
      variant,
      primaryText,
      secondaryText,
      color,
      accentColor,
      x: Math.round(widthPx / 2 - 62),
      y: heightPx - 210,
      width: 124,
      height: 124,
      rotation: 0,
      opacity: 0.95,
      locked: false,
      visible: true,
      zIndex: design.elements.length + 1,
    };
    onChangeDesign({
      ...design,
      elements: [...design.elements, newSeal],
      updatedAt: new Date().toISOString(),
    });
    setSelectedElementId(newSeal.id);
  };

  const handleAddImageOrLogo = (src: string, label: string, isLogo = true) => {
    const { widthPx } = design.pageConfig;
    const newImg: CertificateElement = {
      id: `img-${Date.now()}`,
      type: 'image',
      name: label,
      src,
      objectFit: 'contain',
      borderRadius: isLogo ? 0 : 12,
      isLogo,
      x: Math.round(widthPx / 2 - 42),
      y: 62,
      width: 84,
      height: 84,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: design.elements.length + 1,
    };
    onChangeDesign({
      ...design,
      elements: [...design.elements, newImg],
      updatedAt: new Date().toISOString(),
    });
    setSelectedElementId(newImg.id);
  };

  const handleUploadDeviceImage = (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleAddImageOrLogo(
          reader.result,
          isLogo ? (isAr ? 'شعار مرفوع' : 'Uploaded Logo') : isAr ? 'صورة مرفوعة' : 'Uploaded Photo',
          isLogo
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBalanceSignatureLayout = (count: 1 | 2 | 3) => {
    const { widthPx, heightPx } = design.pageConfig;
    const nonSigElements = design.elements.filter((el) => el.type !== 'signature');
    const yPos = heightPx - 195;
    const sigWidth = 220;

    const sampleNames = [
      { name: 'أ. د. عبد الرحمن المنصور', title: 'رئيس مجلس الإدارة' },
      { name: 'م. فيصل بن خالد الدوسري', title: 'المدير التنفيذي' },
      { name: 'د. سارة بنت محمد الشهري', title: 'مديرة التدريب والتطوير' },
    ];

    const newSigs: SignatureCertificateElement[] = [];
    const positions =
      count === 1
        ? [Math.round(widthPx / 2 - sigWidth / 2)]
        : count === 2
        ? [widthPx - 340, 120]
        : [widthPx - 320, Math.round(widthPx / 2 - sigWidth / 2), 100];

    positions.forEach((xPos, i) => {
      newSigs.push({
        id: `sig-bal-${Date.now()}-${i}`,
        type: 'signature',
        name: `${isAr ? 'التوقيع' : 'Signature'} ${i + 1}`,
        signatureMode: 'text',
        signatureText: sampleNames[i].name,
        signerName: sampleNames[i].name,
        signerTitle: sampleNames[i].title,
        color: design.pageConfig.frameColor || '#0B192C',
        fontFamily: 'Aref Ruqaa',
        showLine: true,
        x: xPos,
        y: yPos,
        width: sigWidth,
        height: 105,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: nonSigElements.length + i + 1,
      });
    });

    onChangeDesign({
      ...design,
      elements: [...nonSigElements, ...newSigs],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleChangePageDimensions = (
    format: PageFormat,
    orientation: PageOrientation,
    customW?: number,
    customH?: number
  ) => {
    const resolved = resolvePaperDimensions(
      format,
      orientation,
      customW || design.pageConfig.widthMm,
      customH || design.pageConfig.heightMm
    );

    const newWMm = resolved.widthMm;
    const newHMm = resolved.heightMm;
    const newWPx = resolved.logicalWidthPx;
    const newHPx = resolved.logicalHeightPx;

    const scaleX = newWPx / design.pageConfig.widthPx;
    const scaleY = newHPx / design.pageConfig.heightPx;

    const rescaledElements = design.elements.map((el) => ({
      ...el,
      x: Math.round(el.x * scaleX),
      y: Math.round(el.y * scaleY),
      width: Math.round(el.width * scaleX),
      height: Math.round(el.height * scaleY),
    }));

    onChangeDesign({
      ...design,
      pageConfig: {
        ...design.pageConfig,
        format,
        orientation,
        widthMm: newWMm,
        heightMm: newHMm,
        widthPx: newWPx,
        heightPx: newHPx,
      },
      elements: rescaledElements,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleLayerOrder = (id: string, action: 'front' | 'back' | 'forward' | 'backward') => {
    const sorted = [...design.elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx === -1) return;

    const item = sorted[idx];
    sorted.splice(idx, 1);
    if (action === 'front') sorted.push(item);
    else if (action === 'back') sorted.unshift(item);
    else if (action === 'forward') sorted.splice(Math.min(sorted.length, idx + 1), 0, item);
    else if (action === 'backward') sorted.splice(Math.max(0, idx - 1), 0, item);

    const reindexed = sorted.map((el, i) => ({ ...el, zIndex: i + 1 }));
    onChangeDesign({
      ...design,
      elements: reindexed,
      updatedAt: new Date().toISOString(),
    });
  };

  const applyWordingToCertificate = (preset: {
    title: string;
    subtitle: string;
    introText: string;
    bodyText: string;
    closingText?: string;
  }) => {
    const updatedElements = design.elements.map((el) => {
      if (el.type !== 'text') return el;
      if (el.fieldRole === 'title') return { ...el, content: preset.title };
      if (el.fieldRole === 'subtitle') return { ...el, content: preset.subtitle };
      if (el.fieldRole === 'intro') return { ...el, content: preset.introText };
      if (el.fieldRole === 'body') return { ...el, content: preset.bodyText };
      return el;
    });

    onChangeDesign({
      ...design,
      elements: updatedElements,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleGenerateAiWording = async () => {
    setAiLoading(true);
    setAiError(null);

    const recipientEl = design.elements.find(
      (e): e is TextCertificateElement => e.type === 'text' && e.fieldRole === 'recipientName'
    );
    const orgEl = design.elements.find(
      (e): e is TextCertificateElement => e.type === 'text' && e.fieldRole === 'organization'
    );
    const titleEl = design.elements.find(
      (e): e is TextCertificateElement => e.type === 'text' && e.fieldRole === 'title'
    );

    const certTitle = titleEl?.content || design.subtypeAr || 'شهادة شكر وتقدير';
    const recipient = recipientEl?.content || 'إلى الأستاذ / خالد أحمد عبدالله الهاشمي';
    const orgName = orgEl?.content || 'الجهة المانحة';
    const occasion = aiOccasion.trim() || 'التميز في الأداء والعطاء المؤسسي المشرف';

    const buildLocalSmartSuggestions = () => [
      {
        title: certTitle,
        subtitle: 'تقديرًا للتميز والإخلاص في الأداء المهني',
        introText: `تتشرف ${orgName} بمنح هذه الشهادة التقديرية إلى:`,
        bodyText: `تقديرًا وعرفانًا لجهوده المتميزة وإسهاماته الفاعلة في ${occasion}، وما قدمه من نموذج مشرف في الكفاءة والالتزام والابتكار، متمنين له دوام التوفيق والريادة.`,
        closingText: 'مع خالص الشكر والتقدير والاعتزاز',
      },
      {
        title: certTitle,
        subtitle: 'وسام الاستحقاق والجودة المؤسسية',
        introText: `يسر إدارة ${orgName} أن تتقدم بخالص الشكر والتقدير إلى:`,
        bodyText: `وذلك نظير ما بذله من عطاء استثنائي وتفانٍ ملموس في ${occasion}، مما أسهم بفاعلية في تحقيق المستهدفات الاستراتيجية ورفع معايير الجودة والتميز.`,
        closingText: 'سائلين المولى عز وجل له مزيدًا من النجاح والتألق',
      },
      {
        title: certTitle,
        subtitle: 'شهادة اعتزاز وتكريم رسمي',
        introText: `تمنح ${orgName} هذه الشهادة بكل فخر واعتزاز إلى:`,
        bodyText: `تثمينًا لدوره الريادي وجهوده المخلصة في ${occasion}، وإشادًة بما أظهره من احترافية عالية وروح مبادرة مسؤولة تستحق التكريم والإشادة.`,
        closingText: 'ودمتم ذخراً للتميز والإبداع',
      },
    ];

    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateType: certTitle,
          recipientName: recipient,
          organizationName: orgName,
          occasionOrCourse: aiOccasion,
          tone: aiTone,
          language: design.language,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Static hosting fallback (e.g., GitHub Pages where /api/* returns HTML 404)
        setAiSuggestions(buildLocalSmartSuggestions());
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        setAiSuggestions(buildLocalSmartSuggestions());
      } else if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
      } else {
        setAiSuggestions(buildLocalSmartSuggestions());
      }
    } catch {
      // Network or static hosting fallback
      setAiSuggestions(buildLocalSmartSuggestions());
    } finally {
      setAiLoading(false);
    }
  };

  const textElements = useMemo(
    () => design.elements.filter((e): e is TextCertificateElement => e.type === 'text'),
    [design.elements]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Top Studio Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Project Title & Auto-save Status */}
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="text"
            value={design.name}
            onChange={(e) =>
              onChangeDesign({ ...design, name: e.target.value, updatedAt: new Date().toISOString() }, false)
            }
            className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-52 sm:w-64 focus:outline-none focus:border-amber-600"
          />

          {lastSavedAt && (
            <span className="hidden xl:inline-flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? `حفظ تلقائي (${lastSavedAt})` : `Auto-saved (${lastSavedAt})`}</span>
            </span>
          )}
        </div>

        {/* Center Studio Manipulation Tools */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title={isAr ? 'تراجع (Undo)' : 'Undo'}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-35"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title={isAr ? 'إعادة (Redo)' : 'Redo'}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-35"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Zoom Controls */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
            title={isAr ? 'تصغير' : 'Zoom Out'}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono tabular-nums font-semibold text-slate-700 px-1.5">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
            title={isAr ? 'تكبير' : 'Zoom In'}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(0.78)}
            title={isAr ? 'ملاءمة الشهادة داخل العرض' : 'Fit to Screen'}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Grid & Center Tools */}
          <button
            type="button"
            onClick={() => setShowGrid((g) => !g)}
            title={isAr ? 'إظهار / إخفاء الشبكة' : 'Toggle Grid'}
            className={`p-2 rounded-lg border transition-colors ${
              showGrid ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={!selectedElement}
            onClick={() => handleCenterSelected('h')}
            title={isAr ? 'توسيط العنصر المحدد أفقيًا' : 'Center Horizontally'}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-35"
          >
            <AlignHorizontalJustifyCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!selectedElement}
            onClick={() => handleCenterSelected('v')}
            title={isAr ? 'توسيط العنصر المحدد عموديًا' : 'Center Vertically'}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-35"
          >
            <AlignVerticalJustifyCenter className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Smart Design Actions */}
          <button
            type="button"
            onClick={handleSmartAutoFormat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100 transition-colors whitespace-nowrap"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-700" />
            <span>{isAr ? 'تحسين تنسيق الشهادة' : 'Auto-Format'}</span>
          </button>

          <button
            type="button"
            onClick={handleCyclePalette}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            <Palette className="w-3.5 h-3.5 text-slate-600" />
            <span>{isAr ? 'تجربة ألوان بديلة' : 'Swap Colors'}</span>
          </button>

          <button
            type="button"
            onClick={handleCycleVisualStyle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            <Frame className="w-3.5 h-3.5 text-slate-600" />
            <span>{isAr ? 'تغيير النمط مع حفظ النصوص' : 'Swap Style'}</span>
          </button>

          <button
            type="button"
            onClick={onResetToOriginal}
            title={isAr ? 'إعادة ضبط التصميم' : 'Reset Design'}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Save & Export Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveProject}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5 text-slate-700" />
            <span>{isAr ? 'حفظ' : 'Save'}</span>
          </button>
          <button
            type="button"
            onClick={onSaveAsTemplate}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
            <span>{isAr ? 'حفظ كقالب' : 'Save Template'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'تصدير الشهادة' : 'Export Certificate'}</span>
          </button>
        </div>
      </div>

      {/* Smart Layout & Field Warnings */}
      {(outOfBoundsElements.length > 0 || emptyRequiredFields.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {outOfBoundsElements.length > 0 &&
                (isAr
                  ? `تنبيه التصميم الذكي: يوجد (${outOfBoundsElements.length}) عنصر قريب جدًا من حافة القص أو خارج حدود الصفحة الآمنة للطباعة. `
                  : `Warning: ${outOfBoundsElements.length} element(s) are near or outside safe print bounds. `)}
              {emptyRequiredFields.length > 0 &&
                (isAr
                  ? `يوجد حقل أساسي فارغ (الاسم أو العنوان).`
                  : `Required field (Name or Title) is empty.`)}
            </span>
          </div>
          {outOfBoundsElements.length > 0 && (
            <button
              type="button"
              onClick={handleSmartAutoFormat}
              className="px-3 py-1 rounded-md bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
            >
              {isAr ? 'إصلاح وتوسيط تلقائي' : 'Auto-Fix Positions'}
            </button>
          )}
        </div>
      )}

      {/* Main Editor Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Inspector & Tools Panel (5 columns on desktop) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          {/* Tool Tabs Navigation */}
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 border-b border-slate-200 bg-slate-50 p-1 gap-1">
            {(
              [
                ['fields', TypeIcon, isAr ? 'النصوص والبيانات' : 'Text & Fields'],
                ['typography', AlignCenter, isAr ? 'الخط والعنصر' : 'Inspector'],
                ['styles', Palette, isAr ? `الأنماط (${ARTISTIC_STYLES.length})` : `Styles (${ARTISTIC_STYLES.length})`],
                ['ornaments', Award, isAr ? 'الإطارات والزخارف' : 'Ornaments'],
                ['media', ImageIcon, isAr ? 'الشعارات والخلفيات' : 'Logos & BG'],
                ['signatures', PenTool, isAr ? 'التوقيع والأختام' : 'Signatures'],
                ['page', Settings2, isAr ? 'أبعاد الصفحة' : 'Page Setup'],
                ['layers', Layers, isAr ? `الطبقات (${design.elements.length})` : `Layers (${design.elements.length})`],
              ] as const
            ).map(([tabId, Icon, label]) => (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap truncate ${
                  activeTab === tabId
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tabId ? 'text-amber-400' : ''}`} />
                <span className="truncate max-w-full">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Body */}
          <div className="p-4 space-y-4 max-h-[640px] overflow-y-auto">
            {/* TAB 1: QUICK FIELDS & AI WORDING */}
            {activeTab === 'fields' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">
                    {isAr ? 'تحرير بيانات ونصوص الشهادة' : 'Edit Certificate Text Fields'}
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddTextElement}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'إضافة نص جديد' : 'Add Text'}</span>
                  </button>
                </div>

                {/* All Editable Text Elements List */}
                <div className="space-y-3">
                  {textElements.map((txtEl) => (
                    <div
                      key={txtEl.id}
                      onClick={() => setSelectedElementId(txtEl.id)}
                      className={`p-3 rounded-lg border transition-colors ${
                        selectedElementId === txtEl.id
                          ? 'border-amber-600 bg-amber-50/40'
                          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800">{txtEl.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedElementId(txtEl.id);
                              setActiveTab('typography');
                            }}
                            className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                          >
                            {isAr ? 'تنسيق الخط' : 'Format'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateElement(txtEl.id);
                            }}
                            title={isAr ? 'تكرار النص' : 'Duplicate'}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteElement(txtEl.id);
                            }}
                            title={isAr ? 'حذف النص' : 'Delete'}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {txtEl.fieldRole === 'body' || txtEl.content.length > 65 ? (
                        <textarea
                          rows={2}
                          value={txtEl.content}
                          onChange={(e) => updateElement(txtEl.id, { content: e.target.value }, false)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-amber-600"
                        />
                      ) : (
                        <input
                          type="text"
                          value={txtEl.content}
                          onChange={(e) => updateElement(txtEl.id, { content: e.target.value }, false)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-amber-600"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Date & Reference ID Architectural Placement & Formatting Controls */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950">
                      {isAr
                        ? 'تنسيق وموضع التاريخ والرقم المرجعي داخل التصميم:'
                        : 'Date & Reference ID Layout & Formatting:'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePositionDateAndRef('above-signatures')}
                      className="px-2.5 py-1.5 text-[11px] font-bold bg-white border border-amber-300 rounded-lg text-slate-800 hover:bg-amber-100 transition-colors text-right"
                    >
                      {isAr ? '1. متناظر فوق التوقيعين (القياسي)' : '1. Balanced Above Signatures'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePositionDateAndRef('top-corners')}
                      className="px-2.5 py-1.5 text-[11px] font-bold bg-white border border-amber-300 rounded-lg text-slate-800 hover:bg-amber-100 transition-colors text-right"
                    >
                      {isAr ? '2. أعلى الزاويتين (بروتوكول وزاري)' : '2. Top Protocol Corners'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePositionDateAndRef('bottom-corners')}
                      className="px-2.5 py-1.5 text-[11px] font-bold bg-white border border-amber-300 rounded-lg text-slate-800 hover:bg-amber-100 transition-colors text-right"
                    >
                      {isAr ? '3. أسفل زاويتي الإطار' : '3. Bottom Frame Corners'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePositionDateAndRef('center-inline')}
                      className="px-2.5 py-1.5 text-[11px] font-bold bg-white border border-amber-300 rounded-lg text-slate-800 hover:bg-amber-100 transition-colors text-right"
                    >
                      {isAr ? '4. متجاوران في المنتصف' : '4. Centered Inline Pair'}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const dateEl = design.elements.find(
                          (e): e is TextCertificateElement => e.type === 'text' && e.fieldRole === 'issueDate'
                        );
                        if (dateEl) {
                          updateElement(dateEl.id, { content: 'التاريخ: 25 / 10 / 2026 م' });
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:border-amber-500"
                    >
                      {isAr ? 'تاريخ ميلادي رسمي' : 'Gregorian Date'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const dateEl = design.elements.find(
                          (e): e is TextCertificateElement => e.type === 'text' && e.fieldRole === 'issueDate'
                        );
                        if (dateEl) {
                          updateElement(dateEl.id, { content: 'حُرِّرَ في: 14 / 05 / 1448 هـ' });
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:border-amber-500"
                    >
                      {isAr ? 'تاريخ هجري رسمي' : 'Hijri Date'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const refEl = design.elements.find(
                          (e): e is TextCertificateElement => e.type === 'text' && e.fieldRole === 'certificateId'
                        );
                        if (refEl) {
                          const randomNum = Math.floor(1000 + Math.random() * 9000);
                          updateElement(refEl.id, { content: `الرقم المرجعي: REF-2026-${randomNum}` });
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:border-amber-500"
                    >
                      {isAr ? 'توليد رقم مرجعي جديد' : 'Generate Ref ID'}
                    </button>
                  </div>
                </div>

                {/* Pre-Decorated Arabic Calligraphic Titles & Phrases (Diwani, Thuluth, Kufic, Tughra) */}
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    {isAr
                      ? 'عناوين ومخطوطات مزخرفة جاهزة (الديواني / الثلث / الكوفي / الطغراء بالتشكيل):'
                      : 'Ready-Made Decorated Calligraphic Titles (Diwani, Thuluth, Kufic):'}
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {DECORATED_ARABIC_CALLIGRAPHY_PRESETS.map((cal) => (
                      <button
                        key={cal.id}
                        type="button"
                        onClick={() => {
                          const targetEl = design.elements.find(
                            (e): e is TextCertificateElement =>
                              e.type === 'text' && e.fieldRole === cal.targetRole
                          );
                          if (targetEl) {
                            updateElement(targetEl.id, {
                              content: cal.text,
                              fontFamily: cal.recommendedFont,
                            });
                            setSelectedElementId(targetEl.id);
                          }
                        }}
                        className="text-right p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:border-amber-500 hover:bg-amber-50/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-900">{cal.styleNameAr}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {cal.recommendedFont}
                          </span>
                        </div>
                        <div
                          className="text-sm font-bold text-slate-900 mt-1 truncate"
                          style={{ fontFamily: cal.recommendedFont }}
                        >
                          {cal.text}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Built-in Formal Wording Presets */}
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    {isAr ? 'صياغات عربية رسمية جاهزة (تطبيق فوري):' : 'Instant Formal Wording Presets:'}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {FORMAL_WORDING_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyWordingToCertificate(preset)}
                        className="text-right p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-colors"
                      >
                        <div className="text-xs font-bold text-slate-900">{preset.labelAr}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{preset.bodyText}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Smart Wording Generator via Gemini */}
                <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold">
                      {isAr ? 'مساعد الصياغة الذكي (Gemini AI)' : 'AI Smart Wording Generator'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isAr
                      ? 'ولّد صياغات عربية أو إنجليزية رسمية ومبتكرة مخصصة لاسم المستفيد والجهة المانحة مع إمكانية مراجعتها قبل اعتمادها.'
                      : 'Generate custom formal certificate wordings tailored to your recipient and organization.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={aiOccasion}
                      onChange={(e) => setAiOccasion(e.target.value)}
                      placeholder={isAr ? 'اسم الدورة أو المناسبة (اختياري)...' : 'Course or occasion...'}
                      className="px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-400"
                    />
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="رسمي فاخر وبليغ">{isAr ? 'أسلوب رسمي فاخر وبليغ' : 'Formal & Prestigious'}</option>
                      <option value="أكاديمي وعلمي رصين">{isAr ? 'أسلوب أكاديمي وعلمي' : 'Academic & Scholarly'}</option>
                      <option value="تحفيزي ومبهج">{isAr ? 'أسلوب تحفيزي وإبداعي' : 'Inspiring & Warm'}</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleGenerateAiWording}
                    className="w-full py-2 px-3 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isAr ? 'توليد 3 صياغات احترافية جديدة' : 'Generate 3 Wording Options'}</span>
                  </button>

                  {aiError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-700 text-[11px] text-rose-200">
                      {aiError}
                    </div>
                  )}

                  {aiSuggestions.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {aiSuggestions.map((sug, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 space-y-1.5">
                          <div className="text-xs font-bold text-amber-300">{sug.title}</div>
                          <div className="text-[11px] text-slate-200 leading-relaxed">{sug.bodyText}</div>
                          <button
                            type="button"
                            onClick={() => applyWordingToCertificate(sug)}
                            className="px-2.5 py-1 rounded bg-white text-slate-900 text-[11px] font-bold hover:bg-amber-100"
                          >
                            {isAr ? 'اعتماد هذه الصياغة في الشهادة' : 'Apply This Wording'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TYPOGRAPHY & FULL ELEMENT INSPECTOR */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                {!selectedElement ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <TypeIcon className="w-7 h-7 text-slate-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      {isAr ? 'لم يتم تحديد عنصر بعد' : 'No Element Selected'}
                    </div>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? 'انقر على أي نص أو وسام أو ختم أو شعار أو توقيع داخل الشهادة لتعديل خصائصه الكاملة وألوانه وموضعه.'
                        : 'Click any text, ornament, seal, logo, or signature on the certificate canvas to customize its properties.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{selectedElement.name}</span>
                        <span className="text-[11px] text-slate-500 block">
                          {isAr
                            ? `نوع العنصر: ${selectedElement.type}${selectedElement.groupId ? ' · مجمّع' : ''}`
                            : `Element Type: ${selectedElement.type}${selectedElement.groupId ? ' · Grouped' : ''}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleLayerOrder(selectedElement.id, 'front')}
                          className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100"
                          title={isAr ? 'إحضار للمقدمة' : 'Bring to Front'}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLayerOrder(selectedElement.id, 'back')}
                          className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100"
                          title={isAr ? 'إرسال للخلفية' : 'Send to Back'}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateElement(selectedElement.id, { locked: !selectedElement.locked })}
                          className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100"
                          title={isAr ? 'قفل / فتح القفل' : 'Lock / Unlock'}
                        >
                          {selectedElement.locked ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateElement(selectedElement.id)}
                          className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100"
                          title={isAr ? 'تكرار' : 'Duplicate'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteElement(selectedElement.id)}
                          className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* TEXT ELEMENT CONTROLS */}
                    {selectedElement.type === 'text' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {isAr ? 'محتوى النص' : 'Text Content'}
                          </label>
                          <textarea
                            rows={2}
                            value={selectedElement.content}
                            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value }, false)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600"
                          />
                        </div>

                        {/* Arabic Calligraphic Kashida & Ornamental Brackets */}
                        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-950">
                              {isAr ? 'زخرفة النص العربي وتطويل الحروف (الكشيدة):' : 'Arabic Calligraphic Kashida & Brackets:'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateElement(selectedElement.id, {
                                    content: applyArabicKashida(selectedElement.content),
                                  })
                                }
                                className="px-2 py-0.5 text-[11px] font-bold bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                              >
                                {isAr ? '+ مدّ الحروف (كشيدة)' : '+ Add Kashida'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateElement(selectedElement.id, {
                                    content: removeArabicKashida(selectedElement.content),
                                  })
                                }
                                className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 transition-colors"
                              >
                                {isAr ? 'إزالة المدّ' : 'Remove'}
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateElement(selectedElement.id, {
                                  content: wrapWithOrnamentalBrackets(selectedElement.content, '﴿', '﴾'),
                                })
                              }
                              className="py-1 px-1.5 text-[11px] font-bold bg-white border border-amber-200 rounded hover:border-amber-500 text-slate-800"
                            >
                              ﴿ ... ﴾
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateElement(selectedElement.id, {
                                  content: wrapWithOrnamentalBrackets(selectedElement.content, '❖', '❖'),
                                })
                              }
                              className="py-1 px-1.5 text-[11px] font-bold bg-white border border-amber-200 rounded hover:border-amber-500 text-slate-800"
                            >
                              ❖ ... ❖
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateElement(selectedElement.id, {
                                  content: wrapWithOrnamentalBrackets(selectedElement.content, '«', '»'),
                                })
                              }
                              className="py-1 px-1.5 text-[11px] font-bold bg-white border border-amber-200 rounded hover:border-amber-500 text-slate-800"
                            >
                              « ... »
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateElement(selectedElement.id, {
                                  content: wrapWithOrnamentalBrackets(selectedElement.content, '✦', '✦'),
                                })
                              }
                              className="py-1 px-1.5 text-[11px] font-bold bg-white border border-amber-200 rounded hover:border-amber-500 text-slate-800"
                            >
                              ✦ ... ✦
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateElement(selectedElement.id, {
                                  content: wrapWithOrnamentalBrackets(selectedElement.content, '༺', '༻'),
                                })
                              }
                              className="py-1 px-1.5 text-[11px] font-bold bg-white border border-amber-200 rounded hover:border-amber-500 text-slate-800"
                            >
                              ༺ ... ༻
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateElement(selectedElement.id, {
                                  content: wrapWithOrnamentalBrackets(selectedElement.content, '۞', '۞'),
                                })
                              }
                              className="py-1 px-1.5 text-[11px] font-bold bg-white border border-amber-200 rounded hover:border-amber-500 text-slate-800"
                            >
                              ۞ ... ۞
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateElement(selectedElement.id, {
                                  content: wrapWithOrnamentalBrackets(selectedElement.content, '❁', '❁'),
                                })
                              }
                              className="py-1 px-1.5 text-[11px] font-bold bg-white border border-amber-200 rounded hover:border-amber-500 text-slate-800"
                            >
                              ❁ ... ❁
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateElement(selectedElement.id, {
                                  content: selectedElement.content
                                    .replace(/^[﴿❖«✦༺۞❁\s]+|[﴾❖»✦༻۞❁\s]+$/g, '')
                                    .trim(),
                                })
                              }
                              className="py-1 px-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded hover:border-rose-400 text-rose-700"
                            >
                              {isAr ? 'بدون أقواس' : 'Clear'}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {isAr ? `نوع الخط (${FONT_LIBRARY.length} خطًا عربيًا مزخرفًا ولاتينيًا)` : 'Font Family'}
                          </label>
                          <select
                            value={selectedElement.fontFamily}
                            onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                            style={{ fontFamily: selectedElement.fontFamily }}
                          >
                            {FONT_LIBRARY.map((f) => (
                              <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
                                {isAr ? `${f.labelAr} — (${f.categoryAr})` : `${f.labelEn} — (${f.categoryEn})`}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Font Size, Weight, Color */}
                        <div className="grid grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'حجم الخط' : 'Font Size'}
                            </label>
                            <input
                              type="number"
                              min={10}
                              max={96}
                              value={selectedElement.fontSize}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { fontSize: Number(e.target.value) })
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'سماكة الخط' : 'Weight'}
                            </label>
                            <select
                              value={selectedElement.fontWeight}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { fontWeight: Number(e.target.value) })
                              }
                              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                            >
                              <option value={400}>{isAr ? 'عادي (400)' : 'Regular (400)'}</option>
                              <option value={500}>{isAr ? 'متوسط (500)' : 'Medium (500)'}</option>
                              <option value={600}>{isAr ? 'شبه عريض (600)' : 'SemiBold (600)'}</option>
                              <option value={700}>{isAr ? 'عريض (700)' : 'Bold (700)'}</option>
                              <option value={800}>{isAr ? 'عريض جدًا (800)' : 'ExtraBold (800)'}</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'لون النص' : 'Text Color'}
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={selectedElement.color}
                                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                className="w-8 h-8 rounded border border-slate-300 cursor-pointer shrink-0"
                              />
                              <input
                                type="text"
                                value={selectedElement.color}
                                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                className="w-full px-1.5 py-1.5 text-[11px] font-mono border border-slate-300 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Alignment, Direction, Italic */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => updateElement(selectedElement.id, { align: 'right' })}
                              className={`p-1.5 rounded ${
                                selectedElement.align === 'right' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                              }`}
                            >
                              <AlignRight className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateElement(selectedElement.id, { align: 'center' })}
                              className={`p-1.5 rounded ${
                                selectedElement.align === 'center' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                              }`}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateElement(selectedElement.id, { align: 'left' })}
                              className={`p-1.5 rounded ${
                                selectedElement.align === 'left' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                              }`}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => updateElement(selectedElement.id, { direction: 'rtl' })}
                              className={`px-2.5 py-1 rounded ${
                                selectedElement.direction === 'rtl' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                              }`}
                            >
                              RTL عربي
                            </button>
                            <button
                              type="button"
                              onClick={() => updateElement(selectedElement.id, { direction: 'ltr' })}
                              className={`px-2.5 py-1 rounded ${
                                selectedElement.direction === 'ltr' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                              }`}
                            >
                              LTR EN
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => updateElement(selectedElement.id, { italic: !selectedElement.italic })}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold italic ${
                              selectedElement.italic
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            I مائل
                          </button>
                        </div>

                        {/* Line Height & Letter Spacing */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? `ارتفاع السطر (${selectedElement.lineHeight})` : `Line Height (${selectedElement.lineHeight})`}
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="2.2"
                              step="0.05"
                              value={selectedElement.lineHeight}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { lineHeight: Number(e.target.value) })
                              }
                              className="w-full accent-amber-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? `تباعد الحروف (${selectedElement.letterSpacing}px)` : `Letter Spacing`}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="8"
                              step="0.5"
                              value={selectedElement.letterSpacing}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { letterSpacing: Number(e.target.value) })
                              }
                              className="w-full accent-amber-600"
                            />
                          </div>
                        </div>

                        {/* Text Outline Stroke & Shadow */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'حد خارجي للنص (Stroke)' : 'Outline Stroke Width'}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="3"
                              step="0.25"
                              value={selectedElement.strokeWidth || 0}
                              onChange={(e) =>
                                updateElement(selectedElement.id, {
                                  strokeWidth: Number(e.target.value),
                                  strokeColor: selectedElement.strokeColor || design.pageConfig.frameAccentColor,
                                })
                              }
                              className="w-full accent-amber-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'لون الحد الخارجي' : 'Outline Color'}
                            </label>
                            <input
                              type="color"
                              value={selectedElement.strokeColor || design.pageConfig.frameAccentColor}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { strokeColor: e.target.value })
                              }
                              className="w-full h-7 rounded border border-slate-300 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Auto-fit long names & Text Shadow */}
                        <div className="space-y-2 pt-1">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(selectedElement.autoFitLongName)}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { autoFitLongName: e.target.checked })
                              }
                              className="rounded accent-amber-600"
                            />
                            <span>{isAr ? 'ملاءمة تلقائية للأسماء العربية الطويلة' : 'Auto-fit long recipient names'}</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedElement.textShadow}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { textShadow: e.target.checked })
                              }
                              className="rounded accent-amber-600"
                            />
                            <span>{isAr ? 'إضافة ظل ناعم للنص لإبرازه' : 'Enable subtle drop shadow'}</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* ORNAMENT ELEMENT CONTROLS */}
                    {selectedElement.type === 'ornament' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {isAr ? 'شكل الوسام أو الزخرفة المتجهة' : 'Ornament Shape'}
                          </label>
                          <select
                            value={selectedElement.variant}
                            onChange={(e) =>
                              updateElement(selectedElement.id, { variant: e.target.value as OrnamentVariant })
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            {ORNAMENT_CATALOG.map((orn) => (
                              <option key={orn.variant} value={orn.variant}>
                                {isAr ? `${orn.nameAr} (${orn.categoryAr})` : orn.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'اللون الأساسي للوسام' : 'Primary Color'}
                            </label>
                            <input
                              type="color"
                              value={selectedElement.color}
                              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                              className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'اللون الثانوي للوسام' : 'Secondary Color'}
                            </label>
                            <input
                              type="color"
                              value={selectedElement.secondaryColor || design.pageConfig.frameColor}
                              onChange={(e) => updateElement(selectedElement.id, { secondaryColor: e.target.value })}
                              className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DIVIDER ELEMENT CONTROLS */}
                    {selectedElement.type === 'divider' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {isAr ? 'نمط الفاصل الزخرفي' : 'Divider Style'}
                          </label>
                          <select
                            value={selectedElement.variant}
                            onChange={(e) =>
                              updateElement(selectedElement.id, { variant: e.target.value as DividerVariant })
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            {DIVIDER_CATALOG.map((dv) => (
                              <option key={dv.variant} value={dv.variant}>
                                {isAr ? dv.nameAr : dv.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'لون الفاصل' : 'Divider Color'}
                            </label>
                            <input
                              type="color"
                              value={selectedElement.color}
                              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                              className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'سماكة الخط' : 'Thickness'}
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={8}
                              value={selectedElement.thickness}
                              onChange={(e) => updateElement(selectedElement.id, { thickness: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SEAL ELEMENT CONTROLS */}
                    {selectedElement.type === 'seal' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {isAr ? 'تصميم الختم الرسمي' : 'Seal Variant'}
                          </label>
                          <select
                            value={selectedElement.variant}
                            onChange={(e) =>
                              updateElement(selectedElement.id, { variant: e.target.value as SealVariant })
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            {SEAL_CATALOG.map((sl) => (
                              <option key={sl.variant} value={sl.variant}>
                                {isAr ? sl.nameAr : sl.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'العبارة العلوية للختم' : 'Top Seal Text'}
                            </label>
                            <input
                              type="text"
                              value={selectedElement.primaryText}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { primaryText: e.target.value }, false)
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'العبارة السفلية للختم' : 'Bottom Seal Text'}
                            </label>
                            <input
                              type="text"
                              value={selectedElement.secondaryText}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { secondaryText: e.target.value }, false)
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'اللون الأساسي للختم' : 'Primary Seal Color'}
                            </label>
                            <input
                              type="color"
                              value={selectedElement.color}
                              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                              className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'اللون الذهبي / الإطار' : 'Accent Color'}
                            </label>
                            <input
                              type="color"
                              value={selectedElement.accentColor}
                              onChange={(e) => updateElement(selectedElement.id, { accentColor: e.target.value })}
                              className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IMAGE / LOGO ELEMENT CONTROLS */}
                    {selectedElement.type === 'image' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-800">
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isAr ? 'استبدال الشعار / الصورة من الجهاز' : 'Replace Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    updateElement(selectedElement.id, { src: reader.result });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'استدارة الحواف' : 'Corner Radius'}
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={200}
                              value={selectedElement.borderRadius}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { borderRadius: Number(e.target.value) })
                              }
                              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'سماكة الإطار' : 'Border Width'}
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={12}
                              value={selectedElement.borderWidth || 0}
                              onChange={(e) =>
                                updateElement(selectedElement.id, {
                                  borderWidth: Number(e.target.value),
                                  borderColor: selectedElement.borderColor || design.pageConfig.frameAccentColor,
                                })
                              }
                              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'لون الإطار' : 'Border Color'}
                            </label>
                            <input
                              type="color"
                              value={selectedElement.borderColor || design.pageConfig.frameAccentColor}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { borderColor: e.target.value })
                              }
                              className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SIGNATURE ELEMENT CONTROLS */}
                    {selectedElement.type === 'signature' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'اسم الموقّع / المسؤول' : 'Signer Name'}
                            </label>
                            <input
                              type="text"
                              value={selectedElement.signerName}
                              onChange={(e) =>
                                updateElement(
                                  selectedElement.id,
                                  { signerName: e.target.value, signatureText: e.target.value },
                                  false
                                )
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {isAr ? 'المسمى الوظيفي' : 'Job Title'}
                            </label>
                            <input
                              type="text"
                              value={selectedElement.signerTitle}
                              onChange={(e) =>
                                updateElement(selectedElement.id, { signerTitle: e.target.value }, false)
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={selectedElement.color}
                              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                              className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                            />
                            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedElement.showLine}
                                onChange={(e) =>
                                  updateElement(selectedElement.id, { showLine: e.target.checked })
                                }
                                className="rounded accent-amber-600"
                              />
                              <span>{isAr ? 'إظهار خط التوقيع' : 'Show signature line'}</span>
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSignature(selectedElement);
                              setSignatureModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                          >
                            {isAr ? 'رسم / تحرير التوقيع الحي' : 'Draw / Edit Signature'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Common Geometry Controls (X, Y, Width, Height, Rotation, Opacity) */}
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800">
                          {isAr ? 'الموضع والأبعاد والشفافية والتدوير' : 'Position, Dimensions, Opacity & Rotation'}
                        </h4>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateElement(selectedElement.id, {
                                x: Math.round((design.pageConfig.widthPx - selectedElement.width) / 2),
                              })
                            }
                            className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                          >
                            {isAr ? 'توسيط أفقي' : 'Center H'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateElement(selectedElement.id, {
                                y: Math.round((design.pageConfig.heightPx - selectedElement.height) / 2),
                              })
                            }
                            className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                          >
                            {isAr ? 'توسيط عمودي' : 'Center V'}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500">X</label>
                          <input
                            type="number"
                            value={selectedElement.x}
                            onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                            className="w-full px-2 py-1 text-xs font-mono border border-slate-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500">Y</label>
                          <input
                            type="number"
                            value={selectedElement.y}
                            onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                            className="w-full px-2 py-1 text-xs font-mono border border-slate-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500">
                            {isAr ? 'العرض W' : 'Width'}
                          </label>
                          <input
                            type="number"
                            min={12}
                            value={selectedElement.width}
                            onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                            className="w-full px-2 py-1 text-xs font-mono border border-slate-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500">
                            {isAr ? 'الارتفاع H' : 'Height'}
                          </label>
                          <input
                            type="number"
                            min={8}
                            value={selectedElement.height}
                            onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                            className="w-full px-2 py-1 text-xs font-mono border border-slate-300 rounded"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            {isAr ? `الشفافية (${Math.round(selectedElement.opacity * 100)}%)` : 'Opacity'}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={selectedElement.opacity}
                            onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })}
                            className="w-full accent-amber-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            {isAr ? `تدوير العنصر (${selectedElement.rotation}°)` : 'Rotation'}
                          </label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            step="5"
                            value={selectedElement.rotation}
                            onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                            className="w-full accent-amber-600"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 3: 42 ARTISTIC & FORMAL BUSINESS STYLES & COLOR PALETTES */}
            {activeTab === 'styles' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-1">
                    {isAr
                      ? `الاستايلات والأنماط الرسمية والتجارية (${ARTISTIC_STYLES.length} نمطًا مستقلًا عن النصوص)`
                      : `${ARTISTIC_STYLES.length} Independent Artistic & Corporate Certificate Styles`}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">
                    {isAr
                      ? 'تشمل استايلات الشركات، البنوك، الغرف التجارية، الآيزو، السفارات، والوزارات. انقر لتبديل المظهر فورًا دون المساس ببيانات الشهادة.'
                      : 'Includes executive corporate, ISO, banking, diplomatic, and royal styles. Click to apply without losing text.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                    {ARTISTIC_STYLES.map((st) => {
                      const isCurrent = design.styleId === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => handleApplyArtisticStyle(st)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-right transition-colors ${
                            isCurrent
                              ? 'border-amber-600 bg-amber-50/70'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0 pr-1">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {st.number}. {isAr ? st.nameAr : st.nameEn}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {isAr ? st.nameEn : st.nameAr}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: st.primaryColor }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: st.accentColor }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: st.backgroundColor }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">
                    {isAr ? 'مجموعات الألوان الرسمية المتناسقة:' : 'Curated Color Palettes:'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PALETTES.map((pal) => (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => {
                          onChangeDesign({
                            ...design,
                            pageConfig: {
                              ...design.pageConfig,
                              backgroundColor: pal.bg,
                              backgroundGradientEnd: pal.bgEnd,
                              frameColor: pal.primary,
                              frameSecondaryColor: pal.secondary,
                              frameAccentColor: pal.accent,
                            },
                            updatedAt: new Date().toISOString(),
                          });
                        }}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-amber-500 bg-white text-right"
                      >
                        <span className="text-[11px] font-semibold text-slate-800 truncate">
                          {isAr ? pal.nameAr : pal.nameEn}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.primary }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.accent }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FRAMES, ORNAMENTS & DIVIDERS */}
            {activeTab === 'ornaments' && (
              <div className="space-y-5">
                {/* Frame customization */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">
                    {isAr ? 'هندسة الإطار الخارجي وألوانه وسماكته' : 'Certificate Frame Architecture & Colors'}
                  </h3>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isAr ? 'طراز الإطار الهندسي / المؤسسي' : 'Frame Architecture Style'}
                    </label>
                    <select
                      value={design.pageConfig.frameType}
                      onChange={(e) =>
                        onChangeDesign({
                          ...design,
                          pageConfig: {
                            ...design.pageConfig,
                            frameType: e.target.value as FrameType,
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      {ARTISTIC_STYLES.map((st) => (
                        <option key={st.id} value={st.frameType}>
                          {st.number}. {isAr ? `${st.nameAr} (${st.frameType})` : `${st.nameEn}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">
                        {isAr ? 'اللون الأساسي' : 'Primary'}
                      </label>
                      <input
                        type="color"
                        value={design.pageConfig.frameColor}
                        onChange={(e) =>
                          onChangeDesign({
                            ...design,
                            pageConfig: { ...design.pageConfig, frameColor: e.target.value },
                          })
                        }
                        className="w-full h-8 rounded cursor-pointer border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">
                        {isAr ? 'اللون الثانوي' : 'Secondary'}
                      </label>
                      <input
                        type="color"
                        value={design.pageConfig.frameSecondaryColor}
                        onChange={(e) =>
                          onChangeDesign({
                            ...design,
                            pageConfig: { ...design.pageConfig, frameSecondaryColor: e.target.value },
                          })
                        }
                        className="w-full h-8 rounded cursor-pointer border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">
                        {isAr ? 'اللون الذهبي/المساعد' : 'Accent'}
                      </label>
                      <input
                        type="color"
                        value={design.pageConfig.frameAccentColor}
                        onChange={(e) =>
                          onChangeDesign({
                            ...design,
                            pageConfig: { ...design.pageConfig, frameAccentColor: e.target.value },
                          })
                        }
                        className="w-full h-8 rounded cursor-pointer border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">
                        {isAr ? 'سماكة الإطار' : 'Thickness'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={design.pageConfig.borderThickness}
                        onChange={(e) =>
                          onChangeDesign({
                            ...design,
                            pageConfig: { ...design.pageConfig, borderThickness: Number(e.target.value) },
                          })
                        }
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Add Independent Vector Ornaments */}
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    {isAr ? 'إضافة أوسمة وتيجان وزخارف مستقلة:' : 'Insert Independent Vector Ornaments:'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ORNAMENT_CATALOG.map((orn) => (
                      <button
                        key={orn.variant}
                        type="button"
                        onClick={() =>
                          handleAddOrnament(orn.variant, orn.defaultColor, isAr ? orn.nameAr : orn.nameEn)
                        }
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 text-right transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {isAr ? orn.nameAr : orn.nameEn}
                          </div>
                          <div className="text-[10px] text-slate-500">{orn.categoryAr}</div>
                        </div>
                        <Plus className="w-4 h-4 text-amber-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Dividers */}
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    {isAr ? 'إضافة فواصل زخرفية أفقية:' : 'Insert Decorative Dividers:'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {DIVIDER_CATALOG.map((div) => (
                      <button
                        key={div.variant}
                        type="button"
                        onClick={() => handleAddDivider(div.variant, isAr ? div.nameAr : div.nameEn)}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 bg-white text-xs font-semibold text-slate-800"
                      >
                        <span className="truncate">{isAr ? div.nameAr : div.nameEn}</span>
                        <Plus className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: LOGOS, IMAGES & BACKGROUNDS */}
            {activeTab === 'media' && (
              <div className="space-y-5">
                {/* Upload from Device */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 text-center transition-colors">
                    <Upload className="w-5 h-5 text-amber-600 mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {isAr ? 'رفع شعار الجهة من الجهاز' : 'Upload Organization Logo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadDeviceImage(e, true)}
                      className="hidden"
                    />
                  </label>

                  <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 text-center transition-colors">
                    <ImageIcon className="w-5 h-5 text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {isAr ? 'إدراج صورة شخصية / صورة' : 'Insert Recipient Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadDeviceImage(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Built-in Vector Institution Emblems */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    {isAr ? 'مكتبة الشعارات المؤسسية والتجارية الجاهزة (SVG):' : 'Built-in Institutional & Corporate Emblems:'}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {BUILTIN_LOGOS.map((logo) => (
                      <button
                        key={logo.id}
                        type="button"
                        onClick={() => handleAddImageOrLogo(logo.src, isAr ? logo.nameAr : logo.nameEn, true)}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-amber-500 bg-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={logo.src}
                            alt={logo.nameAr}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 object-contain"
                          />
                          <span className="text-xs font-semibold text-slate-800">
                            {isAr ? logo.nameAr : logo.nameEn}
                          </span>
                        </div>
                        <Plus className="w-4 h-4 text-amber-600" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Controls */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">
                    {isAr ? 'خلفية الشهادة والأنماط الأمنية والهندسية:' : 'Certificate Background & Pattern:'}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {isAr ? 'لون الخلفية الأساسي' : 'Background Color'}
                      </label>
                      <input
                        type="color"
                        value={design.pageConfig.backgroundColor}
                        onChange={(e) =>
                          onChangeDesign({
                            ...design,
                            pageConfig: { ...design.pageConfig, backgroundColor: e.target.value },
                          })
                        }
                        className="w-full h-8 rounded cursor-pointer border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {isAr ? 'تدرج الخلفية الثانوي' : 'Gradient End Color'}
                      </label>
                      <input
                        type="color"
                        value={design.pageConfig.backgroundGradientEnd || design.pageConfig.backgroundColor}
                        onChange={(e) =>
                          onChangeDesign({
                            ...design,
                            pageConfig: { ...design.pageConfig, backgroundGradientEnd: e.target.value },
                          })
                        }
                        className="w-full h-8 rounded cursor-pointer border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {isAr ? 'النمط الزخرفي للخلفية' : 'Background Pattern'}
                      </label>
                      <select
                        value={design.pageConfig.backgroundPattern}
                        onChange={(e) =>
                          onChangeDesign({
                            ...design,
                            pageConfig: {
                              ...design.pageConfig,
                              backgroundPattern: e.target.value as BackgroundPatternType,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="none">{isAr ? 'بدون نقش (سادة)' : 'None (Solid)'}</option>
                        <option value="guilloche">{isAr ? 'نقش غيلوش دبلوماسي' : 'Guilloche'}</option>
                        <option value="sovereign-rosette">{isAr ? 'روزيتا سيادية أمنية' : 'Sovereign Rosette'}</option>
                        <option value="micro-ledger">{isAr ? 'شبكة سجلات مالية دقيقة' : 'Micro Financial Ledger'}</option>
                        <option value="executive-pinstripe">{isAr ? 'تقليم تنفيذي للأعمال' : 'Executive Pinstripe'}</option>
                        <option value="islamic-stars">{isAr ? 'نجوم هندسية إسلامية' : 'Islamic Stars'}</option>
                        <option value="geometric-grid">{isAr ? 'شبكة هندسية خفيفة' : 'Geometric Grid'}</option>
                        <option value="marble">{isAr ? 'تموجات رخامية' : 'Marble Veins'}</option>
                        <option value="floral-watermark">{isAr ? 'زخرفة نباتية مائية' : 'Botanical Watermark'}</option>
                        <option value="diagonal-lines">{isAr ? 'خطوط قطرية ناعمة' : 'Diagonal Lines'}</option>
                        <option value="dots">{isAr ? 'نقاط ناعمة' : 'Soft Dots'}</option>
                        <option value="waves">{isAr ? 'أمواج هادئة' : 'Subtle Waves'}</option>
                        <option value="confetti">{isAr ? 'نجوم واحتفالات للأطفال' : 'Festive Confetti'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {isAr ? `كثافة النقش (${Math.round(design.pageConfig.patternOpacity * 100)}%)` : 'Pattern Opacity'}
                      </label>
                      <input
                        type="range"
                        min="0.02"
                        max="0.35"
                        step="0.01"
                        value={design.pageConfig.patternOpacity}
                        onChange={(e) =>
                          onChangeDesign({
                            ...design,
                            pageConfig: { ...design.pageConfig, patternOpacity: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-amber-600 mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SIGNATURES & SEALS */}
            {activeTab === 'signatures' && (
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">
                      {isAr ? 'التوقيعات والجهات المانحة' : 'Signatures & Signatories'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSignature(null);
                        setSignatureModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                    >
                      <PenTool className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAr ? 'إضافة توقيع جديد' : 'Add Signature'}</span>
                    </button>
                  </div>

                  {/* Quick Balanced Signature Area Generator */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold text-slate-700">
                      {isAr ? 'إنشاء منطقة توقيعات متوازنة تلقائيًا:' : 'Balanced Signature Layout:'}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {([1, 2, 3] as const).map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => handleBalanceSignatureLayout(cnt)}
                          className="py-1.5 px-2 text-xs font-semibold bg-white border border-slate-200 rounded-md hover:border-amber-500 text-slate-800"
                        >
                          {cnt === 1
                            ? isAr
                              ? 'توقيع واحد'
                              : '1 Signer'
                            : cnt === 2
                            ? isAr
                              ? 'توقيعان متوازنان'
                              : '2 Signers'
                            : isAr
                            ? '3 توقيعات'
                            : '3 Signers'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Existing Signatures on Canvas */}
                  {design.elements
                    .filter((el): el is SignatureCertificateElement => el.type === 'signature')
                    .map((sig) => (
                      <div
                        key={sig.id}
                        className="p-3 rounded-lg border border-slate-200 bg-white space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{sig.signerName}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSignature(sig);
                                setSignatureModalOpen(true);
                              }}
                              className="px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 rounded"
                            >
                              {isAr ? 'تعديل الرسم / الخط' : 'Edit Signature'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteElement(sig.id)}
                              className="p-1 text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={sig.signerName}
                            onChange={(e) =>
                              updateElement(sig.id, { signerName: e.target.value, signatureText: e.target.value }, false)
                            }
                            placeholder={isAr ? 'اسم الموقّع' : 'Signer Name'}
                            className="px-2 py-1 text-xs border border-slate-300 rounded"
                          />
                          <input
                            type="text"
                            value={sig.signerTitle}
                            onChange={(e) => updateElement(sig.id, { signerTitle: e.target.value }, false)}
                            placeholder={isAr ? 'المسمى الوظيفي' : 'Job Title'}
                            className="px-2 py-1 text-xs border border-slate-300 rounded"
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Official Design Seals & Stamps */}
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Stamp className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-slate-900">
                      {isAr ? 'الأختام والشارات التصميمية التزيينية:' : 'Decorative Design Seals & Stamps:'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isAr
                      ? 'أدوات ختم تصميمية تزيينية قابلة لتغيير العبارة واللون والشفافية.'
                      : 'Customizable design seals with editable labels and colors.'}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {SEAL_CATALOG.map((s) => (
                      <button
                        key={s.variant}
                        type="button"
                        onClick={() =>
                          handleAddSeal(
                            s.variant,
                            s.defaultPrimary,
                            s.defaultSecondary,
                            s.color,
                            s.accentColor,
                            isAr ? s.nameAr : s.nameEn
                          )
                        }
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 bg-white text-right"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">{isAr ? s.nameAr : s.nameEn}</div>
                          <div className="text-[11px] text-slate-500">
                            {s.defaultPrimary} · {s.defaultSecondary}
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-amber-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: PAGE DIMENSIONS & PRINT SETUP */}
            {activeTab === 'page' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900">
                  {isAr ? 'أبعاد الشهادة وإعدادات الطباعة' : 'Certificate Dimensions & Print Setup'}
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isAr ? 'المقاس القياسي للصفحة والاتجاه' : 'Standard Page Size & Orientation'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ['A4', 'landscape', isAr ? 'A4 أفقي (297×210 مم)' : 'A4 Landscape'],
                        ['A4', 'portrait', isAr ? 'A4 عمودي (210×297 مم)' : 'A4 Portrait'],
                        ['A3', 'landscape', isAr ? 'A3 أفقي (420×297 مم)' : 'A3 Landscape'],
                        ['A3', 'portrait', isAr ? 'A3 عمودي (297×420 مم)' : 'A3 Portrait'],
                        ['A5', 'landscape', isAr ? 'A5 أفقي (210×148 مم)' : 'A5 Landscape'],
                        ['A5', 'portrait', isAr ? 'A5 عمودي (148×210 مم)' : 'A5 Portrait'],
                        ['LETTER', 'landscape', isAr ? 'Letter أفقي (279.4×215.9 مم)' : 'Letter Landscape'],
                        ['LETTER', 'portrait', isAr ? 'Letter عمودي (215.9×279.4 مم)' : 'Letter Portrait'],
                        ['LEGAL', 'landscape', isAr ? 'Legal أفقي (355.6×215.9 مم)' : 'Legal Landscape'],
                        ['LEGAL', 'portrait', isAr ? 'Legal عمودي (215.9×355.6 مم)' : 'Legal Portrait'],
                      ] as const
                    ).map(([fmt, orient, label]) => {
                      const active =
                        design.pageConfig.format === fmt && design.pageConfig.orientation === orient;
                      return (
                        <button
                          key={`${fmt}-${orient}`}
                          type="button"
                          onClick={() => handleChangePageDimensions(fmt as PageFormat, orient as PageOrientation)}
                          className={`py-2 px-3 rounded-lg border text-xs font-semibold text-right transition-colors ${
                            active
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {(() => {
                    const printSpec = getExportPixelDimensions(design.pageConfig, 300);
                    return (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 tabular-nums">
                        <div>
                          {isAr ? 'مساحة التصميم المنطقية: ' : 'Logical Canvas: '}
                          <strong>{printSpec.logicalWidthPx}×{printSpec.logicalHeightPx} px</strong>
                        </div>
                        <div>
                          {isAr ? 'أبعاد الطباعة (300 DPI): ' : 'Print Output (300 DPI): '}
                          <strong className="text-amber-800">{printSpec.exportWidthPx}×{printSpec.exportHeightPx} px</strong>
                          {' · '}
                          <span>{printSpec.widthMm}×{printSpec.heightMm} mm ({printSpec.widthPt}×{printSpec.heightPt} pt)</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Custom Millimeter Size */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isAr ? 'العرض بالملليمتر (mm)' : 'Width (mm)'}
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={600}
                      value={design.pageConfig.widthMm}
                      onChange={(e) =>
                        handleChangePageDimensions(
                          'CUSTOM',
                          design.pageConfig.orientation,
                          Number(e.target.value),
                          design.pageConfig.heightMm
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isAr ? 'الارتفاع بالملليمتر (mm)' : 'Height (mm)'}
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={600}
                      value={design.pageConfig.heightMm}
                      onChange={(e) =>
                        handleChangePageDimensions(
                          'CUSTOM',
                          design.pageConfig.orientation,
                          design.pageConfig.widthMm,
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Print Bleed / Safe Zone Toggles */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={design.pageConfig.showPrintMargin}
                      onChange={(e) =>
                        onChangeDesign({
                          ...design,
                          pageConfig: { ...design.pageConfig, showPrintMargin: e.target.checked },
                        })
                      }
                      className="rounded accent-amber-600"
                    />
                    <span>{isAr ? 'إظهار حدود هوامش الطباعة على اللوحة' : 'Show print margin boundaries'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={design.pageConfig.showSafeZone}
                      onChange={(e) =>
                        onChangeDesign({
                          ...design,
                          pageConfig: { ...design.pageConfig, showSafeZone: e.target.checked },
                        })
                      }
                      className="rounded accent-amber-600"
                    />
                    <span>
                      {isAr ? 'إظهار المنطقة الآمنة للطباعة (تجنب قص الإطار)' : 'Show print safe zone guide'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={design.pageConfig.whiteForPrint}
                      onChange={(e) =>
                        onChangeDesign({
                          ...design,
                          pageConfig: { ...design.pageConfig, whiteForPrint: e.target.checked },
                        })
                      }
                      className="rounded accent-amber-600"
                    />
                    <span>{isAr ? 'وضع الخلفية البيضاء النقية للطباعة' : 'Pure white background for print'}</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 8: LAYERS & ELEMENT MANAGEMENT */}
            {activeTab === 'layers' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {isAr ? 'إدارة الطبقات وترتيب وتجميع العناصر' : 'Layers, Ordering & Grouping'}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      {isAr
                        ? 'العناصر المجمّعة تتحرك معًا عند سحب أيٍّ منها على اللوحة'
                        : 'Grouped elements move together when dragged on canvas'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {[...design.elements]
                    .sort((a, b) => b.zIndex - a.zIndex)
                    .map((el) => {
                      const isSel = selectedElementId === el.id;
                      const isGrouped = Boolean(el.groupId);
                      return (
                        <div
                          key={el.id}
                          onClick={() => setSelectedElementId(el.id)}
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            isSel
                              ? 'border-amber-600 bg-amber-50/60'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0 pr-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate">{el.name}</span>
                              {isGrouped && (
                                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-bold rounded">
                                  {isAr ? 'مجموعة' : 'Group'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {el.type === 'text' ? el.content : el.type}
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleLayerOrder(el.id, 'front')}
                              title={isAr ? 'إحضار للمقدمة' : 'Bring to Front'}
                              className="px-1 py-0.5 text-[9px] font-bold text-slate-600 hover:text-slate-950 bg-slate-100 rounded"
                            >
                              {isAr ? 'مقدمة' : 'Top'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleLayerOrder(el.id, 'forward')}
                              title={isAr ? 'تقديم خطوة للأمام' : 'Step Forward'}
                              className="p-1 text-slate-500 hover:text-slate-900"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleLayerOrder(el.id, 'backward')}
                              title={isAr ? 'تأخير خطوة للخلف' : 'Step Backward'}
                              className="p-1 text-slate-500 hover:text-slate-900"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleLayerOrder(el.id, 'back')}
                              title={isAr ? 'إرسال للخلفية' : 'Send to Back'}
                              className="px-1 py-0.5 text-[9px] font-bold text-slate-600 hover:text-slate-950 bg-slate-100 rounded"
                            >
                              {isAr ? 'خلفية' : 'Back'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateElement(el.id, {
                                  groupId: isGrouped ? undefined : 'custom-group-1',
                                })
                              }
                              title={isAr ? 'ضم للمجموعة / فك التجميع' : 'Toggle Group'}
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                isGrouped
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {isAr ? (isGrouped ? 'فك' : 'تجميع') : isGrouped ? 'Ungroup' : 'Group'}
                            </button>
                            <button
                              type="button"
                              onClick={() => updateElement(el.id, { visible: !el.visible })}
                              title={isAr ? 'إظهار / إخفاء' : 'Show / Hide'}
                              className="p-1 text-slate-500 hover:text-slate-900"
                            >
                              {el.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => updateElement(el.id, { locked: !el.locked })}
                              title={isAr ? 'قفل / فتح' : 'Lock / Unlock'}
                              className="p-1 text-slate-500 hover:text-slate-900"
                            >
                              {el.locked ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateElement(el.id)}
                              title={isAr ? 'تكرار' : 'Duplicate'}
                              className="p-1 text-slate-500 hover:text-slate-900"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteElement(el.id)}
                              title={isAr ? 'حذف' : 'Delete'}
                              className="p-1 text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Interactive Design Canvas Area (7 columns on desktop) */}
        <div className="lg:col-span-7 bg-slate-200/80 rounded-xl border border-slate-300 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[540px] overflow-auto">
          <div
            className="bg-white shadow-2xl rounded-sm transition-transform origin-center"
            style={{
              width: `${Math.round(design.pageConfig.widthPx * zoom)}px`,
              height: `${Math.round(design.pageConfig.heightPx * zoom)}px`,
            }}
          >
            <CertificateRenderer
              design={design}
              svgRef={svgRef}
              interactive={true}
              selectedElementId={selectedElementId}
              onSelectElement={(id) => {
                setSelectedElementId(id);
                if (id) {
                  const clicked = design.elements.find((e) => e.id === id);
                  if (clicked?.type === 'signature') {
                    setActiveTab('signatures');
                  }
                }
              }}
              onStartDragElement={(e, el) => {
                const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
                const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
                dragStateRef.current = {
                  mode: 'move',
                  elementId: el.id,
                  startX: clientX,
                  startY: clientY,
                  origX: el.x,
                  origY: el.y,
                  origW: el.width,
                  origH: el.height,
                  hasPushedHistory: false,
                };
              }}
              onStartResizeElement={(e, el, handle) => {
                const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
                const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
                dragStateRef.current = {
                  mode: 'resize',
                  elementId: el.id,
                  startX: clientX,
                  startY: clientY,
                  origX: el.x,
                  origY: el.y,
                  origW: el.width,
                  origH: el.height,
                  handle,
                  hasPushedHistory: false,
                };
              }}
              onDoubleClickText={(txtEl) => {
                setSelectedElementId(txtEl.id);
                setActiveTab('typography');
              }}
              showGrid={showGrid}
              snapLines={snapLines}
              exportMode={false}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600">
            <span>
              {isAr
                ? '💡 انقر على أي عنصر في الشهادة لسحبه أو تغيير حجمه، أو انقر مرتين على أي نص لتحريره.'
                : '💡 Click any element to drag or resize, or double-click any text to edit.'}
            </span>
            <span className="font-mono tabular-nums">
              {design.pageConfig.format} · {design.pageConfig.widthMm}×{design.pageConfig.heightMm}mm
            </span>
          </div>
        </div>
      </div>

      {/* Signature Creation & Editing Modal */}
      <SignatureModal
        isOpen={signatureModalOpen}
        language={language}
        initialSignature={editingSignature}
        onClose={() => setSignatureModalOpen(false)}
        onSave={(sigData) => {
          if (editingSignature) {
            updateElement(editingSignature.id, sigData);
          } else {
            const { widthPx, heightPx } = design.pageConfig;
            const newSig: SignatureCertificateElement = {
              id: `sig-${Date.now()}`,
              type: 'signature',
              name: sigData.signerName || (isAr ? 'توقيع جديد' : 'New Signature'),
              ...sigData,
              x: Math.round(widthPx / 2 - 115),
              y: heightPx - 195,
              width: 230,
              height: 105,
              rotation: 0,
              opacity: 1,
              locked: false,
              visible: true,
              zIndex: design.elements.length + 1,
            };
            onChangeDesign({
              ...design,
              elements: [...design.elements, newSig],
              updatedAt: new Date().toISOString(),
            });
            setSelectedElementId(newSig.id);
          }
        }}
      />
    </div>
  );
};
