import { ExportDpi, PageConfig, PageFormat, PageOrientation } from '../types/certificate';

export interface PaperDimensionSpec {
  format: PageFormat;
  orientation: PageOrientation;
  widthMm: number;
  heightMm: number;
  widthPt: number;
  heightPt: number;
  logicalWidthPx: number;
  logicalHeightPx: number;
  aspectRatio: number;
}

export interface ExportPixelDimensions {
  dpi: ExportDpi;
  exportWidthPx: number;
  exportHeightPx: number;
  logicalWidthPx: number;
  logicalHeightPx: number;
  widthMm: number;
  heightMm: number;
  widthPt: number;
  heightPt: number;
  scaleFactorX: number;
  scaleFactorY: number;
}

/**
 * Standard physical dimensions in millimeters (shortEdgeMm × longEdgeMm)
 * alongside canonical 96 DPI logical design space pixels (shortEdgePx × longEdgePx).
 */
export const PAPER_FORMAT_CATALOG: Record<
  Exclude<PageFormat, 'CUSTOM'>,
  {
    shortMm: number;
    longMm: number;
    shortPx: number;
    longPx: number;
    labelAr: string;
    labelEn: string;
  }
> = {
  A4: {
    shortMm: 210,
    longMm: 297,
    shortPx: 794,
    longPx: 1123,
    labelAr: 'A4 قياسي (297×210 مم)',
    labelEn: 'A4 Standard (297×210 mm)',
  },
  A3: {
    shortMm: 297,
    longMm: 420,
    shortPx: 1123,
    longPx: 1587,
    labelAr: 'A3 كبير (420×297 مم)',
    labelEn: 'A3 Large (420×297 mm)',
  },
  A5: {
    shortMm: 148,
    longMm: 210,
    shortPx: 559,
    longPx: 794,
    labelAr: 'A5 متوسط (210×148 مم)',
    labelEn: 'A5 Compact (210×148 mm)',
  },
  LETTER: {
    shortMm: 215.9,
    longMm: 279.4,
    shortPx: 816,
    longPx: 1056,
    labelAr: 'US Letter (279.4×215.9 مم)',
    labelEn: 'US Letter (11×8.5 in)',
  },
  LEGAL: {
    shortMm: 215.9,
    longMm: 355.6,
    shortPx: 816,
    longPx: 1344,
    labelAr: 'US Legal (355.6×215.9 مم)',
    labelEn: 'US Legal (14×8.5 in)',
  },
};

const MM_PER_INCH = 25.4;
const PT_PER_INCH = 72;
const LOGICAL_SCREEN_DPI = 96;

export function mmToPt(mm: number): number {
  return Number(((mm / MM_PER_INCH) * PT_PER_INCH).toFixed(2));
}

export function mmToPxAtDpi(mm: number, dpi: number): number {
  return Math.round((mm / MM_PER_INCH) * dpi);
}

/**
 * Single source of truth for resolving paper dimensions in mm, pt, and logical design pixels (96 DPI).
 */
export function resolvePaperDimensions(
  format: PageFormat,
  orientation: PageOrientation,
  customWidthMm?: number,
  customHeightMm?: number
): PaperDimensionSpec {
  let widthMm: number;
  let heightMm: number;
  let logicalWidthPx: number;
  let logicalHeightPx: number;

  if (format === 'CUSTOM') {
    const rawW = Math.max(80, Math.min(1000, customWidthMm || 297));
    const rawH = Math.max(80, Math.min(1000, customHeightMm || 210));
    widthMm = orientation === 'landscape' ? Math.max(rawW, rawH) : Math.min(rawW, rawH);
    heightMm = orientation === 'landscape' ? Math.min(rawW, rawH) : Math.max(rawW, rawH);
    logicalWidthPx = mmToPxAtDpi(widthMm, LOGICAL_SCREEN_DPI);
    logicalHeightPx = mmToPxAtDpi(heightMm, LOGICAL_SCREEN_DPI);
  } else {
    const spec = PAPER_FORMAT_CATALOG[format] || PAPER_FORMAT_CATALOG.A4;
    widthMm = orientation === 'landscape' ? spec.longMm : spec.shortMm;
    heightMm = orientation === 'landscape' ? spec.shortMm : spec.longMm;
    logicalWidthPx = orientation === 'landscape' ? spec.longPx : spec.shortPx;
    logicalHeightPx = orientation === 'landscape' ? spec.shortPx : spec.longPx;
  }

  const widthPt = mmToPt(widthMm);
  const heightPt = mmToPt(heightMm);
  const aspectRatio = Number((widthMm / heightMm).toFixed(5));

  return {
    format,
    orientation,
    widthMm,
    heightMm,
    widthPt,
    heightPt,
    logicalWidthPx,
    logicalHeightPx,
    aspectRatio,
  };
}

/**
 * Computes exact export pixel dimensions at the requested DPI from physical paper dimensions.
 * Example for A4 (297 × 210 mm):
 * - 300 DPI Landscape -> 3508 × 2480 px
 * - 300 DPI Portrait  -> 2480 × 3508 px
 * - 150 DPI Landscape -> 1754 × 1240 px
 * - 96 DPI Landscape  -> 1123 × 794 px
 */
export function getExportPixelDimensions(
  pageConfig: Pick<PageConfig, 'format' | 'orientation' | 'widthMm' | 'heightMm' | 'widthPx' | 'heightPx'>,
  dpi: ExportDpi = 300
): ExportPixelDimensions {
  const spec = resolvePaperDimensions(
    pageConfig.format,
    pageConfig.orientation,
    pageConfig.widthMm,
    pageConfig.heightMm
  );

  const logicalWidthPx = pageConfig.widthPx || spec.logicalWidthPx;
  const logicalHeightPx = pageConfig.heightPx || spec.logicalHeightPx;

  let exportWidthPx: number;
  let exportHeightPx: number;

  if (dpi === 96) {
    exportWidthPx = logicalWidthPx;
    exportHeightPx = logicalHeightPx;
  } else {
    exportWidthPx = mmToPxAtDpi(spec.widthMm, dpi);
    exportHeightPx = mmToPxAtDpi(spec.heightMm, dpi);
  }

  return {
    dpi,
    exportWidthPx,
    exportHeightPx,
    logicalWidthPx,
    logicalHeightPx,
    widthMm: spec.widthMm,
    heightMm: spec.heightMm,
    widthPt: spec.widthPt,
    heightPt: spec.heightPt,
    scaleFactorX: exportWidthPx / logicalWidthPx,
    scaleFactorY: exportHeightPx / logicalHeightPx,
  };
}
