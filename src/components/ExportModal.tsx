import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileCode2,
  FileImage,
  FileJson,
  FileText,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  CertificateDesign,
  ExportDpi,
  PageFormat,
  PageOrientation,
  UILanguage,
} from '../types/certificate';
import { CertificateRenderer } from './CertificateRenderer';
import {
  exportCertificateAsJpg,
  exportCertificateAsPdf,
  exportCertificateAsPng,
  exportCertificateAsSvg,
  exportDesignAsJson,
} from '../utils/exportCertificate';
import { getExportPixelDimensions, resolvePaperDimensions } from '../utils/pageDimensions';

interface ExportModalProps {
  isOpen: boolean;
  design: CertificateDesign;
  language: UILanguage;
  defaultDpi: ExportDpi;
  onClose: () => void;
  onChangeDesign?: (updated: CertificateDesign) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  design,
  language,
  defaultDpi,
  onClose,
  onChangeDesign,
}) => {
  const isAr = language === 'ar';
  const cleanSvgRef = useRef<SVGSVGElement | null>(null);

  const [format, setFormat] = useState<'pdf' | 'png' | 'jpg' | 'svg' | 'json'>('pdf');
  const [dpi, setDpi] = useState<ExportDpi>(defaultDpi || 300);
  const [jpgQuality, setJpgQuality] = useState<number>(0.95);
  const [transparentBg, setTransparentBg] = useState(false);
  const [whitePrintBg, setWhitePrintBg] = useState(design.pageConfig.whiteForPrint);
  const [previewZoom, setPreviewZoom] = useState<'fit' | number>('fit');
  const [filename, setFilename] = useState(
    design.name.replace(/\s+/g, '-') || 'certificate-studio-export'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFilename(design.name.replace(/\s+/g, '-') || 'certificate-studio-export');
      setWhitePrintBg(design.pageConfig.whiteForPrint);
      setDpi(defaultDpi || 300);
      setPreviewZoom('fit');
      setExportStatus(null);
    }
  }, [isOpen, design.id, design.name, design.pageConfig.whiteForPrint, defaultDpi]);

  if (!isOpen) return null;

  const previewDesign: CertificateDesign = {
    ...design,
    pageConfig: {
      ...design.pageConfig,
      transparentBackground: format === 'png' && transparentBg,
      whiteForPrint: whitePrintBg,
    },
  };

  const outputSpec = getExportPixelDimensions(
    previewDesign.pageConfig,
    format === 'svg' || format === 'json' ? 96 : dpi
  );

  const handlePaperOrOrientationChange = (
    nextFormat: PageFormat,
    nextOrientation: PageOrientation
  ) => {
    const resolved = resolvePaperDimensions(
      nextFormat,
      nextOrientation,
      design.pageConfig.widthMm,
      design.pageConfig.heightMm
    );

    const scaleX = resolved.logicalWidthPx / design.pageConfig.widthPx;
    const scaleY = resolved.logicalHeightPx / design.pageConfig.heightPx;

    const rescaledElements = design.elements.map((el) => ({
      ...el,
      x: Math.round(el.x * scaleX),
      y: Math.round(el.y * scaleY),
      width: Math.round(el.width * scaleX),
      height: Math.round(el.height * scaleY),
    }));

    const updated: CertificateDesign = {
      ...design,
      pageConfig: {
        ...design.pageConfig,
        format: nextFormat,
        orientation: nextOrientation,
        widthMm: resolved.widthMm,
        heightMm: resolved.heightMm,
        widthPx: resolved.logicalWidthPx,
        heightPx: resolved.logicalHeightPx,
      },
      elements: rescaledElements,
      updatedAt: new Date().toISOString(),
    };

    if (onChangeDesign) {
      onChangeDesign(updated);
    }
    setExportStatus(null);
  };

  const handleRunExport = async () => {
    if (!cleanSvgRef.current) return;
    setIsExporting(true);
    setExportStatus(null);
    try {
      const safeFilename = filename.trim() || 'certificate';
      let dimSummary = '';

      if (format === 'png') {
        const res = await exportCertificateAsPng(cleanSvgRef.current, previewDesign, {
          filename: safeFilename,
          dpi,
          transparentBackground: transparentBg,
        });
        dimSummary = `${res.widthPx}×${res.heightPx} px (${dpi} DPI)`;
      } else if (format === 'jpg') {
        const res = await exportCertificateAsJpg(cleanSvgRef.current, previewDesign, {
          filename: safeFilename,
          dpi,
          quality: jpgQuality,
        });
        dimSummary = `${res.widthPx}×${res.heightPx} px (${dpi} DPI)`;
      } else if (format === 'pdf') {
        const res = await exportCertificateAsPdf(cleanSvgRef.current, previewDesign, {
          filename: safeFilename,
          dpi,
        });
        dimSummary = `${res.widthMm}×${res.heightMm} mm (${res.widthPt}×${res.heightPt} pt | ${res.widthPx}×${res.heightPx} px)`;
      } else if (format === 'svg') {
        const res = await exportCertificateAsSvg(cleanSvgRef.current, previewDesign, safeFilename);
        dimSummary = `viewBox 0 0 ${res.widthPx} ${res.heightPx} (${res.widthMm}×${res.heightMm} mm)`;
      } else if (format === 'json') {
        exportDesignAsJson(design, safeFilename);
        dimSummary = 'JSON Project';
      }

      setExportStatus({
        type: 'success',
        message: isAr
          ? `تم إنشاء وتنزيل الملف (${safeFilename}.${format}) بنجاح بأبعاد كاملة متطابقة: ${dimSummary}`
          : `Successfully generated and downloaded (${safeFilename}.${format}) — ${dimSummary}`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isAr
          ? 'حدث خطأ أثناء التصدير'
          : 'Export failed';
      setExportStatus({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  const isLandscape = previewDesign.pageConfig.orientation === 'landscape';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div>
            <h3 className="text-lg font-bold">
              {isAr
                ? 'تصدير ومعاينة الشهادة بجودة طباعية احترافية (Full-Bleed 100%)'
                : 'Export & Preview Full-Page Print-Ready Certificate'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isAr
                ? 'تطابق كامل بين أبعاد التصميم والملف الناتج (PDF / PNG / JPG / SVG) بدون هوامش بيضاء زائدة أو انكماش'
                : 'Exact 1:1 coordinate mapping across PDF, PNG, JPG, and SVG with zero unintended margins or shrinking'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 overflow-y-auto">
          {/* Left/Right Live Preview */}
          <div className="lg:col-span-7 flex flex-col bg-slate-100 rounded-xl p-4 border border-slate-200">
            {/* Preview Top Bar with Zoom Controls & Dimensions */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {isAr ? 'معاينة الصفحة النهائية:' : 'Final Page Preview:'}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-mono text-[11px] font-bold tabular-nums">
                  {previewDesign.pageConfig.format} ·{' '}
                  {isLandscape ? (isAr ? 'أفقي' : 'Landscape') : isAr ? 'عمودي' : 'Portrait'}
                </span>
              </div>

              {/* Preview Zoom Controls */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewZoom((z) =>
                      z === 'fit' ? 0.85 : Math.max(0.5, Number((z - 0.15).toFixed(2)))
                    )
                  }
                  title={isAr ? 'تصغير المعاينة' : 'Zoom Out'}
                  className="p-1 text-slate-600 hover:text-slate-900 rounded"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom('fit')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition-colors ${
                    previewZoom === 'fit'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    {isAr ? 'ملاءمة' : 'Fit'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(1)}
                  className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded transition-colors ${
                    previewZoom === 1
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewZoom((z) =>
                      z === 'fit' ? 1.15 : Math.min(2, Number((z + 0.15).toFixed(2)))
                    )
                  }
                  title={isAr ? 'تكبير المعاينة' : 'Zoom In'}
                  className="p-1 text-slate-600 hover:text-slate-900 rounded"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Certificate Page Frame Container */}
            <div className="flex-1 flex items-center justify-center overflow-auto min-h-[300px] max-h-[420px] p-2">
              <div
                className="flex items-center justify-center overflow-hidden rounded-sm shadow-xl border border-slate-300 bg-white transition-all"
                style={
                  previewZoom === 'fit'
                    ? {
                        aspectRatio: `${previewDesign.pageConfig.widthPx} / ${previewDesign.pageConfig.heightPx}`,
                        maxHeight: isLandscape ? '360px' : '400px',
                        maxWidth: '100%',
                        width: isLandscape ? '100%' : 'auto',
                        height: isLandscape ? 'auto' : '100%',
                      }
                    : {
                        width: `${Math.round(previewDesign.pageConfig.widthPx * 0.45 * previewZoom)}px`,
                        height: `${Math.round(previewDesign.pageConfig.heightPx * 0.45 * previewZoom)}px`,
                        flexShrink: 0,
                      }
                }
              >
                <CertificateRenderer
                  design={previewDesign}
                  svgRef={cleanSvgRef}
                  interactive={false}
                  exportMode={true}
                />
              </div>
            </div>

            {/* Exact Output Specification Readout Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 font-mono tabular-nums">
              <div>
                <span className="font-sans font-bold text-slate-700">
                  {isAr ? 'أبعاد الملف الناتج: ' : 'Output Size: '}
                </span>
                <span className="text-slate-900 font-bold">
                  {outputSpec.exportWidthPx} × {outputSpec.exportHeightPx} px
                </span>
                <span> · </span>
                <span>
                  {outputSpec.widthMm} × {outputSpec.heightMm} mm
                </span>
                <span> · </span>
                <span>
                  {outputSpec.widthPt} × {outputSpec.heightPt} pt
                </span>
              </div>
              <div className="text-emerald-700 font-sans font-bold">
                {isAr ? '✓ تغطية الصفحة 100% بدون هوامش زائدة' : '✓ 100% Full-Page Coverage'}
              </div>
            </div>
          </div>

          {/* Export Settings Controls */}
          <div className="lg:col-span-5 space-y-4">
            {/* Filename */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'اسم الملف المصدّر' : 'Export Filename'}
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>

            {/* Paper Size & Orientation Quick Selector */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isAr ? 'مقاس الورق' : 'Paper Size'}
                </label>
                <select
                  value={previewDesign.pageConfig.format}
                  onChange={(e) =>
                    handlePaperOrOrientationChange(
                      e.target.value as PageFormat,
                      previewDesign.pageConfig.orientation
                    )
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                >
                  <option value="A4">A4 (297×210 mm)</option>
                  <option value="A3">A3 (420×297 mm)</option>
                  <option value="A5">A5 (210×148 mm)</option>
                  <option value="LETTER">US Letter (279.4×215.9 mm)</option>
                  <option value="LEGAL">US Legal (355.6×215.9 mm)</option>
                  <option value="CUSTOM">
                    {isAr ? 'مخصص (Custom)' : 'Custom'} ({previewDesign.pageConfig.widthMm}×
                    {previewDesign.pageConfig.heightMm} mm)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isAr ? 'اتجاه الشهادة' : 'Orientation'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      ['landscape', isAr ? 'أفقي' : 'Landscape'],
                      ['portrait', isAr ? 'عمودي' : 'Portrait'],
                    ] as const
                  ).map(([orient, label]) => (
                    <button
                      key={orient}
                      type="button"
                      onClick={() =>
                        handlePaperOrOrientationChange(previewDesign.pageConfig.format, orient)
                      }
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                        previewDesign.pageConfig.orientation === orient
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Format Selector (PDF, PNG, JPG, SVG, JSON) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'صيغة التصدير' : 'Export Format'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-right transition-colors ${
                    format === 'pdf'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">PDF للطباعة</div>
                    <div
                      className={`text-[10px] truncate ${
                        format === 'pdf' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {isAr ? 'صفحة كاملة دقيقة' : 'Full-page print'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-right transition-colors ${
                    format === 'png'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">صورة PNG</div>
                    <div
                      className={`text-[10px] truncate ${
                        format === 'png' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {isAr ? 'جودة غير مضغوطة' : 'Lossless & alpha'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('jpg')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-right transition-colors ${
                    format === 'jpg'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileImage className="w-4 h-4 shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">صورة JPG</div>
                    <div
                      className={`text-[10px] truncate ${
                        format === 'jpg' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {isAr ? 'خلفية صلبة وحجم خفيف' : 'Opaque & compact'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('svg')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-right transition-colors ${
                    format === 'svg'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileCode2 className="w-4 h-4 shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">متجهات SVG</div>
                    <div
                      className={`text-[10px] truncate ${
                        format === 'svg' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {isAr ? 'خطوط مضمّنة وفيكتور' : 'Vector + fonts'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-right transition-colors ${
                    format === 'json'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileJson className="w-4 h-4 shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">مشروع JSON</div>
                    <div
                      className={`text-[10px] truncate ${
                        format === 'json' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {isAr ? 'ملف قابل للاستكمال' : 'Project backup'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Resolution / DPI Selector for PDF, PNG, JPG */}
            {(format === 'png' || format === 'jpg' || format === 'pdf') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'دقة التصدير والطباعة (DPI)' : 'Export Resolution (DPI)'}
                  </label>
                  <span className="text-[11px] font-mono text-amber-700 font-bold tabular-nums">
                    {outputSpec.exportWidthPx} × {outputSpec.exportHeightPx} px
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      [96, isAr ? '96 (شاشة)' : '96 (Screen)'],
                      [150, isAr ? '150 (رقمي)' : '150 (Web)'],
                      [300, isAr ? '300 (طباعة)' : '300 (Print)'],
                      [400, isAr ? '400 (فائقة)' : '400 (Ultra)'],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDpi(val)}
                      className={`py-2 px-2 rounded-lg text-[11px] font-bold border transition-colors tabular-nums ${
                        dpi === val
                          ? 'bg-amber-50 border-amber-600 text-amber-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* JPEG Quality Selector */}
            {format === 'jpg' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? 'جودة ضغط صورة JPG' : 'JPG Image Quality'}
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {Math.round(jpgQuality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.7}
                  max={1}
                  step={0.05}
                  value={jpgQuality}
                  onChange={(e) => setJpgQuality(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            )}

            {/* Background Options */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              {format === 'png' && (
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                    className="rounded accent-amber-600"
                  />
                  <span>
                    {isAr
                      ? 'تصدير بخلفية شفافة (بدون لون الخلفية)'
                      : 'Export with transparent background'}
                  </span>
                </label>
              )}

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whitePrintBg}
                  onChange={(e) => setWhitePrintBg(e.target.checked)}
                  className="rounded accent-amber-600"
                />
                <span>
                  {isAr
                    ? 'جعل الخلفية بيضاء نقية لتوفير الحبر عند الطباعة على ورق فاخر'
                    : 'Use pure white background for specialty paper printing'}
                </span>
              </label>
            </div>

            {/* Status Feedback */}
            {exportStatus && (
              <div
                className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 ${
                  exportStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{exportStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={handleDirectPrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{isAr ? 'طباعة مباشرة (صفحة كاملة)' : 'Print Directly (Full Page)'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleRunExport}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Download className="w-4 h-4 text-amber-400" />
              )}
              <span>
                {isExporting
                  ? isAr
                    ? 'جاري تجهيز الملف بأبعاد دقيقة...'
                    : 'Generating high-res file...'
                  : isAr
                  ? `تنزيل الشهادة (${format.toUpperCase()})`
                  : `Download Certificate (${format.toUpperCase()})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
