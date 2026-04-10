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
}

IMPORTANTE: Responde SOLO con el JSON puro. NO uses bloques de codigo markdown. NO agregues texto antes o despues del JSON. Solo el objeto JSON.`;

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
      // Aggressively strip all markdown artifacts
      let cleaned = content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/^\s*json\s*/i, "")
        .trim();
      // Extract JSON object
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}") + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = cleaned.substring(jsonStart, jsonEnd);
        analysis = JSON.parse(jsonStr);
      } else {
        analysis = JSON.parse(cleaned);
      }
    } catch (parseErr) {
      console.error("[AI Riesgos] Parse error. Raw content:", content.substring(0, 200));
      // Second attempt: try to extract with more aggressive regex
      try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          analysis = JSON.parse(match[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch {
        analysis = {
          riesgos: "Ver observaciones - la IA genero una respuesta que no pudo ser procesada automaticamente",
          medidasControl: "Revisar manualmente",
          valorRiesgoSugerido: 12,
          tiposEspeciales: [],
          requiereLoto: false,
          condicionesClimaticas: "",
          normaAplicable: "",
          observaciones: content.replace(/```json/gi, "").replace(/```/g, "").substring(0, 500),
        };
      }
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
