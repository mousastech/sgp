export const dynamic = "force-dynamic";

import { getCategorias, getEquipos, getAreas, getEmpleados } from "@/lib/actions/admin";
import { getRoles } from "@/lib/actions/roles";
import { AdminPanel } from "./AdminPanel";

export default async function AdminPage() {
  const [categorias, equipos, areas, empleados, roles] = await Promise.all([
    getCategorias(),
    getEquipos(),
    getAreas(),
    getEmpleados(),
    getRoles(),
  ]);

  return (
    <AdminPanel
      categorias={categorias}
      equipos={equipos}
      areas={areas}
      empleados={empleados}
      roles={roles}
    />
  );
}
