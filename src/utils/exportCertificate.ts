import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { CertificateDesign, ExportDpi } from '../types/certificate';
import { getExportPixelDimensions } from './pageDimensions';

const GOOGLE_FONTS_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Alkalami&family=Almarai:wght@400;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;500;600;700;800&family=Changa:wght@400;600;700;800&family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=El+Messiri:wght@400;600;700&family=Gulzar&family=Harmattan:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Katibeh&family=Kufam:wght@400;600;700;800&family=Lalezar&family=Lateef:wght@400;600;700&family=Lemonada:wght@400;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,500;0,600;0,700;1,400&family=Marhey:wght@400;600;700&family=Markazi+Text:wght@500;600;700&family=Mirza:wght@400;600;700&family=Montserrat:wght@400;500;600;700;800&family=Noto+Kufi+Arabic:wght@400;600;700;800&family=Noto+Naskh+Arabic:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Qahiri&family=Rakkas&family=Readex+Pro:wght@400;500;600;700&family=Reem+Kufi:wght@500;600;700&family=Scheherazade+New:wght@400;700&family=Tajawal:wght@400;500;700;800&family=Vibes&display=swap');`;

const fontCssCache = new Map<string, string>();
const imageDataUriCache = new Map<string, string>();

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return window.btoa(binary);
}

