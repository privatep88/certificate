import React from 'react';
import {
  CertificateDesign,
  CertificateElement,
  DividerCertificateElement,
  ImageCertificateElement,
  OrnamentCertificateElement,
  SealCertificateElement,
  SignatureCertificateElement,
  TextCertificateElement,
} from '../types/certificate';

interface CertificateRendererProps {
  design: CertificateDesign;
  svgRef?: React.Ref<SVGSVGElement>;
  interactive?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onStartDragElement?: (e: React.MouseEvent | React.TouchEvent, element: CertificateElement) => void;
  onStartResizeElement?: (
    e: React.MouseEvent | React.TouchEvent,
    element: CertificateElement,
    handle: 'nw' | 'ne' | 'sw' | 'se' | 'e' | 'w'
  ) => void;
  onDoubleClickText?: (element: TextCertificateElement) => void;
  onDoubleClickElement?: (element: CertificateElement) => void;
  showGrid?: boolean;
  snapLines?: { x?: number; y?: number };
  exportMode?: boolean;
  className?: string;
}

function wrapTextLines(text: string, maxCharsPerLine: number): string[] {
  const rawParagraphs = (text || '').split('\n');
  const lines: string[] = [];

  for (const paragraph of rawParagraphs) {
    const words = paragraph.trim().split(/\s+/);
    if (words.length === 0 || (words.length === 1 && words[0] === '')) {
      lines.push('');
      continue;
    }
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${currentLine} ${words[i]}`;
      if (candidate.length <= maxCharsPerLine) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
  }
  return lines;
}

export const CertificateRenderer: React.FC<CertificateRendererProps> = ({
  design,
  svgRef,
  interactive = false,
  selectedElementId = null,
  onSelectElement,
  onStartDragElement,
  onStartResizeElement,
  onDoubleClickText,
  onDoubleClickElement,
  showGrid = false,
  snapLines,
  exportMode = false,
  className = '',
}) => {
  const { pageConfig, elements } = design;
  const { widthPx, heightPx } = pageConfig;
  const uid = design.id.replace(/[^a-zA-Z0-9_-]/g, '');

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  const renderBackgroundPattern = () => {
    if (pageConfig.whiteForPrint || pageConfig.transparentBackground || pageConfig.backgroundPattern === 'none') {
      return null;
    }
    const op = pageConfig.patternOpacity || 0.08;
    const stroke = pageConfig.frameSecondaryColor || '#B8860B';

    switch (pageConfig.backgroundPattern) {
      case 'guilloche':
        return (
          <g opacity={op}>
            <circle cx={widthPx / 2} cy={heightPx / 2} r={Math.min(widthPx, heightPx) * 0.38} fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="6 4" />
            <circle cx={widthPx / 2} cy={heightPx / 2} r={Math.min(widthPx, heightPx) * 0.34} fill="none" stroke={stroke} strokeWidth="0.8" />
            <circle cx={widthPx / 2} cy={heightPx / 2} r={Math.min(widthPx, heightPx) * 0.3} fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="3 5" />
            <ellipse cx={widthPx / 2} cy={heightPx / 2} rx={widthPx * 0.42} ry={heightPx * 0.24} fill="none" stroke={stroke} strokeWidth="0.9" />
            <ellipse cx={widthPx / 2} cy={heightPx / 2} rx={widthPx * 0.24} ry={heightPx * 0.42} fill="none" stroke={stroke} strokeWidth="0.9" />
          </g>
        );
      case 'islamic-stars':
        return (
          <g opacity={op}>
            <pattern id={`pat-islamic-${uid}`} width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,8 49,28 70,28 53,41 59,62 40,49 21,62 27,41 10,28 31,28" fill="none" stroke={stroke} strokeWidth="1.2" />
              <circle cx="40" cy="40" r="32" fill="none" stroke={stroke} strokeWidth="0.7" />
            </pattern>
            <rect width={widthPx} height={heightPx} fill={`url(#pat-islamic-${uid})`} />
          </g>
        );
      case 'geometric-grid':
        return (
          <g opacity={op}>
            <pattern id={`pat-grid-${uid}`} width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke={stroke} strokeWidth="0.9" />
              <circle cx="24" cy="24" r="2" fill={stroke} />
            </pattern>
            <rect width={widthPx} height={heightPx} fill={`url(#pat-grid-${uid})`} />
          </g>
        );
      case 'diagonal-lines':
        return (
          <g opacity={op}>
            <pattern id={`pat-diag-${uid}`} width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="32" stroke={stroke} strokeWidth="1.2" />
            </pattern>
            <rect width={widthPx} height={heightPx} fill={`url(#pat-diag-${uid})`} />
          </g>
        );
      case 'marble':
        return (
          <g opacity={op * 1.3}>
            <path d={`M 0 ${heightPx * 0.25} Q ${widthPx * 0.35} ${heightPx * 0.15}, ${widthPx * 0.65} ${heightPx * 0.38} T ${widthPx} ${heightPx * 0.2}`} fill="none" stroke={stroke} strokeWidth="2.5" />
            <path d={`M 0 ${heightPx * 0.72} Q ${widthPx * 0.4} ${heightPx * 0.85}, ${widthPx * 0.75} ${heightPx * 0.6} T ${widthPx} ${heightPx * 0.78}`} fill="none" stroke={stroke} strokeWidth="1.8" />
          </g>
        );
      case 'floral-watermark':
        return (
          <g opacity={op * 1.2} transform={`translate(${widthPx / 2}, ${heightPx / 2})`}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <ellipse key={deg} cx="0" cy="-120" rx="45" ry="110" fill="none" stroke={stroke} strokeWidth="1.4" transform={`rotate(${deg})`} />
            ))}
          </g>
        );
      case 'dots':
        return (
          <g opacity={op}>
            <pattern id={`pat-dots-${uid}`} width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="18" cy="18" r="2.2" fill={stroke} />
            </pattern>
            <rect width={widthPx} height={heightPx} fill={`url(#pat-dots-${uid})`} />
          </g>
        );
      case 'waves':
        return (
          <g opacity={op}>
            <pattern id={`pat-waves-${uid}`} width="80" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 20 Q 20 5, 40 20 T 80 20" fill="none" stroke={stroke} strokeWidth="1.2" />
            </pattern>
            <rect width={widthPx} height={heightPx} fill={`url(#pat-waves-${uid})`} />
          </g>
        );
      case 'confetti':
        return (
          <g opacity={op * 1.8}>
            <pattern id={`pat-confetti-${uid}`} width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="24" cy="24" r="5" fill="#F59E0B" />
              <circle cx="95" cy="36" r="4" fill="#EC4899" />
              <polygon points="60,12 64,22 74,22 66,28 69,38 60,32 51,38 54,28 46,22 56,22" fill="#3B82F6" />
              <rect x="25" y="85" width="12" height="6" rx="3" fill="#10B981" transform="rotate(25 25 85)" />
              <circle cx="88" cy="96" r="5" fill="#8B5CF6" />
            </pattern>
            <rect width={widthPx} height={heightPx} fill={`url(#pat-confetti-${uid})`} />
          </g>
        );
      case 'micro-ledger':
        return (
          <g opacity={op * 1.15}>
            <pattern id={`pat-ledger-${uid}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <line x1="0" y1="12" x2="24" y2="12" stroke={stroke} strokeWidth="0.6" strokeDasharray="2 2" />
              <line x1="12" y1="0" x2="12" y2="24" stroke={stroke} strokeWidth="0.6" strokeDasharray="2 2" />
              <rect x="10.5" y="10.5" width="3" height="3" fill="none" stroke={stroke} strokeWidth="0.6" />
            </pattern>
            <rect width={widthPx} height={heightPx} fill={`url(#pat-ledger-${uid})`} />
          </g>
        );
      case 'sovereign-rosette':
        return (
          <g opacity={op * 1.35}>
            <g transform={`translate(${widthPx / 2}, ${heightPx / 2})`}>
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <g key={deg} transform={`rotate(${deg})`}>
                  <ellipse cx="0" cy="-145" rx="36" ry="135" fill="none" stroke={stroke} strokeWidth="1.1" />
                  <circle cx="0" cy="-240" r="8" fill="none" stroke={stroke} strokeWidth="1" />
                </g>
              ))}
              <circle cx="0" cy="0" r="95" fill="none" stroke={stroke} strokeWidth="1.4" strokeDasharray="6 4" />
              <circle cx="0" cy="0" r="190" fill="none" stroke={stroke} strokeWidth="1" />
            </g>
          </g>
        );
      case 'executive-pinstripe':
        return (
          <g opacity={op * 1.1}>
            <pattern id={`pat-pinstripe-${uid}`} width="18" height="18" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="18" stroke={stroke} strokeWidth="0.8" />
              <line x1="9" y1="0" x2="9" y2="18" stroke={stroke} strokeWidth="0.4" strokeDasharray="3 3" />
            </pattern>
            <rect width={widthPx} height={heightPx} fill={`url(#pat-pinstripe-${uid})`} />
          </g>
        );
      default:
        return null;
    }
  };

  const renderCornerOrnaments = (inset: number, color: string, accent: string) => {
    const ornamentStyle = pageConfig.cornerOrnament || 'geometric';
    if (ornamentStyle === 'none') return null;

    const cornerSize = 68;
    const corners = [
      { x: inset, y: inset, sx: 1, sy: 1 },
      { x: widthPx - inset, y: inset, sx: -1, sy: 1 },
      { x: inset, y: heightPx - inset, sx: 1, sy: -1 },
      { x: widthPx - inset, y: heightPx - inset, sx: -1, sy: -1 },
    ];

    return corners.map((c, idx) => (
      <g key={idx} transform={`translate(${c.x}, ${c.y}) scale(${c.sx}, ${c.sy})`}>
        {ornamentStyle === 'arabesque' && (
          <>
            <path d="M 0 0 L 64 0 L 52 12 L 16 12 L 12 16 L 12 52 L 0 64 Z" fill={color} />
            <path d="M 18 18 L 48 18 L 36 30 L 30 36 L 18 48 Z" fill="none" stroke={accent} strokeWidth="2" />
            <polygon points="26,14 34,22 26,30 18,22" fill={accent} />
            <circle cx="10" cy="10" r="3.5" fill={accent} />
          </>
        )}
        {ornamentStyle === 'floral' && (
          <>
            <path d="M 0 0 L 62 0 C 44 10 24 14 14 24 C 14 34 10 44 0 62 Z" fill={color} />
            <path d="M 14 14 Q 36 14 48 26 Q 28 26 20 34 Q 26 28 14 48 Q 14 36 14 14 Z" fill={accent} />
            <circle cx="28" cy="28" r="4" fill={color} stroke={accent} strokeWidth="1.5" />
          </>
        )}
        {ornamentStyle === 'classic-scroll' && (
          <>
            <path
              d="M 2 2 L 66 2 M 2 2 L 2 66"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 12 12 L 54 12 C 44 12 40 22 46 26 C 50 28 54 24 50 20 M 12 12 L 12 54 C 12 44 22 40 26 46 C 28 50 24 54 20 50"
              fill="none"
              stroke={accent}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="4" fill={accent} />
          </>
        )}
        {ornamentStyle === 'stars' && (
          <>
            <path d="M 0 0 L 58 0 L 48 10 L 10 10 L 10 48 L 0 58 Z" fill={color} />
            <polygon points="26,14 29,22 37,22 31,27 33,35 26,30 19,35 21,27 15,22 23,22" fill={accent} />
            <circle cx="44" cy="18" r="3" fill={accent} />
            <circle cx="18" cy="44" r="3" fill={accent} />
          </>
        )}
        {ornamentStyle === 'royal-crest' && (
          <>
            <path d="M 0 0 L 72 0 L 58 14 L 14 14 L 14 58 L 0 72 Z" fill={color} />
            <polygon points="6,6 28,6 22,22 6,28" fill={accent} />
            <polygon points="10,10 22,10 18,18 10,22" fill={color} />
            <path d="M 22 22 L 54 22 M 22 22 L 22 54" stroke={accent} strokeWidth="2.5" />
            <circle cx="32" cy="32" r="5" fill={accent} />
          </>
        )}
        {ornamentStyle === 'geometric' && (
          <>
            <path
              d={`M 0 0 L ${cornerSize} 0 L ${cornerSize - 12} 12 L 12 12 L 12 ${cornerSize - 12} L 0 ${cornerSize} Z`}
              fill={color}
            />
            <path
              d={`M 18 18 L ${cornerSize - 8} 18 M 18 18 L 18 ${cornerSize - 8}`}
              stroke={accent}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="28" cy="28" r="4.5" fill={accent} />
            <polygon points="6,6 16,6 6,16" fill={accent} />
          </>
        )}
      </g>
    ));
  };

  const renderFrame = () => {
    const primary = pageConfig.frameColor || '#0B192C';
    const secondary = pageConfig.frameSecondaryColor || '#B8860B';
    const accent = pageConfig.frameAccentColor || '#D4AF37';
    const bw = pageConfig.borderThickness ?? 3;
    const ft = pageConfig.frameType;
    const showStandardBorders =
      bw > 0 &&
      ft !== 'minimal-clean' &&
      ft !== 'corporate-sidebar-right' &&
      ft !== 'corporate-sidebar-left' &&
      ft !== 'swiss-grid-executive';

    // Base outer & inner architectural frames + specialized decorative motifs per style
    return (
      <g className="certificate-frame">
        {/* 1. Modern / Corporate / Training Horizontal Ribbons */}
        {(ft === 'modern-horizontal' || ft === 'corporate-formal' || ft === 'training-pro') && (
          <g>
            <polygon points={`0,0 ${widthPx * 0.28},0 ${widthPx * 0.18},26 0,26`} fill={primary} />
            <polygon points={`${widthPx * 0.2},0 ${widthPx * 0.36},0 ${widthPx * 0.31},16 ${widthPx * 0.15},16`} fill={accent} />
            <polygon points={`${widthPx},${heightPx} ${widthPx * 0.72},${heightPx} ${widthPx * 0.82},${heightPx - 26} ${widthPx},${heightPx - 26}`} fill={primary} />
            <polygon points={`${widthPx * 0.8},${heightPx} ${widthPx * 0.64},${heightPx} ${widthPx * 0.69},${heightPx - 16} ${widthPx * 0.85},${heightPx - 16}`} fill={accent} />
          </g>
        )}

        {/* 2. Royal / Luxury / Navy-Gold / Black-Gold Diagonal Corner Ribbons */}
        {(ft === 'royal-gold' || ft === 'luxury-multi' || ft === 'navy-gold' || ft === 'black-gold') && (
          <g>
            <polygon points="0,0 130,0 0,130" fill={primary} />
            <polygon points="130,0 152,0 0,152 0,130" fill={accent} />
            <polygon points={`${widthPx},0 ${widthPx - 130},0 ${widthPx},130`} fill={primary} />
            <polygon points={`${widthPx - 130},0 ${widthPx - 152},0 ${widthPx},152 ${widthPx},130`} fill={accent} />
            <polygon points={`0,${heightPx} 130,${heightPx} 0,${heightPx - 130}`} fill={primary} />
            <polygon points={`130,${heightPx} 152,${heightPx} 0,${heightPx - 152} 0,${heightPx - 130}`} fill={accent} />
            <polygon points={`${widthPx},${heightPx} ${widthPx - 130},${heightPx} ${widthPx},${heightPx - 130}`} fill={primary} />
            <polygon points={`${widthPx - 130},${heightPx} ${widthPx - 152},${heightPx} ${widthPx},${heightPx - 152} ${widthPx},${heightPx - 130}`} fill={accent} />
          </g>
        )}

        {/* 3. Islamic Arabesque / Emerald Gold / Ornate Corners Octagonal Medallions */}
        {(ft === 'islamic-arabesque' || ft === 'emerald-gold' || ft === 'ornate-corners' || ft === 'emerald-diwan') && (
          <g>
            {[
              [42, 42],
              [widthPx - 42, 42],
              [42, heightPx - 42],
              [widthPx - 42, heightPx - 42],
            ].map(([cx, cy], idx) => (
              <g key={idx} transform={`translate(${cx}, ${cy})`}>
                <rect x="-26" y="-26" width="52" height="52" fill={primary} stroke={accent} strokeWidth="2" />
                <rect x="-26" y="-26" width="52" height="52" fill={primary} stroke={accent} strokeWidth="2" transform="rotate(45)" />
                <circle cx="0" cy="0" r="12" fill={accent} />
                <circle cx="0" cy="0" r="5" fill={primary} />
              </g>
            ))}
            {ft === 'emerald-diwan' && (
              <g>
                <polygon points={`${widthPx / 2 - 140},32 ${widthPx / 2 + 140},32 ${widthPx / 2 + 115},52 ${widthPx / 2 - 115},52`} fill={primary} stroke={accent} strokeWidth="1.5" />
                <polygon points={`${widthPx / 2 - 140},${heightPx - 32} ${widthPx / 2 + 140},${heightPx - 32} ${widthPx / 2 + 115},${heightPx - 52} ${widthPx / 2 - 115},${heightPx - 52}`} fill={primary} stroke={accent} strokeWidth="1.5" />
              </g>
            )}
          </g>
        )}

        {/* 4. Tech Innovation & Titanium Tech Corp Brackets */}
        {(ft === 'tech-innovation' || ft === 'titanium-tech-corp') && (
          <g>
            <path d={`M 24 96 L 24 24 L 116 24`} fill="none" stroke={accent} strokeWidth="5" />
            <path d={`M ${widthPx - 24} 96 L ${widthPx - 24} 24 L ${widthPx - 116} 24`} fill="none" stroke={accent} strokeWidth="5" />
            <path d={`M 24 ${heightPx - 96} L 24 ${heightPx - 24} L 116 ${heightPx - 24}`} fill="none" stroke={accent} strokeWidth="5" />
            <path d={`M ${widthPx - 24} ${heightPx - 96} L ${widthPx - 24} ${heightPx - 24} L ${widthPx - 116} ${heightPx - 24}`} fill="none" stroke={accent} strokeWidth="5" />
            {ft === 'titanium-tech-corp' && (
              <g>
                <rect x="24" y={heightPx * 0.25} width="8" height={heightPx * 0.5} fill={primary} />
                <rect x={widthPx - 32} y={heightPx * 0.25} width="8" height={heightPx * 0.5} fill={primary} />
                <circle cx="28" cy={heightPx * 0.22} r="5" fill={accent} />
                <circle cx={widthPx - 28} cy={heightPx * 0.22} r="5" fill={accent} />
                <circle cx="28" cy={heightPx * 0.78} r="5" fill={accent} />
                <circle cx={widthPx - 28} cy={heightPx * 0.78} r="5" fill={accent} />
              </g>
            )}
          </g>
        )}

        {/* 5. Kids Playful Dashed Rounded Frame */}
        {ft === 'kids-playful' && (
          <g>
            <rect
              x="22"
              y="22"
              width={widthPx - 44}
              height={heightPx - 44}
              rx="28"
              fill="none"
              stroke={secondary}
              strokeWidth="6"
              strokeDasharray="18 10"
            />
          </g>
        )}

        {/* 6. Executive Platinum & Gold-Silver-Lines Precision Beveled Frame */}
        {(ft === 'executive-platinum' || ft === 'gold-silver-lines') && (
          <g>
            <rect x="20" y="20" width={widthPx - 40} height={heightPx - 40} fill="none" stroke={primary} strokeWidth="6" />
            <rect x="28" y="28" width={widthPx - 56} height={heightPx - 56} fill="none" stroke={secondary} strokeWidth="2" />
            <polygon points={`${widthPx / 2 - 180},20 ${widthPx / 2 + 180},20 ${widthPx / 2 + 155},38 ${widthPx / 2 - 155},38`} fill={primary} />
            <polygon points={`${widthPx / 2 - 90},25 ${widthPx / 2 + 90},25 ${widthPx / 2 + 78},33 ${widthPx / 2 - 78},33`} fill={accent} />
            <polygon points={`${widthPx / 2 - 180},${heightPx - 20} ${widthPx / 2 + 180},${heightPx - 20} ${widthPx / 2 + 155},${heightPx - 38} ${widthPx / 2 - 155},${heightPx - 38}`} fill={primary} />
          </g>
        )}

        {/* 7. Diplomatic Embassy & Ministry Sovereign Crest Frames */}
        {(ft === 'diplomatic-embassy' || ft === 'ministry-sovereign' || ft === 'sapphire-protocol') && (
          <g>
            {/* Top Sovereign Header Bar */}
            <rect x="32" y="32" width={widthPx - 64} height="16" fill={primary} />
            <rect x="32" y="48" width={widthPx - 64} height="4" fill={accent} />
            {/* Bottom Protocol Bar */}
            <rect x="32" y={heightPx - 48} width={widthPx - 64} height="16" fill={primary} />
            <rect x="32" y={heightPx - 52} width={widthPx - 64} height="4" fill={accent} />
            {/* Side Protocol Pilasters */}
            <rect x="32" y="48" width="12" height={heightPx - 96} fill={primary} opacity="0.12" />
            <rect x={widthPx - 44} y="48" width="12" height={heightPx - 96} fill={primary} opacity="0.12" />
            {ft === 'ministry-sovereign' && (
              <g transform={`translate(${widthPx / 2}, 40)`}>
                <polygon points="-28,-12 28,-12 20,16 -20,16" fill={accent} stroke={primary} strokeWidth="2" />
                <circle cx="0" cy="2" r="6" fill={primary} />
              </g>
            )}
          </g>
        )}

        {/* 8. ISO Accreditation & Banking Guilloche Security Frames */}
        {(ft === 'iso-accreditation' || ft === 'banking-guilloche') && (
          <g>
            <rect
              x="24"
              y="24"
              width={widthPx - 48}
              height={heightPx - 48}
              fill="none"
              stroke={primary}
              strokeWidth="8"
              strokeDasharray={ft === 'banking-guilloche' ? '12 3 3 3' : '24 4'}
            />
            <rect
              x="36"
              y="36"
              width={widthPx - 72}
              height={heightPx - 72}
              fill="none"
              stroke={secondary}
              strokeWidth="2.5"
            />
            {/* Security Guilloche Rosettes in 4 Corners */}
            {[
              [56, 56],
              [widthPx - 56, 56],
              [56, heightPx - 56],
              [widthPx - 56, heightPx - 56],
            ].map(([cx, cy], idx) => (
              <g key={idx} transform={`translate(${cx}, ${cy})`}>
                <circle cx="0" cy="0" r="22" fill={ '#FFFFFF' } stroke={primary} strokeWidth="2" />
                <circle cx="0" cy="0" r="17" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="0" cy="0" r="11" fill="none" stroke={secondary} strokeWidth="1.2" />
                <circle cx="0" cy="0" r="4" fill={primary} />
              </g>
            ))}
          </g>
        )}

        {/* 9. Boardroom Mahogany & Marble Gold Heavy Luxury Frames */}
        {(ft === 'boardroom-mahogany' || ft === 'marble-gold' || ft === 'double-triple-border') && (
          <g>
            <rect x="20" y="20" width={widthPx - 40} height={heightPx - 40} fill="none" stroke={primary} strokeWidth="12" />
            <rect x="28" y="28" width={widthPx - 56} height={heightPx - 56} fill="none" stroke={accent} strokeWidth="2.5" />
            <rect x="38" y="38" width={widthPx - 76} height={heightPx - 76} fill="none" stroke={secondary} strokeWidth="1.5" />
          </g>
        )}

        {/* 10. Corporate Sidebar Right (Arabic Executive Band) */}
        {ft === 'corporate-sidebar-right' && (
          <g>
            <rect x={widthPx - 68} y="0" width="68" height={heightPx} fill={primary} />
            <rect x={widthPx - 76} y="0" width="8" height={heightPx} fill={accent} />
            <polygon points={`${widthPx - 76},${heightPx * 0.18} ${widthPx - 98},${heightPx * 0.25} ${widthPx - 76},${heightPx * 0.32}`} fill={accent} />
            <polygon points={`${widthPx - 76},${heightPx * 0.68} ${widthPx - 98},${heightPx * 0.75} ${widthPx - 76},${heightPx * 0.82}`} fill={accent} />
            <line x1="28" y1="28" x2={widthPx - 90} y2="28" stroke={primary} strokeWidth="3" />
            <line x1="28" y1="28" x2="28" y2={heightPx - 28} stroke={primary} strokeWidth="3" />
            <line x1="28" y1={heightPx - 28} x2={widthPx - 90} y2={heightPx - 28} stroke={primary} strokeWidth="3" />
          </g>
        )}

        {/* 11. Corporate Sidebar Left (International / Bilingual Band) */}
        {ft === 'corporate-sidebar-left' && (
          <g>
            <rect x="0" y="0" width="68" height={heightPx} fill={primary} />
            <rect x="68" y="0" width="8" height={heightPx} fill={accent} />
            <polygon points={`76,${heightPx * 0.18} 98,${heightPx * 0.25} 76,${heightPx * 0.32}`} fill={accent} />
            <polygon points={`76,${heightPx * 0.68} 98,${heightPx * 0.75} 76,${heightPx * 0.82}`} fill={accent} />
            <line x1="90" y1="28" x2={widthPx - 28} y2="28" stroke={primary} strokeWidth="3" />
            <line x1={widthPx - 28} y1="28" x2={widthPx - 28} y2={heightPx - 28} stroke={primary} strokeWidth="3" />
            <line x1="90" y1={heightPx - 28} x2={widthPx - 28} y2={heightPx - 28} stroke={primary} strokeWidth="3" />
          </g>
        )}

        {/* 12. Gold Pillar Classical & Academic Senate Columns */}
        {(ft === 'gold-pillar-classical' || ft === 'academic-senate' || ft === 'classic-european') && (
          <g>
            {/* Left Classical Pillar */}
            <rect x="34" y="64" width="18" height={heightPx - 128} fill={primary} opacity="0.9" />
            <line x1="39" y1="68" x2="39" y2={heightPx - 68} stroke={accent} strokeWidth="1.5" />
            <line x1="47" y1="68" x2="47" y2={heightPx - 68} stroke={accent} strokeWidth="1.5" />
            <rect x="28" y="54" width="30" height="12" rx="2" fill={secondary} stroke={primary} strokeWidth="1.5" />
            <rect x="28" y={heightPx - 66} width="30" height="12" rx="2" fill={secondary} stroke={primary} strokeWidth="1.5" />

            {/* Right Classical Pillar */}
            <rect x={widthPx - 52} y="64" width="18" height={heightPx - 128} fill={primary} opacity="0.9" />
            <line x1={widthPx - 47} y1="68" x2={widthPx - 47} y2={heightPx - 68} stroke={accent} strokeWidth="1.5" />
            <line x1={widthPx - 39} y1="68" x2={widthPx - 39} y2={heightPx - 68} stroke={accent} strokeWidth="1.5" />
            <rect x={widthPx - 58} y="54" width="30" height="12" rx="2" fill={secondary} stroke={primary} strokeWidth="1.5" />
            <rect x={widthPx - 58} y={heightPx - 66} width="30" height="12" rx="2" fill={secondary} stroke={primary} strokeWidth="1.5" />
          </g>
        )}

        {/* 13. Legal Notary & Chancery Scroll Double Ledger Rules */}
        {(ft === 'legal-notary' || ft === 'chancery-scroll') && (
          <g>
            <line x1="66" y1="32" x2="66" y2={heightPx - 32} stroke={secondary} strokeWidth="2" />
            <line x1="72" y1="32" x2="72" y2={heightPx - 32} stroke={accent} strokeWidth="1" />
            <line x1={widthPx - 66} y1="32" x2={widthPx - 66} y2={heightPx - 32} stroke={secondary} strokeWidth="2" />
            <line x1={widthPx - 72} y1="32" x2={widthPx - 72} y2={heightPx - 32} stroke={accent} strokeWidth="1" />
            {ft === 'chancery-scroll' && (
              <g>
                <circle cx={widthPx / 2} cy="32" r="10" fill={accent} stroke={primary} strokeWidth="2" />
                <circle cx={widthPx / 2} cy={heightPx - 32} r="10" fill={accent} stroke={primary} strokeWidth="2" />
              </g>
            )}
          </g>
        )}

        {/* 14. Swiss Grid Executive Architectural Structural Lines */}
        {ft === 'swiss-grid-executive' && (
          <g>
            <line x1="0" y1="56" x2={widthPx} y2="56" stroke={primary} strokeWidth="2" />
            <line x1="0" y1={heightPx - 56} x2={widthPx} y2={heightPx - 56} stroke={primary} strokeWidth="2" />
            <line x1="56" y1="0" x2="56" y2={heightPx} stroke={primary} strokeWidth="2" />
            <line x1={widthPx - 56} y1="0" x2={widthPx - 56} y2={heightPx} stroke={primary} strokeWidth="2" />
            <rect x="48" y="48" width="16" height="16" fill={secondary} />
            <rect x={widthPx - 64} y="48" width="16" height="16" fill={secondary} />
            <rect x="48" y={heightPx - 64} width="16" height="16" fill={secondary} />
            <rect x={widthPx - 64} y={heightPx - 64} width="16" height="16" fill={secondary} />
          </g>
        )}

        {/* 15. Heritage Arch (Arabian Royal Archway Crown) */}
        {ft === 'heritage-arch' && (
          <g>
            <path
              d={`M 54 ${heightPx - 54} L 54 140 Q 54 54 140 54 L ${widthPx / 2 - 90} 54 Q ${widthPx / 2} 22 ${widthPx / 2 + 90} 54 L ${widthPx - 140} 54 Q ${widthPx - 54} 54 ${widthPx - 54} 140 L ${widthPx - 54} ${heightPx - 54} Z`}
              fill="none"
              stroke={accent}
              strokeWidth="2.5"
            />
            <polygon points={`${widthPx / 2},24 ${widthPx / 2 + 14},42 ${widthPx / 2},52 ${widthPx / 2 - 14},42`} fill={secondary} />
          </g>
        )}

        {/* Primary Outer Border */}
        {showStandardBorders && (
          <rect
            x="32"
            y="32"
            width={widthPx - 64}
            height={heightPx - 64}
            fill="none"
            stroke={primary}
            strokeWidth={bw + 1}
          />
        )}

        {/* Secondary Middle Accent Border */}
        {showStandardBorders && (
          <rect
            x="42"
            y="42"
            width={widthPx - 84}
            height={heightPx - 84}
            fill="none"
            stroke={accent}
            strokeWidth={Math.max(1.2, bw - 0.5)}
          />
        )}

        {/* Triple Inner Hairline Border */}
        {showStandardBorders && (
          <rect
            x="49"
            y="49"
            width={widthPx - 98}
            height={heightPx - 98}
            fill="none"
            stroke={secondary}
            strokeWidth="1"
            strokeDasharray={
              ft === 'classic-european' || ft === 'official-seal-frame' || ft === 'iso-accreditation'
                ? '8 4'
                : undefined
            }
          />
        )}

        {/* Corner Filigree Ornaments */}
        {showStandardBorders &&
          ft !== 'kids-playful' &&
          ft !== 'iso-accreditation' &&
          ft !== 'banking-guilloche' &&
          renderCornerOrnaments(32, primary, accent)}
      </g>
    );
  };

  const renderOrnamentElement = (el: OrnamentCertificateElement) => {
    const c1 = el.color || '#C5A059';
    const c2 = el.secondaryColor || '#0B192C';

    switch (el.variant) {
      case 'crown-royal':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <path d="M12 74 L20 32 L40 52 L50 20 L60 52 L80 32 L88 74 Z" fill={c1} stroke={c2} strokeWidth="3" strokeLinejoin="round" />
            <rect x="14" y="76" width="72" height="10" rx="4" fill={c2} />
            <circle cx="20" cy="26" r="5" fill={c1} />
            <circle cx="50" cy="14" r="6" fill={c1} />
            <circle cx="80" cy="26" r="5" fill={c1} />
          </svg>
        );
      case 'laurel-wreath':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <path d="M50 84 C24 80 14 55 20 26 C26 42 32 64 50 76" fill="none" stroke={c1} strokeWidth="4" strokeLinecap="round" />
            <path d="M50 84 C76 80 86 55 80 26 C74 42 68 64 50 76" fill="none" stroke={c1} strokeWidth="4" strokeLinecap="round" />
            <polygon points="50,18 55,32 70,32 58,41 62,55 50,46 38,55 42,41 30,32 45,32" fill={c1} />
            <path d="M38 86 L50 78 L62 86" fill="none" stroke={c2} strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'islamic-rosette':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <g transform="translate(50,50)">
              <rect x="-28" y="-28" width="56" height="56" fill={c2} stroke={c1} strokeWidth="3" />
              <rect x="-28" y="-28" width="56" height="56" fill={c2} stroke={c1} strokeWidth="3" transform="rotate(45)" />
              <circle cx="0" cy="0" r="18" fill={c1} />
              <circle cx="0" cy="0" r="8" fill={c2} />
            </g>
          </svg>
        );
      case 'medal-ribbon':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <polygon points="34,52 22,92 38,84 46,94 48,54" fill={c2} />
            <polygon points="66,52 78,92 62,84 54,94 52,54" fill={c2} />
            <circle cx="50" cy="40" r="28" fill={c1} stroke={c2} strokeWidth="3" />
            <circle cx="50" cy="40" r="21" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 2" />
            <polygon points="50,24 54,34 65,34 56,41 59,51 50,45 41,51 44,41 35,34 46,34" fill="#FFFFFF" />
          </svg>
        );
      case 'excellence-shield':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <path d="M18 14 H82 V48 C82 74 50 88 50 92 C50 88 18 74 18 48 Z" fill={c2} stroke={c1} strokeWidth="4" />
            <path d="M28 24 H72 V46 C72 65 50 76 50 79 C50 76 28 65 28 46 Z" fill="none" stroke={c1} strokeWidth="2" />
            <polygon points="50,28 55,41 69,41 58,49 62,62 50,54 38,62 42,49 31,41 45,41" fill={c1} />
          </svg>
        );
      case 'star-cluster':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <polygon points="50,14 58,36 82,36 62,50 70,72 50,58 30,72 38,50 18,36 42,36" fill={c1} />
            <polygon points="20,62 23,70 31,70 25,75 27,83 20,78 13,83 15,75 9,70 17,70" fill={c2} />
            <polygon points="80,62 83,70 91,70 85,75 87,83 80,78 73,83 75,75 69,70 77,70" fill={c2} />
          </svg>
        );
      case 'trophy-cup':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <path d="M28 18 H72 V42 C72 58 50 66 50 66 C50 66 28 58 28 42 Z" fill={c1} stroke={c2} strokeWidth="3" />
            <path d="M28 24 H16 C16 40 22 46 28 46" fill="none" stroke={c1} strokeWidth="4" />
            <path d="M72 24 H84 C84 40 78 46 72 46" fill="none" stroke={c1} strokeWidth="4" />
            <rect x="44" y="66" width="12" height="14" fill={c2} />
            <rect x="30" y="80" width="40" height="10" rx="3" fill={c1} stroke={c2} strokeWidth="2" />
          </svg>
        );
      case 'graduation-cap':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <polygon points="50,18 92,38 50,58 8,38" fill={c2} stroke={c1} strokeWidth="3" />
            <path d="M26 48 V68 C26 78 74 78 74 68 V48" fill={c1} />
            <path d="M84 42 V72" stroke={c1} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="84" cy="74" r="4" fill={c2} />
          </svg>
        );
      case 'kids-star-smile':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <polygon points="50,8 63,34 92,38 71,58 76,86 50,73 24,86 29,58 8,38 37,34" fill={c1} stroke={c2} strokeWidth="3" strokeLinejoin="round" />
            <circle cx="41" cy="46" r="4" fill="#1E293B" />
            <circle cx="59" cy="46" r="4" fill="#1E293B" />
            <path d="M39 58 Q50 68 61 58" fill="none" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        );
      case 'tech-hexagon':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <polygon points="50,8 88,29 88,71 50,92 12,71 12,29" fill={c2} stroke={c1} strokeWidth="4" />
            <polygon points="50,22 75,36 75,64 50,78 25,64 25,36" fill="none" stroke={c1} strokeWidth="2" />
            <circle cx="50" cy="50" r="10" fill={c1} />
          </svg>
        );
      case 'heart-care':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <path d="M50 84 C50 84 14 60 14 34 C14 20 26 12 38 16 C44 18 48 23 50 28 C52 23 56 18 62 16 C74 12 86 20 86 34 C86 60 50 84 50 84 Z" fill={c1} stroke={c2} strokeWidth="3" />
          </svg>
        );
      case 'floral-branch':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <path d="M18 82 Q50 50 84 18" fill="none" stroke={c1} strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="36" cy="52" rx="14" ry="7" fill={c1} transform="rotate(-35 36 52)" />
            <ellipse cx="56" cy="34" rx="14" ry="7" fill={c1} transform="rotate(-35 56 34)" />
            <ellipse cx="64" cy="56" rx="14" ry="7" fill={c2} transform="rotate(25 64 56)" />
            <ellipse cx="44" cy="72" rx="14" ry="7" fill={c2} transform="rotate(25 44 72)" />
          </svg>
        );
      case 'corner-arabesque':
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <path d="M12 12 H78 C54 12 46 28 46 46 C28 46 12 54 12 78 Z" fill={c1} opacity="0.22" />
            <path d="M14 84 V14 H84" fill="none" stroke={c1} strokeWidth="4" strokeLinecap="round" />
            <path d="M24 72 V24 H72" fill="none" stroke={c2} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M24 48 Q48 48 48 24" fill="none" stroke={c1} strokeWidth="3" />
            <circle cx="34" cy="34" r="5" fill={c1} />
          </svg>
        );
      case 'ribbon-banner':
        return (
          <svg viewBox="0 0 160 60" width={el.width} height={el.height} preserveAspectRatio="none">
            <polygon points="6,18 26,18 18,32 26,46 6,46 14,32" fill={c2} />
            <polygon points="154,18 134,18 142,32 134,46 154,46 146,32" fill={c2} />
            <rect x="20" y="10" width="120" height="32" rx="6" fill={c1} stroke={c2} strokeWidth="2.5" />
            <rect x="25" y="14" width="110" height="24" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="4 2" />
          </svg>
        );
      case 'tughra-monogram':
        return (
          <svg viewBox="0 0 160 110" width={el.width} height={el.height}>
            {/* Sultanic Tughra Outer Beyze Loops */}
            <path
              d="M95 72 C32 76 12 54 24 38 C36 22 78 28 118 52 C136 62 146 54 142 42 C136 28 96 34 62 66"
              fill="none"
              stroke={c1}
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            <path
              d="M92 66 C48 68 32 52 40 42 C48 30 82 36 112 56"
              fill="none"
              stroke={c2}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Three Vertical Tughra Shafts (Tughs / Alifs) & Zulf */}
            <path d="M68 68 V14 C76 20 82 28 76 36" fill="none" stroke={c1} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M82 68 V10 C90 16 96 24 90 32" fill="none" stroke={c1} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M96 68 V16 C104 22 110 30 104 38" fill="none" stroke={c1} strokeWidth="3.5" strokeLinecap="round" />
            {/* Sere (Base Calligraphic Interlace) & Tashkeel Dots */}
            <path d="M52 76 Q82 88 128 70 Q102 82 58 84" fill="none" stroke={c1} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="52" cy="28" r="2.8" fill={c1} />
            <circle cx="116" cy="26" r="2.8" fill={c2} />
            <polygon points="122,16 125,22 131,22 126,26 128,32 122,28 116,32 118,26 113,22 119,22" fill={c1} />
            <text
              x="84"
              y="98"
              textAnchor="middle"
              fill={c2}
              fontFamily="Rakkas"
              fontSize="13"
            >
              طُغْرَاءُ التَّمَيُّزِ وَالتَّكْرِيمِ
            </text>
          </svg>
        );
      case 'thuluth-banner':
        return (
          <svg viewBox="0 0 260 80" width={el.width} height={el.height}>
            <rect x="8" y="10" width="244" height="60" rx="30" fill={c2} stroke={c1} strokeWidth="3" />
            <rect x="14" y="16" width="232" height="48" rx="24" fill="none" stroke={c1} strokeWidth="1.2" strokeDasharray="5 3" />
            <circle cx="28" cy="40" r="6" fill={c1} />
            <circle cx="232" cy="40" r="6" fill={c1} />
            <text
              x="130"
              y="48"
              textAnchor="middle"
              fill="#FFFDF7"
              fontFamily="Amiri"
              fontSize="21"
              fontWeight="700"
            >
              ۞ بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ ۞
            </text>
          </svg>
        );
      case 'diwani-cartouche':
        return (
          <svg viewBox="0 0 240 90" width={el.width} height={el.height}>
            <path
              d="M26 45 L44 16 H196 L214 45 L196 74 H44 Z"
              fill="#FFFDF7"
              stroke={c1}
              strokeWidth="3.5"
            />
            <path
              d="M34 45 L49 22 H191 L206 45 L191 68 H49 Z"
              fill="none"
              stroke={c2}
              strokeWidth="1.5"
            />
            <circle cx="16" cy="45" r="6" fill={c1} />
            <circle cx="224" cy="45" r="6" fill={c1} />
            <text
              x="120"
              y="53"
              textAnchor="middle"
              fill={c2}
              fontFamily="Rakkas"
              fontSize="22"
            >
              ༺ وِسَامُ الشَّرَفِ وَالتَّقْدِيرِ ༻
            </text>
          </svg>
        );
      case 'kufic-medallion':
        return (
          <svg viewBox="0 0 120 120" width={el.width} height={el.height}>
            <g transform="translate(60,60)">
              <rect x="-38" y="-38" width="76" height="76" fill={c2} stroke={c1} strokeWidth="3.5" />
              <rect x="-38" y="-38" width="76" height="76" fill={c2} stroke={c1} strokeWidth="3.5" transform="rotate(45)" />
              <rect x="-26" y="-26" width="52" height="52" fill="none" stroke="#FFFDF7" strokeWidth="2" />
              {/* Inner Square Kufic Geometric Pattern */}
              <path
                d="M-16 -16 H16 V16 H-16 Z M-10 -10 V10 H10 V-2 H-2 V2 H4"
                fill="none"
                stroke={c1}
                strokeWidth="3"
                strokeLinecap="square"
              />
            </g>
          </svg>
        );
      case 'quran-rehal':
        return (
          <svg viewBox="0 0 220 175" width={el.width} height={el.height}>
            {/* Carved Wooden Rehal (X-Stand) */}
            <g stroke="#26282B" strokeWidth="1.8" strokeLinejoin="round">
              {/* Left leg going down-right */}
              <path d="M 30,66 L 188,154 L 182,164 L 146,146 L 142,135 L 128,128 L 122,136 L 22,82 Z" fill={c2 || '#4A4D52'} />
              <path d="M 36,74 L 178,152" stroke="#7A7E85" strokeWidth="1.5" fill="none" />
              {/* Right leg going down-left */}
              <path d="M 190,66 L 32,154 L 38,164 L 74,146 L 78,135 L 92,128 L 98,136 L 198,82 Z" fill="#373A3E" />
              <path d="M 184,74 L 42,152" stroke="#686C73" strokeWidth="1.5" fill="none" />
              {/* Decorative cutout notches on stand legs */}
              <circle cx="66" cy="134" r="4.5" fill="#FBFBFB" stroke="none" />
              <circle cx="154" cy="134" r="4.5" fill="#FBFBFB" stroke="none" />
            </g>
            {/* Open Mushaf Cover */}
            <path
              d="M 110,108 L 30,64 L 54,22 L 110,58 L 166,22 L 190,64 Z"
              fill="#323539"
              stroke="#1E2022"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Stacked Pages Edge Depth */}
            <path
              d="M 110,102 L 36,61 L 56,24 L 110,56 L 164,24 L 184,61 Z"
              fill="#DFDDD4"
              stroke="#5A5D62"
              strokeWidth="1.4"
            />
            {/* Open Left & Right Cream Pages */}
            <path
              d="M 110,95 C 86,78 58,64 42,56 L 60,20 C 78,30 96,44 110,56 Z"
              fill={c1 || '#F5F2E6'}
              stroke="#686B70"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M 110,95 C 134,78 162,64 178,56 L 160,20 C 142,30 124,44 110,56 Z"
              fill={c1 || '#F5F2E6'}
              stroke="#686B70"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Inner Page Frame Lines */}
            <path
              d="M 105,84 C 86,70 66,60 51,52 L 64,27 C 80,35 94,46 105,56 Z"
              fill="none"
              stroke="#8C8F94"
              strokeWidth="1"
            />
            <path
              d="M 115,84 C 134,70 154,60 169,52 L 156,27 C 140,35 126,46 115,56 Z"
              fill="none"
              stroke="#8C8F94"
              strokeWidth="1"
            />
            {/* Center Spine & Hanging Bookmark Ribbon */}
            <line x1="110" y1="54" x2="110" y2="104" stroke="#373A3E" strokeWidth="2.5" />
            <path
              d="M 110,98 Q 108,128 104,158 M 112,98 Q 116,126 113,152"
              fill="none"
              stroke="#373A3E"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'grad-cap-book-stars':
        return (
          <svg viewBox="0 0 180 130" width={el.width} height={el.height}>
            {/* Three Stars Above */}
            <polygon
              points="90,8 94,19 106,19 96,26 100,37 90,30 80,37 84,26 74,19 86,19"
              fill={c1}
            />
            <polygon
              points="44,34 47,41 55,41 48,46 51,53 44,48 37,53 40,46 33,41 41,41"
              fill={c1}
            />
            <polygon
              points="136,34 139,41 147,41 140,46 143,53 136,48 129,53 132,46 125,41 133,41"
              fill={c1}
            />
            {/* Academic Mortarboard Cap */}
            <polygon points="90,42 132,58 90,74 48,58" fill={c1} />
            <path d="M 68,66 V 82 C 68,90 112,90 112,82 V 66 L 90,76 Z" fill={c2 || '#D4AF37'} />
            {/* Tassel on Right */}
            <path d="M 122,62 V 84" stroke={c1} strokeWidth="3" strokeLinecap="round" />
            <polygon points="122,82 118,92 126,92" fill={c1} />
            {/* Open Book Pages at Base */}
            <path
              d="M 90,114 Q 60,96 24,104 L 30,94 Q 62,88 90,106 Q 118,88 150,94 L 156,104 Q 120,96 90,114 Z"
              fill={c1}
            />
            <path
              d="M 90,120 Q 58,104 18,112 L 22,106 Q 58,98 90,114 Q 122,98 158,106 L 162,112 Q 122,104 90,120 Z"
              fill={c2 || '#D4AF37'}
            />
            <path
              d="M 90,106 Q 64,90 36,92 M 90,106 Q 116,90 144,92"
              fill="none"
              stroke={c1}
              strokeWidth="2.5"
            />
          </svg>
        );
      case 'charcoal-gold-medal':
        return (
          <svg viewBox="0 0 220 300" width={el.width} height={el.height}>
            <defs>
              <linearGradient id={`cg-medal-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCE79C" />
                <stop offset="35%" stopColor={c1 || '#D4AF37'} />
                <stop offset="70%" stopColor="#9A6F1A" />
                <stop offset="100%" stopColor="#F5D061" />
              </linearGradient>
            </defs>
            {/* Bottom Left & Right Gold Ribbons */}
            <polygon points="68,175 34,270 68,248 84,284 108,185" fill={`url(#cg-medal-${el.id})`} stroke="#9A6F1A" strokeWidth="1.5" />
            <polygon points="152,175 186,270 152,248 136,284 112,185" fill={`url(#cg-medal-${el.id})`} stroke="#9A6F1A" strokeWidth="1.5" />
            {/* Scalloped Rosette Outer Gold Rim */}
            <polygon
              points="110,12 126,22 145,17 156,33 176,36 180,55 198,66 194,85 206,102 195,119 200,138 184,151 182,171 163,176 153,194 134,191 118,204 102,194 84,203 70,189 50,191 42,173 23,167 23,147 9,134 17,115 9,97 23,82 23,62 41,54 48,35 67,34 80,18 98,23"
              fill={`url(#cg-medal-${el.id})`}
              stroke="#8A6114"
              strokeWidth="2"
            />
            {/* Inner Gold Ring & Dark Charcoal Core */}
            <circle cx="110" cy="108" r="76" fill={c2 || '#3E3E3E'} stroke={`url(#cg-medal-${el.id})`} strokeWidth="5" />
            <circle cx="110" cy="108" r="64" fill="none" stroke={`url(#cg-medal-${el.id})`} strokeWidth="2" />
            {/* Detailed Multi-Leaf Gold Laurel Wreath */}
            <g fill={`url(#cg-medal-${el.id})`}>
              <path d="M 110,156 C 72,152 54,122 62,78 C 66,112 82,140 110,148 Z" />
              <path d="M 110,156 C 148,152 166,122 158,78 C 154,112 138,140 110,148 Z" />
              {/* Left Laurel Leaves */}
              <ellipse cx="64" cy="118" rx="11" ry="4.5" transform="rotate(35 64 118)" />
              <ellipse cx="60" cy="102" rx="11" ry="4.5" transform="rotate(55 60 102)" />
              <ellipse cx="62" cy="86" rx="10" ry="4" transform="rotate(72 62 86)" />
              <ellipse cx="74" cy="134" rx="11" ry="4.5" transform="rotate(18 74 134)" />
              <ellipse cx="90" cy="146" rx="11" ry="4.5" transform="rotate(5 90 146)" />
              {/* Right Laurel Leaves */}
              <ellipse cx="156" cy="118" rx="11" ry="4.5" transform="rotate(-35 156 118)" />
              <ellipse cx="160" cy="102" rx="11" ry="4.5" transform="rotate(-55 160 102)" />
              <ellipse cx="158" cy="86" rx="10" ry="4" transform="rotate(-72 158 86)" />
              <ellipse cx="146" cy="134" rx="11" ry="4.5" transform="rotate(-18 146 134)" />
              <ellipse cx="130" cy="146" rx="11" ry="4.5" transform="rotate(-5 130 146)" />
              {/* Stem Cross at Bottom of Wreath */}
              <path d="M 96,158 L 110,148 L 124,158" stroke={`url(#cg-medal-${el.id})`} strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        );
      case 'navy-torch-book-medal':
        return (
          <svg viewBox="0 0 220 300" width={el.width} height={el.height}>
            <defs>
              <linearGradient id={`ntb-gold-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCE79C" />
                <stop offset="50%" stopColor={c1 || '#D4AF37'} />
                <stop offset="100%" stopColor="#9A6F1A" />
              </linearGradient>
            </defs>
            {/* Navy Ribbon Tails with Gold Edges */}
            <polygon points="62,172 30,272 68,252 90,285 106,182" fill={c2 || '#0B1D3A'} stroke={`url(#ntb-gold-${el.id})`} strokeWidth="4" />
            <polygon points="158,172 190,272 152,252 130,285 114,182" fill={c2 || '#0B1D3A'} stroke={`url(#ntb-gold-${el.id})`} strokeWidth="4" />
            {/* Scalloped Gold Medal Disc */}
            <polygon
              points="110,12 126,20 145,16 156,31 176,35 180,53 198,65 194,84 206,101 195,118 200,137 184,150 182,170 163,175 153,193 134,190 118,203 102,193 84,202 70,188 50,190 42,172 23,166 23,146 9,133 17,114 9,96 23,81 23,61 41,53 48,34 67,33 80,17 98,22"
              fill={`url(#ntb-gold-${el.id})`}
              stroke="#8A6114"
              strokeWidth="2"
            />
            {/* Deep Navy Inner Circle */}
            <circle cx="110" cy="108" r="76" fill={c2 || '#0B1D3A'} stroke={`url(#ntb-gold-${el.id})`} strokeWidth="4" />
            <circle cx="110" cy="108" r="68" fill="none" stroke={`url(#ntb-gold-${el.id})`} strokeWidth="1.5" />
            {/* Gold Laurel Wreath */}
            <path d="M 110,164 C 66,156 50,116 62,68" fill="none" stroke={`url(#ntb-gold-${el.id})`} strokeWidth="5" strokeDasharray="10 4" strokeLinecap="round" />
            <path d="M 110,164 C 154,156 170,116 158,68" fill="none" stroke={`url(#ntb-gold-${el.id})`} strokeWidth="5" strokeDasharray="10 4" strokeLinecap="round" />
            {/* Top 3 Stars */}
            <polygon points="110,46 113,53 120,53 114,57 116,64 110,60 104,64 106,57 100,53 107,53" fill={`url(#ntb-gold-${el.id})`} />
            <circle cx="88" cy="58" r="3.5" fill={`url(#ntb-gold-${el.id})`} />
            <circle cx="132" cy="58" r="3.5" fill={`url(#ntb-gold-${el.id})`} />
            {/* Torch Flame & Handle */}
            <path d="M 110,64 C 120,76 118,88 110,94 C 102,88 100,76 110,64 Z" fill={`url(#ntb-gold-${el.id})`} />
            <rect x="106" y="94" width="8" height="16" rx="2" fill={`url(#ntb-gold-${el.id})`} />
            {/* Open Book in Center */}
            <path d="M 108,108 L 78,102 V 134 L 108,140 Z" fill={`url(#ntb-gold-${el.id})`} />
            <path d="M 112,108 L 142,102 V 134 L 112,140 Z" fill={`url(#ntb-gold-${el.id})`} />
            <path d="M 76,138 Q 110,146 144,138" fill="none" stroke={`url(#ntb-gold-${el.id})`} strokeWidth="3" />
          </svg>
        );
      case 'stepped-gold-corner':
        return (
          <svg viewBox="0 0 120 120" width={el.width} height={el.height}>
            <polyline points="8,12 108,12 108,112" fill="none" stroke={c1 || '#E5A93C'} strokeWidth="2.5" />
            <polyline points="18,22 98,22 98,102" fill="none" stroke={c1 || '#E5A93C'} strokeWidth="2.5" />
            <polyline points="28,32 88,32 88,92" fill="none" stroke={c1 || '#E5A93C'} strokeWidth="2.5" />
          </svg>
        );
      case 'royal-arabesque-crest':
        return (
          <svg viewBox="0 0 200 70" width={el.width} height={el.height}>
            <g fill="none" stroke={c1 || '#C5A059'} strokeWidth="2.2" strokeLinecap="round">
              {/* Central Palmette & Diamond */}
              <polygon points="100,8 112,35 100,62 88,35" fill={c1 || '#C5A059'} opacity="0.25" />
              <polygon points="100,14 109,35 100,56 91,35" stroke={c1 || '#C5A059'} strokeWidth="2" />
              {/* Symmetrical Arabesque Spirals */}
              <path d="M 88,35 C 72,12 48,14 36,28 C 28,38 38,50 50,44 C 58,40 56,28 46,28" />
              <path d="M 112,35 C 128,12 152,14 164,28 C 172,38 162,50 150,44 C 142,40 144,28 154,28" />
              <path d="M 88,35 C 70,54 44,54 14,35" />
              <path d="M 112,35 C 130,54 156,54 186,35" />
              <circle cx="10" cy="35" r="3" fill={c1 || '#C5A059'} />
              <circle cx="190" cy="35" r="3" fill={c1 || '#C5A059'} />
            </g>
          </svg>
        );
      case 'title-sparkle-rays':
        return (
          <svg viewBox="0 0 60 60" width={el.width} height={el.height}>
            <line x1="18" y1="26" x2="8" y2="8" stroke={c1 || '#0B556C'} strokeWidth="5" strokeLinecap="round" />
            <line x1="28" y1="34" x2="48" y2="18" stroke={c2 || '#EAB308'} strokeWidth="5" strokeLinecap="round" />
            <line x1="28" y1="46" x2="52" y2="46" stroke={c1 || '#0B556C'} strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        );
      case 'school-doodle-trophy':
        return (
          <svg viewBox="0 0 120 120" width={el.width} height={el.height}>
            <g fill="none" stroke={c1 || '#CBD5E1'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 32,20 H 88 V 48 C 88,72 60,80 60,80 C 60,80 32,72 32,48 Z" />
              <path d="M 32,28 H 16 C 16,48 24,56 34,56" />
              <path d="M 88,28 H 104 C 104,48 96,56 86,56" />
              <path d="M 52,80 V 96 M 68,80 V 96" />
              <rect x="36" y="96" width="48" height="10" rx="3" />
            </g>
          </svg>
        );
      case 'school-doodle-books':
        return (
          <svg viewBox="0 0 130 100" width={el.width} height={el.height}>
            <g fill="none" stroke={c1 || '#CBD5E1'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Top Book */}
              <polygon points="26,24 84,14 112,26 54,36" />
              <path d="M 26,24 V 38 L 54,50 L 112,40 V 26" />
              {/* Middle Book */}
              <path d="M 20,46 L 50,58 L 116,46 L 116,60 L 50,72 L 20,60 Z" />
              {/* Bottom Book */}
              <path d="M 16,66 L 54,80 L 118,66 L 118,82 L 54,96 L 16,82 Z" />
            </g>
          </svg>
        );
      case 'school-doodle-backpack':
        return (
          <svg viewBox="0 0 120 140" width={el.width} height={el.height}>
            <g fill="none" stroke={c1 || '#CBD5E1'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 46,24 C 46,12 74,12 74,24" />
              <rect x="24" y="24" width="72" height="96" rx="26" />
              <rect x="34" y="68" width="52" height="40" rx="10" />
              <path d="M 34,82 H 86" />
              <rect x="46" y="88" width="10" height="12" rx="2" />
              <path d="M 14,64 H 24 V 104 H 14 Z M 96,64 H 106 V 104 H 96 Z" />
            </g>
          </svg>
        );
      case 'school-doodle-globe':
        return (
          <svg viewBox="0 0 120 140" width={el.width} height={el.height}>
            <g fill="none" stroke={c1 || '#CBD5E1'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="58" cy="58" r="36" />
              <path d="M 58,14 A 46,46 0 0 1 58,102" />
              <line x1="58" y1="102" x2="58" y2="120" />
              <path d="M 34,120 H 82" />
              <ellipse cx="58" cy="58" rx="18" ry="36" />
              <line x1="22" y1="58" x2="94" y2="58" />
            </g>
          </svg>
        );
      case 'school-doodle-pencils':
        return (
          <svg viewBox="0 0 110 130" width={el.width} height={el.height}>
            <g fill="none" stroke={c1 || '#CBD5E1'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 26,56 L 82,66 L 72,118 C 70,124 20,116 18,108 Z" />
              {/* Pencils sticking out */}
              <path d="M 38,56 L 44,20 L 52,10 L 56,22 L 50,58" />
              <path d="M 56,60 L 70,28 L 80,20 L 82,32 L 68,62" />
              <path d="M 70,63 L 88,36 L 96,28 L 98,40 L 80,65" />
            </g>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 100" width={el.width} height={el.height}>
            <circle cx="50" cy="50" r="40" fill="none" stroke={c1} strokeWidth="4" />
            <polygon points="50,16 60,40 84,40 65,55 72,80 50,65 28,80 35,55 16,40 40,40" fill={c1} />
          </svg>
        );
    }
  };

  const renderDividerElement = (el: DividerCertificateElement) => {
    const c = el.color || '#D4AF37';
    const w = el.width;
    const h = el.height;
    const midY = h / 2;
    const midX = w / 2;

    switch (el.variant) {
      case 'diamond-center':
        return (
          <g>
            <line x1="0" y1={midY} x2={midX - 28} y2={midY} stroke={c} strokeWidth={el.thickness || 2} />
            <line x1={midX + 28} y1={midY} x2={w} y2={midY} stroke={c} strokeWidth={el.thickness || 2} />
            <polygon points={`${midX},${midY - 8} ${midX + 12},${midY} ${midX},${midY + 8} ${midX - 12},${midY}`} fill={c} />
            <circle cx={midX - 20} cy={midY} r="3" fill={c} />
            <circle cx={midX + 20} cy={midY} r="3" fill={c} />
          </g>
        );
      case 'royal-flourish':
        return (
          <g>
            <path d={`M 10 ${midY} Q ${midX * 0.5} ${midY - 10}, ${midX - 16} ${midY}`} fill="none" stroke={c} strokeWidth={el.thickness || 2} />
            <path d={`M ${midX + 16} ${midY} Q ${midX * 1.5} ${midY - 10}, ${w - 10} ${midY}`} fill="none" stroke={c} strokeWidth={el.thickness || 2} />
            <polygon points={`${midX},${midY - 9} ${midX + 14},${midY} ${midX},${midY + 9} ${midX - 14},${midY}`} fill={c} />
          </g>
        );
      case 'islamic-knot':
        return (
          <g>
            <line x1="0" y1={midY} x2={midX - 34} y2={midY} stroke={c} strokeWidth={el.thickness || 2} />
            <line x1={midX + 34} y1={midY} x2={w} y2={midY} stroke={c} strokeWidth={el.thickness || 2} />
            <rect x={midX - 9} y={midY - 9} width="18" height="18" fill="none" stroke={c} strokeWidth="2" />
            <rect x={midX - 9} y={midY - 9} width="18" height="18" fill="none" stroke={c} strokeWidth="2" transform={`rotate(45 ${midX} ${midY})`} />
          </g>
        );
      case 'double-line':
        return (
          <g>
            <line x1="0" y1={midY - 3} x2={w} y2={midY - 3} stroke={c} strokeWidth={el.thickness || 2} />
            <line x1="25" y1={midY + 3} x2={w - 25} y2={midY + 3} stroke={c} strokeWidth="1.2" />
          </g>
        );
      case 'dashed-gold':
        return <line x1="0" y1={midY} x2={w} y2={midY} stroke={c} strokeWidth={el.thickness || 2} strokeDasharray="10 6" />;
      case 'stars-divider':
        return (
          <g>
            <line x1="0" y1={midY} x2={midX - 42} y2={midY} stroke={c} strokeWidth="1.8" />
            <line x1={midX + 42} y1={midY} x2={w} y2={midY} stroke={c} strokeWidth="1.8" />
            <circle cx={midX} cy={midY} r="5.5" fill={c} />
            <circle cx={midX - 20} cy={midY} r="3.5" fill={c} />
            <circle cx={midX + 20} cy={midY} r="3.5" fill={c} />
          </g>
        );
      default:
        return (
          <g>
            <line x1="20" y1={midY} x2={w - 20} y2={midY} stroke={c} strokeWidth={el.thickness || 2} strokeLinecap="round" />
            <circle cx={midX} cy={midY} r="3.5" fill={c} />
          </g>
        );
    }
  };

  const renderSealElement = (el: SealCertificateElement) => {
    const primary = el.color || '#B8860B';
    const accent = el.accentColor || '#D4AF37';
    const w = el.width;
    const h = el.height;

    if (el.variant === 'ideal-student-medal') {
      return (
        <svg viewBox="0 0 160 190" width={w} height={h}>
          <defs>
            <linearGradient id={`ideal-gold-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF0A8" />
              <stop offset="45%" stopColor={accent || '#EAB308'} />
              <stop offset="85%" stopColor={primary || '#A16207'} />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
          </defs>
          {/* Gold Ribbons at Bottom */}
          <polygon points="48,118 22,174 46,164 56,184 74,126" fill={`url(#ideal-gold-${el.id})`} stroke={primary} strokeWidth="1.2" />
          <polygon points="112,118 138,174 114,164 104,184 86,126" fill={`url(#ideal-gold-${el.id})`} stroke={primary} strokeWidth="1.2" />
          {/* Scalloped Gold Sunburst Outer Disc */}
          <polygon
            points="80,8 92,16 106,12 114,24 128,26 131,40 144,48 141,62 150,74 142,86 146,100 134,109 132,123 118,127 110,139 96,136 84,146 72,138 58,144 48,133 34,135 28,121 15,116 16,102 6,91 12,78 6,64 17,54 17,40 30,34 36,20 50,20 60,8 73,13"
            fill={`url(#ideal-gold-${el.id})`}
            stroke={primary}
            strokeWidth="1.8"
          />
          <circle cx="80" cy="76" r="54" fill={`url(#ideal-gold-${el.id})`} stroke="#1E293B" strokeWidth="2.5" />
          <circle cx="80" cy="76" r="48" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 2" />
          <text
            x="80"
            y="68"
            textAnchor="middle"
            fill="#111827"
            fontFamily="Cairo"
            fontSize="18"
            fontWeight="800"
          >
            {el.primaryText}
          </text>
          <text
            x="80"
            y="94"
            textAnchor="middle"
            fill="#111827"
            fontFamily="Cairo"
            fontSize="21"
            fontWeight="900"
          >
            {el.secondaryText}
          </text>
        </svg>
      );
    }

    if (el.variant === 'anta-mumayaz-medal') {
      return (
        <svg viewBox="0 0 200 270" width={w} height={h}>
          <defs>
            <linearGradient id={`am-gold-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor={accent || '#D4AF37'} />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>
          {/* Navy & Gold Bottom Ribbons */}
          <polygon points="56,158 34,255 64,238 88,262 96,166" fill={primary || '#05204A'} stroke={`url(#am-gold-${el.id})`} strokeWidth="4" />
          <polygon points="144,158 166,255 136,238 112,262 104,166" fill={primary || '#05204A'} stroke={`url(#am-gold-${el.id})`} strokeWidth="4" />
          {/* Scalloped Metallic Gold Rim */}
          <polygon
            points="100,10 116,18 134,14 144,28 162,32 166,49 182,60 178,78 190,94 180,110 184,128 170,140 168,158 150,163 140,180 122,177 108,189 92,179 76,188 62,175 44,177 36,160 18,154 18,136 6,124 13,106 6,89 18,75 18,57 35,49 42,31 60,30 72,15 89,20"
            fill={`url(#am-gold-${el.id})`}
            stroke="#854D0E"
            strokeWidth="2"
          />
          <circle cx="100" cy="100" r="70" fill={primary || '#05204A'} stroke={`url(#am-gold-${el.id})`} strokeWidth="4.5" />
          <circle cx="100" cy="100" r="61" fill="none" stroke={`url(#am-gold-${el.id})`} strokeWidth="1.8" />
          {/* White Laurel Wreath & Bottom Star */}
          <path d="M 84,142 C 54,132 48,92 64,62" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeDasharray="8 4" strokeLinecap="round" />
          <path d="M 116,142 C 146,132 152,92 136,62" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeDasharray="8 4" strokeLinecap="round" />
          <polygon points="100,136 103,143 111,143 105,148 107,155 100,150 93,155 95,148 89,143 97,143" fill="#FFFFFF" />
          {/* Editable Center Text */}
          <text
            x="100"
            y="88"
            textAnchor="middle"
            fill={`url(#am-gold-${el.id})`}
            fontFamily="Cairo"
            fontSize="24"
            fontWeight="800"
          >
            {el.primaryText}
          </text>
          <text
            x="100"
            y="118"
            textAnchor="middle"
            fill={`url(#am-gold-${el.id})`}
            fontFamily="Cairo"
            fontSize="26"
            fontWeight="900"
          >
            {el.secondaryText}
          </text>
        </svg>
      );
    }

    if (el.variant === 'navy-gold-future-seal') {
      return (
        <svg viewBox="0 0 160 160" width={w} height={h}>
          {/* Scalloped Dark Navy Seal */}
          <polygon
            points="80,8 93,14 108,11 116,23 131,26 134,41 147,50 144,64 153,77 145,90 148,105 136,115 134,130 119,134 111,147 96,145 84,154 71,146 57,153 46,142 31,144 25,130 11,125 11,110 2,99 8,85 2,71 12,60 12,45 25,38 31,24 46,23 56,11 70,15"
            fill={primary || '#05204A'}
            stroke={accent || '#D4AF37'}
            strokeWidth="2.5"
          />
          <circle cx="80" cy="80" r="58" fill={primary || '#05204A'} stroke={accent || '#D4AF37'} strokeWidth="3.5" />
          <circle cx="80" cy="80" r="50" fill="none" stroke={accent || '#D4AF37'} strokeWidth="1.2" />
          {/* Laurel Wreath */}
          <path d="M 68,120 C 42,110 38,76 52,50" fill="none" stroke={accent || '#D4AF37'} strokeWidth="4" strokeDasharray="7 3" strokeLinecap="round" />
          <path d="M 92,120 C 118,110 122,76 108,50" fill="none" stroke={accent || '#D4AF37'} strokeWidth="4" strokeDasharray="7 3" strokeLinecap="round" />
          {/* 3 Top Stars & 1 Bottom Star */}
          <polygon points="80,36 82,42 88,42 83,46 85,52 80,48 75,52 77,46 72,42 78,42" fill={accent || '#D4AF37'} />
          <circle cx="66" cy="46" r="2.5" fill={accent || '#D4AF37'} />
          <circle cx="94" cy="46" r="2.5" fill={accent || '#D4AF37'} />
          <polygon points="80,118 82,123 87,123 83,126 84,131 80,128 76,131 77,126 73,123 78,123" fill={accent || '#D4AF37'} />
          {/* Editable Text */}
          <text
            x="80"
            y="76"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="Cairo"
            fontSize="13.5"
            fontWeight="800"
          >
            {el.primaryText}
          </text>
          <text
            x="80"
            y="96"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="Cairo"
            fontSize="13.5"
            fontWeight="800"
          >
            {el.secondaryText}
          </text>
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 140 140" width={w} height={h}>
        {/* Ribbons at bottom for wax/excellence seals */}
        {(el.variant === 'gold-wax-seal' || el.variant === 'excellence-star-seal') && (
          <g>
            <polygon points="48,100 34,136 52,126 62,138 64,102" fill={primary} />
            <polygon points="92,100 106,136 88,126 78,138 76,102" fill={primary} />
          </g>
        )}

        {/* Outer jagged star ring or double circle */}
        {el.variant === 'gold-wax-seal' || el.variant === 'excellence-star-seal' ? (
          <polygon
            points="70,8 82,18 98,14 104,29 120,33 118,49 131,60 122,74 128,89 113,97 111,113 95,113 85,126 70,119 55,126 45,113 29,113 27,97 12,89 18,74 9,60 22,49 20,33 36,29 42,14 58,18"
            fill={primary}
            stroke={accent}
            strokeWidth="2.5"
          />
        ) : (
          <circle cx="70" cy="68" r="56" fill="none" stroke={primary} strokeWidth="4" />
        )}

        <circle
          cx="70"
          cy="68"
          r="46"
          fill={el.variant === 'official-circular-stamp' ? 'none' : primary}
          stroke={el.variant === 'official-circular-stamp' ? primary : accent}
          strokeWidth="2.5"
          strokeDasharray={el.variant === 'official-circular-stamp' ? '5 3' : undefined}
        />

        <circle cx="70" cy="68" r="38" fill="none" stroke={el.variant === 'official-circular-stamp' ? primary : '#FFFFFF'} strokeWidth="1.2" opacity="0.85" />

        {/* Stars & Text inside Seal */}
        <text
          x="70"
          y="58"
          textAnchor="middle"
          fill={el.variant === 'official-circular-stamp' ? primary : '#FFFFFF'}
          fontFamily="Cairo"
          fontSize="11.5"
          fontWeight="800"
        >
          {el.primaryText}
        </text>
        <line
          x1="44"
          y1="66"
          x2="96"
          y2="66"
          stroke={el.variant === 'official-circular-stamp' ? primary : accent}
          strokeWidth="1.5"
        />
        <text
          x="70"
          y="80"
          textAnchor="middle"
          fill={el.variant === 'official-circular-stamp' ? primary : accent}
          fontFamily="Plus Jakarta Sans"
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="0.8"
        >
          {el.secondaryText}
        </text>
        <polygon
          points="70,34 72,40 78,40 73,44 75,50 70,46 65,50 67,44 62,40 68,40"
          fill={el.variant === 'official-circular-stamp' ? primary : accent}
        />
      </svg>
    );
  };

  const renderSignatureElement = (el: SignatureCertificateElement) => {
    const w = el.width;
    const h = el.height;

    return (
      <svg viewBox="0 0 230 105" width={w} height={h} preserveAspectRatio="xMidYMid meet">
        {/* Signature graphic or calligraphic text */}
        {el.signatureMode === 'text' || !el.signatureDataUrl ? (
          <text
            x={115}
            y={36}
            textAnchor="middle"
            direction="rtl"
            unicodeBidi="embed"
            style={{ direction: 'rtl', unicodeBidi: 'embed' }}
            fill={el.color || '#0B192C'}
            fontFamily={el.fontFamily || 'Aref Ruqaa'}
            fontSize="24"
            fontStyle="italic"
            opacity="0.88"
          >
            {el.signatureText || el.signerName}
          </text>
        ) : (
          <image
            href={el.signatureDataUrl}
            x={40}
            y={2}
            width={150}
            height={46}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* Signature Line */}
        {el.showLine && (
          <line
            x1={20}
            y1={52}
            x2={210}
            y2={52}
            stroke={el.color || '#0B192C'}
            strokeWidth="1.5"
            strokeOpacity="0.45"
          />
        )}

        {/* Signer Name */}
        <text
          x={115}
          y={74}
          textAnchor="middle"
          direction="rtl"
          unicodeBidi="embed"
          style={{ direction: 'rtl', unicodeBidi: 'embed' }}
          fill={el.color || '#0B192C'}
          fontFamily="Cairo"
          fontSize="15.5"
          fontWeight="700"
        >
          {el.signerName}
        </text>

        {/* Signer Job Title */}
        <text
          x={115}
          y={94}
          textAnchor="middle"
          direction="rtl"
          unicodeBidi="embed"
          style={{ direction: 'rtl', unicodeBidi: 'embed' }}
          fill={el.color || '#0B192C'}
          fontFamily="Tajawal"
          fontSize="13"
          fontWeight="500"
          opacity="0.78"
        >
          {el.signerTitle}
        </text>
        <rect x="0" y="0" width="230" height="105" fill="transparent" />
      </svg>
    );
  };

  const renderImageElement = (el: ImageCertificateElement) => {
    const clipId = `clip-img-${el.id}`;
    return (
      <g>
        {el.borderRadius > 0 && (
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width={el.width} height={el.height} rx={el.borderRadius} />
            </clipPath>
          </defs>
        )}
        <image
          href={el.src}
          x="0"
          y="0"
          width={el.width}
          height={el.height}
          preserveAspectRatio={el.objectFit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
          clipPath={el.borderRadius > 0 ? `url(#${clipId})` : undefined}
        />
        {el.borderWidth && el.borderWidth > 0 ? (
          <rect
            x="0"
            y="0"
            width={el.width}
            height={el.height}
            rx={el.borderRadius || 0}
            fill="none"
            stroke={el.borderColor || '#D4AF37'}
            strokeWidth={el.borderWidth}
          />
        ) : null}
      </g>
    );
  };

  const renderTextElement = (el: TextCertificateElement) => {
    // Auto-fit long names if enabled
    let effectiveFontSize = el.fontSize;
    if (el.autoFitLongName && el.content.length > 28) {
      const ratio = Math.max(0.62, 28 / el.content.length);
      effectiveFontSize = Math.round(el.fontSize * ratio);
    }

    const avgCharWidth = effectiveFontSize * 0.52;
    const maxCharsPerLine = Math.max(12, Math.floor(el.width / avgCharWidth));
    const lines = wrapTextLines(el.content, maxCharsPerLine);

    const isRtl = el.direction === 'rtl';
    const anchor =
      el.align === 'center'
        ? 'middle'
        : el.align === 'right'
        ? isRtl
          ? 'start'
          : 'end'
        : isRtl
        ? 'end'
        : 'start';
    const textX = el.align === 'center' ? el.width / 2 : el.align === 'right' ? el.width - 8 : 8;
    const lineStep = effectiveFontSize * (el.lineHeight || 1.4);

    return (
      <g>
        <rect x="0" y="0" width={el.width} height={el.height} fill="transparent" />
        <text
          x={textX}
          y={effectiveFontSize}
          textAnchor={anchor}
          direction={el.direction}
          unicodeBidi="embed"
          style={{ direction: el.direction, unicodeBidi: 'embed' }}
          fontFamily={el.fontFamily}
          fontSize={effectiveFontSize}
          fontWeight={el.fontWeight}
          fontStyle={el.italic ? 'italic' : 'normal'}
          fill={el.color}
          letterSpacing={el.letterSpacing ? `${el.letterSpacing}px` : undefined}
          stroke={el.strokeColor && el.strokeWidth ? el.strokeColor : undefined}
          strokeWidth={el.strokeWidth || undefined}
          filter={el.textShadow ? `url(#drop-shadow-${uid})` : undefined}
        >
          {lines.map((line, idx) => (
            <tspan
              key={idx}
              x={textX}
              dy={idx === 0 ? 0 : lineStep}
              direction={el.direction}
              unicodeBidi="embed"
              style={{ direction: el.direction, unicodeBidi: 'embed' }}
            >
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  const marginPx = Math.round((pageConfig.marginMm / pageConfig.widthMm) * widthPx);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${widthPx} ${heightPx}`}
      width="100%"
      height="100%"
      className={`select-none ${className}`}
      onMouseDown={(e) => {
        if (interactive && e.target === e.currentTarget && onSelectElement) {
          onSelectElement(null);
        }
      }}
    >
      <defs>
        {pageConfig.backgroundGradientEnd && !pageConfig.whiteForPrint && !pageConfig.transparentBackground && (
          <linearGradient id={`bg-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={pageConfig.backgroundColor} />
            <stop offset="100%" stopColor={pageConfig.backgroundGradientEnd} />
          </linearGradient>
        )}
        <filter id={`drop-shadow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* 1. Background Surface */}
      {!pageConfig.transparentBackground && (
        <rect
          x="0"
          y="0"
          width={widthPx}
          height={heightPx}
          fill={
            pageConfig.whiteForPrint
              ? '#FFFFFF'
              : pageConfig.backgroundGradientEnd
              ? `url(#bg-grad-${uid})`
              : pageConfig.backgroundColor
          }
          onMouseDown={() => interactive && onSelectElement && onSelectElement(null)}
        />
      )}

      {/* 2. Background Decorative Pattern */}
      {renderBackgroundPattern()}

      {/* 3. Architectural Certificate Frame */}
      {renderFrame()}

      {/* 4. Optional Editor Grid Overlay */}
      {interactive && !exportMode && showGrid && (
        <g opacity="0.22" pointerEvents="none">
          <pattern id={`editor-grid-${uid}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0284C7" strokeWidth="0.8" />
          </pattern>
          <rect width={widthPx} height={heightPx} fill={`url(#editor-grid-${uid})`} />
        </g>
      )}

      {/* 5. Elements Layer Stack */}
      {sortedElements.map((el) => {
        if (!el.visible) return null;
        const isSelected = interactive && !exportMode && selectedElementId === el.id;
        const centerX = el.x + el.width / 2;
        const centerY = el.y + el.height / 2;

        return (
          <g
            key={el.id}
            transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0} ${el.width / 2} ${el.height / 2})`}
            opacity={el.opacity ?? 1}
            style={{ cursor: interactive ? (el.locked ? 'not-allowed' : 'move') : 'default' }}
            onMouseDown={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              onSelectElement?.(el.id);
              if (!el.locked) {
                onStartDragElement?.(e, el);
              }
            }}
            onTouchStart={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              onSelectElement?.(el.id);
              if (!el.locked) {
                onStartDragElement?.(e, el);
              }
            }}
            onDoubleClick={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              if (!el.locked) {
                onDoubleClickElement?.(el);
                if (el.type === 'text') {
                  onDoubleClickText?.(el);
                }
              }
            }}
          >
            {el.type === 'text' && renderTextElement(el)}
            {el.type === 'ornament' && renderOrnamentElement(el)}
            {el.type === 'divider' && renderDividerElement(el)}
            {el.type === 'seal' && renderSealElement(el)}
            {el.type === 'signature' && renderSignatureElement(el)}
            {el.type === 'image' && renderImageElement(el)}

            {/* Selection Box & Resize Handles in Editor */}
            {isSelected && (
              <g>
                <rect
                  x="-4"
                  y="-4"
                  width={el.width + 8}
                  height={el.height + 8}
                  fill="none"
                  stroke={el.locked ? '#EF4444' : '#2563EB'}
                  strokeWidth="2"
                  strokeDasharray={el.locked ? '4 4' : undefined}
                  pointerEvents="none"
                />
                {!el.locked && onStartResizeElement && (
                  <>
                    {(
                      [
                        ['nw', -6, -6],
                        ['ne', el.width - 2, -6],
                        ['sw', -6, el.height - 2],
                        ['se', el.width - 2, el.height - 2],
                        ['w', -6, el.height / 2 - 5],
                        ['e', el.width - 2, el.height / 2 - 5],
                      ] as const
                    ).map(([handle, hx, hy]) => (
                      <rect
                        key={handle}
                        x={hx}
                        y={hy}
                        width="10"
                        height="10"
                        rx="2"
                        fill="#FFFFFF"
                        stroke="#2563EB"
                        strokeWidth="2"
                        style={{ cursor: `${handle}-resize` }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          onStartResizeElement(e, el, handle);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          onStartResizeElement(e, el, handle);
                        }}
                      />
                    ))}
                  </>
                )}
              </g>
            )}
            {/* Suppress unused variable warning */}
            {centerX && centerY ? null : null}
          </g>
        );
      })}

      {/* 6. Print Margin & Safe Zone Guides (Editor only) */}
      {interactive && !exportMode && pageConfig.showPrintMargin && (
        <rect
          x={marginPx}
          y={marginPx}
          width={widthPx - marginPx * 2}
          height={heightPx - marginPx * 2}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          pointerEvents="none"
        />
      )}

      {interactive && !exportMode && pageConfig.showSafeZone && (
        <rect
          x={64}
          y={64}
          width={widthPx - 128}
          height={heightPx - 128}
          fill="none"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          pointerEvents="none"
        />
      )}

      {/* 7. Smart Alignment Snap Lines */}
      {interactive && !exportMode && snapLines?.x !== undefined && (
        <line
          x1={snapLines.x}
          y1={0}
          x2={snapLines.x}
          y2={heightPx}
          stroke="#EC4899"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          pointerEvents="none"
        />
      )}
      {interactive && !exportMode && snapLines?.y !== undefined && (
        <line
          x1={0}
          y1={snapLines.y}
          x2={widthPx}
          y2={snapLines.y}
          stroke="#EC4899"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          pointerEvents="none"
        />
      )}
    </svg>
  );
};
