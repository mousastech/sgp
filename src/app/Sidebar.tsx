"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ClipboardList,
  ClipboardCheck,
  CheckCircle,
  BarChart3,
  BookOpen,
  Settings,
  Menu,
  X,
  Shield,
  User,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    title: "INICIO",
    items: [
      { href: "/", label: "Inicio", icon: Home },
    ],
  },
  {
    title: "OPERACIONES",
    items: [
      { href: "/captura", label: "Permiso General", icon: ClipboardList },
      { href: "/verificacion", label: "Listas de Verificacion", icon: ClipboardCheck },
      { href: "/aprobacion", label: "Gestion de Permisos", icon: CheckCircle },
    ],
  },
  {
    title: "CUMPLIMIENTO",
    items: [
      { href: "/dashboard", label: "Dashboard HSE", icon: BarChart3 },
      { href: "/bitacora", label: "Bitacora de Permisos", icon: BookOpen },
    ],
  },
  {
    title: "REFERENCIA",
    items: [
      { href: "/admin", label: "Administracion", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-xl shadow-lg p-2.5 border border-gray-200"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-engie-blue flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                Permisos de Trabajo
              </h1>
              <p className="text-[11px] text-gray-400 font-medium">ENGIE Mexico</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-engie-blue text-white shadow-md shadow-engie-blue/25"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-gray-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User area */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-engie-blue/10 flex items-center justify-center">
              <User className="w-4 h-4 text-engie-blue" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">
                Operador ENGIE
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                permisos@engie.com
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
