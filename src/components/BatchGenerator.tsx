import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  Loader2,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { BatchRow, CertificateDesign, UILanguage } from '../types/certificate';
import { CertificateRenderer } from './CertificateRenderer';
import { exportBatchAsMultiPagePdf, exportBatchAsZipPng } from '../utils/exportCertificate';

interface BatchGeneratorProps {
  language: UILanguage;
  activeDesign: CertificateDesign;
  templates: CertificateDesign[];
  onOpenIndividualInEditor: (design: CertificateDesign) => void;
}

export const BatchGenerator: React.FC<BatchGeneratorProps> = ({
  language,
  activeDesign,
  templates,
  onOpenIndividualInEditor,
}) => {
  const isAr = language === 'ar';
  const [selectedBaseId, setSelectedBaseId] = useState<string>('active');
  const [namingPattern, setNamingPattern] = useState<'recipient' | 'id_recipient'>('recipient');
  const [sharedCourse, setSharedCourse] = useState('دورة القيادة الاستراتيجية والابتكار المؤسسي');
  const [sharedOrg, setSharedOrg] = useState('أكاديمية آفاق المعرفة للتدريب والتطوير');
  const [sharedDate, setSharedDate] = useState('التاريخ: 25 / 10 / 2026 م');
  const [sharedDuration, setSharedDuration] = useState('بواقع (25) ساعة تدريبية معتمدة');
  const [pasteText, setPasteText] = useState('');

  const [rows, setRows] = useState<BatchRow[]>([
    {
      id: 'row-1',
      recipientName: 'إلى الأستاذ / خالد أحمد عبدالله الهاشمي',
      courseOrOccasion: 'دورة القيادة الاستراتيجية والابتكار المؤسسي',
      organizationName: 'أكاديمية آفاق المعرفة للتدريب والتطوير',
      issueDate: 'التاريخ: 25 / 10 / 2026 م',
      certificateId: 'رقم الشهادة: CS-2026-1001',
      trainerOrSigner: 'د. وليد بن ناصر الغامدي',
      durationHours: 'بواقع (25) ساعة تدريبية معتمدة',
    },
    {
      id: 'row-2',
      recipientName: 'الأستاذة / سارة بنت خالد بن عبد العزيز العبد الله',
      courseOrOccasion: 'دورة القيادة الاستراتيجية والابتكار المؤسسي',
      organizationName: 'أكاديمية آفاق المعرفة للتدريب والتطوير',
      issueDate: 'التاريخ: 25 / 10 / 2026 م',
      certificateId: 'رقم الشهادة: CS-2026-1002',
      trainerOrSigner: 'د. وليد بن ناصر الغامدي',
      durationHours: 'بواقع (25) ساعة تدريبية معتمدة',
    },
    {
      id: 'row-3',
      recipientName: 'الدكتور / طارق بن زياد بن سليمان الحربي',
      courseOrOccasion: 'دورة القيادة الاستراتيجية والابتكار المؤسسي',
      organizationName: 'أكاديمية آفاق المعرفة للتدريب والتطوير',
      issueDate: 'التاريخ: 25 / 10 / 2026 م',
      certificateId: 'رقم الشهادة: CS-2026-1003',
      trainerOrSigner: 'د. وليد بن ناصر الغامدي',
      durationHours: 'بواقع (25) ساعة تدريبية معتمدة',
    },
  ]);

  const [previewIndex, setPreviewIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Refs to hidden SVG renderers for bulk export
  const svgRefs = useRef<Record<string, SVGSVGElement | null>>({});

  const baseDesign: CertificateDesign = useMemo(() => {
    if (selectedBaseId === 'active') return activeDesign;
    return templates.find((t) => t.id === selectedBaseId) || activeDesign;
  }, [selectedBaseId, activeDesign, templates]);

  const buildCertificateForRow = (row: BatchRow, idx: number): CertificateDesign => {
    let firstSigUpdated = false;
    const clonedElements = baseDesign.elements.map((el) => {
      if (el.type === 'signature' && row.trainerOrSigner && !firstSigUpdated) {
        firstSigUpdated = true;
        return {
          ...el,
          signerName: row.trainerOrSigner,
          signatureText: row.trainerOrSigner,
        };
      }
      if (el.type !== 'text') return { ...el };
      if (el.fieldRole === 'recipientName') {
        return { ...el, content: row.recipientName || (isAr ? '[الاسم مفقود]' : '[Missing Name]') };
      }
      if (el.fieldRole === 'organization' && row.organizationName) {
        return { ...el, content: row.organizationName };
      }
      if (el.fieldRole === 'courseName' && (row.courseOrOccasion || row.durationHours)) {
        return {
          ...el,
          content: [row.courseOrOccasion, row.durationHours].filter(Boolean).join('  |  '),
        };
      }
      if (el.fieldRole === 'issueDate' && row.issueDate) {
        return { ...el, content: row.issueDate };
      }
      if (el.fieldRole === 'certificateId' && row.certificateId) {
        return { ...el, content: row.certificateId };
      }
      return { ...el };
    });

    return {
      ...baseDesign,
      id: `${baseDesign.id}-batch-${idx}`,
      name: `${baseDesign.name} - ${row.recipientName || idx + 1}`,
      elements: clonedElements,
      updatedAt: new Date().toISOString(),
    };
  };

  const generatedDesigns = useMemo(
    () => rows.map((r, idx) => ({ row: r, design: buildCertificateForRow(r, idx) })),
    [rows, baseDesign]
  );

  const missingNamesCount = rows.filter((r) => !r.recipientName.trim()).length;

  const handleAddRow = () => {
    const nextNum = 1000 + rows.length + 1;
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        recipientName: '',
        courseOrOccasion: sharedCourse,
        organizationName: sharedOrg,
        issueDate: sharedDate,
        certificateId: `رقم الشهادة: CS-2026-${nextNum}`,
        trainerOrSigner: '',
        durationHours: sharedDuration,
      },
    ]);
    setPreviewIndex(rows.length);
  };

  const handlePasteList = () => {
    const names = pasteText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    const newRows: BatchRow[] = names.map((name, i) => ({
      id: `row-${Date.now()}-${i}`,
      recipientName: name,
      courseOrOccasion: sharedCourse,
      organizationName: sharedOrg,
      issueDate: sharedDate,
      certificateId: `رقم الشهادة: CS-2026-${1000 + rows.length + i + 1}`,
      trainerOrSigner: '',
      durationHours: sharedDuration,
    }));

    setRows((prev) => [...prev, ...newRows]);
    setPasteText('');
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const lines = reader.result
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return;

      const parsedRows: BatchRow[] = [];
      lines.forEach((line, idx) => {
        const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        // Skip header row if detected
        if (
          idx === 0 &&
          (cols[0].includes('الاسم') || cols[0].toLowerCase().includes('name'))
        ) {
          return;
        }
        parsedRows.push({
          id: `csv-${Date.now()}-${idx}`,
          recipientName: cols[0] || '',
          courseOrOccasion: cols[1] || sharedCourse,
          organizationName: cols[2] || sharedOrg,
          issueDate: cols[3] || sharedDate,
          certificateId: cols[4] || `رقم الشهادة: CS-2026-${1000 + idx + 1}`,
          trainerOrSigner: cols[5] || '',
          durationHours: cols[6] || sharedDuration,
        });
      });

      if (parsedRows.length > 0) {
        setRows(parsedRows);
        setPreviewIndex(0);
      }
    };
    reader.readAsText(file);
  };

  const applySharedToAll = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        courseOrOccasion: sharedCourse,
        organizationName: sharedOrg,
        issueDate: sharedDate,
        durationHours: sharedDuration,
      }))
    );
  };

  const handleExportZip = async () => {
    if (generatedDesigns.length === 0) return;
    setIsExporting(true);
    setExportMessage(null);
    try {
      const items = generatedDesigns
        .map(({ row, design }, idx) => {
          const svgEl = svgRefs.current[row.id];
          if (!svgEl) return null;
          const cleanRecipient = (row.recipientName || `certificate-${idx + 1}`).replace(/\s+/g, '-');
          const cleanRef = (row.certificateId || `${idx + 1}`).replace(/[^a-zA-Z0-9_-]/g, '');
          const fileName =
            namingPattern === 'id_recipient' ? `${cleanRef}_${cleanRecipient}` : cleanRecipient;
          return { svgElement: svgEl, design, fileName };
        })
        .filter((x): x is { svgElement: SVGSVGElement; design: CertificateDesign; fileName: string } => Boolean(x));

      await exportBatchAsZipPng(items, `certificates-batch-${items.length}.zip`);
      setExportMessage(
        isAr
          ? `تم إنشاء وتنزيل (${items.length}) شهادة منفصلة داخل ملف مضغوط ZIP بنجاح.`
          : `Successfully exported ${items.length} certificates as a ZIP archive.`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMultiPdf = async () => {
    if (generatedDesigns.length === 0) return;
    setIsExporting(true);
    setExportMessage(null);
    try {
      const items = generatedDesigns
        .map(({ row, design }) => {
          const svgEl = svgRefs.current[row.id];
          return svgEl ? { svgElement: svgEl, design } : null;
        })
        .filter((x): x is { svgElement: SVGSVGElement; design: CertificateDesign } => Boolean(x));

      await exportBatchAsMultiPagePdf(items, `certificates-batch-${items.length}.pdf`);
      setExportMessage(
        isAr
          ? `تم إنشاء وتنزيل ملف PDF متعدد الصفحات يضم (${items.length}) شهادة جاهزة للطباعة.`
          : `Successfully exported ${items.length} certificates in a single multi-page PDF.`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const safePreviewIndex = Math.min(previewIndex, Math.max(0, generatedDesigns.length - 1));
  const currentPreview = generatedDesigns[safePreviewIndex];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? 'الإنشاء الجماعي للشهادات (دفعة واحدة)' : 'Batch Certificate Generator'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {isAr
              ? 'أنشئ عشرات الشهادات من قالب واحد عبر الإدخال اليدوي أو لصق قائمة الأسماء أو استيراد ملف CSV، مع معاينة كل شهادة وتصديرها.'
              : 'Generate multiple certificates from a single template via manual entry, pasted list, or CSV import.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isExporting || generatedDesigns.length === 0}
            onClick={handleExportZip}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 rounded-lg hover:bg-amber-300 disabled:opacity-50 transition-colors"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderArchive className="w-4 h-4" />}
            <span>
              {isAr ? `تنزيل الكل كصور منفصلة (ZIP — ${generatedDesigns.length})` : `Download All PNGs (ZIP — ${generatedDesigns.length})`}
            </span>
          </button>

          <button
            type="button"
            disabled={isExporting || generatedDesigns.length === 0}
            onClick={handleExportMultiPdf}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <FileText className="w-4 h-4 text-amber-400" />}
            <span>
              {isAr ? `تنزيل ملف PDF موحّد للطباعة (${generatedDesigns.length})` : `Download Multi-Page PDF (${generatedDesigns.length})`}
            </span>
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-sm font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{exportMessage}</span>
        </div>
      )}

      {missingNamesCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-sm font-medium flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            {isAr
              ? `تنبيه التحقق: يوجد عدد (${missingNamesCount}) سجل بدون اسم مستفيد. يرجى استكمال الأسماء المفقودة قبل التصدير النهائي.`
              : `Validation Warning: ${missingNamesCount} record(s) have a missing recipient name.`}
          </span>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Right Column: Template Selection, CSV/Paste Import & Records Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Template & Shared Metadata Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {isAr ? '1. اختيار القالب والبيانات المشتركة للدفعة' : '1. Select Template & Shared Batch Details'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'القالب المستخدم للإنشاء الجماعي' : 'Base Certificate Template'}
                </label>
                <select
                  value={selectedBaseId}
                  onChange={(e) => setSelectedBaseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
                >
                  <option value="active">
                    {isAr ? `التصميم الحالي المفتوح في المحرر (${activeDesign.name})` : `Current Active Design (${activeDesign.name})`}
                  </option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'طريقة تسمية الملفات المصدرة' : 'Exported File Naming Pattern'}
                </label>
                <select
                  value={namingPattern}
                  onChange={(e) => setNamingPattern(e.target.value as 'recipient' | 'id_recipient')}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
                >
                  <option value="recipient">{isAr ? 'وفق اسم المستفيد' : 'By Recipient Name'}</option>
                  <option value="id_recipient">{isAr ? 'وفق الرقم المرجعي + اسم المستفيد' : 'By Reference ID + Recipient Name'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'اسم الدورة أو المناسبة المشترك' : 'Shared Course / Event Title'}
                </label>
                <input
                  type="text"
                  value={sharedCourse}
                  onChange={(e) => setSharedCourse(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'اسم الجهة المانحة' : 'Issuing Organization'}
                </label>
                <input
                  type="text"
                  value={sharedOrg}
                  onChange={(e) => setSharedOrg(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'تاريخ الإصدار' : 'Issue Date'}
                </label>
                <input
                  type="text"
                  value={sharedDate}
                  onChange={(e) => setSharedDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={applySharedToAll}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {isAr ? 'تعميم بيانات الدورة والجهة على جميع السجلات' : 'Apply Shared Details to All Rows'}
                </button>
              </div>
            </div>
          </div>

          {/* Paste Names or Import CSV */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {isAr ? '2. لصق قائمة أسماء أو استيراد ملف CSV' : '2. Paste Names List or Import CSV'}
              </h3>

              <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>{isAr ? 'استيراد ملف CSV' : 'Import CSV File'}</span>
                <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="hidden" />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                rows={3}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={
                  isAr
                    ? 'الصق قائمة الأسماء هنا (كل اسم في سطر مستقل)...\nمثال:\nأحمد بن محمد العتيبي\nخالد بن سعد الدوسري'
                    : 'Paste names here (one name per line)...'
                }
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
              <button
                type="button"
                onClick={handlePasteList}
                disabled={!pasteText.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors shrink-0 self-end sm:self-stretch"
              >
                {isAr ? 'إضافة القائمة دفعة واحدة' : 'Add Pasted Names'}
              </button>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-900">
                  {isAr ? `سجلات المستفيدين (${rows.length})` : `Recipient Records (${rows.length})`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة مستفيد جديد' : 'Add Recipient'}</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold w-10">#</th>
                    <th className="py-2.5 px-3 font-bold">{isAr ? 'اسم المستفيد' : 'Recipient Name'}</th>
                    <th className="py-2.5 px-3 font-bold">{isAr ? 'الدورة / المناسبة' : 'Course / Event'}</th>
                    <th className="py-2.5 px-3 font-bold">{isAr ? 'رقم الشهادة' : 'Certificate ID'}</th>
                    <th className="py-2.5 px-3 font-bold text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.map((row, idx) => {
                    const isCurrent = idx === safePreviewIndex;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setPreviewIndex(idx)}
                        className={`cursor-pointer transition-colors ${
                          isCurrent ? 'bg-amber-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2 px-3 font-mono tabular-nums text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.recipientName}
                            placeholder={isAr ? 'أدخل اسم المستفيد...' : 'Enter recipient name...'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRows((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, recipientName: val } : r))
                              );
                            }}
                            className={`w-full px-2.5 py-1 rounded border text-xs ${
                              !row.recipientName.trim()
                                ? 'border-rose-400 bg-rose-50'
                                : 'border-slate-200 bg-white'
                            }`}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.courseOrOccasion}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRows((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, courseOrOccasion: val } : r))
                              );
                            }}
                            className="w-full px-2.5 py-1 rounded border border-slate-200 bg-white text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.certificateId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRows((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, certificateId: val } : r))
                              );
                            }}
                            className="w-full px-2.5 py-1 rounded border border-slate-200 bg-white text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              title={isAr ? 'فتح وتعديل هذه الشهادة في المحرر' : 'Edit in Studio'}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenIndividualInEditor(generatedDesigns[idx].design);
                              }}
                              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={rows.length <= 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRows((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1.5 rounded text-rose-600 hover:bg-rose-50 disabled:opacity-30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Certificate Preview Column */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4 sticky top-20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {isAr
                ? `معاينة الشهادة (${safePreviewIndex + 1} من ${generatedDesigns.length})`
                : `Certificate Preview (${safePreviewIndex + 1} of ${generatedDesigns.length})`}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePreviewIndex <= 0}
                onClick={() => setPreviewIndex((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
              >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                type="button"
                disabled={safePreviewIndex >= generatedDesigns.length - 1}
                onClick={() => setPreviewIndex((p) => Math.min(generatedDesigns.length - 1, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
              >
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {currentPreview && (
            <>
              <div
                className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100"
                style={{
                  aspectRatio: `${currentPreview.design.pageConfig.widthPx} / ${currentPreview.design.pageConfig.heightPx}`,
                }}
              >
                <CertificateRenderer
                  design={currentPreview.design}
                  interactive={false}
                  exportMode={true}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="text-xs text-slate-600 truncate">
                  {isAr ? 'المستفيد:' : 'Recipient:'}{' '}
                  <strong className="text-slate-900">{currentPreview.row.recipientName || '—'}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenIndividualInEditor(currentPreview.design)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تخصيص هذه الشهادة في المحرر' : 'Customize in Editor'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Offscreen Clean SVG Renderers for Bulk Export */}
      <div
        className="fixed -left-[9999px] -top-[9999px] overflow-hidden pointer-events-none opacity-0"
        aria-hidden="true"
      >
        {generatedDesigns.map(({ row, design }) => (
          <div
            key={row.id}
            style={{
              width: `${design.pageConfig.widthPx}px`,
              height: `${design.pageConfig.heightPx}px`,
            }}
          >
            <CertificateRenderer
              svgRef={(el) => {
                svgRefs.current[row.id] = el;
              }}
              design={design}
              interactive={false}
              exportMode={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
