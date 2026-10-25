import { CertificateDesign } from '../types/certificate';

export function createSvgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

// =========================================================================
// 1. OFFICIAL SAUDI MINISTRY OF EDUCATION LOGO (شعار وزارة التعليم الرسمي)
// =========================================================================
export const SAUDI_MOE_LOGO_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140" width="320" height="140">
  <!-- Ministry of Education Iconic Dot Cluster (Palm / Book / Seedling Formation) -->
  <g transform="translate(230, 68)">
    <!-- Central upright dots -->
    <circle cx="0" cy="-38" r="4.2" fill="#007A65"/>
    <circle cx="0" cy="-24" r="5.2" fill="#007A65"/>
    <circle cx="0" cy="-8" r="6.0" fill="#007A65"/>
    <circle cx="0" cy="8" r="5.8" fill="#007A65"/>
    <circle cx="0" cy="24" r="5.0" fill="#007A65"/>
    <circle cx="0" cy="38" r="4.0" fill="#007A65"/>

    <!-- Right sweeping arcs -->
    <circle cx="14" cy="-32" r="4.2" fill="#008E76"/>
    <circle cx="16" cy="-16" r="5.2" fill="#008E76"/>
    <circle cx="16" cy="2" r="5.6" fill="#008E76"/>
    <circle cx="14" cy="18" r="5.0" fill="#008E76"/>
    <circle cx="10" cy="32" r="3.8" fill="#008E76"/>

    <circle cx="28" cy="-22" r="4.0" fill="#00A88F"/>
    <circle cx="32" cy="-6" r="4.8" fill="#00A88F"/>
    <circle cx="30" cy="10" r="4.8" fill="#00A88F"/>
    <circle cx="24" cy="24" r="3.6" fill="#00A88F"/>

    <circle cx="42" cy="-10" r="3.6" fill="#B49A6C"/>
    <circle cx="46" cy="4" r="4.2" fill="#B49A6C"/>
    <circle cx="40" cy="18" r="3.4" fill="#B49A6C"/>

    <circle cx="56" cy="2" r="3.2" fill="#C5A059"/>

    <!-- Left sweeping arcs -->
    <circle cx="-14" cy="-32" r="4.2" fill="#008E76"/>
    <circle cx="-16" cy="-16" r="5.2" fill="#008E76"/>
    <circle cx="-16" cy="2" r="5.6" fill="#008E76"/>
    <circle cx="-14" cy="18" r="5.0" fill="#008E76"/>
    <circle cx="-10" cy="32" r="3.8" fill="#008E76"/>

    <circle cx="-28" cy="-22" r="4.0" fill="#00A88F"/>
    <circle cx="-32" cy="-6" r="4.8" fill="#00A88F"/>
    <circle cx="-30" cy="10" r="4.8" fill="#00A88F"/>
    <circle cx="-24" cy="24" r="3.6" fill="#00A88F"/>

    <circle cx="-42" cy="-10" r="3.6" fill="#B49A6C"/>
    <circle cx="-46" cy="4" r="4.2" fill="#B49A6C"/>
    <circle cx="-40" cy="18" r="3.4" fill="#B49A6C"/>

    <circle cx="-56" cy="2" r="3.2" fill="#C5A059"/>
  </g>

  <!-- Typography Block -->
  <g fill="#007A65" text-anchor="end" font-family="'Cairo', 'Tajawal', sans-serif">
    <text x="155" y="44" font-size="13.5" font-weight="600" letter-spacing="0.5" fill="#5A6B72">المملكة العربية السعودية</text>
    <text x="155" y="78" font-size="28" font-weight="800" fill="#007A65" letter-spacing="0.2">وزارة التعلـيـم</text>
    <text x="155" y="99" font-size="11.5" font-weight="700" letter-spacing="1.2" fill="#008E76" font-family="'Plus Jakarta Sans', sans-serif">Ministry of Education</text>
  </g>
</svg>
`);

// =========================================================================
// 2. GULF TALENT DAY 2026 EMBLEM (شعار اليوم الخليجي للموهبة والإبداع 2026)
// =========================================================================
export const GULF_TALENT_2026_LOGO_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150" width="320" height="150">
  <defs>
    <linearGradient id="gtGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00A88F"/>
      <stop offset="100%" stop-color="#007A65"/>
    </linearGradient>
    <linearGradient id="gtGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E5C77A"/>
      <stop offset="100%" stop-color="#B49A6C"/>
    </linearGradient>
  </defs>

  <!-- Stylized Figure with Creative Wings / Spark -->
  <g transform="translate(68, 70)">
    <!-- Central Head / Spark -->
    <circle cx="0" cy="-36" r="10.5" fill="url(#gtGoldGrad)"/>
    <polygon points="0,-54 3,-42 12,-42 4,-36 7,-24 0,-30 -7,-24 -4,-36 -12,-42 -3,-42" fill="#E5C77A" opacity="0.85"/>

    <!-- Dynamic Flowing Wings / Petals -->
    <!-- Right Wing -->
    <path d="M 0,-18 C 18,-38 46,-32 52,-14 C 54,-4 44,14 26,22 C 14,27 4,16 0,8 Z" fill="url(#gtGreenGrad)"/>
    <path d="M 6,-10 C 22,-24 40,-16 42,-4 C 44,6 32,16 18,18 Z" fill="url(#gtGoldGrad)" opacity="0.9"/>
    <!-- Left Wing -->
    <path d="M 0,-18 C -18,-38 -46,-32 -52,-14 C -54,-4 -44,14 -26,22 C -14,27 -4,16 0,8 Z" fill="url(#gtGreenGrad)"/>
    <path d="M -6,-10 C -22,-24 -40,-16 -42,-4 C -44,6 -32,16 -18,18 Z" fill="url(#gtGoldGrad)" opacity="0.9"/>

    <!-- Base trunk & roots -->
    <path d="M -4,12 C -6,28 -12,42 -22,48 C -8,44 0,38 4,24 Z" fill="#007A65"/>
    <path d="M 4,12 C 6,28 12,42 22,48 C 8,44 0,38 -4,24 Z" fill="#007A65"/>
  </g>

  <!-- Typography Block -->
  <g font-family="'Cairo', 'Tajawal', sans-serif" text-anchor="start">
    <text x="135" y="44" font-size="14" font-weight="700" fill="#B49A6C" letter-spacing="1">اليـوم الخلـيـجي</text>
    <text x="135" y="74" font-size="22" font-weight="800" fill="#007A65">للموهبة والإبداع</text>
    <rect x="135" y="86" width="160" height="2" fill="url(#gtGoldGrad)"/>
    <text x="135" y="106" font-size="16" font-weight="800" fill="#B49A6C" font-family="'Plus Jakarta Sans', sans-serif" letter-spacing="2">2026</text>
    <text x="186" y="105" font-size="10" font-weight="700" fill="#007A65" font-family="'Plus Jakarta Sans', sans-serif" letter-spacing="0.8">GULF TALENT DAY</text>
  </g>
</svg>
`);

