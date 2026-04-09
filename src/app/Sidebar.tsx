"use client";

import { useState, createContext, useContext } from "react";
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
  ChevronsLeft,
  ChevronsRight,
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

// Context to share collapsed state with layout
export const SidebarContext = createContext({ collapsed: false });

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-xl shadow-lg p-2.5 border border-gray-200"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "w-[68px]" : "w-64"
        } ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className={`border-b border-gray-100 flex items-center ${collapsed ? "p-3 justify-center" : "p-5 justify-between"}`}>
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-engie-blue flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-engie-blue flex items-center justify-center shrink-0">
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
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-4">
              {!collapsed && (
                <p className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center ${collapsed ? "justify-center" : ""} gap-3 ${collapsed ? "px-2" : "px-3"} py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-engie-blue text-white shadow-md shadow-engie-blue/25"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center py-3 border-t border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          title={collapsed ? "Expandir menu" : "Colapsar menu"}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>

        {/* User area */}
        <div className={`border-t border-gray-100 ${collapsed ? "p-2" : "p-4"}`}>
          {collapsed ? (
            <div className="w-10 h-10 mx-auto rounded-full bg-engie-blue/10 flex items-center justify-center" title="Operador ENGIE">
              <User className="w-4 h-4 text-engie-blue" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-engie-blue/10 flex items-center justify-center shrink-0">
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
          )}
        </div>
      </aside>

      {/* Spacer div to push main content - matches sidebar width */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? "w-[68px]" : "w-64"}`} />
    </SidebarContext.Provider>
  );
}
