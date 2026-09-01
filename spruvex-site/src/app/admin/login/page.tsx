import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCsrfTokenForForm } from "@/lib/csrf";
import { isAdminAuthenticated } from "@/lib/session";

export const metadata: Metadata = { title: "دخول الإدارة", robots: { index: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await isAdminAuthenticated()) redirect("/admin");

  const { next } = await searchParams;
  const csrfToken = await getCsrfTokenForForm();
  const nextPath = next && next.startsWith("/admin") ? next : "/admin";

  return (
    <section className="flex min-h-[70vh] items-center bg-[var(--color-bg)] py-20">
      <Container>
        <LoginForm csrfToken={csrfToken} nextPath={nextPath} />
      </Container>
    </section>
  );
}