// =========================================================================
// 3. GULF TALENT TOP-RIGHT CORNER GEOMETRIC ACCENT (زخرفة الزاوية الهندسية العليا)
// =========================================================================
export const GULF_TALENT_CORNER_TR_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" width="240" height="200">
  <defs>
    <linearGradient id="cgGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00A88F"/>
      <stop offset="100%" stop-color="#007A65"/>
    </linearGradient>
    <linearGradient id="cgGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E2C983"/>
      <stop offset="100%" stop-color="#B49A6C"/>
    </linearGradient>
  </defs>
  <!-- Modern Geometric Facets -->
  <polygon points="240,0 240,150 140,0" fill="url(#cgGreen)"/>
  <polygon points="240,150 240,190 90,0 140,0" fill="url(#cgGold)"/>
  <polygon points="90,0 45,0 240,210 240,190" fill="#005B4C"/>
  <polygon points="45,0 15,0 240,230 240,210" fill="#C5A059" opacity="0.85"/>
</svg>
`);

// =========================================================================
// 4. GULF TALENT BOTTOM-LEFT CORNER GEOMETRIC ACCENT (زخرفة الزاوية الهندسية السفلى)
// =========================================================================
export const GULF_TALENT_CORNER_BL_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" width="240" height="200">
  <defs>
    <linearGradient id="cgGreen2" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#00A88F"/>
      <stop offset="100%" stop-color="#007A65"/>
    </linearGradient>
    <linearGradient id="cgGold2" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#E2C983"/>
      <stop offset="100%" stop-color="#B49A6C"/>
    </linearGradient>
  </defs>
  <!-- Modern Geometric Symmetrical Facets -->
  <polygon points="0,200 0,50 100,200" fill="url(#cgGreen2)"/>
  <polygon points="0,50 0,10 150,200 100,200" fill="url(#cgGold2)"/>
  <polygon points="150,200 195,200 0,-10 0,10" fill="#005B4C"/>
  <polygon points="195,200 225,200 0,-30 0,-10" fill="#C5A059" opacity="0.85"/>
</svg>
`);

// =========================================================================
// 5. GULF TALENT DOUBLE BORDER FRAME (إطار الشهادة الذهبي المزدوج)
// =========================================================================
export const GULF_TALENT_FRAME_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1015 702" width="1015" height="702">
  <!-- Outer delicate gray/sand line -->
  <rect x="2" y="2" width="1011" height="698" fill="none" stroke="#E2E8F0" stroke-width="1.5"/>
  <!-- Inner Primary Gold Rectangle -->
  <rect x="14" y="14" width="987" height="674" fill="none" stroke="#B49A6C" stroke-width="2"/>
  <!-- Corner Notch Accents -->
  <rect x="10" y="10" width="8" height="8" fill="#007A65"/>
  <rect x="997" y="10" width="8" height="8" fill="#007A65"/>
  <rect x="10" y="684" width="8" height="8" fill="#007A65"/>
  <rect x="997" y="684" width="8" height="8" fill="#007A65"/>
</svg>
`);

// =========================================================================
// 6. WORLD SPACE WEEK 2025 EMBLEM (شعار أسبوع الفضاء العالمي 2025)
// =========================================================================
export const SPACE_WEEK_2025_LOGO_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150" width="320" height="150">
  <defs>
    <linearGradient id="swGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7059A6"/>
      <stop offset="100%" stop-color="#3B2D73"/>
    </linearGradient>
    <linearGradient id="swGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>

  <!-- Orbital Planet Icon -->
  <g transform="translate(65, 72)">
    <circle cx="0" cy="0" r="32" fill="url(#swGrad1)"/>
    <!-- Atmosphere Glow -->
    <circle cx="0" cy="0" r="28" fill="none" stroke="#A78BFA" stroke-width="1.5" opacity="0.6"/>
    <!-- Planet ring tilted -->
    <ellipse cx="0" cy="0" rx="46" ry="14" fill="none" stroke="url(#swGoldGrad)" stroke-width="3" transform="rotate(-25)"/>
    <!-- Little orbiting satellite / moon -->
    <circle cx="36" cy="-18" r="4" fill="#FCD34D"/>
    <!-- Twinkle stars inside badge -->
    <polygon points="-12,-10 -9,-8 -7,-12 -8,-7 -5,-5 -8,-3 -7,2 -10,-2 -14,0 -11,-5" fill="#FFFFFF" opacity="0.9" transform="scale(0.7)"/>
    <polygon points="12,12 15,14 17,10 16,15 19,17 16,19 17,24 14,20 10,22 13,17" fill="#FCD34D" opacity="0.9" transform="scale(0.7)"/>
  </g>

  <!-- Typography Block -->
  <g font-family="'Cairo', 'Tajawal', sans-serif" text-anchor="start">
    <text x="130" y="44" font-size="15" font-weight="700" fill="#7059A6">أسبوع الفضاء العالمي</text>
    <text x="130" y="74" font-size="20" font-weight="800" fill="#3B2D73" font-family="'Plus Jakarta Sans', sans-serif" letter-spacing="1">WORLD SPACE WEEK</text>
    <rect x="130" y="85" width="175" height="2" fill="url(#swGoldGrad)"/>
    <text x="130" y="106" font-size="12" font-weight="700" fill="#F59E0B" font-family="'Plus Jakarta Sans', sans-serif" letter-spacing="2">OCTOBER 4 - 10 • 2025</text>
  </g>
</svg>
`);

// =========================================================================
// 7. PLANET SATURN ILLUSTRATION (كوكب زحل والمدارات الفضائية)
// =========================================================================
export const SPACE_SATURN_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 130" width="180" height="130">
  <defs>
    <linearGradient id="saturnBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E9D5FF"/>
      <stop offset="40%" stop-color="#A855F7"/>
      <stop offset="80%" stop-color="#4C1D95"/>
      <stop offset="100%" stop-color="#2E1065"/>
    </linearGradient>
    <linearGradient id="saturnRings" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>

  <g transform="translate(90, 65)">
    <!-- Back half of planetary rings -->
    <ellipse cx="0" cy="0" rx="76" ry="24" fill="none" stroke="url(#saturnRings)" stroke-width="7" stroke-dasharray="140 0" transform="rotate(-24)" opacity="0.85"/>
    <ellipse cx="0" cy="0" rx="66" ry="20" fill="none" stroke="#FDE68A" stroke-width="2" transform="rotate(-24)" opacity="0.6"/>

    <!-- Planet Sphere -->
    <circle cx="0" cy="0" r="38" fill="url(#saturnBody)"/>
    <!-- Atmosphere Banding -->
    <path d="M -36,-10 Q 0,-2 36,-10" fill="none" stroke="#C084FC" stroke-width="3" opacity="0.45"/>
    <path d="M -38,4 Q 0,12 38,4" fill="none" stroke="#E9D5FF" stroke-width="2.5" opacity="0.5"/>
    <path d="M -34,18 Q 0,26 34,18" fill="none" stroke="#581C87" stroke-width="4" opacity="0.6"/>

    <!-- Front half of planetary rings passing in front of sphere -->
    <path d="M -70,28 A 76 24 0 0 0 70,-28" fill="none" stroke="url(#saturnRings)" stroke-width="7" transform="rotate(-24)"/>
    <path d="M -60,24 A 66 20 0 0 0 60,-24" fill="none" stroke="#FDE68A" stroke-width="2" transform="rotate(-24)"/>

    <!-- Little Sparkle Stars around Saturn -->
    <polygon points="-65,-35 -63,-30 -58,-30 -62,-26 -60,-20 -65,-24 -70,-20 -68,-26 -72,-30 -67,-30" fill="#FDE68A" opacity="0.9" transform="scale(0.8)"/>
    <polygon points="70,40 72,44 76,44 73,47 75,51 70,48 65,51 67,47 64,44 68,44" fill="#FFFFFF" opacity="0.9" transform="scale(0.7)"/>
    <circle cx="-50" cy="35" r="2.5" fill="#C084FC"/>
    <circle cx="55" cy="-35" r="3" fill="#FDE68A"/>
  </g>
</svg>
`);

// =========================================================================
// 8. DYNAMIC SPACE ROCKET ILLUSTRATION (الصاروخ الفضائي مع لهب الانطلاق)
// =========================================================================
export const SPACE_ROCKET_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#EF4444"/>
    </linearGradient>
  </defs>

  <!-- Rocket Flying Diagonally (45 deg) -->
  <g transform="translate(80, 80) rotate(-45)">
    <!-- Exhaust Smoke Puffs -->
    <ellipse cx="0" cy="62" rx="14" ry="7" fill="#E2E8F0" opacity="0.45"/>
    <ellipse cx="-6" cy="74" rx="18" ry="8" fill="#E2E8F0" opacity="0.3"/>
    <ellipse cx="6" cy="85" rx="22" ry="9" fill="#E2E8F0" opacity="0.2"/>

    <!-- Rocket Flame -->
    <path d="M -9,38 C -14,54 0,70 0,72 C 0,70 14,54 9,38 Z" fill="url(#flameGrad)"/>
    <path d="M -5,38 C -8,48 0,58 0,60 C 0,58 8,48 5,38 Z" fill="#FEF08A"/>

    <!-- Left Fin -->
    <path d="M -15,16 L -32,36 L -16,36 Z" fill="#4C1D95"/>
    <!-- Right Fin -->
    <path d="M 15,16 L 32,36 L 16,36 Z" fill="#4C1D95"/>
    <!-- Center Nozzle -->
    <rect x="-9" y="34" width="18" height="5" rx="2" fill="#334155"/>

    <!-- Rocket Fuselage -->
    <path d="M 0,-48 C 18,-24 18,22 15,35 L -15,35 C -18,22 -18,-24 0,-48 Z" fill="url(#rocketBody)" stroke="#94A3B8" stroke-width="1.5"/>

    <!-- Nose Cone Color Accent -->
    <path d="M 0,-48 C 9,-36 13,-24 15,-14 L -15,-14 C -13,-24 -9,-36 0,-48 Z" fill="#4C1D95"/>

    <!-- Porthole Window -->
    <circle cx="0" cy="2" r="9" fill="#0284C7" stroke="#CBD5E1" stroke-width="2.5"/>
    <circle cx="0" cy="2" r="6" fill="#38BDF8"/>
    <ellipse cx="-2" cy="0" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.75"/>

    <!-- Body Stripe -->
    <rect x="-14" y="24" width="28" height="4" fill="#F59E0B"/>
  </g>
</svg>
`);

// =========================================================================
// 9. SPACE WEEK ELEVATED WHITE CARD & STARRY BACKDROP (خلفية وبطاقة أسبوع الفضاء)
// =========================================================================
export const SPACE_WEEK_FRAME_BG_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1123 794" width="1123" height="794">
  <defs>
    <linearGradient id="spaceCosmicBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#403278"/>
      <stop offset="50%" stop-color="#312463"/>
      <stop offset="100%" stop-color="#1E1442"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0F0826" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Deep Cosmic Canvas -->
  <rect x="0" y="0" width="1123" height="794" fill="url(#spaceCosmicBg)"/>

  <!-- Twinkling Stars in Margins -->
  <g fill="#FDE68A" opacity="0.85">
    <polygon points="24,30 26,34 30,34 27,37 28,41 24,38 20,41 21,37 18,34 22,34"/>
    <polygon points="1090,40 1092,44 1096,44 1093,47 1094,51 1090,48 1086,51 1087,47 1084,44 1088,44"/>
    <polygon points="30,760 32,764 36,764 33,767 34,771 30,768 26,771 27,767 24,764 28,764"/>
    <polygon points="1080,750 1082,754 1086,754 1083,757 1084,761 1080,758 1076,761 1077,757 1074,754 1078,754"/>
    <circle cx="70" cy="22" r="2" fill="#FFFFFF"/>
    <circle cx="560" cy="18" r="2.5" fill="#FDE68A"/>
    <circle cx="1040" cy="24" r="1.8" fill="#FFFFFF"/>
    <circle cx="20" cy="400" r="2" fill="#FDE68A"/>
    <circle cx="1105" cy="400" r="2.2" fill="#FDE68A"/>
    <circle cx="560" cy="775" r="2.5" fill="#FFFFFF"/>
  </g>

  <!-- Elevated White Certificate Card -->
  <rect x="48" y="44" width="1027" height="706" rx="8" fill="#FFFFFF" filter="url(#cardShadow)"/>

  <!-- Inner Double Border in Space Violet & Gold -->
  <rect x="64" y="60" width="995" height="674" rx="4" fill="none" stroke="#4D3D8A" stroke-width="2"/>
  <rect x="70" y="66" width="983" height="662" rx="2" fill="none" stroke="#F59E0B" stroke-width="0.8" opacity="0.65"/>

  <!-- Gold Corner Ornaments -->
  <g fill="#F59E0B">
    <rect x="62" y="62" width="6" height="6"/>
    <rect x="1055" y="62" width="6" height="6"/>
    <rect x="62" y="726" width="6" height="6"/>
    <rect x="1055" y="726" width="6" height="6"/>
  </g>
