"use client";

import { useI18n } from "@/lib/i18n";

export function LangToggle({ collapsed }: { collapsed: boolean }) {
  const { lang, setLang } = useI18n();

  if (collapsed) {
    return (
      <button
        onClick={() => setLang(lang === "es" ? "en" : "es")}
        className="w-10 h-6 mx-auto flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
      >
        <span className="text-sm">{lang === "es" ? "🇲🇽" : "🇺🇸"}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 py-1">
      <button
        onClick={() => setLang("es")}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
          lang === "es" ? "bg-engie-blue/10 text-engie-blue" : "text-gray-400 hover:text-gray-600"
        }`}
        title="Español"
      >
        <span className="text-sm">🇲🇽</span>
        {lang === "es" && "ES"}
      </button>
      <button
        onClick={() => setLang("en")}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
          lang === "en" ? "bg-engie-blue/10 text-engie-blue" : "text-gray-400 hover:text-gray-600"
        }`}
        title="English"
      >
        <span className="text-sm">🇺🇸</span>
        {lang === "en" && "EN"}
      </button>
    </div>
  );
}
