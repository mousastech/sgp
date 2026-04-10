"use server";

import { getPrisma } from "@/lib/prisma";
import { genFolio } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getEmpleadosOperadores() {
  // All ENGIE employees who can be Solicitante (Anexo 1: all except Contratista)
  return (await getPrisma()).empleado.findMany({
    where: { activo: true, puedeSerSolicitante: true },
    orderBy: { nombreCompleto: "asc" },
  });
}

export async function getEmpleadosResponsables() {
  // All employees who can be Responsable del Trabajo (Anexo 1: all including contratistas)
  return (await getPrisma()).empleado.findMany({
    where: { activo: true, puedeSerResponsable: true },
    orderBy: { nombreCompleto: "asc" },
    select: { id: true, numeroEmpleado: true, nombreCompleto: true, puesto: true },
  });
}

export async function getAreas() {
  return (await getPrisma()).area.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
}

export async function getCategorias() {
  return (await getPrisma()).categoriaEpp.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    include: {
      equipos: {
        where: { activo: true },
        orderBy: [{ obligatorio: "desc" }, { nombre: "asc" }],
      },
    },
  });
}

export async function crearPermiso(formData: FormData) {
  const empleadoId = Number(formData.get("empleadoId"));
  const areaId = Number(formData.get("areaId"));
  const fechaTrabajo = formData.get("fechaTrabajo") as string;
  const horaInicio = formData.get("horaInicio") as string;
  const horaFin = formData.get("horaFin") as string;
  const normaAplicable = formData.get("normaAplicable") as string;
  const actividadEspecifica = formData.get("actividadEspecifica") as string;
  const descripcionPasos = formData.get("descripcionPasos") as string;
  const riesgos = formData.get("riesgosIdentificados") as string;
  const medidas = formData.get("medidasControl") as string;
  const observaciones = formData.get("observacionesOperador") as string;
  const lat = parseFloat(formData.get("lat") as string) || null;
  const lon = parseFloat(formData.get("lon") as string) || null;
  const enviar = formData.get("enviar") === "true";
  // Apartado I extras
  const ordenTrabajo = (formData.get("ordenTrabajo") as string)?.trim() || null;
  const duracionDias = parseInt(formData.get("duracionDias") as string) || null;
  const duracionHoras = parseFloat(formData.get("duracionHoras") as string) || null;
  const disponibilidadEmergencia = parseFloat(formData.get("disponibilidadEmergencia") as string) || null;
  const solicitanteEngie = (formData.get("solicitanteEngie") as string)?.trim() || null;
  const responsableTrabajo = (formData.get("responsableTrabajo") as string)?.trim() || null;
  const departamentoContratista = (formData.get("departamentoContratista") as string)?.trim() || null;
  // Apartado II
  const valorRiesgoMax = parseInt(formData.get("valorRiesgoMax") as string) || null;
  const condicionesClimaticas = (formData.get("condicionesClimaticas") as string)?.trim() || null;
  // Apartado III
  const requiereLoto = formData.get("requiereLoto") === "true";
  const noLoto = (formData.get("noLoto") as string)?.trim() || null;
  const tiposTrabajoEspecial = (formData.get("tiposTrabajoEspecial") as string) || null;

  // Validate
  const errors: string[] = [];
  if (!actividadEspecifica?.trim()) errors.push("La actividad específica es obligatoria.");
  if (!descripcionPasos?.trim()) errors.push("El paso a paso es obligatorio.");

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const count = await (await getPrisma()).permisoTrabajo.count();
  const folio = genFolio(count);
  const estado = enviar ? "ENVIADO" : "BORRADOR";

  const permiso = await (await getPrisma()).permisoTrabajo.create({
    data: {
      folio,
      empleadoId,
      areaId,
      fechaTrabajo: new Date(fechaTrabajo),
      horaInicio,
      horaFin,
      actividadEspecifica,
      descripcionPasos,
      normaAplicable,
      riesgosIdentificados: riesgos || null,
      medidasControl: medidas || null,
      estado,
      ordenTrabajo,
      duracionDias,
      duracionHoras,
      disponibilidadEmergencia,
      solicitanteEngie,
      responsableTrabajo,
      departamentoContratista,
      valorRiesgoMax,
      condicionesClimaticas,
      requiereLoto,
      noLoto,
      tiposTrabajoEspecial,
      coordenadasLatCaptura: lat,
      coordenadasLonCaptura: lon,
      observacionesOperador: observaciones || null,
    },
  });

  await (await getPrisma()).auditoria.create({
    data: {
      tabla: "permisos_trabajo",
      registroId: permiso.id,
      accion: "CREATE",
      usuario: `Empleado #${empleadoId}`,
      datosNuevos: { folio, estado },
    },
  });

  revalidatePath("/captura");
  revalidatePath("/aprobacion");
  revalidatePath("/dashboard");

  // Check 24h advance warning (sec. 6.3)
  const fechaObj = new Date(fechaTrabajo + "T00:00:00");
  const horasAnticipacion = (fechaObj.getTime() - Date.now()) / (1000 * 60 * 60);
  const warning = horasAnticipacion < 24
    ? "Solicitud con menos de 24h de anticipacion (sec. 6.3)"
    : undefined;

  return { success: true, folio, estado, warning };
}
