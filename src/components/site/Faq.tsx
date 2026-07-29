"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHead } from "./SectionHead";
import { faqs } from "./faq-data";
import { cn } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24">
      <div className="container">
        <SectionHead eyebrow="Dudas frecuentes" title="Antes de dar el paso" />
        <div className="mx-auto max-w-[760px]">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="border-b border-line">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-[22px] text-left font-sans text-[17px] font-semibold"
                >
                  {q}
                  <span className="relative h-[22px] w-[22px] flex-none">
                    <span className="absolute left-1/2 top-1/2 h-0.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded bg-accent" />
                    <span className={cn("absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded bg-accent transition-transform duration-300", isOpen && "scale-y-0")} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-[22px] text-[15.5px] text-muted">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
