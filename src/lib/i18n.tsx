"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "es" | "en";

type I18nContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const translations: Record<string, Record<Lang, string>> = {
  // Sidebar
  "nav.inicio": { es: "Inicio", en: "Home" },
  "nav.permiso_general": { es: "Permiso General", en: "General Permit" },
  "nav.listas_verificacion": { es: "Listas de Verificacion", en: "Verification Lists" },
  "nav.gestion_permisos": { es: "Gestion de Permisos", en: "Permit Management" },
  "nav.rondas": { es: "Rondas Operativas", en: "Operational Rounds" },
  "nav.dashboard": { es: "Dashboard HSE", en: "HSE Dashboard" },
  "nav.bitacora": { es: "Bitacora de Permisos", en: "Permit Logbook" },
  "nav.calendario": { es: "Calendario", en: "Calendar" },
  "nav.genie": { es: "Genie de Seguridad", en: "Security Genie" },
  "nav.analitica": { es: "Analitica de Riesgo", en: "Risk Analytics" },
  "nav.admin": { es: "Administracion", en: "Administration" },
  "nav.operaciones": { es: "OPERACIONES", en: "OPERATIONS" },
  "nav.cumplimiento": { es: "CUMPLIMIENTO", en: "COMPLIANCE" },
  "nav.ia": { es: "IA", en: "AI" },
  "nav.referencia": { es: "REFERENCIA", en: "REFERENCE" },
  "nav.inicio_section": { es: "INICIO", en: "HOME" },

  // Home
  "home.title": { es: "Sistema de Permisos de Trabajo", en: "Work Permit System" },
  "home.subtitle": { es: "Gestion digital de permisos de trabajo alineada al procedimiento RENOVABLES-O-PR-01 Ed.2 para las centrales electricas con tecnologias renovables de ENGIE Mexico.", en: "Digital work permit management aligned with procedure RENOVABLES-O-PR-01 Ed.2 for ENGIE Mexico renewable energy plants." },
  "home.buenos_dias": { es: "Buenos dias", en: "Good morning" },
  "home.buenas_tardes": { es: "Buenas tardes", en: "Good afternoon" },
  "home.buenas_noches": { es: "Buenas noches", en: "Good evening" },
  "home.agenda": { es: "Agenda del Dia", en: "Today's Agenda" },
  "home.sin_permisos_hoy": { es: "No hay permisos programados para hoy.", en: "No permits scheduled for today." },
  "home.acciones_rapidas": { es: "Acciones Rapidas", en: "Quick Actions" },
  "home.flujo": { es: "Flujo del Permiso de Trabajo", en: "Work Permit Flow" },
  "home.actividad_reciente": { es: "Actividad Reciente", en: "Recent Activity" },
  "home.nuevo_permiso": { es: "Nuevo Permiso", en: "New Permit" },
  "home.crear_solicitud": { es: "Crear solicitud", en: "Create request" },
  "home.verificacion": { es: "Verificacion", en: "Verification" },
  "home.listas_especiales": { es: "Listas especiales", en: "Special lists" },
  "home.gestion": { es: "Gestion", en: "Management" },
  "home.flujo_completo": { es: "Flujo completo", en: "Full flow" },
  "home.dashboard": { es: "Dashboard", en: "Dashboard" },
  "home.kpis_metricas": { es: "KPIs y metricas", en: "KPIs & metrics" },
  "home.bitacora": { es: "Bitacora", en: "Logbook" },
  "home.registro_formal": { es: "Registro formal", en: "Formal registry" },

  // Flow steps
  "flow.solicitud": { es: "SOLICITUD", en: "REQUEST" },
  "flow.revision": { es: "REVISION", en: "REVIEW" },
  "flow.autorizacion": { es: "AUTORIZACION", en: "AUTHORIZATION" },
  "flow.erum": { es: "ERUM", en: "ERUM" },
  "flow.ejecucion": { es: "EJECUCION", en: "EXECUTION" },
  "flow.cierre": { es: "CIERRE", en: "CLOSURE" },
  "flow.cerrado": { es: "CERRADO", en: "CLOSED" },
  "flow.solicitud_desc": { es: "Captura en campo", en: "Field capture" },
  "flow.revision_desc": { es: "Autorizador evalua", en: "Authorizer reviews" },
  "flow.autorizacion_desc": { es: "Firma electronica", en: "Electronic signature" },
  "flow.erum_desc": { es: "Riesgo ultimo minuto", en: "Last minute risk" },
  "flow.ejecucion_desc": { es: "Trabajo en curso", en: "Work in progress" },
  "flow.cierre_desc": { es: "Doble firma", en: "Dual signature" },
  "flow.cerrado_desc": { es: "Archivado (6 anos)", en: "Archived (6 years)" },

  // Captura
  "captura.title": { es: "Permiso de Trabajo General", en: "General Work Permit" },
  "captura.apartado1": { es: "I. Solicitud", en: "I. Request" },
  "captura.apartado1_desc": { es: "Seccion 6.1 — Datos del permiso, personas y descripcion", en: "Section 6.1 — Permit data, personnel and description" },
  "captura.apartado2": { es: "II. Analisis de Seguridad", en: "II. Safety Analysis" },
  "captura.apartado2_desc": { es: "Seccion 6.2 — Resultado del analisis de riesgos SEGURIDAD-PR-02-FO01", en: "Section 6.2 — Risk analysis result SEGURIDAD-PR-02-FO01" },
  "captura.apartado3": { es: "III. Listas de Verificacion para Trabajo de Riesgo Especial", en: "III. Special Risk Work Verification Lists" },
  "captura.apartado3_desc": { es: "Seccion 6.3 — Marque Si o N/A para cada tipo de trabajo especial", en: "Section 6.3 — Check Yes or N/A for each special work type" },
  "captura.analizar_ia": { es: "Analizar con IA", en: "Analyze with AI" },
  "captura.revisar_cumplimiento": { es: "Revisar Cumplimiento", en: "Review Compliance" },
  "captura.guardar": { es: "Guardar Permiso", en: "Save Permit" },
  "captura.enviar": { es: "Enviar directamente para autorizacion", en: "Submit directly for authorization" },
  "captura.encabezado": { es: "ENCABEZADO DEL PERMISO", en: "PERMIT HEADER" },
  "captura.datos_solicitud": { es: "DATOS DE LA SOLICITUD", en: "REQUEST DATA" },
  "captura.personas": { es: "PERSONAS INVOLUCRADAS", en: "PERSONNEL INVOLVED" },
  "captura.geolocalizacion": { es: "Geolocalizacion y Observaciones", en: "Geolocation and Observations" },

  // Common
  "common.guardar": { es: "Guardar", en: "Save" },
  "common.cancelar": { es: "Cancelar", en: "Cancel" },
  "common.cerrar": { es: "cerrar", en: "close" },
  "common.agregar": { es: "Agregar", en: "Add" },
  "common.editar": { es: "Editar", en: "Edit" },
  "common.desactivar": { es: "Desactivar", en: "Deactivate" },
  "common.imprimir": { es: "Imprimir", en: "Print" },
  "common.buscar": { es: "Buscar", en: "Search" },
  "common.filtros": { es: "Filtros", en: "Filters" },
  "common.todos": { es: "Todos", en: "All" },
  "common.powered_by": { es: "Powered by Databricks", en: "Powered by Databricks" },

  // Sidebar header
  "sidebar.title": { es: "Permisos de Trabajo", en: "Work Permits" },
  "sidebar.subtitle": { es: "ENGIE Mexico", en: "ENGIE Mexico" },
  "sidebar.expandir": { es: "Expandir menu", en: "Expand menu" },
  "sidebar.colapsar": { es: "Colapsar menu", en: "Collapse menu" },
};

const I18nContext = createContext<I18nContextType>({
  lang: "es",
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const saved = localStorage.getItem("engie_lang") as Lang;
    if (saved === "en" || saved === "es") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("engie_lang", l);
  }

  function t(key: string): string {
    return translations[key]?.[lang] || key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