async function fetchInlinedFontFamilyCss(family: string): Promise<string> {
  const cleanFamily = family.trim();
  if (!cleanFamily) return '';
  if (fontCssCache.has(cleanFamily)) {
    return fontCssCache.get(cleanFamily)!;
  }

  try {
    const encoded = encodeURIComponent(cleanFamily);
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;600;700;800&display=swap`;
    let res = await fetch(cssUrl);
    if (!res.ok) {
      // Single-weight decorative fonts like Rakkas, Katibeh, Lalezar, Vibes, Qahiri, Gulzar, Alkalami
      res = await fetch(`https://fonts.googleapis.com/css2?family=${encoded}&display=swap`);
    }
    if (!res.ok) return '';

    let cssText = await res.text();
    const urlRegex = /url\(\s*['"]?(https:\/\/fonts\.gstatic\.com\/[^)'"]+)['"]?\s*\)/g;
    const matches = Array.from(cssText.matchAll(urlRegex));

    await Promise.all(
      matches.map(async (match) => {
        const fullMatch = match[0];
        const fontUrl = match[1].replace(/['"]/g, '');
        try {
          const fontRes = await fetch(fontUrl);
          if (!fontRes.ok) return;
          const buf = await fontRes.arrayBuffer();
          const b64 = arrayBufferToBase64(buf);
          const dataUri = `data:font/woff2;base64,${b64}`;
          cssText = cssText.split(fullMatch).join(`url('${dataUri}')`);
        } catch {
          // Ignore individual font binary error
        }
      })
    );

    fontCssCache.set(cleanFamily, cssText);
    return cssText;
  } catch {
    return '';
  }
}

async function getEmbeddedFontsCssForDesign(design: CertificateDesign): Promise<string> {
  const families = new Set<string>([
    'Cairo',
    'Tajawal',
    'Aref Ruqaa',
    'Plus Jakarta Sans',
    'Rakkas',
    'Amiri',
    'Reem Kufi',
    'Noto Kufi Arabic',
  ]);
  for (const el of design.elements) {
    if (el.type === 'text' && el.fontFamily) {
      families.add(el.fontFamily);
    } else if (el.type === 'signature' && el.fontFamily) {
      families.add(el.fontFamily);
    }
  }

  const rules = await Promise.all(Array.from(families).map((f) => fetchInlinedFontFamilyCss(f)));
  return [GOOGLE_FONTS_IMPORT, ...rules.filter(Boolean)].join('\n');
}

function utf8SvgDataUriToBase64(dataUri: string): string {
  try {
    const prefix = 'data:image/svg+xml;utf8,';
    if (!dataUri.startsWith(prefix)) return dataUri;
    const rawPayload = dataUri.slice(prefix.length);
    const decodedSvg = decodeURIComponent(rawPayload);
    const utf8Bytes = new TextEncoder().encode(decodedSvg);
    const b64 = arrayBufferToBase64(utf8Bytes.buffer);
    return `data:image/svg+xml;base64,${b64}`;
  } catch {
    return dataUri;
  }
}

/**
 * Ensures any <image> tags inside the cloned SVG use self-contained base64 data: URIs
 * so rendering the SVG inside an isolated Blob Image never drops external logos,
 * nested SVG decorative layers, or signatures.
 */
async function inlineExternalImagesInSvgClone(svgClone: SVGSVGElement): Promise<void> {
  const imageNodes = Array.from(svgClone.querySelectorAll('image'));
  await Promise.all(
    imageNodes.map(async (imgNode) => {
      const href = imgNode.getAttribute('href') || imgNode.getAttribute('xlink:href');
      if (!href) return;
      if (href.startsWith('data:image/svg+xml;utf8,')) {
        const b64Uri = utf8SvgDataUriToBase64(href);
        imgNode.setAttribute('href', b64Uri);
        imgNode.setAttribute('xlink:href', b64Uri);
        return;
      }
      if (href.startsWith('data:')) {
        imgNode.setAttribute('href', href);
        imgNode.setAttribute('xlink:href', href);
        return;
      }
      if (imageDataUriCache.has(href)) {
        const cached = imageDataUriCache.get(href)!;
        imgNode.setAttribute('href', cached);
        imgNode.setAttribute('xlink:href', cached);
        return;
      }
      try {
        const res = await fetch(href);
        if (!res.ok) return;
        const blob = await res.blob();
        const buf = await blob.arrayBuffer();
        const b64 = arrayBufferToBase64(buf);
        const mime = blob.type || 'image/png';
        const dataUri = `data:${mime};base64,${b64}`;
        imageDataUriCache.set(href, dataUri);
        imgNode.setAttribute('href', dataUri);
        imgNode.setAttribute('xlink:href', dataUri);
      } catch {
        // Keep original href if fetch fails
      }
    })
  );
}

/**
 * Serializes an SVG element while strictly preserving its logical coordinate space in `viewBox`
 * and setting the output viewport `width` and `height` independently.
 *
 * Keeping `viewBox="0 0 ${logicalWidthPx} ${logicalHeightPx}"` while setting `width="${outputWidthAttr}"`
 * and `height="${outputHeightAttr}"` makes the SVG vector engine scale the design uniformly across 100%
 * of the output canvas/page with zero unintended margins.
 */
export function serializeSvgWithFonts(
  svgElement: SVGSVGElement,
  logicalWidthPx: number,
  logicalHeightPx: number,
  outputWidthAttr: string | number = logicalWidthPx,
  outputHeightAttr: string | number = logicalHeightPx,
  customFontCss?: string
): string {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clone.setAttribute('viewBox', `0 0 ${logicalWidthPx} ${logicalHeightPx}`);
  clone.setAttribute('width', String(outputWidthAttr));
  clone.setAttribute('height', String(outputHeightAttr));
  clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  clone.removeAttribute('style');
  clone.removeAttribute('class');

  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent = `${customFontCss || GOOGLE_FONTS_IMPORT}\ntext { text-rendering: geometricPrecision; shape-rendering: geometricPrecision; font-feature-settings: "liga" 1, "calt" 1; }`;
  clone.insertBefore(styleEl, clone.firstChild);

  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

/**
 * Renders the certificate SVG onto an HTMLCanvasElement at the exact target DPI pixel dimensions.
 * For A4 at 300 DPI:
 * - Landscape: 3508 × 2480 px
 * - Portrait:  2480 × 3508 px
 */
export async function renderSvgToCanvas(
  svgElement: SVGSVGElement,
  design: CertificateDesign,
  dpi: ExportDpi = 300,
  transparentBackground: boolean = false
): Promise<HTMLCanvasElement> {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font ready warning
    }
  }

  const dims = getExportPixelDimensions(design.pageConfig, dpi);
  const { logicalWidthPx, logicalHeightPx, exportWidthPx, exportHeightPx } = dims;

  const cloneForPrep = svgElement.cloneNode(true) as SVGSVGElement;
  await inlineExternalImagesInSvgClone(cloneForPrep);

  const inlinedFontsCss = await getEmbeddedFontsCssForDesign(design);
  const svgString = serializeSvgWithFonts(
    cloneForPrep,
    logicalWidthPx,
    logicalHeightPx,
    exportWidthPx,
    exportHeightPx,
    inlinedFontsCss
  );

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        if (img.decode) {
          await img.decode();
        }
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      } catch {
        // Ignore decode warning
      }
      const canvas = document.createElement('canvas');
      canvas.width = exportWidthPx;
      canvas.height = exportHeightPx;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('تعذر إنشاء سياق الرسم (Canvas 2D Context)'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (!transparentBackground && !design.pageConfig.transparentBackground) {
        ctx.fillStyle = design.pageConfig.whiteForPrint
          ? '#FFFFFF'
          : design.pageConfig.backgroundColor || '#FFFFFF';
        ctx.fillRect(0, 0, exportWidthPx, exportHeightPx);
      } else {
        ctx.clearRect(0, 0, exportWidthPx, exportHeightPx);
      }

      ctx.drawImage(img, 0, 0, exportWidthPx, exportHeightPx);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('حدث خطأ أثناء تحويل عناصر الشهادة إلى صورة عالية الدقة'));
    };
    img.src = url;
  });
}

