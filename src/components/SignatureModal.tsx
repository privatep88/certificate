import React, { useEffect, useRef, useState } from 'react';
import { Check, Eraser, PenTool, Type as TypeIcon, Upload, X } from 'lucide-react';
import { SignatureCertificateElement, UILanguage } from '../types/certificate';

interface SignatureModalProps {
  isOpen: boolean;
  language: UILanguage;
  initialSignature?: SignatureCertificateElement | null;
  onClose: () => void;
  onSave: (sigData: {
    signatureMode: 'drawn' | 'image' | 'text';
    signatureDataUrl?: string;
    signatureText?: string;
    signerName: string;
    signerTitle: string;
    color: string;
    fontFamily: string;
    showLine: boolean;
  }) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  language,
  initialSignature,
  onClose,
  onSave,
}) => {
  const isAr = language === 'ar';
  const [mode, setMode] = useState<'drawn' | 'image' | 'text'>(initialSignature?.signatureMode || 'drawn');
  const [signerName, setSignerName] = useState(initialSignature?.signerName || (isAr ? 'أ. د. عبد الرحمن المنصور' : 'Dr. Alexander Vance'));
  const [signerTitle, setSignerTitle] = useState(initialSignature?.signerTitle || (isAr ? 'المدير العام / المشرف العام' : 'Executive Director'));
  const [signatureText, setSignatureText] = useState(initialSignature?.signatureText || (isAr ? 'عبد الرحمن المنصور' : 'A. Vance'));
  const [color, setColor] = useState(initialSignature?.color || '#0B192C');
  const [fontFamily, setFontFamily] = useState(initialSignature?.fontFamily || 'Aref Ruqaa');
  const [showLine, setShowLine] = useState(initialSignature?.showLine ?? true);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | undefined>(initialSignature?.signatureDataUrl);
  const [penSize, setPenSize] = useState(2.5);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnStrokes, setHasDrawnStrokes] = useState(false);

  useEffect(() => {
    if (isOpen && initialSignature) {
      setMode(initialSignature.signatureMode);
      setSignerName(initialSignature.signerName);
      setSignerTitle(initialSignature.signerTitle);
      setSignatureText(initialSignature.signatureText || initialSignature.signerName);
      setColor(initialSignature.color);
      setFontFamily(initialSignature.fontFamily || 'Aref Ruqaa');
      setShowLine(initialSignature.showLine);
      setUploadedDataUrl(initialSignature.signatureDataUrl);
    }
  }, [isOpen, initialSignature]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawnStrokes(false);
    }
  };

  const getPointerPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0];
      return {
        x: ((t.clientX - rect.left) / rect.width) * canvas.width,
        y: ((t.clientY - rect.top) / rect.height) * canvas.height,
      };
    }
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawnStrokes(true);
  };

  const moveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    let finalDataUrl = uploadedDataUrl;
    if (mode === 'drawn' && canvasRef.current && hasDrawnStrokes) {
      finalDataUrl = canvasRef.current.toDataURL('image/png');
    }
    onSave({
      signatureMode: mode,
      signatureDataUrl: finalDataUrl,
      signatureText: signatureText || signerName,
      signerName,
      signerTitle,
      color,
      fontFamily,
      showLine,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h3 className="text-lg font-bold">
              {isAr ? 'إعداد وإدراج التوقيع التصميمي' : 'Design & Insert Signature'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isAr
                ? 'ارسم توقيعك بالفأرة أو اللمس، أو ارفع صورة توقيع شفافة، أو اختر توقيعًا خطيًا'
                : 'Draw with mouse/touch, upload an image, or use calligraphic script'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('drawn')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'drawn' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>{isAr ? 'رسم التوقيع' : 'Draw Signature'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'text' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TypeIcon className="w-4 h-4" />
              <span>{isAr ? 'توقيع نصي خطي' : 'Calligraphic Text'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('image')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'image' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isAr ? 'رفع صورة توقيع' : 'Upload Image'}</span>
            </button>
          </div>

          {/* Mode Body */}
          {mode === 'drawn' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{isAr ? 'ارسم التوقيع داخل المساحة التالية:' : 'Draw your signature inside the box:'}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1">
                    <span>{isAr ? 'السماكة:' : 'Width:'}</span>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.5"
                      value={penSize}
                      onChange={(e) => setPenSize(Number(e.target.value))}
                      className="w-16 accent-amber-600"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مسح اللوحة' : 'Clear'}</span>
                  </button>
                </div>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={140}
                  onMouseDown={startDraw}
                  onMouseMove={moveDraw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={moveDraw}
                  onTouchEnd={endDraw}
                  className="w-full h-36 cursor-crosshair touch-none"
                />
              </div>
            </div>
          )}

          {mode === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'نص التوقيع المرسوم خطيًا' : 'Calligraphic Signature Text'}
                </label>
                <input
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'نوع الخط للتوقيع' : 'Signature Script Font'}
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Aref Ruqaa">خط الرقعة والديواني (Aref Ruqaa)</option>
                  <option value="Vibes">خط الطغراء والتوقيع الديواني الحر (Vibes)</option>
                  <option value="Rakkas">الخط الديواني السلطاني (Rakkas)</option>
                  <option value="Gulzar">خط النستعليق الديواني المنساب (Gulzar)</option>
                  <option value="Amiri">خط الثلث والنسخ الأميري (Amiri)</option>
                  <option value="Katibeh">خط الثلث العريض (Katibeh)</option>
                  <option value="Reem Kufi">الخط الكوفي الفاطمي (Reem Kufi)</option>
                  <option value="Playfair Display">Playfair Display Italic</option>
                  <option value="Cormorant Garamond">Cormorant Garamond</option>
                </select>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span style={{ fontFamily, color, fontSize: '28px', fontStyle: 'italic' }}>
                  {signatureText || signerName}
                </span>
              </div>
            </div>
          )}

          {mode === 'image' && (
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="w-7 h-7 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-700">
                  {isAr ? 'اختر صورة توقيع من جهازك (PNG شفاف مفضل)' : 'Choose signature image from device (transparent PNG recommended)'}
                </span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              {uploadedDataUrl && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                  <img
                    src={uploadedDataUrl}
                    alt="Uploaded Signature"
                    referrerPolicy="no-referrer"
                    className="max-h-24 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Signer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isAr ? 'اسم الموقّع (يظهر أسفل التوقيع)' : 'Signer Full Name'}
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isAr ? 'المسمى الوظيفي / الصفة' : 'Job Title / Role'}
              </label>
              <input
                type="text"
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Color & Line Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700">
                {isAr ? 'لون الحبر والنص:' : 'Ink & Text Color:'}
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-slate-300"
              />
              {['#0B192C', '#1E3A8A', '#064E3B', '#78350F', '#111827'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className="w-6 h-6 rounded-full border border-slate-300"
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showLine}
                onChange={(e) => setShowLine(e.target.checked)}
                className="rounded accent-amber-600"
              />
              <span>{isAr ? 'إظهار خط فاصل تحت التوقيع' : 'Show signature underline'}</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Check className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'اعتماد وإدراج التوقيع' : 'Apply Signature'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
