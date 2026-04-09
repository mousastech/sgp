export const dynamic = "force-dynamic";

import { getEmpleadosOperadores, getAreas } from "@/lib/actions/permisos";
import { CapturaForm } from "./CapturaForm";

export default async function CapturaPage() {
  const [empleados, areas] = await Promise.all([
    getEmpleadosOperadores(),
    getAreas(),
  ]);

  if (!empleados.length || !areas.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center text-yellow-800">
        No hay empleados o areas registrados. Configure en Administracion.
      </div>
    );
  }

  return <CapturaForm empleados={empleados} areas={areas} />;
}
