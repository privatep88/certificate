import {
  ArtisticStyle,
  CertificateCategory,
  DividerVariant,
  OrnamentVariant,
  SealVariant,
} from '../types/certificate';
import {
  SAUDI_MOE_LOGO_SVG,
  GULF_TALENT_2026_LOGO_SVG,
  SPACE_WEEK_2025_LOGO_SVG,
  TEACHER_DAY_2025_LOGO_SVG,
} from './saudiCertificateAssets';
import { WARITH_UNIVERSITY_CREST_SVG } from './attachedCertificateTemplates';

export const CERTIFICATE_CATEGORIES: CertificateCategory[] = [
  {
    id: 'appreciation',
    nameAr: 'شهادات الشكر والتقدير',
    nameEn: 'Appreciation & Gratitude',
    descriptionAr: 'نماذج فاخرة لتقديم الشكر والعرفان للموظفين والمعلمين والطلاب والجهات والمتطوعين.',
    descriptionEn: 'Prestigious templates for expressing gratitude to employees, teachers, students, and partners.',
    subtypesAr: [
      'شهادة شكر وتقدير عامة',
      'شهادة اليوم الخليجي للموهبة والإبداع',
      'شهادة يوم المعلم',
      'شهادة شكر لموظف',
      'شهادة شكر لمعلم أو معلمة',
      'شهادة شكر لطالب أو طالبة',
      'شهادة شكر لجهة أو مؤسسة',
      'شهادة شكر لمتطوع',
      'شهادة شكر لمتحدث أو محاضر',
      'شهادة تقدير للجهود المتميزة',
      'شهادة تقدير للمشاركة الفعالة',
      'شهادة شكر للجان التنظيمية',
      'شهادة شكر للشركاء والداعمين',
      'شهادة تقدير للإنجازات المهنية',
    ],
  },
  {
    id: 'excellence',
    nameAr: 'شهادات التكريم والتميز',
    nameEn: 'Honors & Excellence',
    descriptionAr: 'تصاميم مهيبة للاحتفاء بالتفوق والإبداع والقيادة والمراكز الأولى والأداء الاستثنائي.',
    descriptionEn: 'Regal designs celebrating excellence, innovation, leadership, and top achievements.',
    subtypesAr: [
      'شهادة تكريم رسمية',
      'شهادة التميز والإبداع',
      'شهادة التفوق الأكاديمي',
      'شهادة الطالب المثالي',
      'شهادة الموظف المثالي',
      'شهادة الإنجاز الاستثنائي',
      'شهادة القيادة المتميزة',
      'شهادة الإبداع والابتكار',
      'شهادة أفضل أداء',
      'شهادة المراكز الأولى',
      'شهادة التميز المؤسسي',
      'شهادة الإنجاز السنوي',
      'شهادة تكريم الفائزين في المسابقات',
    ],
  },
  {
    id: 'training',
    nameAr: 'شهادات إتمام الدورات والتدريب',
    nameEn: 'Courses & Training Completion',
    descriptionAr: 'شهادات تدريبية متكاملة تدعم اسم الدورة، الساعات التدريبية، المدرب، ورقم الاعتماد التصميمي.',
    descriptionEn: 'Comprehensive training certificates with course hours, trainer, dates, and reference numbers.',
    subtypesAr: [
      'شهادة اجتياز دورة تدريبية',
      'شهادة إتمام دورة',
      'شهادة حضور دورة',
      'شهادة إتمام برنامج تدريبي',
      'شهادة المشاركة في ورشة عمل',
      'شهادة اجتياز اختبار',
      'شهادة إتمام برنامج تأهيلي',
      'شهادة إتمام دورة إلكترونية',
      'شهادة إتمام تدريب مهني',
      'شهادة حضور مؤتمر أو ندوة',
      'شهادة إتمام برنامج تطوير مهارات',
      'شهادة إتمام معسكر تدريبي',
    ],
  },
  {
    id: 'academic',
    nameAr: 'الشهادات التعليمية والأكاديمية',
    nameEn: 'Educational & Academic',
    descriptionAr: 'قوالب تصميمية قابلة للتخصيص للنجاح والتفوق الدراسي وحفظ القرآن والأنشطة المدرسية.',
    descriptionEn: 'Customizable design templates for academic achievement, Quran memorization, and school events.',
    disclaimerAr:
      'تنبيه: قوالب التخرج والنجاح في هذا القسم هي قوالب تصميمية احترافية قابلة للتخصيص لأغراض الاحتفاء والتكريم، ولا تُعد وثائق رسمية معتمدة من وزارة أو جهة تعليمية حكومية.',
    disclaimerEn:
      'Note: Graduation and academic templates are customizable design templates for celebration and recognition, not government-accredited official transcripts.',
    subtypesAr: [
      'شهادة نجاح',
      'شهادة أسبوع الفضاء العالمي',
      'شهادة تفوق دراسي',
      'شهادة مشاركة مدرسية',
      'شهادة اجتياز مستوى تعليمي',
      'شهادة حفظ ومراجعة',
      'شهادة إنجاز أكاديمي',
      'شهادة تخرج رمزية أو احتفالية',
      'شهادة مشاركة في نشاط علمي',
      'شهادة مشاركة في معرض',
      'شهادة مشاركة في مسابقة مدرسية',
      'شهادة تكريم للطلاب المتفوقين',
      'شهادة تقدير للكادر التعليمي',
    ],
  },
  {
    id: 'participation',
    nameAr: 'شهادات المشاركة والحضور',
    nameEn: 'Participation & Attendance',
    descriptionAr: 'شهادات مخصصة للمؤتمرات والملتقيات والمعارض والمبادرات المجتمعية والتطوعية.',
    descriptionEn: 'Certificates tailored for conferences, forums, exhibitions, and community initiatives.',
    subtypesAr: [
      'شهادة حضور فعالية',
      'شهادة المشاركة في مؤتمر',
      'شهادة المشاركة في ملتقى',
      'شهادة المشاركة في مسابقة',
      'شهادة المشاركة المجتمعية',
      'شهادة المشاركة التطوعية',
      'شهادة المشاركة في مشروع',
      'شهادة المشاركة في معرض أو مهرجان',
      'شهادة إتمام نشاط',
      'شهادة المشاركة في مبادرة',
    ],
  },
  {
    id: 'congratulations',
    nameAr: 'شهادات التهنئة والمناسبات',
    nameEn: 'Congratulations & Occasions',
    descriptionAr: 'بطاقات وشهادات تهنئة راقية للنجاح، الترقية، التخرج، المولود الجديد، والأعياد والمناسبات الوطنية.',
    descriptionEn: 'Elegant congratulatory certificates for promotions, graduation, newborns, and national holidays.',
    subtypesAr: [
      'شهادة تهنئة بالنجاح',
      'شهادة تهنئة بالتفوق',
      'شهادة تهنئة بالترقية',
      'شهادة تهنئة بالإنجاز',
      'شهادة تهنئة بالفوز',
      'شهادة تهنئة بالتخرج',
      'شهادة تهنئة بمولود جديد',
      'شهادة تهنئة بمناسبة شخصية',
      'شهادة تهنئة بالعيد',
      'شهادة تهنئة باليوم الوطني',
      'شهادة تهنئة بشهر رمضان',
      'شهادة تهنئة بمناسبة مهنية أو مؤسسية',
    ],
  },
  {
    id: 'professional',
    nameAr: 'شهادات إدارية ومهنية ومجتمعية',
    nameEn: 'Corporate, Professional & Civic',
    descriptionAr: 'تصاميم مؤسسية لإنجاز المشاريع، تكريم المتقاعدين، خدمة العملاء، والقيادة والعمل الجماعي.',
    descriptionEn: 'Corporate templates for project completion, retirement honors, customer service, and teamwork.',
    disclaimerAr:
      'تنبيه: قوالب الخبرة والإنجاز المهني هي نماذج تصميمية قابلة للتخصيص الداخلي ولا تُغني عن المستندات الرسمية التي تستلزم تصديقًا أو تحققًا قانونيًا من الجهات المختصة.',
    disclaimerEn:
      'Note: Professional templates are customizable design layouts and do not replace legally notarized or government-verified documents.',
    subtypesAr: [
      'شهادة خبرة بتصميم قابل للتخصيص',
      'شهادة تقدير للموظفين',
      'شهادة إنجاز مشروع',
      'شهادة إتمام مهمة',
      'شهادة تقدير للخدمة المجتمعية',
      'شهادة تكريم للمتقاعدين',
      'شهادة شكر للشركاء',
      'شهادة العمل التطوعي',
      'شهادة التميز في خدمة العملاء',
      'شهادة الإنجاز المؤسسي',
      'شهادة الالتزام والانضباط',
      'شهادة القيادة والعمل الجماعي',
    ],
  },
  {
    id: 'kids',
    nameAr: 'شهادات الأطفال والأنشطة الإبداعية',
    nameEn: 'Kids & Creative Activities',
    descriptionAr: 'تصاميم مبهجة وملونة لرياض الأطفال والمدارس لتحفيز القراءة، السلوك الإيجابي، والمواهب.',
    descriptionEn: 'Cheerful, colorful designs for kindergartens and schools celebrating reading, creativity, and good behavior.',
    subtypesAr: [
      'شهادة الطفل المبدع',
      'شهادة السلوك الإيجابي',
      'شهادة القراءة',
      'شهادة حفظ القرآن',
      'شهادة الرسام الصغير',
      'شهادة الموهبة',
      'شهادة المشاركة الرياضية',
      'شهادة الإنجاز اليومي',
      'شهادة الالتزام',
      'شهادة المشاركة في الأنشطة',
      'شهادات شخصيات كرتونية أصلية وبسيطة ملائمة للأطفال',
      'شهادات ملونة للمدارس ورياض الأطفال',
    ],
  },
  {
    id: 'sports_arts',
    nameAr: 'شهادات رياضية وفنية وتطوعية',
    nameEn: 'Sports, Arts & Volunteering',
    descriptionAr: 'نماذج ديناميكية للبطولات الرياضية، التحكيم، المبادرات الإنسانية، والمسابقات الثقافية والإعلامية.',
    descriptionEn: 'Dynamic templates for sports championships, refereeing, humanitarian initiatives, and cultural arts.',
    subtypesAr: [
      'شهادات المراكز الرياضية',
      'شهادات الفوز بالبطولات',
      'شهادات المشاركة الرياضية',
      'شهادات التحكيم',
      'شهادات العمل التطوعي',
      'شهادات المبادرات الإنسانية',
      'شهادات المشاركة الفنية',
      'شهادات المسابقات الثقافية',
      'شهادات الإبداع الإعلامي',
      'شهادات الإنجاز في المشاريع والمبادرات',
    ],
  },
  {
    id: 'additional',
    nameAr: 'أنواع إضافية ومخصصة',
    nameEn: 'Special & Custom Categories',
    descriptionAr: 'شهادات العضوية، الشراكة، المواهب والهوايات، الجوائز، والشهادات التذكارية المخصصة.',
    descriptionEn: 'Membership, partnership, hobbies, awards, commemorative certificates, and user-defined types.',
    subtypesAr: [
      'شهادات العضوية',
      'شهادات الخبرة والتقدير',
      'شهادات الإنجاز الشخصي',
      'شهادات الشراكة',
      'شهادات المواهب والهوايات',
      'شهادات المسابقات والجوائز',
      'شهادات تقدير المؤسسات',
      'شهادات المناسبات الخاصة',
      'شهادات التقدير التذكارية',
      'شهادات مخصصة ينشئها المستخدم بنفسه',
    ],
  },
];

