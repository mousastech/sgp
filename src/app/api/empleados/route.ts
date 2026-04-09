import { getPrisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const empleados = await (await getPrisma()).empleado.findMany({
    where: { activo: true },
    orderBy: { nombreCompleto: "asc" },
    select: {
      id: true,
      numeroEmpleado: true,
      nombreCompleto: true,
      puesto: true,
      puestoHomologado: true,
      puedeSerSolicitante: true,
      puedeSerResponsable: true,
      puedeSerAutorizador: true,
      esJefePlanta: true,
      esContratista: true,
      esSupervisor: true,
    },
  });
  return NextResponse.json(empleados);
}
