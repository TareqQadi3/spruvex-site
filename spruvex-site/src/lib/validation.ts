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
    const digits = val.replace(/^\+?00?966/, "").replace(/^0/, "");
    return `+966${digits}`;
  });

export const restaurantNameSchema = z
  .string()
  .trim()
  .min(2, "اسم المطعم قصير جدًا")
  .max(120, "اسم المطعم طويل جدًا");

export const emailSchema = z.string().trim().email("بريد إلكتروني غير صحيح").max(190);

export const trialSignupSchema = z.object({
  restaurantName: restaurantNameSchema,
  phone: saudiPhoneSchema,
  email: emailSchema,
  csrfToken: z.string().min(1),
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
