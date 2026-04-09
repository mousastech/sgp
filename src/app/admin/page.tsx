export const dynamic = "force-dynamic";

import { getCategorias, getEquipos, getAreas, getEmpleados } from "@/lib/actions/admin";
import { AdminPanel } from "./AdminPanel";

export default async function AdminPage() {
  const [categorias, equipos, areas, empleados] = await Promise.all([
    getCategorias(),
    getEquipos(),
    getAreas(),
    getEmpleados(),
  ]);

  return (
    <AdminPanel
      categorias={categorias}
      equipos={equipos}
      areas={areas}
      empleados={empleados}
    />
  );
}
