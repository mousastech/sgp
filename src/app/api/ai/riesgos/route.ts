import { NextRequest, NextResponse } from "next/server";
import { callFMAPI } from "@/lib/fmapi";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `Eres un experto en seguridad industrial y salud ocupacional para centrales electricas con tecnologias renovables (eolica y solar) de ENGIE Mexico. Tu rol es analizar descripciones de trabajos y generar un analisis de riesgos completo.

Contexto: Centrales electricas renovables en Mexico (eolica: aerogeneradores 80-120m, solar: paneles, inversores, subestaciones). El procedimiento base es RENOVABLES-O-PR-01 Ed.2.

Normas mexicanas aplicables:
- NOM-009-STPS-2011: Trabajos en Altura
- NOM-029-STPS-2011: Instalaciones Electricas
- NOM-005-STPS-2017: Sustancias Quimicas
- NOM-031-STPS-2011: Construccion
- NOM-033-STPS-2015: Espacios Confinados

Tipos de trabajo especial: ALTURAS (>1.80m), ESPACIOS_CONFINADOS, EXCAVACION, CALIENTE, EQUIPO_ENERGIZADO, IZAJE_CARGAS, MAQUINARIA_PESADA, ICS

Responde SIEMPRE en formato JSON valido con esta estructura:
{
  "riesgos": "lista de riesgos identificados separados por coma",
  "medidasControl": "lista de medidas de control separadas por coma",
  "valorRiesgoSugerido": numero del 1 al 25 (matriz 5x5 probabilidad x severidad),
  "tiposEspeciales": ["array de tipos detectados como ALTURAS, EQUIPO_ENERGIZADO, etc"],
  "requiereLoto": true/false,
  "condicionesClimaticas": "condiciones climaticas a considerar",
  "normaAplicable": "norma NOM mas relevante",
  "observaciones": "recomendaciones adicionales de seguridad"
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actividad, pasos, area, norma } = body;

    if (!actividad) {
      return NextResponse.json({ error: "La descripcion de la actividad es requerida" }, { status: 400 });
    }

    const prompt = `Analiza el siguiente trabajo y genera el analisis de riesgos:

ACTIVIDAD: ${actividad}
${pasos ? `PASO A PASO: ${pasos}` : ""}
${area ? `AREA/UBICACION: ${area}` : ""}
${norma ? `NORMA INDICADA: ${norma}` : ""}

Genera el JSON con el analisis completo de riesgos, medidas de control, valor de riesgo sugerido, tipos de trabajo especial detectados, si requiere LOTO, y condiciones climaticas a considerar.`;

    const content = await callFMAPI([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ]);

    // Parse JSON from response - handle markdown code blocks and extra text
    let analysis;
    try {
      // Strip markdown code blocks if present
      let cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}") + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        analysis = JSON.parse(cleaned.substring(jsonStart, jsonEnd));
      } else {
        analysis = JSON.parse(cleaned);
      }
    } catch {
      // Fallback: return a reasonable default with the raw text as observaciones
      analysis = {
        riesgos: "Ver observaciones",
        medidasControl: "Ver observaciones",
        valorRiesgoSugerido: 12,
        tiposEspeciales: [],
        requiereLoto: false,
        condicionesClimaticas: "",
        normaAplicable: "",
        observaciones: content.substring(0, 500),
      };
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
