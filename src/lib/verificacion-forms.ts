// Form definitions for all verification lists per RENOVABLES-O-PR-01
// Each form follows the exact structure of its official ENGIE format

export type FieldType =
  | "check_si_no"
  | "check_si_no_na"
  | "check_cumple_na"
  | "text"
  | "number"
  | "date"
  | "conditional"
  | "atmospheric_test"
  | "signature_block"
  | "risk_table";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  unit?: string;
  // For conditional fields: which section to show/skip
  showSection?: string;
  skipToSection?: string;
}

export interface FormSection {
  id: string;
  title: string;
  subtitle?: string;
  note?: string;
  fields: FormField[];
}

export interface VerificationFormDef {
  tipo: string;
  codigo: string;
  titulo: string;
  vigencia: string;
  sections: FormSection[];
}

export const VERIFICATION_FORMS: Record<string, VerificationFormDef> = {
  // ═══════════ IN06 - EQUIPO ENERGIZADO ═══════════
  EQUIPO_ENERGIZADO: {
    tipo: "EQUIPO_ENERGIZADO",
    codigo: "RENOVABLES-O-PR-01-IN06-FO01",
    titulo: "Lista de Verificacion para Trabajo con Equipo Energizado",
    vigencia: "12 horas",
    sections: [
      {
        id: "encabezado",
        title: "Informacion General",
        fields: [
          { id: "justificacion", label: "Explique por que el equipo no puede desenergizarse o el trabajo sera diferido", type: "text", required: true },
        ],
      },
      {
        id: "tipo_energia",
        title: "I. Tipo de Energia Expuesta",
        fields: [
          { id: "energia_electrica", label: "Energia Electrica", type: "check_si_no" },
          { id: "energia_mecanica", label: "Energia Mecanica", type: "check_si_no" },
          { id: "energia_otros", label: "Otros (especifique)", type: "text", placeholder: "Especifique..." },
        ],
      },
      {
        id: "verificaciones",
        title: "II. Verificaciones Preliminares",
        fields: [
          { id: "valor_energia", label: "Valor y unidad de medida de la energia expuesta", type: "text", required: true },
          { id: "distancia_partes", label: "Distancia a las partes energizadas (m)", type: "number", unit: "m" },
        ],
      },
      {
        id: "medidas",
        title: "III. Medidas y Requerimientos de Seguridad",
        fields: [
          { id: "instruccion_trabajo", label: "Se cuenta con una instruccion de trabajo especifica", type: "check_si_no_na" },
          { id: "senalizacion", label: "Se cuenta con los insumos para la senalizacion y barricada", type: "check_si_no_na" },
          { id: "iluminacion", label: "La iluminacion es apropiada", type: "check_si_no_na" },
          { id: "persona_emergencia", label: "Se considera una persona cerca de interruptores listo para desenergizar en caso de emergencia", type: "check_si_no_na" },
          { id: "epp_adecuado", label: "Se valida que el EPP, equipos y herramientas son adecuados segun el analisis de riesgo", type: "check_si_no_na" },
          { id: "extintor", label: "Extintor vigente, accesible y situado en lugar visible", type: "check_si_no_na" },
          { id: "personal_calificado", label: "El personal esta calificado (DC-3, entrenamiento por fabricante, formacion en seguridad electrica)", type: "check_si_no_na" },
          { id: "tipo_calificacion", label: "Tipo de calificacion y fecha de expedicion", type: "text" },
        ],
      },
      {
        id: "epp_especifico",
        title: "IV. Revision de EPP Especifico",
        fields: [
          { id: "guantes_dielectricos", label: "Guantes dielectricos (especifique clase)", type: "check_si_no_na" },
          { id: "clase_guantes", label: "Clase de guantes dielectricos", type: "text" },
          { id: "inspeccion_guantes", label: "Inspeccion de guantes satisfactoria (rasgaduras, desgaste, prueba de inflado)", type: "check_si_no_na" },
          { id: "careta_facial", label: "Careta facial", type: "check_si_no_na" },
          { id: "traje_arco", label: "Traje contra arco electrico", type: "check_si_no_na" },
          { id: "epp_otros", label: "Otros (especifique)", type: "text" },
        ],
      },
    ],
  },

  // ═══════════ IN02 - ALTURAS ═══════════
  ALTURAS: {
    tipo: "ALTURAS",
    codigo: "RENOVABLES-O-PR-01-IN02-FO01",
    titulo: "Lista de Verificacion para Trabajo en Altura",
    vigencia: "12 horas",
    sections: [
      {
        id: "verificaciones_previas",
        title: "I. Verificaciones Previas",
        fields: [
          { id: "proc_ascenso", label: "Se cuenta con un procedimiento de ascenso y descenso", type: "check_si_no_na" },
          { id: "protocolo_emergencias", label: "Se cuenta con el protocolo de respuesta a emergencias", type: "check_si_no_na" },
          { id: "inspeccion_arnes", label: "Inspeccion del Arnes, linea de vida y absorbedor de energia satisfactoria", type: "check_si_no_na" },
          { id: "insumos_delimitar", label: "Se cuenta con los insumos para delimitar el area", type: "check_si_no_na" },
          { id: "aditamentos_herramienta", label: "Se cuenta con aditamentos para asegurar la herramienta ante caida", type: "check_si_no_na" },
          { id: "dc3", label: "La persona cuenta con DC-3", type: "check_si_no_na" },
          { id: "dc3_fecha", label: "Fecha de expedicion DC-3", type: "date" },
          { id: "rescatista", label: "Se cuenta con un rescatista en sitio", type: "check_si_no_na" },
          { id: "signos_vitales", label: "Se revisaron signos vitales y han sido satisfactorios", type: "check_si_no_na" },
          { id: "distancia_lineas", label: "Se cumple con la distancia minima a lineas energizadas (50kV>3.10m, 115kV>4.57m, 230kV>6.10m)", type: "check_si_no_na" },
          { id: "metodo_comunicacion", label: "Metodo de comunicacion entre persona en altura y personal en piso", type: "text" },
          { id: "punto_anclaje", label: "Se cuenta con un punto de anclaje adecuado", type: "check_si_no_na" },
        ],
      },
      {
        id: "cond_eolicas",
        title: "Ascenso a Turbinas Eolicas",
        fields: [
          { id: "requiere_eolicas", label: "Es requerido el trabajo de ascenso a turbinas eolicas", type: "conditional", showSection: "eolicas", skipToSection: "cond_andamios" },
        ],
      },
      {
        id: "eolicas",
        title: "II. Medidas de Seguridad en Ascenso a Turbinas Eolicas",
        fields: [
          { id: "gwo", label: "La persona cuenta con GWO", type: "check_si_no_na" },
          { id: "gwo_fecha", label: "Fecha de expedicion GWO", type: "date" },
          { id: "escalera_certificada", label: "La escalera de turbina eolica esta certificada", type: "check_si_no_na" },
          { id: "escalera_fecha", label: "Fecha de expedicion certificacion escalera", type: "date" },
          { id: "cert_elevador", label: "Certificacion del elevador de turbina eolica", type: "check_si_no_na" },
          { id: "elevador_fecha", label: "Fecha de expedicion certificacion elevador", type: "date" },
          { id: "cert_cuerdas", label: "Certificacion para trabajos en cuerdas", type: "check_si_no_na" },
          { id: "cuerdas_fecha", label: "Fecha de expedicion", type: "date" },
          { id: "categoria_cuerdas", label: "Categoria de la certificacion para trabajos en cuerdas", type: "text" },
        ],
      },
      {
        id: "cond_andamios",
        title: "Andamios",
        fields: [
          { id: "requiere_andamios", label: "Es requerido el trabajo en andamios", type: "conditional", showSection: "andamios", skipToSection: "cond_cubiertas" },
        ],
      },
      {
        id: "andamios",
        title: "IV. Medidas de Seguridad en Andamios",
        fields: [
          { id: "dc3_armado", label: "El responsable del armado cuenta con DC3", type: "check_si_no" },
          { id: "armado_fecha", label: "Fecha de expedicion", type: "date" },
          { id: "andamio_liberado", label: "El andamio esta liberado para uso (tarjeta de liberacion)", type: "check_si_no" },
        ],
      },
      {
        id: "cond_cubiertas",
        title: "Cubiertas",
        fields: [
          { id: "requiere_cubiertas", label: "Es requerido el trabajo para acceso a cubiertas", type: "conditional", showSection: "cubiertas", skipToSection: "cond_elevador" },
        ],
      },
      {
        id: "cubiertas",
        title: "V. Medidas de Seguridad para Acceso a Cubiertas",
        fields: [
          { id: "ruta_acceso", label: "Existe una ruta de acceso definida y segura", type: "check_si_no" },
          { id: "cubierta_transitable", label: "La cubierta es transitable", type: "check_si_no" },
          { id: "linea_vida", label: "Se tiene linea de vida", type: "check_si_no" },
        ],
      },
      {
        id: "cond_elevador",
        title: "Elevador Movil",
        fields: [
          { id: "requiere_elevador", label: "Es requerido el trabajo en Elevador Movil", type: "conditional", showSection: "elevador_movil" },
        ],
      },
      {
        id: "elevador_movil",
        title: "VI. Medidas de Seguridad en Elevador Movil",
        fields: [
          { id: "inspeccion_mecanica", label: "Se cuenta con la inspeccion mecanica (RENOVABLES-O-PR-01-IN07-FO04)", type: "check_si_no" },
          { id: "cert_operador", label: "Se cuenta con Certificacion o DC3 del operador", type: "check_si_no" },
          { id: "cert_operador_fecha", label: "Fecha de expedicion", type: "date" },
          { id: "persona_emergencia", label: "Se cuenta con otra persona con DC3 para operar a nivel cero en emergencia", type: "check_si_no" },
          { id: "cert_elevador_movil", label: "Se cuenta con certificacion del elevador movil", type: "check_si_no" },
          { id: "cmu", label: "Carga Maxima de Utilizacion (CMU)", type: "number", unit: "kg" },
          { id: "superficie_firme", label: "La superficie es firme y sin obstaculos", type: "check_si_no" },
          { id: "puntos_colision", label: "Se han identificado posibles puntos de colision", type: "check_si_no" },
        ],
      },
    ],
  },

  // ═══════════ IN03 - ESPACIOS CONFINADOS ═══════════
  ESPACIOS_CONFINADOS: {
    tipo: "ESPACIOS_CONFINADOS",
    codigo: "RENOVABLES-O-PR-01-IN03-FO01",
    titulo: "Lista de Verificacion para Trabajo en Espacios Confinados",
    vigencia: "12 horas",
    sections: [
      {
        id: "peligros",
        title: "I. Naturaleza de los Peligros en el Espacio Confinado",
        fields: [
          { id: "deficiencia_oxigeno", label: "Deficiencia/Incremento de Oxigeno", type: "check_si_no" },
          { id: "gases_inflamables", label: "Gases o Vapores Inflamables", type: "check_si_no" },
          { id: "gases_toxicos", label: "Gases o Vapores Toxicos", type: "check_si_no" },
          { id: "electricidad", label: "Contacto con electricidad", type: "check_si_no" },
          { id: "calor_frio", label: "Peligro por calor/frio", type: "check_si_no" },
          { id: "materiales_peligrosos", label: "Materiales peligrosos (Biologicos, corrosivos, etc.)", type: "check_si_no" },
          { id: "hds_sustancias", label: "Cuenta con la HDS de las sustancias quimicas a manejar", type: "check_si_no" },
          { id: "fauna_peligrosa", label: "Fauna Peligrosa", type: "check_si_no" },
          { id: "otros_peligros", label: "Otro (especifique)", type: "text" },
        ],
      },
      {
        id: "equipo_requerido",
        title: "II. Equipo Requerido para Entrar y Trabajar",
        note: "En caso de seleccionar 'No' el trabajo en espacios confinados no puede realizarse.",
        fields: [
          { id: "respiracion_autonomo", label: "Equipo de Respiracion Autonomo", type: "check_si_no_na" },
          { id: "respiracion_emergencia", label: "Equipo de respiracion para escape de emergencia", type: "check_si_no_na" },
          { id: "proteccion_respiratoria", label: "Proteccion respiratoria", type: "check_si_no_na" },
          { id: "proteccion_resp_esp", label: "Especifique proteccion respiratoria", type: "text" },
          { id: "metodo_comunicacion", label: "Metodo de comunicacion", type: "check_si_no_na" },
          { id: "comunicacion_esp", label: "Especifique metodo", type: "text" },
          { id: "equipo_rescate", label: "Equipo de rescate", type: "check_si_no_na" },
          { id: "rescate_esp", label: "Especifique equipo de rescate", type: "text" },
          { id: "tipo_ventilacion", label: "Tipo de ventilacion", type: "check_si_no_na" },
          { id: "ventilacion_esp", label: "Especifique tipo de ventilacion", type: "text" },
          { id: "tiempo_permanencia", label: "Tiempo max. de permanencia", type: "text" },
        ],
      },
      {
        id: "preparaciones",
        title: "III. Preparaciones Previas a la Entrada",
        note: "En caso de seleccionar 'No' el trabajo en espacios confinados no puede realizarse.",
        fields: [
          { id: "plan_emergencias", label: "Se tiene un plan de atencion a emergencias", type: "check_si_no_na" },
          { id: "vigia", label: "Se cuenta con un vigia", type: "check_si_no_na" },
          { id: "personal_dc3", label: "El personal esta calificado (DC-3)", type: "check_si_no_na" },
          { id: "dc3_fecha", label: "Fecha de expedicion DC-3", type: "date" },
          { id: "loto_requerido", label: "Se requiere aplicacion de LOTO", type: "check_si_no_na" },
          { id: "no_loto", label: "No. de LOTO", type: "text" },
          { id: "ventilacion_aire", label: "Ventilacion para proporcionar aire fresco", type: "check_si_no_na" },
          { id: "empleados_informados", label: "Empleados informados de peligros especificos", type: "check_si_no_na" },
          { id: "area_delimitada", label: "Area debidamente delimitada", type: "check_si_no_na" },
          { id: "procedimientos_revisados", label: "Procedimientos revisados con cada empleado", type: "check_si_no_na" },
        ],
      },
      {
        id: "equipo_electrico",
        title: "IV. Equipo Electrico / Herramientas",
        fields: [
          { id: "iluminacion_explosion", label: "Iluminacion (A prueba de explosion)", type: "check_si_no_na" },
          { id: "gfci", label: "Interruptores de circuito para falla a tierra (GFCI)", type: "check_si_no_na" },
          { id: "equipo_otros", label: "Otro (especifique)", type: "text" },
        ],
      },
      {
        id: "prueba_atmosferica",
        title: "V. Prueba Atmosferica",
        fields: [
          { id: "prueba_atm", label: "Datos de prueba atmosferica", type: "atmospheric_test" },
        ],
      },
    ],
  },

  // ═══════════ IN04 - EXCAVACION ═══════════
  EXCAVACION: {
    tipo: "EXCAVACION",
    codigo: "RENOVABLES-O-PR-01-IN04-FO01",
    titulo: "Lista de Verificacion para Excavacion",
    vigencia: "12 horas",
    sections: [
      {
        id: "interferencias",
        title: "I. Evaluacion de Interferencias",
        note: "En caso de seleccionar 'No' debera anexarse un plan de trabajo con metodo de comprobacion de ausencia de canalizaciones.",
        fields: [
          { id: "sin_interferencia", label: "Se comprueba que no hay interferencia con canalizaciones electricas, gas, comunicaciones, etc.", type: "check_si_no" },
        ],
      },
      {
        id: "detalles",
        title: "II. Detalles de la Excavacion",
        fields: [
          { id: "usa_maquinaria", label: "Se utilizara maquinaria para la excavacion y/o perforacion", type: "check_si_no_na" },
          { id: "tipo_maquinaria", label: "Tipo de maquinaria a utilizar", type: "text" },
          { id: "operador_dc3", label: "El operador de la maquina esta calificado (DC-3)", type: "check_si_no_na" },
          { id: "dc3_fecha", label: "Fecha de expedicion DC-3", type: "date" },
          { id: "inspeccion_maquinaria", label: "Se ha revisado y cumple con la lista de inspeccion de maquinaria", type: "check_si_no_na" },
          { id: "herramientas_especiales", label: "Requerimiento de herramientas especiales", type: "text" },
          { id: "herramienta_buen_estado", label: "La herramienta manual se encuentra en buen estado", type: "check_si_no_na" },
          { id: "insumos_delimitar", label: "Se cuenta con los insumos para delimitar el area", type: "check_si_no_na" },
          { id: "loto_requerido", label: "Se requiere aplicacion de LOTO", type: "check_si_no_na" },
          { id: "no_loto", label: "No. de LOTO", type: "text" },
          { id: "profundidad", label: "Profundidad de la excavacion", type: "number", unit: "m" },
        ],
      },
      {
        id: "cond_profundidad",
        title: "Excavaciones >1.30m",
        note: "Si la excavacion es mayor a 1.30m de profundidad, continue con los apartados III y IV.",
        fields: [
          { id: "requiere_profunda", label: "Es requerido excavaciones mayores a 1.30 m de profundidad", type: "conditional", showSection: "profundidad", skipToSection: "cond_prueba_atm" },
        ],
      },
      {
        id: "profundidad",
        title: "III. Requisitos para Excavaciones >1.30m",
        fields: [
          { id: "acceso_seguro", label: "El acceso se considera seguro para evacuar en caso de emergencia", type: "check_si_no" },
          { id: "afecta_estabilidad", label: "La excavacion afecta la estabilidad de estructuras adyacentes", type: "check_si_no" },
          { id: "contencion_derrumbes", label: "Los mecanismos de contencion contra derrumbes han sido verificados", type: "check_si_no" },
          { id: "persona_contencion", label: "Nombre de la persona que verifico la contencion contra derrumbes", type: "text" },
        ],
      },
      {
        id: "cond_prueba_atm",
        title: "Prueba Atmosferica",
        fields: [
          { id: "requiere_prueba_atm", label: "Es requerido realizar la prueba atmosferica", type: "conditional", showSection: "prueba_atm" },
        ],
      },
      {
        id: "prueba_atm",
        title: "IV. Prueba Atmosferica",
        fields: [
          { id: "prueba_atm", label: "Datos de prueba atmosferica", type: "atmospheric_test" },
        ],
      },
    ],
  },

  // ═══════════ IN05 - CALIENTE ═══════════
  CALIENTE: {
    tipo: "CALIENTE",
    codigo: "RENOVABLES-O-PR-01-IN05-FO01",
    titulo: "Lista de Verificacion para Trabajo en Caliente",
    vigencia: "12 horas",
    sections: [
      {
        id: "condiciones",
        title: "I. Condiciones del Equipo y Requerimientos de Proteccion contra Incendios",
        fields: [
          { id: "tuberia_recipiente", label: "El trabajo se llevara a cabo en una tuberia o recipiente", type: "check_si_no" },
          { id: "ultima_sustancia", label: "Especifique la ultima sustancia contenida", type: "text" },
          { id: "material_inflamable", label: "El ultimo material contenido es inflamable/explosivo", type: "check_si_no" },
          { id: "loto_contemplado", label: "Se ha contemplado LOTO", type: "check_si_no_na" },
          { id: "no_loto", label: "No. de LOTO", type: "text" },
          { id: "area_limpia", label: "Area limpia y libre de inflamables en radio de zona delimitada", type: "check_si_no_na" },
          { id: "alcantarillas_cubiertas", label: "Alcantarillas y/o drenes cercanos cubiertos y senalizados", type: "check_si_no_na" },
          { id: "insumos_delimitar", label: "Se cuenta con los insumos para delimitar el area", type: "check_si_no_na" },
          { id: "extintor", label: "Extintor vigente, accesible y en lugar visible", type: "check_si_no_na" },
          { id: "tipo_extinguidor", label: "Tipo de extinguidor", type: "text" },
          { id: "epp_vigente", label: "EPP especifico vigente y en buen estado", type: "check_si_no_na" },
          { id: "vigilante_extintores", label: "Se cuenta con vigilante entrenado en uso de extintores", type: "check_si_no_na" },
          { id: "sin_interferencia", label: "Se descarta interferencia con otras actividades", type: "check_si_no_na" },
          { id: "conexiones_soldadora", label: "Conexiones, protecciones y cableados suficientes para maquina de soldar", type: "check_si_no_na" },
        ],
      },
      {
        id: "cond_prueba_atm",
        title: "Prueba Atmosferica",
        note: "Si la actividad es en espacios confinados o recipientes con polvos, gases o vapores inflamables.",
        fields: [
          { id: "requiere_prueba_atm", label: "Es requerida la Prueba Atmosferica", type: "conditional", showSection: "prueba_atm", skipToSection: "cond_paredes" },
        ],
      },
      {
        id: "prueba_atm",
        title: "II. Prueba Atmosferica",
        fields: [
          { id: "prueba_atm", label: "Datos de prueba atmosferica", type: "atmospheric_test" },
        ],
      },
      {
        id: "cond_paredes",
        title: "Trabajos en Paredes/Techos",
        fields: [
          { id: "requiere_paredes", label: "Es requerido trabajos en paredes/techos o equipo encerrado", type: "conditional", showSection: "paredes", skipToSection: "ejecutor" },
        ],
      },
      {
        id: "paredes",
        title: "III. Trabajos en Paredes/Techos o Equipo Encerrado",
        fields: [
          { id: "construccion_no_combustible", label: "La construccion no es combustible ni tiene cobertura combustible", type: "check_si_no_na" },
          { id: "combustibles_alejados", label: "Combustibles al otro lado de las paredes han sido movidos", type: "check_si_no_na" },
          { id: "recipientes_libres", label: "Los recipientes estan libres de liquidos y vapores inflamables", type: "check_si_no_na" },
          { id: "detectores_desconectados", label: "Los detectores de humo o calor del area han sido desconectados", type: "check_si_no_na" },
        ],
      },
      {
        id: "ejecutor",
        title: "IV. A Llenar por Ejecutor(es) del Trabajo",
        fields: [
          { id: "ejecutor", label: "Datos del ejecutor", type: "signature_block" },
        ],
      },
      {
        id: "vigilante",
        title: "V. A Llenar por Vigilante contra Incendios",
        fields: [
          { id: "vigilante", label: "Datos del vigilante contra incendios", type: "signature_block" },
        ],
      },
    ],
  },

  // ═══════════ IN07 - IZAJE Y CARGAS ═══════════
  IZAJE_CARGAS: {
    tipo: "IZAJE_CARGAS",
    codigo: "RENOVABLES-O-PR-01-IN07-FO01",
    titulo: "Lista de Verificacion para Izaje y Movimiento de Cargas Suspendidas",
    vigencia: "12 horas",
    sections: [
      {
        id: "condiciones_izaje",
        title: "I. Condiciones para el Izaje",
        note: "En caso de seleccionar 'No' en las casillas, el trabajo de Izaje no podra autorizarse.",
        fields: [
          { id: "condiciones_clima", label: "Las condiciones climatologicas son adecuadas", type: "check_si_no_na" },
          { id: "peso_carga", label: "Se conoce el peso de la carga (Kg)", type: "check_si_no_na" },
          { id: "peso_valor", label: "Peso de la carga", type: "number", unit: "kg" },
          { id: "centro_gravedad", label: "Se identifica el centro de gravedad y los puntos de Izaje", type: "check_si_no_na" },
          { id: "area_libre", label: "Area libre de obstrucciones y de personal", type: "check_si_no_na" },
          { id: "plan_izaje", label: "El responsable presento el plan de Izaje", type: "check_si_no_na" },
          { id: "medios_delimitar", label: "Se cuentan con los medios para delimitar y senalizar el area", type: "check_si_no_na" },
          { id: "distancia_lineas", label: "Se cumple con la distancia minima a lineas energizadas (50kV>3.10m, 115kV>4.57m, 230kV>6.10m)", type: "check_si_no_na" },
        ],
      },
      {
        id: "gruas_montacargas",
        title: "II. Verificaciones Previas para Gruas o Montacargas",
        fields: [
          { id: "carga_max_grua", label: "Carga maxima de utilizacion de la grua segun plan de izaje", type: "number", unit: "kg" },
          { id: "peso_inferior_75", label: "El peso de la carga es inferior al 75% de carga maxima", type: "check_si_no_na" },
          { id: "eslingas_buen_estado", label: "Eslingas, cables, grilletes, cadenas en buen estado y corresponden al peso", type: "check_si_no_na" },
          { id: "ganchos_pestillos", label: "Ganchos, mosquetones y accesorios tienen pestillos de seguridad", type: "check_si_no_na" },
          { id: "metodo_comunicacion", label: "Metodo de comunicacion", type: "text" },
          { id: "inspeccion_mecanica", label: "Se cuenta con la inspeccion mecanica (RENOVABLES-O-PR-01-IN07-FO02/FO03)", type: "check_si_no" },
        ],
      },
      {
        id: "operador",
        title: "III. A Llenar por el Operador de Grua / Montacarga",
        fields: [
          { id: "operador", label: "Datos del operador", type: "signature_block" },
          { id: "operador_dc3", label: "El operador esta calificado (DC-3)", type: "check_si_no" },
          { id: "operador_dc3_fecha", label: "Fecha de expedicion", type: "date" },
          { id: "requiere_maniobrista", label: "Se requiere asistencia de un maniobrista", type: "check_si_no" },
        ],
      },
      {
        id: "cond_maniobrista",
        title: "Maniobrista Adicional",
        fields: [
          { id: "requiere_maniobrista_adicional", label: "Es requerido el trabajo de Maniobrista adicional", type: "conditional", showSection: "maniobrista" },
        ],
      },
      {
        id: "maniobrista",
        title: "IV. A Llenar por el Maniobrista",
        fields: [
          { id: "maniobrista", label: "Datos del maniobrista", type: "signature_block" },
          { id: "maniobrista_dc3", label: "El operador esta calificado (DC-3)", type: "check_si_no" },
          { id: "maniobrista_dc3_fecha", label: "Fecha de expedicion", type: "date" },
        ],
      },
    ],
  },

  // ═══════════ IN09 - MAQUINARIA PESADA ═══════════
  MAQUINARIA_PESADA: {
    tipo: "MAQUINARIA_PESADA",
    codigo: "RENOVABLES-O-PR-01-IN09-FO01",
    titulo: "Lista de Verificacion para Manejo de Maquinaria Pesada",
    vigencia: "12 horas",
    sections: [
      {
        id: "condiciones",
        title: "I. Condiciones para Manejo de Maquinaria Pesada",
        fields: [
          { id: "condiciones_clima", label: "Las condiciones climatologicas son adecuadas", type: "check_si_no" },
          { id: "area_libre", label: "Area libre de obstrucciones y de personal. No existe interferencia con otros trabajos", type: "check_si_no" },
          { id: "medios_delimitar", label: "Se cuentan con los medios para delimitar y/o senalizar el area", type: "check_si_no" },
          { id: "rutas_transito", label: "Se han definido las rutas de transito y sitio de estacionamiento", type: "check_si_no" },
          { id: "metodo_comunicacion", label: "Metodo de comunicacion del operador", type: "text" },
          { id: "insumos_combustibles", label: "Los insumos para recarga de combustibles son seguros", type: "check_si_no" },
        ],
      },
      {
        id: "verificaciones_maquinaria",
        title: "II. Verificaciones Previas de la Maquinaria",
        fields: [
          { id: "llantas", label: "Llantas / presion de aire", type: "check_cumple_na" },
          { id: "orugas", label: "Integridad de orugas", type: "check_cumple_na" },
          { id: "hidraulico", label: "Sistema hidraulico sin fugas", type: "check_cumple_na" },
          { id: "luces", label: "Luces (faros, direccionales, luces traseras)", type: "check_cumple_na" },
          { id: "frenos", label: "Frenos funcionales", type: "check_cumple_na" },
          { id: "ruidos", label: "Sin presencia de ruidos anormales", type: "check_cumple_na" },
          { id: "bateria", label: "Bateria / Sistema electrico en buenas condiciones", type: "check_cumple_na" },
          { id: "alarma_reversa", label: "Alarma sonora de reversa", type: "check_cumple_na" },
          { id: "cinturon", label: "Cinturon de seguridad", type: "check_cumple_na" },
          { id: "jaula_volcadura", label: "Jaula anti volcadura", type: "check_cumple_na" },
          { id: "ventilacion_ac", label: "Ventilacion / aire acondicionado funcional (cabina cerrada)", type: "check_cumple_na" },
          { id: "proteccion_polvo", label: "Proteccion respiratoria contra polvo (cabina abierta)", type: "check_cumple_na" },
          { id: "mantenimiento", label: "Mantenimiento realizado dentro del periodo requerido", type: "check_cumple_na" },
        ],
      },
      {
        id: "operador",
        title: "III. A Llenar por el Operador de la Maquinaria",
        fields: [
          { id: "operador", label: "Datos del operador", type: "signature_block" },
          { id: "operador_dc3", label: "El operador esta calificado (DC-3)", type: "check_si_no" },
          { id: "operador_dc3_fecha", label: "Fecha de expedicion", type: "date" },
        ],
      },
    ],
  },

  // ═══════════ ICS - INTERVENCION DE ICS ═══════════
  ICS: {
    tipo: "ICS",
    codigo: "SISTEMAS-PR-05-FO35",
    titulo: "Permiso de Trabajo para la Intervencion de ICS",
    vigencia: "12 horas",
    sections: [
      {
        id: "equipo_computo",
        title: "I. Descripcion del Equipo de Computo",
        fields: [
          { id: "tipo_equipo", label: "Tipo de Equipo", type: "text" },
          { id: "marca", label: "Marca", type: "text" },
          { id: "modelo", label: "Modelo", type: "text" },
          { id: "no_serie", label: "No. de Serie", type: "text" },
        ],
      },
      {
        id: "ciberseguridad",
        title: "II. Cuestionario de Validacion de Ciberseguridad",
        fields: [
          { id: "actualizaciones_windows", label: "El equipo cuenta con las ultimas actualizaciones de Windows", type: "check_si_no" },
          { id: "politica_ti_iot", label: "El contratista conoce la politica de seguridad de TI, IOT de ENGIE", type: "check_si_no" },
          { id: "acuse_confidencialidad", label: "El contratista firmo el acuse de confidencialidad de la politica de TI, IOT", type: "check_si_no" },
          { id: "sistema_operativo", label: "Sistema operativo instalado en el equipo", type: "text" },
        ],
      },
      {
        id: "antivirus",
        title: "III. Antivirus",
        fields: [
          { id: "fecha_escaneo", label: "Fecha de ultimo escaneo del equipo", type: "date" },
          { id: "fabricante_antivirus", label: "Fabricante del antivirus", type: "text" },
        ],
      },
      {
        id: "requerimientos",
        title: "IV. Requerimientos Adicionales",
        fields: [
          { id: "aplicativo_productivo", label: "El equipo intervendra en un aplicativo productivo", type: "check_si_no" },
          { id: "aplicativo_esp", label: "Especifique aplicativo", type: "text" },
          { id: "asignacion_ip", label: "Se requiere asignacion de Direccion IP", type: "check_si_no" },
          { id: "ip_esp", label: "Especifique IP", type: "text" },
          { id: "conectar_servidor", label: "Se requiere conectarse a un servidor", type: "check_si_no" },
          { id: "servidor_esp", label: "Especifique servidor", type: "text" },
          { id: "escaneo_almacenamiento", label: "Escaneo de medio de almacenamiento externo satisfactorio", type: "check_si_no" },
          { id: "dispositivo_escaneo", label: "Dispositivo empleado (KUB o TrendMicro)", type: "text" },
        ],
      },
      {
        id: "riesgos_ics",
        title: "V. Evaluacion de Riesgos ICS",
        subtitle: "Identifique los riesgos tecnologicos y sus medidas de control",
        fields: [
          { id: "tabla_riesgos", label: "Tabla de riesgos y medidas de control", type: "risk_table" },
        ],
      },
    ],
  },
};

// Helper to get form definition by tipo
export function getFormDef(tipo: string): VerificationFormDef | null {
  return VERIFICATION_FORMS[tipo] || null;
}

// Get all form types
export function getAllFormTypes(): { tipo: string; titulo: string; codigo: string }[] {
  return Object.values(VERIFICATION_FORMS).map((f) => ({
    tipo: f.tipo,
    titulo: f.titulo,
    codigo: f.codigo,
  }));
}