</svg>
`);

// =========================================================================
// 10. WORLD TEACHER DAY 2025 EMBLEM (شعار يوم المعلم الرسمي 2025)
// =========================================================================
export const TEACHER_DAY_2025_LOGO_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150" width="320" height="150">
  <defs>
    <linearGradient id="tdNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#313988"/>
      <stop offset="100%" stop-color="#1B2052"/>
    </linearGradient>
    <linearGradient id="tdGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22995D"/>
      <stop offset="100%" stop-color="#166B44"/>
    </linearGradient>
    <linearGradient id="tdGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#D4A34B"/>
    </linearGradient>
  </defs>

  <!-- Folded Ribbon Geometric Dynamic Badge -->
  <g transform="translate(68, 70)">
    <!-- Right Green Fold -->
    <polygon points="0,-40 38,-14 26,12 -8,-10" fill="url(#tdGreenGrad)"/>
    <!-- Left Navy Fold -->
    <polygon points="0,-40 -38,-14 -26,12 8,-10" fill="url(#tdNavyGrad)"/>
    <!-- Center Golden Heart / Ribbon Knot -->
    <polygon points="0,-18 20,4 0,38 -20,4" fill="url(#tdGoldGrad)"/>
    <!-- Little Pencil / Torch Tip in Center -->
    <polygon points="0,-36 6,-22 -6,-22" fill="#FCD34D"/>
    <!-- Floating Sparkle -->
    <circle cx="0" cy="46" r="3.5" fill="#166B44"/>
  </g>

  <!-- Typography Block -->
  <g font-family="'Cairo', 'Tajawal', sans-serif" text-anchor="start">
    <text x="135" y="44" font-size="14" font-weight="700" fill="#166B44">اليـوم العـالمـي</text>
    <text x="135" y="74" font-size="24" font-weight="800" fill="#1B2052">يــوم الـمـعـلـم</text>
    <rect x="135" y="85" width="165" height="2.5" fill="url(#tdGoldGrad)"/>
    <text x="135" y="106" font-size="12" font-weight="800" fill="#D4A34B" font-family="'Plus Jakarta Sans', sans-serif" letter-spacing="1.5">TEACHER DAY • 5 OCT 2025</text>
  </g>
</svg>
`);

// =========================================================================
// 11. WORLD TEACHER DAY FACETED CORNER BACKDROP & WHITE CARD (خلفية وبطاقة يوم المعلم)
// =========================================================================
export const TEACHER_DAY_FRAME_BG_SVG = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1123 794" width="1123" height="794">
  <defs>
    <linearGradient id="tdNavyBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#232A69"/>
      <stop offset="100%" stop-color="#141842"/>
    </linearGradient>
    <linearGradient id="tdGreenFacet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E8251"/>
      <stop offset="100%" stop-color="#125735"/>
    </linearGradient>
    <filter id="tdCardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0A0D24" flood-opacity="0.38"/>
    </filter>
  </defs>

  <!-- Deep Royal Navy Canvas -->
  <rect x="0" y="0" width="1123" height="794" fill="url(#tdNavyBg)"/>

  <!-- Top-Right Geometric Facet -->
  <polygon points="1123,0 1123,240 880,0" fill="url(#tdGreenFacet)"/>
  <polygon points="1123,240 1123,300 820,0 880,0" fill="#D4A34B"/>

  <!-- Bottom-Left Geometric Facet -->
  <polygon points="0,794 0,550 240,794" fill="url(#tdGreenFacet)"/>
  <polygon points="0,550 0,490 300,794 240,794" fill="#D4A34B"/>

  <!-- Elevated Pure White Certificate Card -->
  <rect x="48" y="44" width="1027" height="706" rx="8" fill="#FFFFFF" filter="url(#tdCardShadow)"/>

  <!-- Inner Double Border in Forest Green and Navy -->
  <rect x="64" y="60" width="995" height="674" rx="4" fill="none" stroke="#1E8251" stroke-width="2"/>
  <rect x="70" y="66" width="983" height="662" rx="2" fill="none" stroke="#232A69" stroke-width="1" opacity="0.6"/>

  <!-- Corner Ornamental Accents -->
  <g fill="#D4A34B">
    <polygon points="64,64 74,64 64,74"/>
    <polygon points="1059,64 1049,64 1059,74"/>
    <polygon points="64,734 74,734 64,724"/>
    <polygon points="1059,734 1049,734 1059,724"/>
  </g>
