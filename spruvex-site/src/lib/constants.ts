/**
 * مصدر الحقيقة الوحيد للباقات والأسعار والإضافات.
 * أي تعديل مستقبلي على الأسعار أو الميزات يتم هنا فقط — لا تكرّر هذه البيانات
 * في أي مكوّن أو صفحة أخرى، استورد من هنا دائمًا.
 */

export const BRAND = {
  name: "SpruVex R",
  tagline: "نظام إدارة المطاعم",
  domain: "spruvex.com",
} as const;

export type PlanId = "basic" | "pro" | "advanced";
export type BillingCycle = "monthly" | "semiannual" | "yearly";

export const BILLING_CYCLES: { id: BillingCycle; label: string; months: number }[] = [
  { id: "monthly", label: "شهري", months: 1 },
  { id: "semiannual", label: "6 أشهر", months: 6 },
  { id: "yearly", label: "سنوي", months: 12 },
];

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  branches: string;
  highlighted?: boolean;
  prices: {
    /** السعر الحالي — خصم دائم ~30% عن listMonthly أدناه. */
    monthly: number;
    /**
     * ⚠️ سعر الـ 6 أشهر لم يُحدَّد صراحة في بيانات المنتج — هذا رقم مبدئي
     * (خصم ~10% مقارنة بالسعر الشهري × 6) بانتظار اعتماد صاحب المنتج.
     * TODO(business): تأكيد السعر الرسمي لدورة الـ 6 أشهر لكل باقة.
     */
    semiannual: number;
    /** الشهري × 10 — أي شهرين مجانًا عند الدفع السنوي. */
    yearly: number;
    /** السعر "الأصلي" قبل خصم الـ30% الدائم — يُعرض مشطوبًا بجانب monthly. */
    listMonthly: number;
  };
}

export interface FeatureRow {
  label: string;
  basic: boolean;
  pro: boolean;
  advanced: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "الأساسية",
    description: "لبداية قوية لمطعم بفرع واحد",
    branches: "فرع واحد",
    prices: { monthly: 45, semiannual: 243, yearly: 450, listMonthly: 65 },
  },
  {
    id: "pro",
    name: "الاحترافية",
    description: "لإدارة أذكى مع نمو مطعمك",
    branches: "حتى 3 فروع",
    highlighted: true,
    prices: { monthly: 70, semiannual: 378, yearly: 700, listMonthly: 100 },
  },
  {
    id: "advanced",
    name: "المتقدمة",
    description: "تحكم كامل للسلاسل متعددة الفروع",
    branches: "غير محدود",
    prices: { monthly: 109, semiannual: 589, yearly: 1090, listMonthly: 155 },
  },
];

export const FEATURE_ROWS: FeatureRow[] = [
  { label: "نقطة البيع + المخزون + الفوترة (ZATCA)", basic: true, pro: true, advanced: true },
  { label: "المنيو الإلكتروني + التخصيص", basic: true, pro: true, advanced: true },
  { label: "فاتورة واتساب", basic: true, pro: true, advanced: true },
  { label: "الولاء + الطلب الجماعي + التقييمات", basic: false, pro: true, advanced: true },
  { label: "المشتريات + مقارنة الفروع + تقرير الضريبة", basic: false, pro: true, advanced: true },
  { label: "ربحية القائمة", basic: false, pro: true, advanced: true },
  { label: "تحويل مخزون بين الفروع + تنبيهات استباقية", basic: false, pro: false, advanced: true },
  { label: "تكاملات التوصيل + بوابة دفع المنيو + NFC", basic: false, pro: false, advanced: true },
];

export interface Addon {
  id: string;
  name: string;
  description: string;
  /**
   * ⚠️ أسعار الإضافات لم تُحدَّد في بيانات المنتج — أرقام مبدئية للعرض فقط.
   * TODO(business): تأكيد السعر الرسمي لكل إضافة قبل الإطلاق التجاري.
   */
  monthlyPrice: number;
}

