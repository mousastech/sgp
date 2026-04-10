"use client";

import { useI18n } from "@/lib/i18n";

export function PageHero({ titleKey, subtitleKey }: { titleKey: string; subtitleKey?: string }) {
  const { t } = useI18n();
  return (
    <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
      <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-engie-blue/80 to-engie-blue-light/50 flex items-end p-6">
        <div>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">{t(titleKey)}</h2>
          {subtitleKey && <p className="text-sm text-white/80 mt-1">{t(subtitleKey)}</p>}
        </div>
      </div>
    </div>
  );
}
