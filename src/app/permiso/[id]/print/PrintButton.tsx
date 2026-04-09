"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        position: "fixed", top: 20, right: 20,
        background: "#003DA5", color: "white", border: "none",
        padding: "10px 24px", borderRadius: 8, fontSize: 14,
        cursor: "pointer", fontWeight: 600,
      }}
      className="no-print"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