export const ADDONS: Addon[] = [
  {
    id: "extra-branch",
    name: "فرع إضافي",
    description: "أضف فرعًا إضافيًا خارج حدود باقتك",
    monthlyPrice: 99,
  },
  {
    id: "delivery-integration",
    name: "تكامل توصيل واحد",
    description: "ربط مع أحد تطبيقات التوصيل",
    monthlyPrice: 79,
  },
  {
    id: "menu-payment-gateway",
    name: "بوابة دفع المنيو",
    description: "الدفع الإلكتروني مباشرة من المنيو الرقمي",
    monthlyPrice: 59,
  },
  {
    id: "whatsapp-alerts",
    name: "تنبيهات واتساب الاستباقية",
    description: "تنبيهات تلقائية للعملاء والفريق عبر واتساب",
    monthlyPrice: 39,
  },
];

export function getPlan(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function priceForCycle(plan: Plan, cycle: BillingCycle): number {
  return plan.prices[cycle];
}

/** التوفير الحقيقي المحسوب من مقارنة السعر الشهري × 12 بسعر الباقة السنوية. */
export function yearlySavings(plan: Plan): number {
  return plan.prices.monthly * 12 - plan.prices.yearly;
}

/** نسبة الخصم الدائم المعروضة (السعر الحالي مقابل listMonthly) — ثابتة تسويقيًا عند 30%. */
export const PERMANENT_DISCOUNT_PERCENT = 30;

/**
 * كود خصم إضافي 20% بمناسبة اليوم الوطني — يُطبَّق فوق السعر الحالي (وليس
 * فوق listMonthly) عند إتمام الدفع بـ/pay/[plan]. التحقق والحساب يتمّان من
 * جانب السيرفر فقط (src/lib/repositories/paymentSubmissions.ts) — لا يُعتمَد
 * على أي مبلغ يرسله المتصفح.
 */
export const NATIONAL_DAY_PROMO = {
  code: "WATANI20",
  percentOff: 20,
} as const;

export function normalizePromoCode(input: string | null | undefined): string {
  return (input ?? "").trim().toUpperCase();
}

export function isValidPromoCode(code: string | null | undefined): boolean {
  return normalizePromoCode(code) === NATIONAL_DAY_PROMO.code;
}

/** يُطبَّق فقط لو الكود صحيحًا — وإلا يُرجع المبلغ كما هو دون أي تغيير. */
export function applyPromoDiscount(amountHalalas: number, code: string | null | undefined): number {
  if (!isValidPromoCode(code)) return amountHalalas;
  return Math.round(amountHalalas * (1 - NATIONAL_DAY_PROMO.percentOff / 100));
}

export type BusinessType = "restaurant" | "cafe" | "food_truck" | "dessert_cafe" | "other";

export const BUSINESS_TYPES: { id: BusinessType; label: string }[] = [
  { id: "restaurant", label: "مطعم" },
  { id: "cafe", label: "كوفي" },
  { id: "food_truck", label: "فود ترك" },
  { id: "dessert_cafe", label: "مقهى حلويات" },
  { id: "other", label: "أخرى" },
];

/** تاريخ اليوم الوطني السعودي القادم (23 سبتمبر) لعرض العدّاد التنازلي. */
export function nextNationalDay(from: Date = new Date()): Date {
  const year = from.getFullYear();
  let target = new Date(Date.UTC(year, 8, 23, 0, 0, 0));
  if (target.getTime() < from.getTime()) {
    target = new Date(Date.UTC(year + 1, 8, 23, 0, 0, 0));
  }
  return target;
}

export const TRUST_BAR_ITEMS = [
  { category: "توصيل", name: "هنقرستيشن" },
  { category: "توصيل", name: "جاهز" },
  { category: "توصيل", name: "كيتا" },
  { category: "توصيل", name: "جيديا" },
  { category: "دفع", name: "مدى" },
  { category: "دفع", name: "هلا" },
] as const;

export const TRIAL_DAYS = 14;

/**
 * ⚠️ بيانات بنكية Placeholder — TODO(business): استبدلها ببيانات الحساب
 * البنكي الفعلي لمنصة SpruVex قبل الإطلاق. لا تُستخدم هذه القيم لأي تحويل حقيقي.
 */
export const BANK_TRANSFER_INFO = {
  bankName: "TODO: اسم البنك",
  accountName: "TODO: اسم صاحب الحساب (شركة سبروفكس)",
  accountNumber: "TODO-0000000000",
  iban: "SA00 0000 0000 0000 0000 0000",
} as const;
