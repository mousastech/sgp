import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./Sidebar";

export const metadata: Metadata = {
  title: "Permisos de Trabajo — ENGIE Mexico",
  description: "Sistema de Gestion de Permisos de Trabajo HSE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen flex">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-0 lg:ml-64">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
