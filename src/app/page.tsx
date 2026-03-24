"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
          QR Carne Tracker
        </h1>
        <p className="mb-12 text-lg text-gray-400">
          Sistema de registro y venta de carne
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/admin"
            className="flex items-center justify-center gap-3 rounded-2xl bg-amber-500 px-6 py-5 text-xl font-semibold text-black transition-colors hover:bg-amber-400 active:bg-amber-600"
          >
            <span className="text-2xl" role="img" aria-label="Administrador">
              🛡️
            </span>
            Administrador
          </Link>

          <Link
            href="/pos"
            className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-6 py-5 text-xl font-semibold text-white transition-colors hover:bg-emerald-500 active:bg-emerald-700"
          >
            <span className="text-2xl" role="img" aria-label="Punto de Venta">
              🛒
            </span>
            Punto de Venta
          </Link>
        </div>

        <p className="mt-10 text-sm text-gray-500 text-center">
          Registra, etiqueta y vende carne con seguimiento por QR.
        </p>
      </div>
    </div>
  );
}
