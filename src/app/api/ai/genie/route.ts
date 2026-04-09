import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { callFMAPI } from "@/lib/fmapi";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `Eres el Genie de Seguridad de ENGIE Mexico. Respondes preguntas sobre permisos de trabajo, cumplimiento HSE y seguridad operativa en centrales electricas renovables.

Tienes acceso a la base de datos PostgreSQL con estas tablas:

1. **permisos_trabajo** - Permisos de trabajo:
   - id, folio (varchar), empleado_id, area_id, fecha_trabajo (date), hora_inicio, hora_fin
   - actividad_especifica (text), descripcion_pasos (text), norma_aplicable
   - estado (varchar): BORRADOR, ENVIADO, EN_REVISION, AUTORIZADO, EN_EJECUCION, CIERRE_RESPONSABLE, CERRADO, RECHAZADO, DEVUELTO, SUSPENDIDO
   - requiere_loto (boolean), tipos_trabajo_especial (JSON array string), valor_riesgo_max (int)
   - extension_dias (int), created_at, fecha_cierre, fecha_autorizacion
   - responsable_trabajo, solicitante_engie, departamento_contratista

2. **empleados** - Personal:
   - id, numero_empleado, nombre_completo, puesto, puesto_homologado, area_id
   - puede_ser_autorizador, es_jefe_planta, es_contratista, es_supervisor

3. **areas** - Areas/centrales:
   - id, nombre, ubicacion

4. **aprobaciones** - Firmas de autorizacion:
   - id, permiso_id, supervisor_id, decision (varchar), comentarios, firma_electronica, fecha_firma

5. **listas_verificacion** - Listas de verificacion especiales:
   - id, permiso_id, tipo (varchar), codigo, respuestas (JSON), estado

6. **auditoria** - Log de auditoria:
   - id, tabla, registro_id, accion, usuario, datos_nuevos (JSON), created_at

7. **evidencias** - Fotos adjuntas:
   - id, permiso_id, tipo, nombre, creado_por, created_at

Cuando el usuario hace una pregunta:
1. Si necesitas datos, genera UNA consulta SQL PostgreSQL valida
2. Responde en formato JSON: {"sql": "SELECT ...", "explicacion": "texto en espanol"}
3. Si no necesitas SQL, responde: {"respuesta": "texto", "sql": null}

REGLAS:
- Usa siempre nombres de columna con snake_case (como estan en la DB)
- Usa LIMIT para evitar resultados excesivos
- Responde siempre en espanol
- Se conciso y directo`;

export async function POST(req: NextRequest) {
  try {
    const { mensaje, historial } = await req.json();
    if (!mensaje) return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...historial.slice(-6),
      { role: "user", content: mensaje },
    ];

    const content = await callFMAPI(messages, 2000, 0.1);

    let parsed;
    try {
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}") + 1;
      parsed = JSON.parse(content.substring(start, end));
    } catch {
      return NextResponse.json({ respuesta: content, sql: null, datos: null });
    }

    const sql = parsed.sql;
    const explicacion = parsed.explicacion || parsed.respuesta || "";
    let datos = null;

    if (sql) {
      try {
        const prisma = await getPrisma();
        const rows = await prisma.$queryRawUnsafe(sql);
        datos = Array.isArray(rows) ? rows.slice(0, 50) : rows;
        // Serialize BigInt
        datos = JSON.parse(JSON.stringify(datos, (_, v) => typeof v === "bigint" ? Number(v) : v));
      } catch (e: any) {
        return NextResponse.json({
          respuesta: explicacion + `\n\nError SQL: ${e.message}`,
          sql,
          datos: null,
        });
      }
    }

    return NextResponse.json({ respuesta: explicacion, sql, datos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