export const ARTISTIC_STYLES: ArtisticStyle[] = [
  {
    id: 'style-1-royal-gold',
    number: 1,
    nameAr: 'النمط الملكي الذهبي',
    nameEn: 'Royal Gold',
    frameType: 'royal-gold',
    backgroundPattern: 'guilloche',
    backgroundColor: '#FFFDF7',
    backgroundGradientEnd: '#FBF5E6',
    primaryColor: '#0B192C',
    secondaryColor: '#B8860B',
    accentColor: '#D4AF37',
    textColor: '#0F172A',
    borderThickness: 3,
    cornerOrnament: 'arabesque',
  },
  {
    id: 'style-2-corporate-formal',
    number: 2,
    nameAr: 'النمط الرسمي المؤسسي',
    nameEn: 'Corporate Formal',
    frameType: 'corporate-formal',
    backgroundPattern: 'geometric-grid',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F8FAFC',
    primaryColor: '#0F172A',
    secondaryColor: '#1E3A8A',
    accentColor: '#C5A059',
    textColor: '#0F172A',
    borderThickness: 2,
    cornerOrnament: 'geometric',
  },
  {
    id: 'style-3-classic-european',
    number: 3,
    nameAr: 'النمط الكلاسيكي الأوروبي',
    nameEn: 'Classic European',
    frameType: 'classic-european',
    backgroundPattern: 'guilloche',
    backgroundColor: '#FCFBF7',
    backgroundGradientEnd: '#F5EFE0',
    primaryColor: '#1C1917',
    secondaryColor: '#854D0E',
    accentColor: '#CA8A04',
    textColor: '#1C1917',
    borderThickness: 3,
    cornerOrnament: 'victorian',
  },
  {
    id: 'style-4-islamic-arabesque',
    number: 4,
    nameAr: 'النمط العربي الإسلامي بزخارف هندسية',
    nameEn: 'Islamic Geometric Arabesque',
    frameType: 'islamic-arabesque',
    backgroundPattern: 'islamic-stars',
    backgroundColor: '#FEFDFB',
    backgroundGradientEnd: '#F7F2E7',
    primaryColor: '#064E3B',
    secondaryColor: '#B45309',
    accentColor: '#D97706',
    textColor: '#064E3B',
    borderThickness: 3,
    cornerOrnament: 'islamic',
  },
  {
    id: 'style-5-modern-geometric',
    number: 5,
    nameAr: 'النمط الهندسي الحديث',
    nameEn: 'Modern Geometric',
    frameType: 'modern-geometric',
    backgroundPattern: 'diagonal-lines',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F1F5F9',
    primaryColor: '#0F172A',
    secondaryColor: '#0284C7',
    accentColor: '#38BDF8',
    textColor: '#0F172A',
    borderThickness: 2,
    cornerOrnament: 'angular',
  },
  {
    id: 'style-6-minimal',
    number: 6,
    nameAr: 'النمط البسيط Minimal',
    nameEn: 'Minimalist Clean',
    frameType: 'minimal-clean',
    backgroundPattern: 'none',
    backgroundColor: '#FFFFFF',
    primaryColor: '#18181B',
    secondaryColor: '#71717A',
    accentColor: '#A16207',
    textColor: '#18181B',
    borderThickness: 1,
    cornerOrnament: 'none',
  },
  {
    id: 'style-7-luxury-multi',
    number: 7,
    nameAr: 'النمط الفاخر بإطارات متعددة',
    nameEn: 'Luxury Multi-Frame',
    frameType: 'luxury-multi',
    backgroundPattern: 'guilloche',
    backgroundColor: '#FFFDF9',
    backgroundGradientEnd: '#F9F1DF',
    primaryColor: '#0B192C',
    secondaryColor: '#9A6F1A',
    accentColor: '#D4AF37',
    textColor: '#0B192C',
    borderThickness: 4,
    cornerOrnament: 'royal',
  },
  {
    id: 'style-8-marble-gold',
    number: 8,
    nameAr: 'نمط الرخام والذهب',
    nameEn: 'Marble & Gold',
    frameType: 'marble-gold',
    backgroundPattern: 'marble',
    backgroundColor: '#FAFAFA',
    backgroundGradientEnd: '#F3F4F6',
    primaryColor: '#1F2937',
    secondaryColor: '#B45309',
    accentColor: '#D4AF37',
    textColor: '#111827',
    borderThickness: 3,
    cornerOrnament: 'angular',
  },
  {
    id: 'style-9-botanical',
    number: 9,
    nameAr: 'نمط الأوراق والزخارف النباتية',
    nameEn: 'Botanical Foliage',
    frameType: 'botanical-leaves',
    backgroundPattern: 'floral-watermark',
    backgroundColor: '#FCFDF9',
    backgroundGradientEnd: '#F2F7EE',
    primaryColor: '#14532D',
    secondaryColor: '#3F6212',
    accentColor: '#CA8A04',
    textColor: '#14532D',
    borderThickness: 2,
    cornerOrnament: 'leaves',
  },
  {
    id: 'style-10-floral-roses',
    number: 10,
    nameAr: 'نمط الورود والأزهار',
    nameEn: 'Floral & Roses',
    frameType: 'floral-roses',
    backgroundPattern: 'floral-watermark',
    backgroundColor: '#FFFBFB',
    backgroundGradientEnd: '#FDF2F8',
    primaryColor: '#831843',
    secondaryColor: '#BE185D',
    accentColor: '#D97706',
    textColor: '#4C0519',
    borderThickness: 2,
    cornerOrnament: 'floral',
  },
  {
    id: 'style-11-gold-silver',
    number: 11,
    nameAr: 'نمط الخطوط الذهبية والفضية',
    nameEn: 'Gold & Silver Lines',
    frameType: 'gold-silver-lines',
    backgroundPattern: 'diagonal-lines',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F8FAFC',
    primaryColor: '#1E293B',
    secondaryColor: '#64748B',
    accentColor: '#C5A059',
    textColor: '#0F172A',
    borderThickness: 3,
    cornerOrnament: 'geometric',
  },
  {
    id: 'style-12-navy-gold',
    number: 12,
    nameAr: 'نمط الأزرق والذهبي',
    nameEn: 'Navy & Gold',
    frameType: 'navy-gold',
    backgroundPattern: 'guilloche',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F0F6FF',
    primaryColor: '#0B192C',
    secondaryColor: '#1D4ED8',
    accentColor: '#D4AF37',
    textColor: '#0B192C',
    borderThickness: 3,
    cornerOrnament: 'royal',
  },
  {
    id: 'style-13-emerald-gold',
    number: 13,
    nameAr: 'نمط الأخضر والذهبي',
    nameEn: 'Emerald & Gold',
    frameType: 'emerald-gold',
    backgroundPattern: 'islamic-stars',
    backgroundColor: '#FCFDFC',
    backgroundGradientEnd: '#ECFDF5',
    primaryColor: '#064E3B',
    secondaryColor: '#047857',
    accentColor: '#D4AF37',
    textColor: '#064E3B',
    borderThickness: 3,
    cornerOrnament: 'islamic',
  },
  {
    id: 'style-14-black-gold',
    number: 14,
    nameAr: 'نمط الأسود والذهبي',
    nameEn: 'Obsidian Black & Gold',
    frameType: 'black-gold',
    backgroundPattern: 'guilloche',
    backgroundColor: '#111827',
    backgroundGradientEnd: '#1F2937',
    primaryColor: '#F9FAFB',
    secondaryColor: '#D4AF37',
    accentColor: '#F59E0B',
    textColor: '#F9FAFB',
    borderThickness: 3,
    cornerOrnament: 'royal',
  },
  {
    id: 'style-15-pastel-soft',
    number: 15,
    nameAr: 'نمط الباستيل الناعم',
    nameEn: 'Soft Pastel',
    frameType: 'pastel-soft',
    backgroundPattern: 'dots',
    backgroundColor: '#FFFDFB',
    backgroundGradientEnd: '#FEF3C7',
    primaryColor: '#334155',
    secondaryColor: '#0D9488',
    accentColor: '#F59E0B',
    textColor: '#1E293B',
    borderThickness: 2,
    cornerOrnament: 'floral',
  },
  {
    id: 'style-16-kids-school',
    number: 16,
    nameAr: 'نمط المدارس والأطفال',
    nameEn: 'Schools & Kids Playful',
    frameType: 'kids-playful',
    backgroundPattern: 'confetti',
    backgroundColor: '#FFFDF5',
    backgroundGradientEnd: '#FEF9C3',
    primaryColor: '#1D4ED8',
    secondaryColor: '#EC4899',
    accentColor: '#F59E0B',
    textColor: '#1E293B',
    borderThickness: 4,
    cornerOrnament: 'stars',
  },
  {
    id: 'style-17-training-pro',
    number: 17,
    nameAr: 'نمط التدريب والتطوير المهني',
    nameEn: 'Professional Training',
    frameType: 'training-pro',
    backgroundPattern: 'geometric-grid',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F8FAFC',
    primaryColor: '#0F172A',
    secondaryColor: '#0369A1',
    accentColor: '#C5A059',
    textColor: '#0F172A',
    borderThickness: 2,
    cornerOrnament: 'angular',
  },
  {
    id: 'style-18-tech-innovation',
    number: 18,
    nameAr: 'نمط التقنية والابتكار',
    nameEn: 'Tech & Innovation',
    frameType: 'tech-innovation',
    backgroundPattern: 'geometric-grid',
    backgroundColor: '#F8FAFC',
    backgroundGradientEnd: '#E0F2FE',
    primaryColor: '#0F172A',
    secondaryColor: '#0284C7',
    accentColor: '#06B6D4',
    textColor: '#0F172A',
    borderThickness: 2,
    cornerOrnament: 'tech',
  },
  {
    id: 'style-19-competitions',
    number: 19,
    nameAr: 'نمط المسابقات والجوائز',
    nameEn: 'Competitions & Awards',
    frameType: 'competition-awards',
    backgroundPattern: 'waves',
    backgroundColor: '#FFFDF7',
    backgroundGradientEnd: '#FEF3C7',
    primaryColor: '#7C2D12',
    secondaryColor: '#B45309',
    accentColor: '#EAB308',
    textColor: '#1C1917',
    borderThickness: 3,
    cornerOrnament: 'royal',
  },
  {
    id: 'style-20-modern-horizontal',
    number: 20,
    nameAr: 'نمط الشهادات الأفقية الحديثة',
    nameEn: 'Modern Horizontal Ribbon',
    frameType: 'modern-horizontal',
    backgroundPattern: 'diagonal-lines',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F1F5F9',
    primaryColor: '#0B192C',
    secondaryColor: '#C5A059',
    accentColor: '#2563EB',
    textColor: '#0F172A',
    borderThickness: 2,
    cornerOrnament: 'geometric',
  },
  {
    id: 'style-21-vertical-formal',
    number: 21,
    nameAr: 'نمط الشهادات العمودية',
    nameEn: 'Vertical Formal Portrait',
    frameType: 'vertical-formal',
    backgroundPattern: 'guilloche',
    backgroundColor: '#FFFDF9',
    backgroundGradientEnd: '#F8F0DF',
    primaryColor: '#0B192C',
    secondaryColor: '#B8860B',
    accentColor: '#D4AF37',
    textColor: '#0B192C',
    borderThickness: 3,
    cornerOrnament: 'arabesque',
  },
  {
    id: 'style-22-official-seals',
    number: 22,
    nameAr: 'نمط الشهادات ذات الأختام الرسمية التصميمية',
    nameEn: 'Official Design Seal Crest',
    frameType: 'official-seal-frame',
    backgroundPattern: 'guilloche',
    backgroundColor: '#FCFBF7',
    backgroundGradientEnd: '#F3EAD6',
    primaryColor: '#0F172A',
    secondaryColor: '#991B1B',
    accentColor: '#D4AF37',
    textColor: '#0F172A',
    borderThickness: 3,
    cornerOrnament: 'victorian',
  },
  {
    id: 'style-23-double-triple',
    number: 23,
    nameAr: 'نمط الإطارات المزدوجة والثلاثية',
    nameEn: 'Double & Triple Architectural Frame',
    frameType: 'double-triple-border',
    backgroundPattern: 'none',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#FAF8F5',
    primaryColor: '#1E293B',
    secondaryColor: '#9A6F1A',
    accentColor: '#C5A059',
    textColor: '#0F172A',
    borderThickness: 4,
    cornerOrnament: 'geometric',
  },
  {
    id: 'style-24-ornate-corners',
    number: 24,
    nameAr: 'نمط الشهادات ذات الزخارف في الزوايا',
    nameEn: 'Ornate Corner Filigree',
    frameType: 'ornate-corners',
    backgroundPattern: 'floral-watermark',
    backgroundColor: '#FFFDF9',
    backgroundGradientEnd: '#F6EFE2',
    primaryColor: '#1C1917',
    secondaryColor: '#A16207',
    accentColor: '#D4AF37',
    textColor: '#1C1917',
    borderThickness: 2,
    cornerOrnament: 'arabesque',
  },
  {
    id: 'style-25-subtle-geometric',
    number: 25,
    nameAr: 'نمط الشهادات ذات الخلفيات الهندسية الخفيفة',
    nameEn: 'Subtle Geometric Mesh',
    frameType: 'subtle-mesh',
    backgroundPattern: 'geometric-grid',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F4F7FB',
    primaryColor: '#0F172A',
    secondaryColor: '#334155',
    accentColor: '#C5A059',
    textColor: '#0F172A',
    borderThickness: 2,
    cornerOrnament: 'angular',
  },
  // === 17 NEW FORMAL, CORPORATE, EXECUTIVE & BUSINESS STYLES (26..42) ===
  {
    id: 'style-26-executive-platinum',
    number: 26,
    nameAr: 'نمط الإدارة التنفيذية البلاتيني (للشركات الكبرى)',
    nameEn: 'Executive Platinum Corporate',
    frameType: 'executive-platinum',
    backgroundPattern: 'executive-pinstripe',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F1F5F9',
    primaryColor: '#0F172A',
    secondaryColor: '#334155',
    accentColor: '#94A3B8',
    textColor: '#0F172A',
    borderThickness: 3,
    cornerOrnament: 'angular',
  },
  {
    id: 'style-27-diplomatic-embassy',
    number: 27,
    nameAr: 'النمط الدبلوماسي والبروتوكول الرسمي',
    nameEn: 'Diplomatic Protocol & Embassy',
    frameType: 'diplomatic-embassy',
    backgroundPattern: 'sovereign-rosette',
    backgroundColor: '#FFFCF5',
    backgroundGradientEnd: '#F7EFE0',
    primaryColor: '#7F1D1D',
    secondaryColor: '#9A6F1A',
    accentColor: '#D4AF37',
    textColor: '#1C1917',
    borderThickness: 3,
    cornerOrnament: 'royal',
  },
  {
    id: 'style-28-iso-accreditation',
    number: 28,
    nameAr: 'نمط شهادات الجودة والاعتماد المؤسسي (ISO)',
    nameEn: 'ISO & Quality Accreditation Standard',
    frameType: 'iso-accreditation',
    backgroundPattern: 'micro-ledger',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F0F9FF',
    primaryColor: '#0C4A6E',
    secondaryColor: '#0369A1',
    accentColor: '#C5A059',
    textColor: '#0F172A',
    borderThickness: 3,
    cornerOrnament: 'geometric',
  },
  {
    id: 'style-29-banking-guilloche',
    number: 29,
    nameAr: 'النمط المصرفي والمالي الموثّق (غيلوش أمني)',
    nameEn: 'Financial & Banking Security Guilloche',
    frameType: 'banking-guilloche',
    backgroundPattern: 'guilloche',
    backgroundColor: '#FCFDF9',
    backgroundGradientEnd: '#EEF2EA',
    primaryColor: '#14532D',
    secondaryColor: '#1E3A8A',
    accentColor: '#B8860B',
    textColor: '#0F172A',
    borderThickness: 4,
    cornerOrnament: 'victorian',
  },
  {
    id: 'style-30-ministry-sovereign',
    number: 30,
    nameAr: 'النمط السيادي والديواني الرفيع',
    nameEn: 'Sovereign Diwan & Ministry Crest',
    frameType: 'ministry-sovereign',
    backgroundPattern: 'sovereign-rosette',
    backgroundColor: '#FFFDF8',
    backgroundGradientEnd: '#F5EEDC',
    primaryColor: '#064E3B',
    secondaryColor: '#92400E',
    accentColor: '#D4AF37',
    textColor: '#064E3B',
    borderThickness: 4,
    cornerOrnament: 'islamic',
  },
  {
    id: 'style-31-boardroom-mahogany',
    number: 31,
    nameAr: 'نمط مجالس الإدارة والحوكمة (ماهوغاني وذهبي)',
    nameEn: 'Boardroom Governance Mahogany',
    frameType: 'boardroom-mahogany',
    backgroundPattern: 'executive-pinstripe',
    backgroundColor: '#FFFDFB',
    backgroundGradientEnd: '#FBF3EE',
    primaryColor: '#451A03',
    secondaryColor: '#78350F',
    accentColor: '#D97706',
    textColor: '#1C1917',
    borderThickness: 4,
    cornerOrnament: 'royal',
  },
  {
    id: 'style-32-chancery-scroll',
    number: 32,
    nameAr: 'نمط الوثائق والمراسيم الكلاسيكية للأعمال',
    nameEn: 'Chancery Executive Charter',
    frameType: 'chancery-scroll',
    backgroundPattern: 'guilloche',
    backgroundColor: '#FDFBF7',
    backgroundGradientEnd: '#F3EAD8',
    primaryColor: '#1E293B',
    secondaryColor: '#854D0E',
    accentColor: '#CA8A04',
    textColor: '#0F172A',
    borderThickness: 3,
    cornerOrnament: 'victorian',
  },
  {
    id: 'style-33-corporate-sidebar-right',
    number: 33,
    nameAr: 'نمط الأعمال ذو الشريط الجانبي الأيمن الفاخر',
    nameEn: 'Corporate Right Sidebar Accent',
    frameType: 'corporate-sidebar-right',
    backgroundPattern: 'micro-ledger',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F8FAFC',
    primaryColor: '#0B192C',
    secondaryColor: '#1E40AF',
    accentColor: '#D4AF37',
    textColor: '#0F172A',
    borderThickness: 2,
    cornerOrnament: 'geometric',
  },
  {
    id: 'style-34-corporate-sidebar-left',
    number: 34,
    nameAr: 'نمط الشركات الاستشارية والهندسية الحديث',
    nameEn: 'Consulting & Engineering Sidebar',
    frameType: 'corporate-sidebar-left',
    backgroundPattern: 'geometric-grid',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#F3F4F6',
    primaryColor: '#111827',
    secondaryColor: '#0F766E',
    accentColor: '#D97706',
    textColor: '#111827',
    borderThickness: 2,
    cornerOrnament: 'angular',
  },
  {
    id: 'style-35-academic-senate',
    number: 35,
    nameAr: 'نمط المجالس العلمية والزمالات المهنية العليا',
    nameEn: 'Academic Senate & Executive Fellowship',
    frameType: 'academic-senate',
    backgroundPattern: 'guilloche',
    backgroundColor: '#FFFDF9',
    backgroundGradientEnd: '#F5EFE2',
    primaryColor: '#1E1B4B',
    secondaryColor: '#9A6F1A',
    accentColor: '#D4AF37',
    textColor: '#0F172A',
    borderThickness: 3,
    cornerOrnament: 'victorian',
  },
  {
    id: 'style-36-legal-notary',
    number: 36,
    nameAr: 'النمط القانوني والتحكيم التجاري الموثّق',
    nameEn: 'Legal Chamber & Commercial Arbitration',
    frameType: 'legal-notary',
    backgroundPattern: 'executive-pinstripe',
    backgroundColor: '#FCFBF9',
    backgroundGradientEnd: '#F4F1EA',
    primaryColor: '#1C1917',
    secondaryColor: '#7F1D1D',
    accentColor: '#B45309',
    textColor: '#1C1917',
    borderThickness: 3,
    cornerOrnament: 'geometric',
  },
  {
    id: 'style-37-swiss-grid-executive',
    number: 37,
    nameAr: 'النمط السويسري المعماري الدقيق للأعمال',
    nameEn: 'Swiss Architectural Grid Executive',
    frameType: 'swiss-grid-executive',
    backgroundPattern: 'micro-ledger',
    backgroundColor: '#FFFFFF',
    primaryColor: '#09090B',
    secondaryColor: '#27272A',
    accentColor: '#B45309',
    textColor: '#09090B',
    borderThickness: 2,
    cornerOrnament: 'none',
  },
  {
    id: 'style-38-gold-pillar-classical',
    number: 38,
    nameAr: 'نمط الأعمدة الذهبية الكلاسيكي للغرف التجارية',
    nameEn: 'Chamber of Commerce Gold Pillars',
    frameType: 'gold-pillar-classical',
    backgroundPattern: 'sovereign-rosette',
    backgroundColor: '#FFFDF7',
    backgroundGradientEnd: '#F9F1DF',
    primaryColor: '#0B192C',
    secondaryColor: '#92400E',
    accentColor: '#D4AF37',
    textColor: '#0B192C',
    borderThickness: 4,
    cornerOrnament: 'royal',
  },
  {
    id: 'style-39-titanium-tech-corp',
    number: 39,
    nameAr: 'نمط التيتانيوم والأمن السيبراني المؤسسي',
    nameEn: 'Titanium Enterprise & Cybersecurity',
    frameType: 'titanium-tech-corp',
    backgroundPattern: 'geometric-grid',
    backgroundColor: '#0F172A',
    backgroundGradientEnd: '#1E293B',
    primaryColor: '#F8FAFC',
    secondaryColor: '#38BDF8',
    accentColor: '#C5A059',
    textColor: '#F8FAFC',
    borderThickness: 3,
    cornerOrnament: 'tech',
  },
  {
    id: 'style-40-emerald-diwan',
    number: 40,
    nameAr: 'النمط الزمردي الديواني المزخرف بالأرابيسك',
    nameEn: 'Emerald Diwan & Gold Arabesque',
    frameType: 'emerald-diwan',
    backgroundPattern: 'islamic-stars',
    backgroundColor: '#FCFDFB',
    backgroundGradientEnd: '#ECFDF5',
    primaryColor: '#064E3B',
    secondaryColor: '#047857',
    accentColor: '#D4AF37',
    textColor: '#064E3B',
    borderThickness: 4,
    cornerOrnament: 'islamic',
  },
  {
    id: 'style-41-sapphire-protocol',
    number: 41,
    nameAr: 'نمط الياقوت الأزرق للاعتمادات الدولية والشراكات',
    nameEn: 'Sapphire International Partnership',
    frameType: 'sapphire-protocol',
    backgroundPattern: 'guilloche',
    backgroundColor: '#FFFFFF',
    backgroundGradientEnd: '#EFF6FF',
    primaryColor: '#1E3A8A',
    secondaryColor: '#1D4ED8',
    accentColor: '#D4AF37',
    textColor: '#0F172A',
    borderThickness: 3,
    cornerOrnament: 'royal',
  },
  {
    id: 'style-42-heritage-arch',
    number: 42,
    nameAr: 'نمط المحراب والقوس التراثي العربي الفاخر',
    nameEn: 'Arabian Heritage Archway',
    frameType: 'heritage-arch',
    backgroundPattern: 'islamic-stars',
    backgroundColor: '#FFFDF8',
    backgroundGradientEnd: '#F7EFE0',
    primaryColor: '#451A03',
    secondaryColor: '#064E3B',
    accentColor: '#D4AF37',
    textColor: '#1C1917',
    borderThickness: 3,
    cornerOrnament: 'islamic',
  },
];

