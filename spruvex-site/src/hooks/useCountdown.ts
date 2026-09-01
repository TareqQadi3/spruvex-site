"use client";

import { useEffect, useState } from "react";

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diffToParts(diffMs: number): CountdownParts {
  const clamped = Math.max(diffMs, 0);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);
  return { days, hours, minutes, seconds };
}

/**
 * عدّاد تنازلي حي يُعاد حسابه كل ثانية اعتمادًا على وقت الجهاز.
 *
 * الحالة الابتدائية null عمدًا (بدل حساب Date.now() فورًا): وقت التصيير على
 * الخادم يختلف عن وقت الترطيب (hydration) على المتصفح ولو بأجزاء من الثانية،
 * فحساب القيمة الحقيقية أثناء الـ render مباشرة يسبب Hydration Mismatch.
 * القيمة الحقيقية تُحسب داخل useEffect (بعد الترطيب) فقط.
 */
export function useCountdown(target: Date): CountdownParts | null {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const update = () => setParts(diffToParts(target.getTime() - Date.now()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return parts;
}