export function triggerDownloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export async function exportCertificateAsPng(
  svgElement: SVGSVGElement,
  design: CertificateDesign,
  options: {
    filename: string;
    dpi: ExportDpi;
    transparentBackground?: boolean;
  }
): Promise<{ widthPx: number; heightPx: number }> {
  const canvas = await renderSvgToCanvas(
    svgElement,
    design,
    options.dpi,
    options.transparentBackground
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('تعذر إنشاء ملف PNG'));
          return;
        }
        const cleanName = options.filename.toLowerCase().endsWith('.png')
          ? options.filename
          : `${options.filename}.png`;
        triggerDownloadBlob(blob, cleanName);
        resolve({ widthPx: canvas.width, heightPx: canvas.height });
      },
      'image/png',
      1.0
    );
  });
}

export async function exportCertificateAsJpg(
  svgElement: SVGSVGElement,
  design: CertificateDesign,
  options: {
    filename: string;
    dpi: ExportDpi;
    quality?: number; // 0.1 .. 1.0, default 0.95
  }
): Promise<{ widthPx: number; heightPx: number }> {
  // JPG does not support transparency; always render with an opaque background
  const opaqueDesign: CertificateDesign = {
    ...design,
    pageConfig: {
      ...design.pageConfig,
      transparentBackground: false,
    },
  };
  const canvas = await renderSvgToCanvas(svgElement, opaqueDesign, options.dpi, false);
  const jpgQuality = Math.min(1, Math.max(0.5, options.quality ?? 0.95));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('تعذر إنشاء ملف JPG'));
          return;
        }
        const cleanName = /\.(jpe?g)$/i.test(options.filename)
          ? options.filename
          : `${options.filename}.jpg`;
        triggerDownloadBlob(blob, cleanName);
        resolve({ widthPx: canvas.width, heightPx: canvas.height });
      },
      'image/jpeg',
      jpgQuality
    );
  });
}

