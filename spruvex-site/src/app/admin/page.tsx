import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SubmissionsDashboard } from "@/components/admin/SubmissionsDashboard";

export const metadata: Metadata = { title: "لوحة الإدارة", robots: { index: false } };

export default function AdminPage() {
  return (
    <section className="min-h-[70vh] bg-[var(--color-bg)] py-12">
      <Container>
        <h1 className="mb-8 text-2xl font-extrabold text-[var(--color-navy-900)]">
          لوحة إدارة الطلبات
        </h1>
        <SubmissionsDashboard />
      </Container>
    </section>
  );
}