export interface FontOption {
  family: string;
  labelAr: string;
  labelEn: string;
  categoryAr: string;
  categoryEn: string;
  script: 'ar' | 'en';
}

export const FONT_LIBRARY: FontOption[] = [
  // === 1. DIWANI, TUGHRA & SULTANIC CALLIGRAPHIC FONTS (الخط الديواني وخط الطغراء والرقعة المزخرف) ===
  {
    family: 'Rakkas',
    labelAr: 'الخط الديواني الجلي المزخرف (Rakkas) — للعناوين السلطانية والطغراء',
    labelEn: 'Rakkas (Ornate Diwani & Tughra Display)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },
  {
    family: 'Aref Ruqaa',
    labelAr: 'خط الرقعة والديواني المزخرف (Aref Ruqaa) — للأسماء والشهادات الفاخرة',
    labelEn: 'Aref Ruqaa (Calligraphic Ruqaa & Diwani)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },
  {
    family: 'Vibes',
    labelAr: 'خط الطغراء والديواني الحر (Vibes) — للأختام والتوقيعات السلطانية',
    labelEn: 'Vibes (Sultanic Tughra & Freehand Diwani)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },
  {
    family: 'Gulzar',
    labelAr: 'خط النستعليق الديواني المزخرف (Gulzar) — مخطوطات ملكية منسابة',
    labelEn: 'Gulzar (Royal Nastaliq Calligraphic)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },
  {
    family: 'Marhey',
    labelAr: 'خط الديواني الانسيابي الحديث (Marhey) — للعناوين الاحتفالية المزخرفة',
    labelEn: 'Marhey (Ornate Flowing Calligraphic)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },

  // === 2. THULUTH & ORNATE NASKH CALLIGRAPHIC FONTS (خط الثلث الجلي والنسخ التراثي المشكول) ===
  {
    family: 'Amiri',
    labelAr: 'خط الثلث والنسخ الأميري المشكول (Amiri) — روائع الخط الكلاسيكي',
    labelEn: 'Amiri (Classical Thuluth/Naskh Serif)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },
  {
    family: 'Katibeh',
    labelAr: 'خط الثلث التراثي العريض (Katibeh) — لترويسات الشهادات الكبرى',
    labelEn: 'Katibeh (Monumental Thuluth Header)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },
  {
    family: 'Mirza',
    labelAr: 'خط ميرزا الفارسي والثلث المزخرف (Mirza) — حروف ذات حليات كلاسيكية',
    labelEn: 'Mirza (Ornate Thuluth-Persian Script)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },
  {
    family: 'Scheherazade New',
    labelAr: 'خط المصحف والنسخ الجلي المشكول (Scheherazade) — يدعم التشكيل الكامل',
    labelEn: 'Scheherazade New (Vocalized Sovereign Naskh)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },
  {
    family: 'Lateef',
    labelAr: 'خط لطيف التراثي الممدود (Lateef) — خط المخطوطات والإجازات العلمية',
    labelEn: 'Lateef (Traditional Manuscript Script)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },
  {
    family: 'Alkalami',
    labelAr: 'الخط المغربي والسوداني المزخرف (Alkalami) — خط القلم التراثي العريض',
    labelEn: 'Alkalami (Heritage Calligraphic Reed Pen)',
    categoryAr: 'خطوط الديواني والطغراء والثلث المزخرفة',
    categoryEn: 'Diwani, Tughra & Thuluth Calligraphic',
    script: 'ar',
  },

  // === 3. KUFIC ORNATE, FOLIATED & GEOMETRIC FONTS (الخط الكوفي المورّق والمصحفي والهندسي) ===
  {
    family: 'Reem Kufi',
    labelAr: 'الخط الكوفي الفاطمي المزخرف (Reem Kufi) — كوفي كلاسيكي فاخر',
    labelEn: 'Reem Kufi (Fatimid Ornate Kufic)',
    categoryAr: 'الخط الكوفي المزخرف والهندسي',
    categoryEn: 'Ornate & Geometric Kufic',
    script: 'ar',
  },
  {
    family: 'Kufam',
    labelAr: 'الخط الكوفي المصحفي والمعماري (Kufam) — حروف كوفية مزخرفة',
    labelEn: 'Kufam (Architectural & Mushaf Kufic)',
    categoryAr: 'الخط الكوفي المزخرف والهندسي',
    categoryEn: 'Ornate & Geometric Kufic',
    script: 'ar',
  },
  {
    family: 'Qahiri',
    labelAr: 'الخط الكوفي المربع المملوكي (Qahiri) — زخرفة هندسية تراثية',
    labelEn: 'Qahiri (Mamluk Square Kufic)',
    categoryAr: 'الخط الكوفي المزخرف والهندسي',
    categoryEn: 'Ornate & Geometric Kufic',
    script: 'ar',
  },
  {
    family: 'Lalezar',
    labelAr: 'خط لاليزار السلطاني الثقيل (Lalezar) — كوفي/ديواني بارز للعناوين',
    labelEn: 'Lalezar (Heavy Sultanic Display)',
    categoryAr: 'الخط الكوفي المزخرف والهندسي',
    categoryEn: 'Ornate & Geometric Kufic',
    script: 'ar',
  },
  {
    family: 'El Messiri',
    labelAr: 'خط المسيري الكوفي الفني (El Messiri) — انحناءات زخرفية أنيقة',
    labelEn: 'El Messiri (Artistic Kufic Sans)',
    categoryAr: 'الخط الكوفي المزخرف والهندسي',
    categoryEn: 'Ornate & Geometric Kufic',
    script: 'ar',
  },
  {
    family: 'Lemonada',
    labelAr: 'خط ليمونادة المزخرف (Lemonada) — حروف عربية حيوية ومرسومة',
    labelEn: 'Lemonada (Expressive Handcrafted Arabic)',
    categoryAr: 'الخط الكوفي المزخرف والهندسي',
    categoryEn: 'Ornate & Geometric Kufic',
    script: 'ar',
  },

  // === 4. FORMAL, CLASSICAL & SOVEREIGN ARABIC FONTS ===
  {
    family: 'Markazi Text',
    labelAr: 'الخط المركزي الديواني (Markazi Text) — للوثائق الرسمية والبيانات',
    labelEn: 'Markazi Text (Sovereign Editorial)',
    categoryAr: 'خطوط عربية رسمية وكلاسيكية',
    categoryEn: 'Formal & Classical Arabic',
    script: 'ar',
  },
  {
    family: 'Noto Kufi Arabic',
    labelAr: 'نوتو كوفي الرسمي (Noto Kufi) — خط الوزارات والمؤسسات الكبرى',
    labelEn: 'Noto Kufi Arabic (Institutional)',
    categoryAr: 'خطوط عربية رسمية وكلاسيكية',
    categoryEn: 'Formal & Classical Arabic',
    script: 'ar',
  },
  {
    family: 'Harmattan',
    labelAr: 'هرمتان التراثي (Harmattan) — خط عربي رصين وواضح للنصوص',
    labelEn: 'Harmattan (Classical Calligraphic Body)',
    categoryAr: 'خطوط عربية رسمية وكلاسيكية',
    categoryEn: 'Formal & Classical Arabic',
    script: 'ar',
  },

  // === 5. CORPORATE, BUSINESS & MODERN READABLE ARABIC FONTS ===
  {
    family: 'Cairo',
    labelAr: 'القاهرة (Cairo) — خط الشركات والأعمال الحديث',
    labelEn: 'Cairo (Corporate Modern Arabic)',
    categoryAr: 'خطوط عربية للأعمال والقراءة',
    categoryEn: 'Business & Modern Arabic',
    script: 'ar',
  },
  {
    family: 'IBM Plex Sans Arabic',
    labelAr: 'آي بي إم بلكس (IBM Plex Arabic) — خط رسمي تنفيذي للأعمال',
    labelEn: 'IBM Plex Sans Arabic (Executive Business)',
    categoryAr: 'خطوط عربية للأعمال والقراءة',
    categoryEn: 'Business & Modern Arabic',
    script: 'ar',
  },
  {
    family: 'Changa',
    labelAr: 'تشانغا (Changa) — خط هندسي رسمي للشركات والاعتمادات',
    labelEn: 'Changa (Corporate Geometric)',
    categoryAr: 'خطوط عربية للأعمال والقراءة',
    categoryEn: 'Business & Modern Arabic',
    script: 'ar',
  },
  {
    family: 'Tajawal',
    labelAr: 'تجوال (Tajawal) — خط سلس وواضح للنصوص والفقرات',
    labelEn: 'Tajawal (Clean Readable)',
    categoryAr: 'خطوط عربية للأعمال والقراءة',
    categoryEn: 'Business & Modern Arabic',
    script: 'ar',
  },
  {
    family: 'Almarai',
    labelAr: 'المراعي (Almarai) — خط مؤسسي متزن للبيانات',
    labelEn: 'Almarai (Crisp Corporate Body)',
    categoryAr: 'خطوط عربية للأعمال والقراءة',
    categoryEn: 'Business & Modern Arabic',
    script: 'ar',
  },
  {
    family: 'Readex Pro',
    labelAr: 'ريدكس برو (Readex Pro) — عصري للتقنية والتدريب المهني',
    labelEn: 'Readex Pro (Contemporary Tech)',
    categoryAr: 'خطوط عربية للأعمال والقراءة',
    categoryEn: 'Business & Modern Arabic',
    script: 'ar',
  },

  // === 6. CLASSICAL & EXECUTIVE LATIN FONTS ===
  {
    family: 'Cinzel',
    labelAr: 'سينزل (Cinzel) — كلاسيكي فاخر للشهادات اللاتينية',
    labelEn: 'Cinzel (Luxury Classical)',
    categoryAr: 'خطوط كلاسيكية ولاتينية للأعمال',
    categoryEn: 'Luxury & Executive Latin',
    script: 'en',
  },
  {
    family: 'Playfair Display',
    labelAr: 'بلاي فير (Playfair Display) — أكاديمي ودبلوماسي أنيق',
    labelEn: 'Playfair Display (Editorial Serif)',
    categoryAr: 'خطوط كلاسيكية ولاتينية للأعمال',
    categoryEn: 'Luxury & Executive Latin',
    script: 'en',
  },
  {
    family: 'Cormorant Garamond',
    labelAr: 'كورمورانت (Cormorant) — دبلوماسي رفيع',
    labelEn: 'Cormorant Garamond (Diplomatic Serif)',
    categoryAr: 'خطوط كلاسيكية ولاتينية للأعمال',
    categoryEn: 'Luxury & Executive Latin',
    script: 'en',
  },
  {
    family: 'Plus Jakarta Sans',
    labelAr: 'بلس جاكرتا (Plus Jakarta Sans) — لاتيني حديث للشركات',
    labelEn: 'Plus Jakarta Sans (Modern Corporate Sans)',
    categoryAr: 'خطوط كلاسيكية ولاتينية للأعمال',
    categoryEn: 'Luxury & Executive Latin',
    script: 'en',
  },
];

// === READY-MADE PRE-DECORATED CALLIGRAPHIC TITLES & VOCALIZED PHRASES (زخارف الخط العربي الجاهزة بالتشكيل والمدود) ===
export interface DecoratedCalligraphyPreset {
  id: string;
  styleNameAr: string;
  targetRole: 'title' | 'subtitle' | 'intro' | 'recipientName';
  text: string;
  recommendedFont: string;
}

export const DECORATED_ARABIC_CALLIGRAPHY_PRESETS: DecoratedCalligraphyPreset[] = [
  {
    id: 'cal-thuluth-appreciation',
    styleNameAr: 'خط الثلث الجلي المشكول — شهادة شكر وتقدير',
    targetRole: 'title',
    text: '۞ شَهَـٰـادَةُ شُكْــرٍ وَتَقْـدِيــرٍ ۞',
    recommendedFont: 'Amiri',
  },
  {
    id: 'cal-diwani-excellence',
    styleNameAr: 'الخط الديواني السلطاني — وسام التميز والإبداع',
    targetRole: 'title',
    text: '༺ وِسَــامُ التَّمَيُّــزِ وَالإِبْــدَاعِ المِهَنِــيِّ ༻',
    recommendedFont: 'Rakkas',
  },
  {
    id: 'cal-tughra-honor',
    styleNameAr: 'طغراء التكريم الديواني — شهادة تكريم واستحقاق',
    targetRole: 'title',
    text: '❁ شَهَــادَةُ تَكْرِيــمٍ وَاسْتِحْقَــاقٍ رَفِيــعٍ ❁',
    recommendedFont: 'Katibeh',
  },
  {
    id: 'cal-kufic-training',
    styleNameAr: 'الخط الكوفي المورّق — شهادة اجتياز واعتماد',
    targetRole: 'title',
    text: '❖ شَهَـادَةُ اجْتِيَـازٍ وَإِتْمَـامِ بَرْنَامَـجٍ تَدْرِيبِـيٍّ ❖',
    recommendedFont: 'Reem Kufi',
  },
  {
    id: 'cal-mushaf-ijaza',
    styleNameAr: 'خط الإجازة والمخطوطات — شهادة إجازة وتفوق علمي',
    targetRole: 'title',
    text: '﴿ شَهَـٰـادَةُ إِجَــازَةٍ وَتَفَــوُّقٍ عِلْمِــيٍّ ﴾',
    recommendedFont: 'Scheherazade New',
  },
  {
    id: 'cal-bismillah-subtitle',
    styleNameAr: 'ترويسة البسملة المزخرفة بالثلث والنسخ',
    targetRole: 'subtitle',
    text: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ ✦ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ',
    recommendedFont: 'Amiri',
  },
  {
    id: 'cal-diwani-subtitle',
    styleNameAr: 'سطر فرعي ديواني مزخرف بالحليات',
    targetRole: 'subtitle',
    text: '✧ عِرْفَـانًـا بِالعَطَـاءِ المُتَمَيِّـزِ وَالإِخْـلَاصِ فِـي العَمَـلِ ✧',
    recommendedFont: 'Aref Ruqaa',
  },
  {
    id: 'cal-recipient-royal',
    styleNameAr: 'تزيين اسم المكرّم بالحليات الديوانية والمدود',
    targetRole: 'recipientName',
    text: '༺ إِلى الأُسْتَـاذِ / خَالِـد أَحْمَـد عَبْدِاللَّهِ الهَاشِمِـي ༻',
    recommendedFont: 'Aref Ruqaa',
  },
];

export function applyCalligraphicKashidaAndOrnament(
  rawText: string,
  mode: 'diwani-brackets' | 'islamic-rosette' | 'kashida-stretch' | 'strip-ornaments'
): string {
  const cleaned = rawText
    .replace(/[۞༺༻❁❖﴿﴾✦✧]/g, '')
    .replace(/ـ+/g, '')
    .trim();

  if (mode === 'strip-ornaments') {
    return cleaned;
  }
  if (mode === 'diwani-brackets') {
    return `༺ ${cleaned} ༻`;
  }
  if (mode === 'islamic-rosette') {
    return `۞ ${cleaned} ۞`;
  }
  // kashida-stretch: insert subtle Arabic tatweel (ـ) inside connected words for authentic Thuluth/Diwani/Kufic look
  const stretched = cleaned
    .replace(/شهاد/g, 'شَهَـاد')
    .replace(/تقدير/g, 'تَقْـدِيـر')
    .replace(/تكريم/g, 'تَكْـرِيـم')
    .replace(/تميز/g, 'تَمَيُّــز')
    .replace(/الأستاذ/g, 'الأُسْتَــاذ')
    .replace(/الهاشمي/g, 'الهَاشِمِــي');
  if (stretched === cleaned) {
    // Generic tatweel insertion on first suitable Arabic connecting letter per word
    return cleaned
      .split(' ')
      .map((word) => {
        if (word.length < 4) return word;
        return word.slice(0, 2) + 'ـ' + word.slice(2);
      })
      .join(' ');
  }
  return stretched;
}

export const ORNAMENT_CATALOG: {
  variant: OrnamentVariant;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  defaultColor: string;
}[] = [
  { variant: 'tughra-monogram', nameAr: 'طغراء سلطانية ديوانية مزخرفة (خط الطغراء)', nameEn: 'Sultanic Calligraphic Tughra', categoryAr: 'مخطوطات وطغراء وخط عربي', defaultColor: '#B8860B' },
  { variant: 'thuluth-banner', nameAr: 'مخطوطة خط الثلث الجلي المزخرف بالتشكيل', nameEn: 'Ornate Thuluth Calligraphic Finial', categoryAr: 'مخطوطات وطغراء وخط عربي', defaultColor: '#0B192C' },
  { variant: 'diwani-cartouche', nameAr: 'خرطوشة ديوانية ملكية مزخرفة بالحليات', nameEn: 'Royal Diwani Calligraphic Cartouche', categoryAr: 'مخطوطات وطغراء وخط عربي', defaultColor: '#9A6F1A' },
  { variant: 'kufic-medallion', nameAr: 'وسام الخط الكوفي المورّق والهندسي', nameEn: 'Foliated Kufic Medallion', categoryAr: 'مخطوطات وطغراء وخط عربي', defaultColor: '#064E3B' },
  { variant: 'crown-royal', nameAr: 'تاج ملكي ذهبي', nameEn: 'Royal Gold Crown', categoryAr: 'تيجان وأوسمة', defaultColor: '#C5A059' },
  { variant: 'laurel-wreath', nameAr: 'إكليل غار فاخر', nameEn: 'Laurel Wreath', categoryAr: 'أوراق نباتية وأغصان', defaultColor: '#B8860B' },
  { variant: 'islamic-rosette', nameAr: 'نجمة إسلامية ثمانية المزخرفة', nameEn: 'Islamic 8-Point Rosette', categoryAr: 'دوائر وزخارف هندسية', defaultColor: '#064E3B' },
  { variant: 'medal-ribbon', nameAr: 'ميدالية التميز بشريط', nameEn: 'Excellence Medal & Ribbon', categoryAr: 'ميداليات', defaultColor: '#D97706' },
  { variant: 'excellence-shield', nameAr: 'درع الريادة والتميز', nameEn: 'Excellence Shield', categoryAr: 'شارات التميز', defaultColor: '#0B192C' },
  { variant: 'star-cluster', nameAr: 'عنقود نجوم متألقة', nameEn: 'Five Star Cluster', categoryAr: 'نجوم ونجيمات', defaultColor: '#EAB308' },
  { variant: 'corner-arabesque', nameAr: 'زخرفة زاوية عربية', nameEn: 'Arabesque Filigree', categoryAr: 'زخارف مركزية', defaultColor: '#C5A059' },
  { variant: 'floral-branch', nameAr: 'غصن زهور مورق', nameEn: 'Botanical Floral Branch', categoryAr: 'ورود وزخارف خفيفة', defaultColor: '#15803D' },
  { variant: 'trophy-cup', nameAr: 'كأس البطولة الرياضية', nameEn: 'Championship Trophy', categoryAr: 'عناصر رياضية', defaultColor: '#CA8A04' },
  { variant: 'kids-star-smile', nameAr: 'وسام النجم المبدع للأطفال', nameEn: 'Kids Super Star Badge', categoryAr: 'عناصر طفولية', defaultColor: '#F59E0B' },
  { variant: 'tech-hexagon', nameAr: 'شارة ابتكار تقني سداسية', nameEn: 'Tech Hexagon Node', categoryAr: 'دوائر وزخارف هندسية', defaultColor: '#0284C7' },
  { variant: 'graduation-cap', nameAr: 'قبعة تخرج أكاديمية', nameEn: 'Academic Mortarboard Cap', categoryAr: 'شارات التميز', defaultColor: '#0F172A' },
  { variant: 'heart-care', nameAr: 'وسام العطاء التطوعي والإنساني', nameEn: 'Humanitarian Care Emblem', categoryAr: 'أوسمة', defaultColor: '#E11D48' },
  { variant: 'ribbon-banner', nameAr: 'شريط عنوان زخرفي', nameEn: 'Decorative Ribbon Banner', categoryAr: 'شرائط وأشرطة زخرفية', defaultColor: '#B45309' },
  { variant: 'quran-rehal', nameAr: 'مصحف شريف مفتوح على حامل خشبي (رحل)', nameEn: 'Open Quran on Wooden Rehal Stand', categoryAr: 'مخطوطات وطغراء وخط عربي', defaultColor: '#F5F2E6' },
  { variant: 'grad-cap-book-stars', nameAr: 'قبعة تخرج ذهبية على كتاب مفتوح ونجوم', nameEn: 'Graduation Cap on Open Book & Stars', categoryAr: 'شارات التميز', defaultColor: '#C58B2B' },
  { variant: 'charcoal-gold-medal', nameAr: 'وسام ذهبي مسنن بمركز رمادي وإكليل غار', nameEn: 'Gold Scalloped Laurel Medal', categoryAr: 'ميداليات', defaultColor: '#D4AF37' },
  { variant: 'navy-torch-book-medal', nameAr: 'وسام شعلة العلم والكتاب المفتوح (كحلي وذهبي)', nameEn: 'Navy & Gold Torch and Book Medal', categoryAr: 'ميداليات', defaultColor: '#D4AF37' },
  { variant: 'stepped-gold-corner', nameAr: 'زخرفة زاوية هندسية ثلاثية الخطوط', nameEn: 'Triple Stepped Gold Corner', categoryAr: 'زخارف مركزية', defaultColor: '#E5A93C' },
  { variant: 'royal-arabesque-crest', nameAr: 'حلية أرابيسك ملكية نباتية متناظرة', nameEn: 'Royal Arabesque Scrollwork Crest', categoryAr: 'زخارف مركزية', defaultColor: '#C5A059' },
  { variant: 'title-sparkle-rays', nameAr: 'إشراقات عنوان احتفالية مزدوجة', nameEn: 'Celebratory Title Sparkle Rays', categoryAr: 'نجوم ونجيمات', defaultColor: '#0B556C' },
  { variant: 'school-doodle-trophy', nameAr: 'رسم مائي مدرسي — كأس التفوق', nameEn: 'School Watermark — Trophy', categoryAr: 'عناصر رياضية', defaultColor: '#CBD5E1' },
  { variant: 'school-doodle-books', nameAr: 'رسم مائي مدرسي — كومة كتب', nameEn: 'School Watermark — Stack of Books', categoryAr: 'شارات التميز', defaultColor: '#CBD5E1' },
  { variant: 'school-doodle-backpack', nameAr: 'رسم مائي مدرسي — حقيبة مدرسية', nameEn: 'School Watermark — Backpack', categoryAr: 'عناصر طفولية', defaultColor: '#CBD5E1' },
  { variant: 'school-doodle-globe', nameAr: 'رسم مائي مدرسي — الكرة الأرضية', nameEn: 'School Watermark — Globe', categoryAr: 'دوائر وزخارف هندسية', defaultColor: '#CBD5E1' },
  { variant: 'school-doodle-pencils', nameAr: 'رسم مائي مدرسي — مقلمة أقلام', nameEn: 'School Watermark — Pencil Cup', categoryAr: 'عناصر طفولية', defaultColor: '#CBD5E1' },
];

export const DIVIDER_CATALOG: {
  variant: DividerVariant;
  nameAr: string;
  nameEn: string;
}[] = [
  { variant: 'diamond-center', nameAr: 'فاصل ماسي ملكي متناظر', nameEn: 'Royal Diamond Divider' },
  { variant: 'royal-flourish', nameAr: 'فاصل زخرفي كلاسيكي', nameEn: 'Classical Ornate Flourish' },
  { variant: 'islamic-knot', nameAr: 'فاصل هندسي عربي إسلامي', nameEn: 'Islamic Geometric Knot' },
  { variant: 'double-line', nameAr: 'خط مزدوج رسمي', nameEn: 'Formal Double Line' },
  { variant: 'dashed-gold', nameAr: 'خط متقطع أنيق', nameEn: 'Elegant Dashed Line' },
  { variant: 'minimal-taper', nameAr: 'خط انسيابي ناعم', nameEn: 'Minimal Tapered Line' },
  { variant: 'stars-divider', nameAr: 'فاصل النجوم المتألقة', nameEn: 'Sparkling Stars Divider' },
];

export const SEAL_CATALOG: {
  variant: SealVariant;
  nameAr: string;
  nameEn: string;
  defaultPrimary: string;
  defaultSecondary: string;
  color: string;
  accentColor: string;
}[] = [
  {
    variant: 'gold-wax-seal',
    nameAr: 'ختم شمعي ذهبي فاخر',
    nameEn: 'Luxury Gold Embossed Seal',
    defaultPrimary: 'ختم التميز والجودة',
    defaultSecondary: 'CERTIFIED EXCELLENCE',
    color: '#B8860B',
    accentColor: '#FFF8DC',
  },
  {
    variant: 'official-circular-stamp',
    nameAr: 'ختم تصميمي دائري للمؤسسات',
    nameEn: 'Institutional Circular Design Stamp',
    defaultPrimary: 'إدارة التدريب والتطوير',
    defaultSecondary: 'نسخة تصميمية معتمدة',
    color: '#1E3A8A',
    accentColor: '#93C5FD',
  },
  {
    variant: 'academic-crest',
    nameAr: 'شعار أكاديمي تصميمي',
    nameEn: 'Academic Excellence Crest',
    defaultPrimary: 'أكاديمية المعرفة والريادة',
    defaultSecondary: 'تقدير التفوق العلمي',
    color: '#064E3B',
    accentColor: '#D4AF37',
  },
  {
    variant: 'excellence-star-seal',
    nameAr: 'وسام النجمة الثمانية المذهّب',
    nameEn: 'Octagonal Star Seal',
    defaultPrimary: 'وسام الاستحقاق',
    defaultSecondary: 'FIRST CLASS HONOR',
    color: '#7C2D12',
    accentColor: '#FDE047',
  },
  {
    variant: 'modern-verified-badge',
    nameAr: 'شارة تحقق رقمية حديثة',
    nameEn: 'Modern Verified Design Badge',
    defaultPrimary: 'إنجاز موثّق',
    defaultSecondary: 'VERIFIED ACHIEVEMENT',
    color: '#0284C7',
    accentColor: '#E0F2FE',
  },
  {
    variant: 'ideal-student-medal',
    nameAr: 'وسام الطالبة المثالية / الطالب المثالي الذهبي',
    nameEn: 'Ideal Student Gold Sunburst Medal',
    defaultPrimary: 'الطالبة',
    defaultSecondary: 'المثالية',
    color: '#A16207',
    accentColor: '#EAB308',
  },
  {
    variant: 'anta-mumayaz-medal',
    nameAr: 'وسام «أنت مميز» الكحلي والذهبي بشريطين',
    nameEn: 'You Are Special Navy & Gold Ribbon Medal',
    defaultPrimary: 'أنت',
    defaultSecondary: 'مميز',
    color: '#05204A',
    accentColor: '#D4AF37',
  },
  {
    variant: 'navy-gold-future-seal',
    nameAr: 'ختم «العلم طريق المستقبل» الكحلي والذهبي',
    nameEn: 'Knowledge is the Path to the Future Seal',
    defaultPrimary: 'العلم طريق',
    defaultSecondary: 'المستقبل',
    color: '#05204A',
    accentColor: '#D4AF37',
  },
];

// Built-in SVG institutional emblems encoded as safe data URLs
function createSvgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const BUILTIN_LOGOS: {
  id: string;
  nameAr: string;
  nameEn: string;
  src: string;
}[] = [
  {
    id: 'logo-saudi-moe-official',
    nameAr: 'شعار وزارة التعليم الرسمي (المملكة العربية السعودية)',
    nameEn: 'Ministry of Education (Saudi Arabia)',
    src: SAUDI_MOE_LOGO_SVG,
  },
  {
    id: 'logo-gulf-talent-2026',
    nameAr: 'شعار اليوم الخليجي للموهبة والإبداع 2026',
    nameEn: 'Gulf Talent Day 2026',
    src: GULF_TALENT_2026_LOGO_SVG,
  },
  {
    id: 'logo-space-week-2025',
    nameAr: 'شعار أسبوع الفضاء العالمي 2025',
    nameEn: 'World Space Week 2025',
    src: SPACE_WEEK_2025_LOGO_SVG,
  },
  {
    id: 'logo-teacher-day-2025',
    nameAr: 'شعار يوم المعلم الرسمي 2025',
    nameEn: 'World Teacher Day 2025',
    src: TEACHER_DAY_2025_LOGO_SVG,
  },
  {
    id: 'logo-warith-university',
    nameAr: 'شعار جامعة وارث الأنبياء الأكاديمي',
    nameEn: "University of Warith Al-Anbiya'a Crest",
    src: WARITH_UNIVERSITY_CREST_SVG,
  },
  {
    id: 'logo-academy-gold',
    nameAr: 'شعار أكاديمية الريادة (ذهبي وكحلي)',
    nameEn: 'Leadership Academy Emblem',
    src: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="#0B192C" stroke="#D4AF37" stroke-width="4"/>
        <circle cx="60" cy="60" r="46" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="4 3"/>
        <path d="M60 22 L88 36 L60 50 L32 36 Z" fill="#D4AF37"/>
        <path d="M40 45 V66 C40 75 80 75 80 66 V45" fill="none" stroke="#F8FAFC" stroke-width="4" stroke-linecap="round"/>
        <path d="M28 84 Q60 98 92 84" fill="none" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
        <circle cx="60" cy="82" r="4" fill="#D4AF37"/>
      </svg>
    `),
  },
  {
    id: 'logo-ministry-style',
    nameAr: 'شعار مؤسسة تعليمية وثقافية (زمردي وذهبي)',
    nameEn: 'Cultural & Educational Institution',
    src: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <polygon points="60,8 73,26 95,19 94,42 112,55 98,73 103,95 81,98 68,115 52,98 30,95 35,73 21,55 39,42 38,19 60,26" fill="#064E3B" stroke="#D4AF37" stroke-width="3"/>
        <circle cx="60" cy="62" r="30" fill="#FEFDFB" stroke="#D4AF37" stroke-width="2.5"/>
        <path d="M43 70 Q60 55 77 70 M43 56 Q60 41 77 56" fill="none" stroke="#064E3B" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="60" cy="44" r="4" fill="#D4AF37"/>
      </svg>
    `),
  },
  {
    id: 'logo-tech-institute',
    nameAr: 'شعار معهد التقنية والابتكار الرقمي',
    nameEn: 'Digital Innovation Institute',
    src: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <polygon points="60,10 104,35 104,85 60,110 16,85 16,35" fill="#0F172A" stroke="#38BDF8" stroke-width="4"/>
        <polygon points="60,24 92,42 92,78 60,96 28,78 28,42" fill="none" stroke="#C5A059" stroke-width="2"/>
        <circle cx="60" cy="60" r="14" fill="#38BDF8"/>
        <path d="M60 30 V46 M60 74 V90 M34 45 L48 53 M72 67 L86 75 M86 45 L72 53 M48 67 L34 75" stroke="#F8FAFC" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: 'logo-sports-federation',
    nameAr: 'شعار البطولة والتميز الرياضي',
    nameEn: 'Sports Championship Crest',
    src: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <path d="M24 18 H96 V58 C96 86 60 104 60 108 C60 104 24 86 24 58 Z" fill="#7C2D12" stroke="#EAB308" stroke-width="4"/>
        <path d="M44 36 H76 V54 C76 66 60 74 60 74 C60 74 44 66 44 54 Z" fill="#EAB308"/>
        <rect x="55" y="74" width="10" height="12" fill="#EAB308"/>
        <rect x="45" y="86" width="30" height="6" rx="3" fill="#FFFBEB"/>
      </svg>
    `),
  },
  {
    id: 'logo-kids-academy',
    nameAr: 'شعار روضة ومدرسة الإبداع الصغير',
    nameEn: 'Little Creators School Emblem',
    src: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="#FEF3C7" stroke="#F59E0B" stroke-width="5"/>
        <polygon points="60,20 71,44 97,47 78,65 83,91 60,78 37,91 42,65 23,47 49,44" fill="#F59E0B" stroke="#1D4ED8" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="52" cy="55" r="3.5" fill="#1E293B"/>
        <circle cx="68" cy="55" r="3.5" fill="#1E293B"/>
        <path d="M51 66 Q60 74 69 66" fill="none" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: 'logo-chamber-commerce',
    nameAr: 'شعار غرفة التجارة ومجلس الأعمال التنفيذي',
    nameEn: 'Chamber of Commerce & Executive Board',
    src: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <rect x="10" y="10" width="100" height="100" rx="18" fill="#0B192C" stroke="#D4AF37" stroke-width="4"/>
        <polygon points="60,22 92,40 28,40" fill="#D4AF37"/>
        <rect x="35" y="45" width="8" height="34" fill="#F8FAFC"/>
        <rect x="56" y="45" width="8" height="34" fill="#D4AF37"/>
        <rect x="77" y="45" width="8" height="34" fill="#F8FAFC"/>
        <rect x="26" y="83" width="68" height="7" rx="2" fill="#D4AF37"/>
      </svg>
    `),
  },
  {
    id: 'logo-iso-quality',
    nameAr: 'شعار الجودة والاعتماد المؤسسي الدولي',
    nameEn: 'Global Quality & ISO Compliance Crest',
    src: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="#0C4A6E" stroke="#C5A059" stroke-width="4"/>
        <circle cx="60" cy="60" r="42" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="5 3"/>
        <ellipse cx="60" cy="60" rx="34" ry="16" fill="none" stroke="#FFFFFF" stroke-width="2"/>
        <ellipse cx="60" cy="60" rx="16" ry="34" fill="none" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M46 61 L56 71 L76 49" fill="none" stroke="#D4AF37" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `),
  },
  {
    id: 'logo-financial-authority',
    nameAr: 'شعار المعهد المالي والمصرفي والحوكمة',
    nameEn: 'Financial & Corporate Governance Institute',
    src: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <polygon points="60,8 106,32 106,88 60,112 14,88 14,32" fill="#14532D" stroke="#D4AF37" stroke-width="4"/>
        <circle cx="60" cy="60" r="32" fill="none" stroke="#D4AF37" stroke-width="2"/>
        <path d="M42 74 L54 56 L66 64 L80 42" fill="none" stroke="#FDE047" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="80" cy="42" r="4.5" fill="#FDE047"/>
      </svg>
    `),
  },
];

export const COLOR_PALETTES = [
  {
    id: 'pal-royal-navy-gold',
    nameAr: 'الأزرق الملكي والذهبي الفاخر',
    nameEn: 'Royal Navy & Gold',
    bg: '#FFFDF8',
    bgEnd: '#F9F3E3',
    primary: '#0B192C',
    secondary: '#B8860B',
    accent: '#D4AF37',
    text: '#0F172A',
  },
  {
    id: 'pal-emerald-imperial',
    nameAr: 'الأخضر الزمردي والذهبي الأصيل',
    nameEn: 'Imperial Emerald & Gold',
    bg: '#FCFDFC',
    bgEnd: '#ECFDF5',
    primary: '#064E3B',
    secondary: '#B45309',
    accent: '#D97706',
    text: '#064E3B',
  },
  {
    id: 'pal-burgundy-prestige',
    nameAr: 'العنابي الدبلوماسي والذهبي',
    nameEn: 'Diplomatic Burgundy & Gold',
    bg: '#FFFDFB',
    bgEnd: '#FEF2F2',
    primary: '#7F1D1D',
    secondary: '#9A6F1A',
    accent: '#D4AF37',
    text: '#1C1917',
  },
  {
    id: 'pal-obsidian-luxury',
    nameAr: 'الأسود الفاخر والسبائك الذهبية',
    nameEn: 'Obsidian & Gold Bullion',
    bg: '#111827',
    bgEnd: '#1F2937',
    primary: '#F9FAFB',
    secondary: '#D4AF37',
    accent: '#F59E0B',
    text: '#F9FAFB',
  },
  {
    id: 'pal-modern-sapphire',
    nameAr: 'الأزرق المؤسسي والفضي الهادئ',
    nameEn: 'Corporate Sapphire & Slate',
    bg: '#FFFFFF',
    bgEnd: '#F1F5F9',
    primary: '#0F172A',
    secondary: '#1D4ED8',
    accent: '#0284C7',
    text: '#0F172A',
  },
  {
    id: 'pal-warm-bronze',
    nameAr: 'البرونزي الكلاسيكي والعاجي',
    nameEn: 'Classical Bronze & Ivory',
    bg: '#FDFBF7',
    bgEnd: '#F3ECE0',
    primary: '#292524',
    secondary: '#78350F',
    accent: '#B45309',
    text: '#1C1917',
  },
  {
    id: 'pal-executive-platinum',
    nameAr: 'البلاتيني الرمادي والكحلي التنفيذي للأعمال',
    nameEn: 'Executive Platinum & Slate',
    bg: '#FFFFFF',
    bgEnd: '#F8FAFC',
    primary: '#0F172A',
    secondary: '#334155',
    accent: '#64748B',
    text: '#0F172A',
  },
  {
    id: 'pal-mahogany-boardroom',
    nameAr: 'البني الماهوغاني والذهبي لمجالس الإدارة',
    nameEn: 'Mahogany Boardroom & Gold',
    bg: '#FFFDFB',
    bgEnd: '#FBF3EE',
    primary: '#451A03',
    secondary: '#78350F',
    accent: '#D97706',
    text: '#1C1917',
  },
];

export const FORMAL_WORDING_PRESETS: {
  id: string;
  category: string;
  labelAr: string;
  title: string;
  subtitle: string;
  introText: string;
  bodyText: string;
  closingText: string;
}[] = [
  {
    id: 'wording-appreciation-1',
    category: 'appreciation',
    labelAr: 'صيغة شكر وتقدير رسمية شاملة',
    title: 'شهادة شكر وتقدير',
    subtitle: 'عرفانًا بالعطاء والتميز المهني',
    introText: 'تتقدم إدارة المؤسسة بخالص الشكر وعظيم التقدير إلى',
    bodyText:
      'تقديرًا لجهوده المتميزة وعطائه المثمر ومساهمته الفاعلة في إنجاح المبادرات وتحقيق أعلى معايير الجودة، متمنين له دوام التوفيق والسداد ومزيدًا من الإنجازات.',
    closingText: 'مع خالص الشكر والتقدير',
  },
  {
    id: 'wording-training-1',
    category: 'training',
    labelAr: 'صيغة اجتياز دورة تدريبية معتمدة التصميم',
    title: 'شهادة اجتياز دورة تدريبية',
    subtitle: 'برنامج التطوير المهني وبناء القدرات',
    introText: 'تشهد أكاديمية التدريب والتطوير بأن المتدرب / المتدربة:',
    bodyText:
      'قد أتمّ بنجاح متطلبات دورة «القيادة الاستراتيجية وإدارة المشاريع الحديثة» بواقع (25) ساعة تدريبية معتمدة، وأظهر التزامًا وتفاعلًا متميزًا طوال فترة البرنامج.',
    closingText: 'وقد مُنحت له هذه الشهادة تقديرًا لإتمام متطلبات البرنامج التدريبي',
  },
  {
    id: 'wording-excellence-1',
    category: 'excellence',
    labelAr: 'صيغة تكريم وتميز رفيعة المستوى',
    title: 'شهادة تكريم وتميز',
    subtitle: 'وسام الإبداع والأداء الاستثنائي',
    introText: 'تقديرًا للتميز والإبداع والإنجازات الملموسة، تتشرف الجهة المانحة بتكريم:',
    bodyText:
      'عرفانًا بجهوده المتميزة وإسهاماته القيّمة وبصمته الإبداعية التي أسهمت في الارتقاء بمستوى الأداء المؤسسي، متمنين له مزيدًا من التفوق والنجاح.',
    closingText: 'مع خالص التقدير والاعتزاز',
  },
  {
    id: 'wording-corporate-b2b',
    category: 'professional',
    labelAr: 'صيغة اعتماد وشكر لشريك أعمال / شركة (B2B)',
    title: 'شهادة تقدير وشراكة استراتيجية',
    subtitle: 'تثمينًا للتعاون المؤسسي والالتزام بمعايير الجودة المهنية',
    introText: 'يتشرف مجلس الإدارة والإدارة التنفيذية بمنح هذه الشهادة التقديرية إلى:',
    bodyText:
      'تقديرًا لشراكتهم الاستراتيجية الموثوقة، والتزامهم التام بأعلى معايير الحوكمة والكفاءة التشغيلية وجودة التوريد وتنفيذ الأعمال خلال العام المالي.',
    closingText: 'متطلعين إلى استمرار الشراكة والنجاح المشترك',
  },
  {
    id: 'wording-executive-exp',
    category: 'professional',
    labelAr: 'صيغة شهادة خبرة وكفاءة مهنية للأعمال (نموذج تصميمي)',
    title: 'شهادة خبرة وكفاءة مهنية',
    subtitle: 'إشهاد بالأداء التنفيذي والالتزام المهني',
    introText: 'تشهد إدارة الموارد البشرية والشؤون الإدارية بأن الأستاذ / الأستاذة:',
    bodyText:
      'قد عمل لدينا وأظهر خلال فترة عمله كفاءة مهنية رفيعة، وقدرة قيادية متميزة في إدارة فرق العمل وتحقيق المستهدفات الاستراتيجية بأعلى درجات الأمانة والانضباط.',
    closingText: 'مُنحت له هذه الشهادة بناءً على طلبه مع تمنياتنا له بالتوفيق',
  },
  {
    id: 'wording-academic-1',
    category: 'academic',
    labelAr: 'صيغة تفوق دراسي وأكاديمي',
    title: 'شهادة تفوق دراسي',
    subtitle: 'احتفاءً بالجد والاجتهاد والتحصيل العلمي',
    introText: 'تسر إدارة الصرح التعليمي أن تمنح هذه الشهادة التقديرية إلى الطالب / الطالبة:',
    bodyText:
      'نظير تفوقه الدراسي المشرف وحصوله على مراتب متقدمة بفضل مثابرته واجتهاده وحرصه الدائم على التميز العلمي والأخلاقي خلال العام الدراسي.',
    closingText: 'سائلين الله له دوام التوفيق والنبوغ العلمي',
  },
  {
    id: 'wording-congrats-1',
    category: 'congratulations',
    labelAr: 'صيغة تهنئة بالنجاح والترقية',
    title: 'شهادة تهنئة وتبريك',
    subtitle: 'فرحة الإنجاز واستحقاق النجاح',
    introText: 'بأسمى آيات التهاني والتبريكات نتقدم إلى:',
    bodyText:
      'بمناسبة تحقيق هذا الإنجاز المشرف والنجاح الباهر الذي جاء ثمرة للجد والإخلاص والطموح العالي، راجين من المولى عز وجل أن يكلل مسيرتكم بمزيد من التألق.',
    closingText: 'ألف مبارك ودمتم في قمم النجاح',
  },
];
