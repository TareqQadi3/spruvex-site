import Image from "next/image";
import { cn } from "@/lib/cn";

export function DeviceFrame({
  src,
  alt,
  variant = "phone",
  className,
  priority,
}: {
  src?: string;
  alt: string;
  variant?: "phone" | "tablet";
  className?: string;
  priority?: boolean;
}) {
  const isPhone = variant === "phone";
  return (
    <div
      className={cn(
        "relative mx-auto rounded-[2.4rem] border-[10px] border-[var(--color-navy-950)] bg-[var(--color-navy-950)] shadow-2xl shadow-navy-950/40",
        isPhone ? "aspect-[9/19] w-full max-w-[300px]" : "aspect-[4/3] w-full max-w-[560px]",
        className
      )}
    >
      {isPhone && (
        <div className="absolute inset-x-0 top-0 z-20 mx-auto h-6 w-28 rounded-b-2xl bg-[var(--color-navy-950)]" />
      )}
      <div className="relative h-full w-full overflow-hidden rounded-[1.7rem] bg-white">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover object-top"
            sizes={isPhone ? "300px" : "560px"}
          />
        ) : (
          <div className="shimmer-sweep relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-navy-900)] via-[var(--color-navy-800)] to-[var(--color-accent-600)]">
            <span className="animate-gentle-pulse text-sm font-bold text-white/70">
              قريبًا لقطات حقيقية
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
