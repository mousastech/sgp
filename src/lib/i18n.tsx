"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "es" | "en";

type I18nContextType = { lang: Lang; setLang: (lang: Lang) => void; t: (key: string) => string };

const T: Record<string, Record<Lang, string>> = {
  // ═══ Sidebar ═══
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
  "sidebar.title": { es: "Permisos de Trabajo", en: "Work Permits" },
  "sidebar.subtitle": { es: "ENGIE Mexico", en: "ENGIE Mexico" },
  "sidebar.expandir": { es: "Expandir menu", en: "Expand menu" },
  "sidebar.colapsar": { es: "Colapsar menu", en: "Collapse menu" },

  // ═══ Home ═══
  "home.title": { es: "Sistema de Permisos de Trabajo", en: "Work Permit System" },
  "home.subtitle": { es: "Gestion digital de permisos de trabajo alineada al procedimiento RENOVABLES-O-PR-01 Ed.2 para las centrales electricas con tecnologias renovables de ENGIE Mexico.", en: "Digital work permit management aligned with RENOVABLES-O-PR-01 Ed.2 for ENGIE Mexico renewable energy plants." },
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
  "home.kpis_metricas": { es: "KPIs y metricas", en: "KPIs & metrics" },
  "home.registro_formal": { es: "Registro formal", en: "Formal registry" },
  "home.mis_pendientes": { es: "Mis Pendientes", en: "My Pending Tasks" },

  // ═══ Flow steps ═══
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

  // ═══ Captura ═══
  "captura.title": { es: "Permiso de Trabajo General", en: "General Work Permit" },
  "captura.apartado1": { es: "I. Solicitud", en: "I. Request" },
  "captura.apartado1_desc": { es: "Seccion 6.1 — Datos del permiso, personas y descripcion", en: "Section 6.1 — Permit data, personnel and description" },
  "captura.apartado2": { es: "II. Analisis de Seguridad", en: "II. Safety Analysis" },
  "captura.apartado2_desc": { es: "Seccion 6.2 — Resultado del analisis de riesgos SEGURIDAD-PR-02-FO01", en: "Section 6.2 — Risk analysis result SEGURIDAD-PR-02-FO01" },
  "captura.apartado3": { es: "III. Listas de Verificacion para Trabajo de Riesgo Especial", en: "III. Special Risk Work Verification Lists" },
  "captura.apartado3_desc": { es: "Seccion 6.3 — Marque Si o N/A para cada tipo de trabajo especial", en: "Section 6.3 — Check Yes or N/A for each special work type" },
  "captura.analizar_ia": { es: "Analizar con IA", en: "Analyze with AI" },
  "captura.analizando": { es: "Analizando...", en: "Analyzing..." },
  "captura.ia_completado": { es: "Analisis de IA completado", en: "AI Analysis completed" },
  "captura.revisar_cumplimiento": { es: "Revisar Cumplimiento", en: "Review Compliance" },
  "captura.revisando": { es: "Revisando...", en: "Reviewing..." },
  "captura.revision_title": { es: "Revision de Cumplimiento con IA", en: "AI Compliance Review" },
  "captura.revision_desc": { es: "Valida el permiso contra RENOVABLES-O-PR-01 antes de enviar", en: "Validates permit against RENOVABLES-O-PR-01 before submission" },
  "captura.guardar": { es: "Guardar Permiso", en: "Save Permit" },
  "captura.guardando": { es: "Guardando...", en: "Saving..." },
  "captura.enviar": { es: "Enviar directamente para autorizacion", en: "Submit directly for authorization" },
  "captura.encabezado": { es: "ENCABEZADO DEL PERMISO", en: "PERMIT HEADER" },
  "captura.datos_solicitud": { es: "DATOS DE LA SOLICITUD", en: "REQUEST DATA" },
  "captura.personas": { es: "PERSONAS INVOLUCRADAS", en: "PERSONNEL INVOLVED" },
  "captura.geo": { es: "Geolocalizacion y Observaciones", en: "Geolocation and Observations" },
  "captura.orden_trabajo": { es: "Orden de Trabajo #", en: "Work Order #" },
  "captura.fecha_solicitada": { es: "Solicitado para fecha *", en: "Requested date *" },
  "captura.hora_solicitada": { es: "Hora solicitada", en: "Requested time" },
  "captura.duracion_dias": { es: "Duracion (dias)", en: "Duration (days)" },
  "captura.duracion_horas": { es: "Duracion (horas)", en: "Duration (hours)" },
  "captura.hora_fin": { es: "Hora fin", en: "End time" },
  "captura.disp_emergencia": { es: "Disp. emergencia (hrs)", en: "Emergency avail. (hrs)" },
  "captura.area": { es: "Area y/o equipo donde se ejecuta el trabajo *", en: "Area/equipment where work is performed *" },
  "captura.descripcion": { es: "Descripcion detallada del trabajo *", en: "Detailed work description *" },
  "captura.pasos": { es: "Paso a paso (procedimiento) *", en: "Step by step (procedure) *" },
  "captura.norma": { es: "Norma aplicable", en: "Applicable standard" },
  "captura.solicitante": { es: "Solicitante ENGIE *", en: "ENGIE Requester *" },
  "captura.responsable": { es: "Responsable del Trabajo *", en: "Work Responsible *" },
  "captura.departamento": { es: "Depto. ENGIE o Contratista", en: "ENGIE Dept. or Contractor" },
  "captura.valor_riesgo": { es: "Valor mas alto de la matriz de riesgos *", en: "Highest risk matrix value *" },
  "captura.condiciones_clima": { es: "Condiciones climatologicas", en: "Weather conditions" },
  "captura.riesgos": { es: "Riesgos identificados", en: "Identified risks" },
  "captura.medidas": { es: "Medidas de control", en: "Control measures" },
  "captura.loto": { es: "LOTO (Bloqueo de Energia Peligrosa)", en: "LOTO (Lockout/Tagout)" },
  "captura.observaciones": { es: "Observaciones adicionales", en: "Additional observations" },

  // ═══ Gestion ═══
  "gestion.title": { es: "Gestion de Permisos de Trabajo", en: "Work Permit Management" },
  "gestion.subtitle": { es: "Flujo segun RENOVABLES-O-PR-01 Ed.2", en: "Flow per RENOVABLES-O-PR-01 Ed.2" },
  "gestion.flujo": { es: "Flujo del Permiso", en: "Permit Flow" },
  "gestion.firmar_como": { es: "Firmar como Autorizador", en: "Sign as Authorizer" },
  "gestion.pendientes": { es: "Pendientes", en: "Pending" },
  "gestion.en_revision": { es: "En Revision", en: "Under Review" },
  "gestion.autorizados": { es: "Autorizados", en: "Authorized" },
  "gestion.en_ejecucion": { es: "En Ejecucion", en: "In Execution" },
  "gestion.cierre_pendiente": { es: "Cierre Pendiente", en: "Closure Pending" },
  "gestion.cerrados": { es: "Cerrados", en: "Closed" },
  "gestion.tomar_revision": { es: "Tomar para Revision", en: "Take for Review" },
  "gestion.autorizar": { es: "Autorizar", en: "Authorize" },
  "gestion.devolver": { es: "Devolver", en: "Return" },
  "gestion.rechazar": { es: "Rechazar", en: "Reject" },
  "gestion.erum_title": { es: "ERUM — Evaluacion de Riesgo de Ultimo Minuto", en: "ERUM — Last Minute Risk Evaluation" },
  "gestion.iniciar_ejecucion": { es: "ERUM Completada — Iniciar Ejecucion", en: "ERUM Complete — Start Execution" },
  "gestion.extender": { es: "Extender (+1 dia)", en: "Extend (+1 day)" },
  "gestion.suspender": { es: "Suspender", en: "Suspend" },
  "gestion.cerrar_permiso": { es: "Cerrar Permiso", en: "Close Permit" },
  "gestion.evidencia": { es: "Evidencia Fotografica", en: "Photo Evidence" },
  "gestion.subir_foto": { es: "Subir foto (max 5MB)", en: "Upload photo (max 5MB)" },

  // ═══ Rondas ═══
  "rondas.title": { es: "Rondas Operativas", en: "Operational Rounds" },
  "rondas.subtitle": { es: "Inspecciones de rutina, lecturas y verificaciones de campo", en: "Routine inspections, readings and field verifications" },
  "rondas.iniciar": { es: "Iniciar Ronda", en: "Start Round" },
  "rondas.plantilla": { es: "Plantilla", en: "Template" },
  "rondas.tendencias": { es: "Tendencias", en: "Trends" },
  "rondas.total": { es: "Total Rondas", en: "Total Rounds" },
  "rondas.hoy": { es: "Hoy", en: "Today" },
  "rondas.anomalias": { es: "Anomalias", en: "Anomalies" },
  "rondas.recientes": { es: "Rondas Recientes", en: "Recent Rounds" },
  "rondas.guardar_borrador": { es: "Guardar Borrador", en: "Save Draft" },
  "rondas.finalizar": { es: "Finalizar Ronda", en: "Finalize Round" },

  // ═══ Dashboard ═══
  "dashboard.title": { es: "Dashboard de Cumplimiento HSE", en: "HSE Compliance Dashboard" },
  "dashboard.tasa_cierre": { es: "Tasa de Cierre Exitoso", en: "Successful Closure Rate" },
  "dashboard.ultimos": { es: "Ultimos Permisos", en: "Latest Permits" },
  "dashboard.auditoria": { es: "Registro de Auditoria", en: "Audit Log" },

  // ═══ Bitacora ═══
  "bitacora.title": { es: "Bitacora de Permisos de Trabajo", en: "Work Permit Logbook" },
  "bitacora.subtitle": { es: "Registro formal con folios consecutivos — sec. 6.8", en: "Formal registry with consecutive folios — sec. 6.8" },

  // ═══ Genie ═══
  "genie.title": { es: "Genie de Seguridad", en: "Security Genie" },
  "genie.subtitle": { es: "Pregunta sobre permisos, cumplimiento y seguridad — Powered by Claude Sonnet 4.6", en: "Ask about permits, compliance and safety — Powered by Claude Sonnet 4.6" },
  "genie.pregunta": { es: "Pregunta lo que quieras", en: "Ask anything" },
  "genie.consulto": { es: "Consulto la base de datos de permisos en tiempo real", en: "I query the permit database in real time" },
  "genie.consultando": { es: "Consultando...", en: "Querying..." },

  // ═══ Analitica ═══
  "analitica.title": { es: "Analitica Predictiva de Riesgo", en: "Predictive Risk Analytics" },
  "analitica.subtitle": { es: "Patrones, tendencias e insights con IA", en: "Patterns, trends and AI insights" },
  "analitica.generar": { es: "Generar Insights con IA", en: "Generate AI Insights" },
  "analitica.generando": { es: "Generando...", en: "Generating..." },
  "analitica.insights_title": { es: "Insights Generados por IA", en: "AI-Generated Insights" },

  // ═══ Admin ═══
  "admin.title": { es: "Administracion de Catalogos", en: "Catalog Administration" },
  "admin.roles": { es: "Roles (Anexo 1)", en: "Roles (Annex 1)" },
  "admin.areas": { es: "Areas / Centrales", en: "Areas / Plants" },
  "admin.empleados": { es: "Empleados", en: "Employees" },
  "admin.categorias": { es: "Categorias EPP", en: "PPE Categories" },
  "admin.equipos": { es: "Equipos EPP", en: "PPE Equipment" },
  "admin.acceso_restringido": { es: "Acceso Restringido", en: "Restricted Access" },
  "admin.solo_roles": { es: "Solo Jefe de Planta, Jefe de Mantenimiento y Supervisor HSE pueden administrar los catalogos.", en: "Only Plant Manager, Maintenance Manager and HSE Supervisor can manage catalogs." },

  // ═══ Verificacion ═══
  "verificacion.title": { es: "Listas de Verificacion", en: "Verification Lists" },
  "verificacion.subtitle": { es: "Formularios de trabajo especial por permiso", en: "Special work forms by permit" },
  "verificacion.crear": { es: "Crear Lista", en: "Create List" },
  "verificacion.guardar": { es: "Guardar Lista de Verificacion", en: "Save Verification List" },
  "verificacion.volver": { es: "Volver a Listas", en: "Back to Lists" },

  // ═══ Common ═══
  "common.guardar": { es: "Guardar", en: "Save" },
  "common.cancelar": { es: "Cancelar", en: "Cancel" },
  "common.cerrar": { es: "cerrar", en: "close" },
  "common.agregar": { es: "Agregar", en: "Add" },
  "common.imprimir": { es: "Imprimir", en: "Print" },
  "common.filtros": { es: "Filtros", en: "Filters" },
  "common.todos": { es: "Todos", en: "All" },
  "common.desde": { es: "Desde", en: "From" },
  "common.hasta": { es: "Hasta", en: "To" },
  "common.limpiar": { es: "Limpiar", en: "Clear" },
  "common.powered": { es: "Powered by Databricks Lakebase", en: "Powered by Databricks Lakebase" },
};

const I18nContext = createContext<I18nContextType>({ lang: "es", setLang: () => {}, t: (key) => key });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  useEffect(() => { const s = localStorage.getItem("engie_lang") as Lang; if (s === "en" || s === "es") setLangState(s); }, []);
  function setLang(l: Lang) { setLangState(l); localStorage.setItem("engie_lang", l); }
  function t(key: string): string { return T[key]?.[lang] || key; }
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }
