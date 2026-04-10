import { NextRequest, NextResponse } from "next/server";
import { callFMAPI } from "@/lib/fmapi";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `Eres un revisor de cumplimiento de permisos de trabajo para centrales electricas renovables de ENGIE Mexico. Tu rol es revisar un permiso de trabajo ANTES de enviarlo para autorizacion y detectar problemas, inconsistencias o campos faltantes.

Procedimiento base: RENOVABLES-O-PR-01 Ed.2
Formato: RENOVABLES-O-PR-01-IN01-FO01

Reglas clave que debes validar:
1. La descripcion del trabajo debe ser clara y especifica (area, equipo, tag)
2. El paso a paso debe ser detallado y secuencial
3. Si hay trabajo en alturas (>1.80m), DEBE marcarse tipo especial ALTURAS
4. Si hay trabajo con electricidad/energia, considerar EQUIPO_ENERGIZADO y/o LOTO
5. Si se trabaja en espacios cerrados, considerar ESPACIOS_CONFINADOS
6. Si hay soldadura/corte/chispas, considerar CALIENTE
7. Si hay excavacion/perforacion, considerar EXCAVACION
8. Si hay gruas/montacargas, considerar IZAJE_CARGAS
9. Las medidas de control deben ser proporcionales a los riesgos
10. El valor de riesgo debe ser coherente con la actividad
11. Debe haber un Responsable del Trabajo asignado
12. La solicitud debe hacerse con >24h de anticipacion si es posible
13. Si requiere LOTO, debe tener numero de LOTO
14. Las condiciones climaticas deben mencionarse si el trabajo es al exterior

Responde en JSON con esta estructura:
{
  "aprobado": true/false,
  "puntaje": numero del 1 al 100 (porcentaje de cumplimiento),
  "criticos": ["lista de problemas criticos que impiden envio"],
  "advertencias": ["lista de advertencias que no bloquean pero deben revisarse"],
  "sugerencias": ["lista de mejoras recomendadas"],
  "resumen": "resumen ejecutivo de 1-2 oraciones"
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const prompt = `Revisa el siguiente permiso de trabajo y evalua su cumplimiento:

DATOS DEL PERMISO:
- Orden de Trabajo: ${body.ordenTrabajo || "(no proporcionado)"}
- Fecha solicitada: ${body.fechaTrabajo || "(no proporcionado)"}
- Duracion: ${body.duracionDias || "?"} dias, ${body.duracionHoras || "?"} horas
- Area: ${body.area || "(no proporcionado)"}
- Actividad: ${body.actividad || "(no proporcionado)"}
- Paso a paso: ${body.pasos || "(no proporcionado)"}
- Norma: ${body.norma || "(no proporcionado)"}
- Solicitante: ${body.solicitante || "(no proporcionado)"}
- Responsable del Trabajo: ${body.responsable || "(no proporcionado)"}
- Departamento/Contratista: ${body.departamento || "(no proporcionado)"}

ANALISIS DE SEGURIDAD:
- Valor riesgo max: ${body.valorRiesgo || "(no proporcionado)"}
- Condiciones climaticas: ${body.condicionesClimaticas || "(no proporcionado)"}
- Riesgos identificados: ${body.riesgos || "(no proporcionado)"}
- Medidas de control: ${body.medidas || "(no proporcionado)"}

CONDICIONES ESPECIALES:
- Tipos de trabajo especial marcados: ${body.tiposEspeciales || "ninguno"}
- Requiere LOTO: ${body.requiereLoto ? "SI" : "NO"}
- No. LOTO: ${body.noLoto || "(no proporcionado)"}

Evalua el cumplimiento del procedimiento RENOVABLES-O-PR-01 y genera el JSON de revision.`;

    const content = await callFMAPI([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], 1500, 0.1);

    let review;
    try {
      let cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}") + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        review = JSON.parse(cleaned.substring(jsonStart, jsonEnd));
      } else {
        review = JSON.parse(cleaned);
      }
    } catch {
      review = { aprobado: true, puntaje: 75, criticos: [], advertencias: ["No se pudo parsear la revision completa"], sugerencias: [], resumen: content.substring(0, 300) };
    }

    return NextResponse.json(review);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
