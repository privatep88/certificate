export type UILanguage = 'ar' | 'en';

export type PageFormat = 'A4' | 'A3' | 'A5' | 'LETTER' | 'LEGAL' | 'CUSTOM';
export type PageOrientation = 'landscape' | 'portrait';
export type ExportDpi = 96 | 150 | 300 | 400;

export type CertificateCategoryId =
  | 'appreciation'
  | 'excellence'
  | 'training'
  | 'academic'
  | 'participation'
  | 'congratulations'
  | 'professional'
  | 'kids'
  | 'sports_arts'
  | 'additional';

export interface CertificateCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  subtypesAr: string[];
  disclaimerAr?: string;
  disclaimerEn?: string;
  isCustom?: boolean;
}

export type FrameType =
  | 'royal-gold'
  | 'corporate-formal'
  | 'classic-european'
  | 'islamic-arabesque'
  | 'modern-geometric'
  | 'minimal-clean'
  | 'luxury-multi'
  | 'marble-gold'
  | 'botanical-leaves'
  | 'floral-roses'
  | 'gold-silver-lines'
  | 'navy-gold'
  | 'emerald-gold'
  | 'black-gold'
  | 'pastel-soft'
  | 'kids-playful'
  | 'training-pro'
  | 'tech-innovation'
  | 'competition-awards'
  | 'modern-horizontal'
  | 'vertical-formal'
  | 'official-seal-frame'
  | 'double-triple-border'
  | 'ornate-corners'
  | 'subtle-mesh'
  | 'executive-platinum'
  | 'diplomatic-embassy'
  | 'iso-accreditation'
  | 'banking-guilloche'
  | 'ministry-sovereign'
  | 'boardroom-mahogany'
  | 'chancery-scroll'
  | 'corporate-sidebar-right'
  | 'corporate-sidebar-left'
  | 'academic-senate'
  | 'legal-notary'
  | 'swiss-grid-executive'
  | 'gold-pillar-classical'
  | 'titanium-tech-corp'
  | 'emerald-diwan'
  | 'sapphire-protocol'
  | 'heritage-arch';

export type BackgroundPatternType =
  | 'none'
  | 'guilloche'
  | 'islamic-stars'
  | 'marble'
  | 'geometric-grid'
  | 'floral-watermark'
  | 'dots'
  | 'waves'
  | 'diagonal-lines'
  | 'confetti'
  | 'micro-ledger'
  | 'sovereign-rosette'
  | 'executive-pinstripe';

export interface ArtisticStyle {
  id: string;
  number: number;
  nameAr: string;
  nameEn: string;
  frameType: FrameType;
  backgroundPattern: BackgroundPatternType;
  backgroundColor: string;
  backgroundGradientEnd?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  borderThickness: number;
  cornerOrnament: string;
}

export type ElementType = 'text' | 'ornament' | 'seal' | 'signature' | 'image' | 'divider';

export type SemanticFieldRole =
  | 'title'
  | 'subtitle'
  | 'intro'
  | 'recipientName'
  | 'body'
  | 'courseName'
  | 'organization'
  | 'trainerName'
  | 'duration'
  | 'issueDate'
  | 'certificateId'
  | 'custom';

export interface BaseCertificateElement {
  id: string;
  type: ElementType;
  name: string;
  x: number; // In canvas coordinate space (e.g., 0..1123 for A4 landscape)
  y: number; // In canvas coordinate space (e.g., 0..794 for A4 landscape)
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  groupId?: string;
}

export interface TextCertificateElement extends BaseCertificateElement {
  type: 'text';
  fieldRole: SemanticFieldRole;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  color: string;
  align: 'right' | 'center' | 'left';
  direction: 'rtl' | 'ltr';
  lineHeight: number;
  letterSpacing: number;
  textShadow: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  autoFitLongName?: boolean;
}

