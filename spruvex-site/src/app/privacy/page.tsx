import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "كيف تجمع منصة SpruVex R بياناتك وتستخدمها وتحميها.",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "ما نجمعه",
    body: [
      "بيانات النشاط: اسم المطعم/النشاط، نوعه، رقم الجوال، البريد الإلكتروني.",
      "بيانات الاستخدام: بيانات الدخول التقنية (مثل عنوان IP) لأغراض الأمان ومعدل الطلبات.",
      "بيانات الفوترة: عند الاشتراك المدفوع، ما يلزم لإتمام التحويل البنكي ومراجعته فقط (مرجع التحويل وإيصاله).",
    ],
  },
  {
    title: "لماذا نجمعها",
    body: [
      "لإنشاء حسابك التجريبي وإدارة اشتراكك، ولإرسال رمز التحقق ورسائل الخدمة الأساسية (الترحيب وتنبيهات الحساب) — لا نرسل رسائل تسويقية دون موافقتك.",
      "لأمان المنصة: منع إنشاء حسابات آلية مكثفة وحماية حسابك من إساءة الاستخدام.",
    ],
  },
  {
    title: "ما لا نفعله أبدًا",
    body: [
      "لا نبيع بياناتك ولا نشاركها مع أطراف إعلانية أو تسويقية.",
      "لا نخزّن كلمة مرورك بأي صورة مقروءة — تُجزَّأ بخوارزمية أحادية الاتجاه قبل التخزين، ولا تصل للموقع التسويقي إطلاقًا.",
    ],
  },
  {
    title: "كيف نحميها",
    body: [
      "اتصالات مشفّرة (HTTPS) بين متصفحك وخوادمنا، وعزل صارم بين بيانات كل مطعم على مستوى قاعدة البيانات نفسها (Row-Level Security).",
      "وصول مبني على أقل الصلاحيات لكل دور (مالك/مدير/كاشير)، وسجلات تدقيق لعمليات الحساب الحساسة.",
    ],
  },
  {
    title: "أطراف المعالجة",
    body: [
      "نستخدم مزوّدي خدمة موثوقين لتشغيل المنصة: Render (استضافة) وResend (إرسال البريد) وGoogle (خدمات البريد). تُعالج بياناتك بموجب عقود المعالجة ووفق هذا البيان فقط.",
    ],
  },
  {
    title: "حقوقك",
    body: [
      "لك طلب نسخة من بياناتك أو تصحيحها أو حذف حسابك بالكامل في أي وقت بمراسلتنا. سنستجيب خلال مدة معقولة بحسب الأنظمة المعمول بها.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-black/5 bg-white p-8 sm:p-12">
        <h1 className="text-3xl font-extrabold text-[var(--color-navy-900)]">
          سياسة الخصوصية
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          آخر تحديث: سبتمبر 2026
        </p>
        <div className="mt-8 flex flex-col gap-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-extrabold text-[var(--color-navy-900)]">{s.title}</h2>
              <div className="mt-2 flex flex-col gap-2">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-[var(--color-ink)]">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-10 rounded-xl bg-[var(--color-bg)] p-4 text-sm leading-relaxed text-[var(--color-muted)]">
          لأي استفسار حول الخصوصية راسلنا على{" "}
          <a href="mailto:info@spruvex.com" className="font-bold text-[var(--color-accent-600)] hover:underline" dir="ltr">
            info@spruvex.com
          </a>
        </p>
      </div>
    </div>
  );
}