export async function exportCertificateAsPdf(
  svgElement: SVGSVGElement,
  design: CertificateDesign,
  options: {
    filename: string;
    dpi: ExportDpi;
  }
): Promise<{ widthMm: number; heightMm: number; widthPt: number; heightPt: number; widthPx: number; heightPx: number }> {
  const dims = getExportPixelDimensions(design.pageConfig, options.dpi);
  const canvas = await renderSvgToCanvas(svgElement, design, options.dpi, false);
  const imgData = canvas.toDataURL('image/png', 1.0);

  const { widthMm, heightMm, widthPt, heightPt } = dims;
  const pdfOrientation = widthMm >= heightMm ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation: pdfOrientation,
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
  });

  // Fill 100% of the PDF page (0, 0, widthMm, heightMm) with zero margins or shrinking
  pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
  const cleanName = options.filename.toLowerCase().endsWith('.pdf')
    ? options.filename
    : `${options.filename}.pdf`;
  pdf.save(cleanName);

  return {
    widthMm,
    heightMm,
    widthPt,
    heightPt,
    widthPx: canvas.width,
    heightPx: canvas.height,
  };
}

export async function exportCertificateAsSvg(
  svgElement: SVGSVGElement,
  design: CertificateDesign,
  filename: string
): Promise<{ widthPx: number; heightPx: number; widthMm: number; heightMm: number }> {
  const dims = getExportPixelDimensions(design.pageConfig, 96);
  const { logicalWidthPx, logicalHeightPx, widthMm, heightMm } = dims;

  const cloneForPrep = svgElement.cloneNode(true) as SVGSVGElement;
  await inlineExternalImagesInSvgClone(cloneForPrep);
  const inlinedFontsCss = await getEmbeddedFontsCssForDesign(design);

  const svgString = serializeSvgWithFonts(
    cloneForPrep,
    logicalWidthPx,
    logicalHeightPx,
    logicalWidthPx,
    logicalHeightPx,
    inlinedFontsCss
  );

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const cleanName = filename.toLowerCase().endsWith('.svg') ? filename : `${filename}.svg`;
  triggerDownloadBlob(blob, cleanName);

  return {
    widthPx: logicalWidthPx,
    heightPx: logicalHeightPx,
    widthMm,
    heightMm,
  };
}

export function exportDesignAsJson(design: CertificateDesign, filename?: string): void {
  const jsonStr = JSON.stringify(design, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const baseName = filename || design.name || 'certificate-project';
  const cleanName = baseName.toLowerCase().endsWith('.json') ? baseName : `${baseName}.json`;
  triggerDownloadBlob(blob, cleanName);
}

export async function exportBatchAsZipPng(
  items: { svgElement: SVGSVGElement; design: CertificateDesign; fileName: string }[],
  zipFilename: string = 'certificates-batch.zip',
  dpi: ExportDpi = 300
): Promise<void> {
  const zip = new JSZip();

  for (const item of items) {
    const canvas = await renderSvgToCanvas(item.svgElement, item.design, dpi, false);
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const safeName = item.fileName.replace(/[\\/:*?"<>|]/g, '_');
    zip.file(`${safeName}.png`, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  triggerDownloadBlob(content, zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`);
}

export async function exportBatchAsMultiPagePdf(
  items: { svgElement: SVGSVGElement; design: CertificateDesign }[],
  pdfFilename: string = 'certificates-batch.pdf',
  dpi: ExportDpi = 300
): Promise<void> {
  if (items.length === 0) return;
  const firstDims = getExportPixelDimensions(items[0].design.pageConfig, dpi);
  const firstOrientation = firstDims.widthMm >= firstDims.heightMm ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation: firstOrientation,
    unit: 'mm',
    format: [firstDims.widthMm, firstDims.heightMm],
    compress: true,
  });

  for (let i = 0; i < items.length; i++) {
    const { svgElement, design } = items[i];
    const dims = getExportPixelDimensions(design.pageConfig, dpi);
    const { widthMm, heightMm } = dims;
    const pageOrientation = widthMm >= heightMm ? 'landscape' : 'portrait';

    if (i > 0) {
      pdf.addPage([widthMm, heightMm], pageOrientation);
    }
    const canvas = await renderSvgToCanvas(svgElement, design, dpi, false);
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
  }

  pdf.save(pdfFilename.endsWith('.pdf') ? pdfFilename : `${pdfFilename}.pdf`);
}
