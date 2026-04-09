export const dynamic = "force-dynamic";

import { getListaById } from "@/lib/actions/verificacion";
import { getFormDef } from "@/lib/verificacion-forms";
import { FormRenderer } from "./FormRenderer";
import { notFound } from "next/navigation";

export default async function VerificacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lista = await getListaById(Number(id));
  if (!lista) return notFound();

  const formDef = getFormDef(lista.tipo);
  if (!formDef) return notFound();

  return (
    <FormRenderer
      lista={{
        id: lista.id,
        tipo: lista.tipo,
        estado: lista.estado,
        respuestas: lista.respuestas as Record<string, any>,
        permiso: {
          folio: lista.permiso.folio,
          actividadEspecifica: lista.permiso.actividadEspecifica,
          empleado: lista.permiso.empleado.nombreCompleto,
          area: lista.permiso.area.nombre,
        },
      }}
      formDef={formDef}
    />
  );
}
