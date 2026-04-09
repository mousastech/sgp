"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Persona = {
  id: number;
  numeroEmpleado: string;
  nombreCompleto: string;
  puesto: string | null;
  puestoHomologado: string | null;
  puedeSerSolicitante: boolean;
  puedeSerResponsable: boolean;
  puedeSerAutorizador: boolean;
  esJefePlanta: boolean;
  esContratista: boolean;
  esSupervisor: boolean;
};

type PersonaContextType = {
  persona: Persona | null;
  empleados: Persona[];
  setPersonaId: (id: number) => void;
  loading: boolean;
};

const PersonaContext = createContext<PersonaContextType>({
  persona: null,
  empleados: [],
  setPersonaId: () => {},
  loading: true,
});

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [empleados, setEmpleados] = useState<Persona[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/empleados")
      .then((r) => r.json())
      .then((data) => {
        setEmpleados(data);
        const saved = localStorage.getItem("engie_persona_id");
        if (saved && data.find((e: Persona) => e.id === Number(saved))) {
          setSelectedId(Number(saved));
        } else if (data.length > 0) {
          setSelectedId(data[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function setPersonaId(id: number) {
    setSelectedId(id);
    localStorage.setItem("engie_persona_id", String(id));
  }

  const persona = empleados.find((e) => e.id === selectedId) || null;

  return (
    <PersonaContext.Provider value={{ persona, empleados, setPersonaId, loading }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}
