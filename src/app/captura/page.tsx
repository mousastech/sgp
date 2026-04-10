export const dynamic = "force-dynamic";

import { getEmpleadosOperadores, getAreas, getEmpleadosResponsables } from "@/lib/actions/permisos";
import { CapturaForm } from "./CapturaForm";
import { CapturaRoleGate } from "./RoleGate";

export default async function CapturaPage() {
  const [empleados, responsables, areas] = await Promise.all([
    getEmpleadosOperadores(),
    getEmpleadosResponsables(),
    getAreas(),
  ]);

  if (!empleados.length || !areas.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center text-yellow-800">
        No hay empleados o areas registrados. Configure en Administracion.
      </div>
    );
  }

  return (
    <CapturaRoleGate>
      <CapturaForm empleados={empleados} responsables={responsables} areas={areas} />
    </CapturaRoleGate>
  );
}