export type OrnamentVariant =
  | 'crown-royal'
  | 'laurel-wreath'
  | 'islamic-rosette'
  | 'star-cluster'
  | 'medal-ribbon'
  | 'corner-arabesque'
  | 'floral-branch'
  | 'trophy-cup'
  | 'kids-star-smile'
  | 'excellence-shield'
  | 'tech-hexagon'
  | 'graduation-cap'
  | 'heart-care'
  | 'ribbon-banner'
  | 'tughra-monogram'
  | 'thuluth-banner'
  | 'diwani-cartouche'
  | 'kufic-medallion'
  | 'quran-rehal'
  | 'grad-cap-book-stars'
  | 'charcoal-gold-medal'
  | 'navy-torch-book-medal'
  | 'stepped-gold-corner'
  | 'royal-arabesque-crest'
  | 'title-sparkle-rays'
  | 'school-doodle-trophy'
  | 'school-doodle-books'
  | 'school-doodle-backpack'
  | 'school-doodle-globe'
  | 'school-doodle-pencils';

export interface OrnamentCertificateElement extends BaseCertificateElement {
  type: 'ornament';
  variant: OrnamentVariant;
  color: string;
  secondaryColor?: string;
}

export type DividerVariant =
  | 'diamond-center'
  | 'royal-flourish'
  | 'double-line'
  | 'dashed-gold'
  | 'islamic-knot'
  | 'minimal-taper'
  | 'stars-divider';

export interface DividerCertificateElement extends BaseCertificateElement {
  type: 'divider';
  variant: DividerVariant;
  color: string;
  thickness: number;
}

export type SealVariant =
  | 'gold-wax-seal'
  | 'official-circular-stamp'
  | 'academic-crest'
  | 'excellence-star-seal'
  | 'modern-verified-badge'
  | 'ideal-student-medal'
  | 'anta-mumayaz-medal'
  | 'navy-gold-future-seal';

export interface SealCertificateElement extends BaseCertificateElement {
  type: 'seal';
  variant: SealVariant;
  primaryText: string;
  secondaryText: string;
  color: string;
  accentColor: string;
}

export interface SignatureCertificateElement extends BaseCertificateElement {
  type: 'signature';
  signatureMode: 'drawn' | 'image' | 'text';
  signatureDataUrl?: string; // For drawn or uploaded image
  signatureText?: string; // For calligraphic text mode
  signerName: string;
  signerTitle: string;
  color: string;
  fontFamily: string;
  showLine: boolean;
}

export interface ImageCertificateElement extends BaseCertificateElement {
  type: 'image';
  src: string; // Data URL or inline SVG data URL
  objectFit: 'contain' | 'cover';
  borderRadius: number;
  borderColor?: string;
  borderWidth?: number;
  isLogo?: boolean;
}

export type CertificateElement =
  | TextCertificateElement
  | OrnamentCertificateElement
  | DividerCertificateElement
  | SealCertificateElement
  | SignatureCertificateElement
  | ImageCertificateElement;

export interface PageConfig {
  format: PageFormat;
  orientation: PageOrientation;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  marginMm: number;
  showPrintMargin: boolean;
  showSafeZone: boolean;
  backgroundColor: string;
  backgroundGradientEnd?: string;
  transparentBackground: boolean;
  backgroundPattern: BackgroundPatternType;
  patternOpacity: number;
  frameType: FrameType;
  frameColor: string;
  frameSecondaryColor: string;
  frameAccentColor: string;
  borderThickness: number;
  cornerOrnament: string;
  whiteForPrint: boolean;
}

export interface CertificateDesign {
  id: string;
  name: string;
  categoryId: string;
  subtypeAr?: string;
  styleId: string;
  language: 'ar' | 'en';
  pageConfig: PageConfig;
  elements: CertificateElement[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  isTemplate?: boolean;
  isCustomUserTemplate?: boolean;
  usageCount?: number;
  featured?: boolean;
}

export interface BatchRow {
  id: string;
  recipientName: string;
  courseOrOccasion: string;
  organizationName: string;
  issueDate: string;
  certificateId: string;
  trainerOrSigner: string;
  durationHours: string;
}

export interface AppSettings {
  language: UILanguage;
  platformNameAr: string;
  platformNameEn: string;
  brandPrimaryColor: string;
  brandAccentColor: string;
  autoSave: boolean;
  defaultExportDpi: ExportDpi;
  defaultPageFormat: PageFormat;
}
