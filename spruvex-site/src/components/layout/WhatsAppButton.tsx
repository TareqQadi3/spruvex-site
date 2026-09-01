"use client";

import { motion } from "framer-motion";

/** رقم واتساب التواصل المباشر — بصيغة دولية بلا "00" أو "+" لرابط wa.me. */
const WHATSAPP_NUMBER = "966576097096";

export function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا على واتساب"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20 ring-4 ring-white/40"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/50" />
      <svg
        viewBox="0 0 32 32"
        width={28}
        height={28}
        fill="white"
        className="relative z-10"
        aria-hidden="true"
      >
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.91 6.472L4 29l7.72-1.868A11.94 11.94 0 0 0 16 27c6.627 0 12-5.373 12-12S22.628 3 16.001 3zm0 21.75a9.7 9.7 0 0 1-4.95-1.354l-.355-.21-4.583 1.109 1.128-4.463-.232-.365A9.71 9.71 0 0 1 5.25 15c0-5.937 4.813-10.75 10.75-10.75S26.75 9.063 26.75 15 21.938 24.75 16.001 24.75zm5.29-7.61c-.29-.145-1.716-.847-1.982-.943-.266-.097-.46-.145-.653.145-.194.29-.75.943-.92 1.137-.169.194-.338.218-.628.073-.29-.145-1.223-.451-2.33-1.437-.861-.768-1.442-1.716-1.611-2.006-.169-.29-.018-.447.127-.591.13-.13.29-.338.435-.507.145-.169.194-.29.29-.483.097-.194.049-.363-.024-.508-.073-.145-.653-1.575-.895-2.157-.236-.567-.476-.49-.653-.499l-.556-.01c-.194 0-.508.073-.774.363-.266.29-1.016.993-1.016 2.423 0 1.43 1.04 2.812 1.185 3.006.145.194 2.048 3.128 4.963 4.386.694.3 1.235.479 1.657.613.696.221 1.33.19 1.83.115.558-.083 1.716-.702 1.958-1.38.242-.677.242-1.258.169-1.38-.072-.121-.266-.194-.556-.339z" />
      </svg>
    </motion.a>
  );
}
