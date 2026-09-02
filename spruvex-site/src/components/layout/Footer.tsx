import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { BRAND } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-[var(--color-navy-950)] text-white/70">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/logomark.png" alt={BRAND.name} width={34} height={26} />
            <span className="text-lg font-extrabold text-white">
              Spru<span className="text-[var(--color-accent-400)]">Vex</span> R
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            نظام تشغيل متكامل للمطاعم — نقطة بيع، منيو رقمي، شاشة مطبخ، وفوترة متوافقة مع ZATCA
            في منصة واحدة عربية أولاً.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">المنتج</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/#features" className="hover:text-white">
                المميزات
              </Link>
            </li>
            <li>
              <Link href="/#app-tour" className="hover:text-white">
                جولة بالتطبيق
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-white">
                الأسعار
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">الشركة</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/contact" className="hover:text-white">
                تواصل معنا
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                ابدأ تجربة مجانية
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">تواصل</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>{BRAND.domain}</li>
            <li dir="ltr" className="text-end">
              hello@{BRAND.domain}
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} {BRAND.name}. جميع الحقوق محفوظة.</span>
          <span>صُنع بعناية للسوق السعودي والخليجي 🇸🇦</span>
        </Container>
      </div>
    </footer>
  );
}
