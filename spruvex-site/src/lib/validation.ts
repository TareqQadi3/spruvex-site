import { z } from "zod";
import { PLANS, type PlanId } from "./constants";

/**
 * يقبل صيغ الجوال السعودي الشائعة: 05XXXXXXXX أو 5XXXXXXXX أو +9665XXXXXXXX
 * ويُطبّعه دائمًا إلى الصيغة الدولية +9665XXXXXXXX.
 */
export const saudiPhoneSchema = z
  .string()
  .trim()
  .min(1, "رقم الجوال مطلوب")
  .transform((val) => val.replace(/[\s-]/g, ""))
  .refine((val) => /^(\+9665\d{8}|009665\d{8}|05\d{8}|5\d{8})$/.test(val), {
    message: "رقم جوال سعودي غير صحيح",
  })
  .transform((val) => {
    // 0{0,2} (بدل 00? القديمة التي كانت تفرض صفرًا واحدًا إلزاميًا قبل 966):
    // تقبل +966 (بلا صفر)، 00966 (بصفرين، الصيغة الدولية بلا +) دون أن تكرّر
    // بادئة +966 عند إدخال رقم دولي جاهز أصلًا.
    const digits = val.replace(/^\+?0{0,2}966/, "").replace(/^0/, "");
    return `+966${digits}`;
  });

export const restaurantNameSchema = z
  .string()
  .trim()
  .min(2, "اسم المطعم قصير جدًا")
  .max(120, "اسم المطعم طويل جدًا");

// .toLowerCase() ليطابق نفس التطبيع الذي يطبّقه spruvex-r على البريد
// (SitePublicService: email.toLowerCase())، فلا يُعامَل Test@x.com وtest@x.com
// كحسابين مختلفين عند فحص التكرار محليًا أو بجانب spruvex-r.
export const emailSchema = z
  .string()
  .trim()
  .email("بريد إلكتروني غير صحيح")
  .max(190)
  .transform((val) => val.toLowerCase());

// نفس سياسة كلمة المرور المستخدمة بالضبط بجانب spruvex-r (RegisterDto.password
// وPublicTrialSignupDto.password: 8+ أحرف، حرف واحد ورقم واحد على الأقل) —
// نفس الـregex حرفيًا، وليس منطقًا موازيًا مختلفًا قد يقبل هنا ما يُرفض هناك.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const PASSWORD_MESSAGE = "كلمة المرور يجب أن تكون 8 أحرف فأكثر، وتحتوي حرفًا ورقمًا على الأقل";

export const passwordSchema = z
  .string()
  .min(8, PASSWORD_MESSAGE)
  .max(128, "كلمة المرور طويلة جدًا")
  .regex(PASSWORD_RULE, PASSWORD_MESSAGE);

export const businessTypeSchema = z.enum(["restaurant", "cafe", "food_truck", "dessert_cafe", "other"]);

export const trialSignupSchema = z
  .object({
    restaurantName: restaurantNameSchema,
    businessType: businessTypeSchema,
    phone: saudiPhoneSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
    csrfToken: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });
export type TrialSignupInput = z.infer<typeof trialSignupSchema>;

export const trialOtpVerifySchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "رمز التحقق يتكوّن من 6 أرقام"),
  csrfToken: z.string().min(1),
});
export type TrialOtpVerifyInput = z.infer<typeof trialOtpVerifySchema>;

export const trialOtpResendSchema = z.object({
  email: emailSchema,
  csrfToken: z.string().min(1),
});
export type TrialOtpResendInput = z.infer<typeof trialOtpResendSchema>;

const PLAN_IDS = PLANS.map((p) => p.id) as [PlanId, ...PlanId[]];

export const paymentSubmissionSchema = z.object({
  restaurantName: restaurantNameSchema,
  phone: saudiPhoneSchema,
  planId: z.enum(PLAN_IDS),
  billingCycle: z.enum(["monthly", "semiannual", "yearly"]),
  transferReference: z
    .string()
    .trim()
    .max(120, "مرجع التحويل طويل جدًا")
    .optional()
    .or(z.literal("")),
  discountCode: z.string().trim().max(40).optional().or(z.literal("")),
  csrfToken: z.string().min(1),
});
export type PaymentSubmissionInput = z.infer<typeof paymentSubmissionSchema>;

export const adminLoginSchema = z.object({
  password: z.string().min(1),
  csrfToken: z.string().min(1),
});

export const submissionReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  notes: z.string().max(500).optional(),
});