</svg>
`);

// =========================================================================
// 12. FULLY DECOMPOSED EDITABLE TEMPLATES (النماذج الثلاثة مفككة وقابلة للتعديل بالكامل)
// =========================================================================

export const SAUDI_GULF_TALENT_DAY_2026_TEMPLATE: CertificateDesign = {
  id: 'saudi-gulf-talent-day-2026',
  name: 'شهادة اليوم الخليجي للموهبة والإبداع 2026 (النموذج الرسمي المعتمد)',
  categoryId: 'appreciation',
  subtypeAr: 'شهادة الموهبة والإبداع الخليجي',
  styleId: 'style-13-emerald-gold',
  language: 'ar',
  featured: true,
  usageCount: 780,
  isTemplate: true,
  createdAt: '2026-03-03T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  pageConfig: {
    format: 'A4',
    orientation: 'landscape',
    widthMm: 297,
    heightMm: 210,
    widthPx: 1123,
    heightPx: 794,
    marginMm: 12,
    showPrintMargin: false,
    showSafeZone: false,
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#FAFBFB',
    transparentBackground: false,
    backgroundPattern: 'none',
    patternOpacity: 0.05,
    frameType: 'minimal-clean',
    frameColor: '#007A65',
    frameSecondaryColor: '#B49A6C',
    frameAccentColor: '#00A88F',
    borderThickness: 2,
    cornerOrnament: 'geometric',
    whiteForPrint: false,
  },
  elements: [
    // 1. Frame / Double Gold Border
    {
      id: 'gtd-border-frame',
      type: 'image',
      name: 'الإطار الهندسي المزدوج',
      src: GULF_TALENT_FRAME_SVG,
      x: 54,
      y: 46,
      width: 1015,
      height: 702,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      objectFit: 'contain',
      borderRadius: 0,
    },
    // 2. Top-Right Corner Geometric Motif
    {
      id: 'gtd-corner-tr',
      type: 'image',
      name: 'زخرفة الزاوية الهندسية العليا (زمردي وذهبي)',
      src: GULF_TALENT_CORNER_TR_SVG,
      x: 900,
      y: 0,
      width: 223,
      height: 186,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      objectFit: 'contain',
      borderRadius: 0,
    },
    // 3. Bottom-Left Corner Geometric Motif
    {
      id: 'gtd-corner-bl',
      type: 'image',
      name: 'زخرفة الزاوية الهندسية السفلى (زمردي وذهبي)',
      src: GULF_TALENT_CORNER_BL_SVG,
      x: 0,
      y: 608,
      width: 223,
      height: 186,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      objectFit: 'contain',
      borderRadius: 0,
    },
    // 4. Saudi Ministry of Education Logo (Top-Right)
    {
      id: 'gtd-moe-logo',
      type: 'image',
      name: 'شعار وزارة التعليم الرسمي',
      src: SAUDI_MOE_LOGO_SVG,
      x: 770,
      y: 62,
      width: 200,
      height: 88,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 10,
      objectFit: 'contain',
      borderRadius: 0,
      isLogo: true,
    },
    // 5. Gulf Talent Day 2026 Official Logo (Top-Left)
    {
      id: 'gtd-event-logo',
      type: 'image',
      name: 'شعار اليوم الخليجي للموهبة والإبداع 2026',
      src: GULF_TALENT_2026_LOGO_SVG,
      x: 100,
      y: 60,
      width: 200,
      height: 94,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 10,
      objectFit: 'contain',
      borderRadius: 0,
      isLogo: true,
    },
    // 6. Main Title: شهادة شكر وتقدير
    {
      id: 'gtd-title',
      type: 'text',
      fieldRole: 'title',
      name: 'عنوان الشهادة الرئيسي',
      content: 'شهادة شكر وتقدير',
      fontFamily: 'Aref Ruqaa',
      fontSize: 50,
      fontWeight: 800,
      italic: false,
      color: '#007A65',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.25,
      letterSpacing: 0,
      textShadow: false,
      x: 261,
      y: 175,
      width: 600,
      height: 68,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 7. Subtitle / Event Description
    {
      id: 'gtd-subtitle',
      type: 'text',
      fieldRole: 'subtitle',
      name: 'المناسبة والفعالية',
      content: 'بمناسبة اليوم الخليجي للموهبة والإبداع 2026 م ✦ معًا لرعاية الموهبة',
      fontFamily: 'Cairo',
      fontSize: 15.5,
      fontWeight: 700,
      italic: false,
      color: '#B49A6C',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 261,
      y: 245,
      width: 600,
      height: 30,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 8. Intro text: يسر إدارة المدرسة أن تتقدم بجزيل الشكر والتقدير إلى:
    {
      id: 'gtd-intro',
      type: 'text',
      fieldRole: 'intro',
      name: 'عبارة التقديم والشكر',
      content: 'يسر إدارة المدرسة أن تتقدم بجزيل الشكر وعظيم التقدير والامتنان إلى:',
      fontFamily: 'Cairo',
      fontSize: 19,
      fontWeight: 600,
      italic: false,
      color: '#334155',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 186,
      y: 282,
      width: 750,
      height: 34,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 9. Recipient Name: إلى الأستاذ / خالد أحمد عبدالله الهاشمي
    {
      id: 'gtd-recipient',
      type: 'text',
      fieldRole: 'recipientName',
      name: 'اسم المستفيد / المكرم',
      content: 'إلى الأستاذ / خالد أحمد عبدالله الهاشمي',
      fontFamily: 'Aref Ruqaa',
      fontSize: 38,
      fontWeight: 700,
      italic: false,
      color: '#007A65',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.3,
      letterSpacing: 0,
      textShadow: false,
      autoFitLongName: true,
      x: 161,
      y: 324,
      width: 800,
      height: 60,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 14,
    },
    // 10. Appreciation Body Text
    {
      id: 'gtd-body',
      type: 'text',
      fieldRole: 'body',
      name: 'نص التقدير والإشادة',
      content:
        'تقديرًا لمشاركته الفاعلة وتميزه الإبداعي في فعاليات وأنشطة اليوم الخليجي للموهبة والإبداع لعام 2026م، سائلين المولى له دوام التوفيق والنجاح ومستقبلًا مشرقًا حافلًا بالإنجاز والابتكار.',
      fontFamily: 'Cairo',
      fontSize: 18.5,
      fontWeight: 500,
      italic: false,
      color: '#1E293B',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.75,
      letterSpacing: 0,
      textShadow: false,
      x: 186,
      y: 395,
      width: 750,
      height: 85,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 11. Divider
    {
      id: 'gtd-divider',
      type: 'divider',
      name: 'فاصل هندسي مذهب',
      variant: 'diamond-center',
      color: '#B49A6C',
      thickness: 2,
      x: 361,
      y: 495,
      width: 400,
      height: 20,
      rotation: 0,
      opacity: 0.9,
      locked: false,
      visible: true,
      zIndex: 11,
    },
    // 12. Right Signature: وكيل المدرسة
    {
      id: 'gtd-sig-vp',
      type: 'signature',
      name: 'توقيع وكيل المدرسة',
      signatureMode: 'text',
      signatureText: 'أ. فهد بن ناصر القحطاني',
      signerName: 'أ. فهد بن ناصر القحطاني',
      signerTitle: 'وكيل المدرسة',
      color: '#007A65',
      fontFamily: 'Aref Ruqaa',
      showLine: true,
      x: 690,
      y: 545,
      width: 230,
      height: 105,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 13,
    },
    // 13. Left Signature: مدير المدرسة
    {
      id: 'gtd-sig-principal',
      type: 'signature',
      name: 'توقيع مدير المدرسة',
      signatureMode: 'text',
      signatureText: 'أ. عبدالرحمن بن سعد الغامدي',
      signerName: 'أ. عبدالرحمن بن سعد الغامدي',
      signerTitle: 'مدير المدرسة',
      color: '#007A65',
      fontFamily: 'Aref Ruqaa',
      showLine: true,
      x: 200,
      y: 545,
      width: 230,
      height: 105,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 13,
    },
    // 14. Issue Date
    {
      id: 'gtd-date',
      type: 'text',
      fieldRole: 'issueDate',
      name: 'تاريخ المناسبة',
      content: 'التاريخ: 3 مارس 2026 م',
      fontFamily: 'Cairo',
      fontSize: 13.5,
      fontWeight: 700,
      italic: false,
      color: '#007A65',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 461,
      y: 670,
      width: 200,
      height: 24,
      rotation: 0,
      opacity: 0.9,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 15. Ref ID
    {
      id: 'gtd-certid',
      type: 'text',
      fieldRole: 'certificateId',
      name: 'الرقم المرجعي',
      content: 'الرقم المرجعي: GTD-2026-904',
      fontFamily: 'Cairo',
      fontSize: 12.5,
      fontWeight: 600,
      italic: false,
      color: '#B49A6C',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 461,
      y: 698,
      width: 200,
      height: 22,
      rotation: 0,
      opacity: 0.85,
      locked: false,
      visible: true,
      zIndex: 12,
    },
  ],
};

export const SAUDI_SPACE_WEEK_2025_TEMPLATE: CertificateDesign = {
  id: 'saudi-space-week-2025',
  name: 'شهادة أسبوع الفضاء العالمي 2025 (تصميم الفضاء والمجرات الرسمي)',
  categoryId: 'academic',
  subtypeAr: 'شهادة أسبوع الفضاء العالمي',
  styleId: 'style-30-tech-innovation',
  language: 'ar',
  featured: true,
  usageCount: 820,
  isTemplate: true,
  createdAt: '2025-10-04T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  pageConfig: {
    format: 'A4',
    orientation: 'landscape',
    widthMm: 297,
    heightMm: 210,
    widthPx: 1123,
    heightPx: 794,
    marginMm: 12,
    showPrintMargin: false,
    showSafeZone: false,
    backgroundColor: '#382B6E',
    backgroundGradientEnd: '#22194A',
    transparentBackground: false,
    backgroundPattern: 'none',
    patternOpacity: 0.08,
    frameType: 'minimal-clean',
    frameColor: '#4D3D8A',
    frameSecondaryColor: '#F59E0B',
    frameAccentColor: '#7059A6',
    borderThickness: 2,
    cornerOrnament: 'stars',
    whiteForPrint: false,
  },
  elements: [
    // 1. Elevated Center Card & Starry Canvas Frame
    {
      id: 'sw-bg-card',
      type: 'image',
      name: 'البطاقة المركزية البيضاء مع النجوم الفضائية',
      src: SPACE_WEEK_FRAME_BG_SVG,
      x: 0,
      y: 0,
      width: 1123,
      height: 794,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      objectFit: 'cover',
      borderRadius: 0,
    },
    // 2. Planet Saturn with Rings (Top-Left Inner Area)
    {
      id: 'sw-saturn',
      type: 'image',
      name: 'رسم كوكب زحل والمدارات الفضائية',
      src: SPACE_SATURN_SVG,
      x: 85,
      y: 165,
      width: 135,
      height: 98,
      rotation: 0,
      opacity: 0.95,
      locked: false,
      visible: true,
      zIndex: 5,
      objectFit: 'contain',
      borderRadius: 0,
    },
    // 3. Space Rocket Launching (Bottom-Right Inner Area)
    {
      id: 'sw-rocket',
      type: 'image',
      name: 'رسم الصاروخ الفضائي المنطلق',
      src: SPACE_ROCKET_SVG,
      x: 885,
      y: 535,
      width: 130,
      height: 130,
      rotation: 0,
      opacity: 0.95,
      locked: false,
      visible: true,
      zIndex: 5,
      objectFit: 'contain',
      borderRadius: 0,
    },
    // 4. Saudi Ministry of Education Logo (Top-Right)
    {
      id: 'sw-moe-logo',
      type: 'image',
      name: 'شعار وزارة التعليم الرسمي',
      src: SAUDI_MOE_LOGO_SVG,
      x: 770,
      y: 65,
      width: 200,
      height: 88,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 10,
      objectFit: 'contain',
      borderRadius: 0,
      isLogo: true,
    },
    // 5. World Space Week 2025 Emblem (Top-Left)
    {
      id: 'sw-event-logo',
      type: 'image',
      name: 'شعار أسبوع الفضاء العالمي 2025',
      src: SPACE_WEEK_2025_LOGO_SVG,
      x: 95,
      y: 62,
      width: 200,
      height: 94,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 10,
      objectFit: 'contain',
      borderRadius: 0,
      isLogo: true,
    },
    // 6. Main Title: شكر وتقدير
    {
      id: 'sw-title',
      type: 'text',
      fieldRole: 'title',
      name: 'عنوان الشهادة الرئيسي',
      content: 'شكر وتقدير',
      fontFamily: 'Aref Ruqaa',
      fontSize: 54,
      fontWeight: 800,
      italic: false,
      color: '#3B2D73',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.25,
      letterSpacing: 0,
      textShadow: false,
      x: 361,
      y: 165,
      width: 400,
      height: 72,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 7. Subtitle / Occasion
    {
      id: 'sw-subtitle',
      type: 'text',
      fieldRole: 'subtitle',
      name: 'المناسبة والفعالية',
      content: 'فعاليات أسبوع الفضاء العالمي لعام 2025 م ✦ WORLD SPACE WEEK',
      fontFamily: 'Cairo',
      fontSize: 15.5,
      fontWeight: 700,
      italic: false,
      color: '#7059A6',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 261,
      y: 242,
      width: 600,
      height: 30,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 8. Intro Text
    {
      id: 'sw-intro',
      type: 'text',
      fieldRole: 'intro',
      name: 'عبارة التقديم والشكر',
      content: 'تسر إدارة المدرسة أن تتقدم بأسمى آيات الشكر والتقدير والثناء إلى:',
      fontFamily: 'Cairo',
      fontSize: 19,
      fontWeight: 600,
      italic: false,
      color: '#334155',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 186,
      y: 278,
      width: 750,
      height: 34,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 9. Recipient Name
    {
      id: 'sw-recipient',
      type: 'text',
      fieldRole: 'recipientName',
      name: 'اسم المستفيد / المكرم',
      content: 'إلى الأستاذ / خالد أحمد عبدالله الهاشمي',
      fontFamily: 'Aref Ruqaa',
      fontSize: 38,
      fontWeight: 700,
      italic: false,
      color: '#3B2D73',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.3,
      letterSpacing: 0,
      textShadow: false,
      autoFitLongName: true,
      x: 161,
      y: 320,
      width: 800,
      height: 60,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 14,
    },
    // 10. Appreciation Body Text
    {
      id: 'sw-body',
      type: 'text',
      fieldRole: 'body',
      name: 'نص التقدير والإشادة',
      content:
        'تقديرًا لمشاركته المتميزة وتفاعله الإيجابي في أنشطة وفعاليات أسبوع الفضاء العالمي لعام 2025م، وإسهامه الملموس في إنجاح البرامج العلمية ونشر المعرفة الفلكية، متمنين له دوام التألق والريادة.',
      fontFamily: 'Cairo',
      fontSize: 18.5,
      fontWeight: 500,
      italic: false,
      color: '#1E293B',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.75,
      letterSpacing: 0,
      textShadow: false,
      x: 186,
      y: 390,
      width: 750,
      height: 85,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 11. Divider: stars divider
    {
      id: 'sw-divider',
      type: 'divider',
      name: 'فاصل النجوم الفضائي',
      variant: 'stars-divider',
      color: '#7059A6',
      thickness: 2,
      x: 361,
      y: 490,
      width: 400,
      height: 20,
      rotation: 0,
      opacity: 0.9,
      locked: false,
      visible: true,
      zIndex: 11,
    },
    // 12. Signature 1 (Right): رائد النشاط
    {
      id: 'sw-sig-activity',
      type: 'signature',
      name: 'توقيع رائد النشاط',
      signatureMode: 'text',
      signatureText: 'أ. تركي بن صالح الحربي',
      signerName: 'أ. تركي بن صالح الحربي',
      signerTitle: 'رائد النشاط الطلابي',
      color: '#3B2D73',
      fontFamily: 'Aref Ruqaa',
      showLine: true,
      x: 740,
      y: 535,
      width: 190,
      height: 105,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 13,
    },
    // 13. Signature 2 (Center): وكيل المدرسة
    {
      id: 'sw-sig-vp',
      type: 'signature',
      name: 'توقيع وكيل المدرسة',
      signatureMode: 'text',
      signatureText: 'أ. ناصر بن إبراهيم السبيعي',
      signerName: 'أ. ناصر بن إبراهيم السبيعي',
      signerTitle: 'وكيل المدرسة',
      color: '#3B2D73',
      fontFamily: 'Aref Ruqaa',
      showLine: true,
      x: 466,
      y: 535,
      width: 190,
      height: 105,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 13,
    },
    // 14. Signature 3 (Left): مدير المدرسة
    {
      id: 'sw-sig-principal',
      type: 'signature',
      name: 'توقيع مدير المدرسة',
      signatureMode: 'text',
      signatureText: 'أ. ماجد بن عبدالله الشهري',
      signerName: 'أ. ماجد بن عبدالله الشهري',
      signerTitle: 'مدير المدرسة',
      color: '#3B2D73',
      fontFamily: 'Aref Ruqaa',
      showLine: true,
      x: 190,
      y: 535,
      width: 190,
      height: 105,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 13,
    },
    // 15. Issue Date
    {
      id: 'sw-date',
      type: 'text',
      fieldRole: 'issueDate',
      name: 'تاريخ الفعالية',
      content: 'التاريخ: 10 أكتوبر 2025 م',
      fontFamily: 'Cairo',
      fontSize: 13.5,
      fontWeight: 700,
      italic: false,
      color: '#3B2D73',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 461,
      y: 658,
      width: 200,
      height: 24,
      rotation: 0,
      opacity: 0.9,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 16. Cert ID
    {
      id: 'sw-certid',
      type: 'text',
      fieldRole: 'certificateId',
      name: 'الرقم المرجعي',
      content: 'الرقم المرجعي: WSW-2025-418',
      fontFamily: 'Cairo',
      fontSize: 12.5,
      fontWeight: 600,
      italic: false,
      color: '#F59E0B',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 461,
      y: 686,
      width: 200,
      height: 22,
      rotation: 0,
      opacity: 0.85,
      locked: false,
      visible: true,
      zIndex: 12,
    },
  ],
};

export const SAUDI_TEACHER_DAY_2025_TEMPLATE: CertificateDesign = {
  id: 'saudi-teacher-day-2025',
  name: 'شهادة يوم المعلم 2025 (النموذج الرسمي الاحتفالي)',
  categoryId: 'appreciation',
  subtypeAr: 'شهادة يوم المعلم',
  styleId: 'style-13-emerald-gold',
  language: 'ar',
  featured: true,
  usageCount: 890,
  isTemplate: true,
  createdAt: '2025-10-05T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  pageConfig: {
    format: 'A4',
    orientation: 'landscape',
    widthMm: 297,
    heightMm: 210,
    widthPx: 1123,
    heightPx: 794,
    marginMm: 12,
    showPrintMargin: false,
    showSafeZone: false,
    backgroundColor: '#1E2454',
    backgroundGradientEnd: '#135C3B',
    transparentBackground: false,
    backgroundPattern: 'none',
    patternOpacity: 0.08,
    frameType: 'minimal-clean',
    frameColor: '#1E8251',
    frameSecondaryColor: '#D4A34B',
    frameAccentColor: '#232A69',
    borderThickness: 2,
    cornerOrnament: 'geometric',
    whiteForPrint: false,
  },
  elements: [
    // 1. Faceted Geometric Backdrop & White Card
    {
      id: 'td-bg-card',
      type: 'image',
      name: 'البطاقة المركزية البيضاء مع الزوايا الهندسية الاحتفالية',
      src: TEACHER_DAY_FRAME_BG_SVG,
      x: 0,
      y: 0,
      width: 1123,
      height: 794,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      objectFit: 'cover',
      borderRadius: 0,
    },
    // 2. Saudi Ministry of Education Logo (Top-Right)
    {
      id: 'td-moe-logo',
      type: 'image',
      name: 'شعار وزارة التعليم الرسمي',
      src: SAUDI_MOE_LOGO_SVG,
      x: 770,
      y: 65,
      width: 200,
      height: 88,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 10,
      objectFit: 'contain',
      borderRadius: 0,
      isLogo: true,
    },
    // 3. World Teacher Day Official Emblem (Top-Left)
    {
      id: 'td-event-logo',
      type: 'image',
      name: 'شعار يوم المعلم الرسمي 2025',
      src: TEACHER_DAY_2025_LOGO_SVG,
      x: 95,
      y: 62,
      width: 200,
      height: 94,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 10,
      objectFit: 'contain',
      borderRadius: 0,
      isLogo: true,
    },
    // 4. Main Calligraphic Title: شكر وتقدير
    {
      id: 'td-title',
      type: 'text',
      fieldRole: 'title',
      name: 'عنوان الشهادة الرئيسي',
      content: 'شكر وتقدير',
      fontFamily: 'Aref Ruqaa',
      fontSize: 54,
      fontWeight: 800,
      italic: false,
      color: '#1B2052',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.25,
      letterSpacing: 0,
      textShadow: false,
      x: 361,
      y: 165,
      width: 400,
      height: 72,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 5. Subtitle: بمناسبة اليوم العالمي للمعلم
    {
      id: 'td-subtitle',
      type: 'text',
      fieldRole: 'subtitle',
      name: 'المناسبة والبيت الشعري',
      content: 'بمناسبة اليوم العالمي للمعلم ✦ قُمْ لِلمُعَلِّمِ وَفِّهِ التَبجِيلا',
      fontFamily: 'Cairo',
      fontSize: 15.5,
      fontWeight: 700,
      italic: false,
      color: '#1E8251',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 261,
      y: 242,
      width: 600,
      height: 30,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 6. Intro Text
    {
      id: 'td-intro',
      type: 'text',
      fieldRole: 'intro',
      name: 'عبارة التقديم والشكر',
      content: 'بمناسبة اليوم العالمي للمعلم، يسر إدارة المدرسة أن تتقدم بأسمى آيات الشكر والعرفان إلى:',
      fontFamily: 'Cairo',
      fontSize: 19,
      fontWeight: 600,
      italic: false,
      color: '#334155',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 186,
      y: 278,
      width: 750,
      height: 34,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 7. Recipient Name: إلى الأستاذ / خالد أحمد عبدالله الهاشمي
    {
      id: 'td-recipient',
      type: 'text',
      fieldRole: 'recipientName',
      name: 'اسم المستفيد / المكرم',
      content: 'إلى الأستاذ / خالد أحمد عبدالله الهاشمي',
      fontFamily: 'Aref Ruqaa',
      fontSize: 38,
      fontWeight: 700,
      italic: false,
      color: '#1E8251',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.3,
      letterSpacing: 0,
      textShadow: false,
      autoFitLongName: true,
      x: 161,
      y: 320,
      width: 800,
      height: 60,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 14,
    },
    // 8. Body Text
    {
      id: 'td-body',
      type: 'text',
      fieldRole: 'body',
      name: 'نص التقدير والإشادة',
      content:
        'تقديرًا لجهوده المخلصة، وعطائه اللامحدود، ورسالته السامية في بناء الأجيال وإنارة دروب المعرفة، وتفانيه المشهود في خدمة المسيرة التعليمية والتربوية، سائلين المولى له دوام التوفيق والسداد.',
      fontFamily: 'Cairo',
      fontSize: 18.5,
      fontWeight: 500,
      italic: false,
      color: '#1E293B',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.75,
      letterSpacing: 0,
      textShadow: false,
      x: 186,
      y: 390,
      width: 750,
      height: 85,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 9. Divider: royal flourish
    {
      id: 'td-divider',
      type: 'divider',
      name: 'فاصل ملكي مذهب',
      variant: 'royal-flourish',
      color: '#D4A34B',
      thickness: 2,
      x: 361,
      y: 490,
      width: 400,
      height: 20,
      rotation: 0,
      opacity: 0.9,
      locked: false,
      visible: true,
      zIndex: 11,
    },
    // 10. Signature 1 (Right): رائد النشاط
    {
      id: 'td-sig-activity',
      type: 'signature',
      name: 'توقيع رائد النشاط',
      signatureMode: 'text',
      signatureText: 'أ. مشاري بن سلطان العتيبي',
      signerName: 'أ. مشاري بن سلطان العتيبي',
      signerTitle: 'رائد النشاط الطلابي',
      color: '#1E8251',
      fontFamily: 'Aref Ruqaa',
      showLine: true,
      x: 740,
      y: 535,
      width: 190,
      height: 105,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 13,
    },
    // 11. Signature 2 (Center): وكيل المدرسة
    {
      id: 'td-sig-vp',
      type: 'signature',
      name: 'توقيع وكيل المدرسة',
      signatureMode: 'text',
      signatureText: 'أ. فيصل بن عبدالعزيز الراشد',
      signerName: 'أ. فيصل بن عبدالعزيز الراشد',
      signerTitle: 'وكيل المدرسة للشؤون المدرسية',
      color: '#1E8251',
      fontFamily: 'Aref Ruqaa',
      showLine: true,
      x: 466,
      y: 535,
      width: 190,
      height: 105,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 13,
    },
    // 12. Signature 3 (Left): مدير المدرسة
    {
      id: 'td-sig-principal',
      type: 'signature',
      name: 'توقيع مدير المدرسة',
      signatureMode: 'text',
      signatureText: 'أ. منصور بن محمد التميمي',
      signerName: 'أ. منصور بن محمد التميمي',
      signerTitle: 'مدير المدرسة',
      color: '#1E8251',
      fontFamily: 'Aref Ruqaa',
      showLine: true,
      x: 190,
      y: 535,
      width: 190,
      height: 105,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 13,
    },
    // 13. Issue Date
    {
      id: 'td-date',
      type: 'text',
      fieldRole: 'issueDate',
      name: 'تاريخ المناسبة',
      content: 'التاريخ: 5 أكتوبر 2025 م',
      fontFamily: 'Cairo',
      fontSize: 13.5,
      fontWeight: 700,
      italic: false,
      color: '#1B2052',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 461,
      y: 658,
      width: 200,
      height: 24,
      rotation: 0,
      opacity: 0.9,
      locked: false,
      visible: true,
      zIndex: 12,
    },
    // 14. Cert ID
    {
      id: 'td-certid',
      type: 'text',
      fieldRole: 'certificateId',
      name: 'الرقم المرجعي',
      content: 'الرقم المرجعي: WTD-2025-703',
      fontFamily: 'Cairo',
      fontSize: 12.5,
      fontWeight: 600,
      italic: false,
      color: '#D4A34B',
      align: 'center',
      direction: 'rtl',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: false,
      x: 461,
      y: 686,
      width: 200,
      height: 22,
      rotation: 0,
      opacity: 0.85,
      locked: false,
      visible: true,
      zIndex: 12,
    },
  ],
};

export const NEW_SAUDI_OFFICIAL_TEMPLATES: CertificateDesign[] = [
  SAUDI_GULF_TALENT_DAY_2026_TEMPLATE,
  SAUDI_SPACE_WEEK_2025_TEMPLATE,
  SAUDI_TEACHER_DAY_2025_TEMPLATE,
];
