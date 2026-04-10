"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { MessageSquare, Send, Database, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql?: string | null;
  datos?: any[] | null;
}

const SUGGESTIONS = [
  "Cuantos permisos hay abiertos hoy?",
  "Que areas tienen mas permisos activos?",
  "Cuantos trabajos en alturas se hicieron este mes?",
  "Cual es la tasa de rechazo de permisos?",
  "Que permisos requieren LOTO actualmente?",
  "Quienes son los autorizadores mas activos?",
  "Hay permisos suspendidos ahora?",
  "Cual es el promedio de valor de riesgo por area?",
];

export default function GeniePage() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/genie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: msg,
          historial: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.respuesta || data.error || "Sin respuesta",
          sql: data.sql,
          datos: data.datos,
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error de conexion con el servicio de IA." }]);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      {/* Header */}
      <div className="shrink-0 pb-3">
        <div className="relative rounded-2xl overflow-hidden h-32">
          <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/80 to-purple-600/50 flex items-center p-6">
            <div>
              <h2 className="text-xl font-bold text-white">{ t("genie.title")}</h2>
              <p className="text-sm text-white/80 mt-1">{t("genie.subtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-center">
              <MessageSquare size={40} className="text-indigo-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">{ t("genie.pregunta")}</h3>
              <p className="text-sm text-gray-400 mt-1">{t("genie.consulto")}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-2xl">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-700"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

              {msg.sql && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Database size={12} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-semibold">SQL ejecutado</span>
                  </div>
                  <pre className="text-[11px] text-indigo-600 font-mono overflow-x-auto">{msg.sql}</pre>
                </div>
              )}

              {msg.datos && msg.datos.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(msg.datos[0]).map((k) => (
                          <th key={k} className="text-left p-2 border border-gray-200 font-semibold text-gray-600">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {msg.datos.slice(0, 20).map((row: any, ri: number) => (
                        <tr key={ri} className="hover:bg-gray-50">
                          {Object.values(row).map((v: any, ci: number) => (
                            <td key={ci} className="p-2 border border-gray-200 text-gray-700">{v?.toString() ?? ""}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {msg.datos.length > 20 && (
                    <p className="text-[10px] text-gray-400 text-center mt-1">Mostrando 20 de {msg.datos.length} resultados</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-500" />
              <span className="text-sm text-gray-400">{ t("genie.consultando")}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Pregunta sobre permisos, seguridad, cumplimiento..."
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
