'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QrGeneratePage() {
  const router = useRouter();
  const [cantidad, setCantidad] = useState(50);
  const [inicio, setInicio] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pin, setPin] = useState('');

  useEffect(() => {
    const storedPin = localStorage.getItem('admin-pin');
    if (!storedPin) {
      router.replace('/admin');
      return;
    }
    setPin(storedPin);
  }, [router]);

  const formatId = (num: number): string => {
    return `QR-${String(num).padStart(3, '0')}`;
  };

  const handleGenerate = async () => {
    if (cantidad < 1 || cantidad > 500) {
      setError('La cantidad debe ser entre 1 y 500');
      return;
    }
    if (inicio < 1) {
      setError('El inicio debe ser al menos 1');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify({ cantidad, inicio }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al generar QR codes');
      }

      // Receive ZIP blob and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-codes-${formatId(inicio)}-a-${formatId(inicio + cantidad - 1)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al generar QR codes'
      );
    } finally {
      setLoading(false);
    }
  };

  const previewStart = formatId(inicio);
  const previewEnd = formatId(inicio + cantidad - 1);

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white">Generar QR Codes</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          QR codes generados y descargados exitosamente
        </div>
      )}

      {/* Form */}
      <div className="flex flex-col gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={cantidad}
                onChange={(e) => {
                  setCantidad(parseInt(e.target.value) || 0);
                  setSuccess(false);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Maximo 500 por lote</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Inicio desde
              </label>
              <input
                type="number"
                min="1"
                value={inicio}
                onChange={(e) => {
                  setInicio(parseInt(e.target.value) || 1);
                  setSuccess(false);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Vista Previa</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <span className="font-mono text-amber-500 font-semibold text-lg">
                {previewStart}
              </span>
              <span className="text-xs text-gray-500">Primero</span>
            </div>

            <div className="flex-1 mx-4 flex items-center">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="px-3 text-sm text-gray-500">
                {cantidad} codigos
              </span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            <div className="flex flex-col items-center">
              <span className="font-mono text-amber-500 font-semibold text-lg">
                {previewEnd}
              </span>
              <span className="text-xs text-gray-500">Ultimo</span>
            </div>
          </div>

          {/* Sample IDs */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {Array.from({ length: Math.min(cantidad, 8) }).map((_, i) => (
              <span
                key={i}
                className="inline-block bg-gray-800 rounded px-2 py-0.5 text-xs font-mono text-gray-400"
              >
                {formatId(inicio + i)}
              </span>
            ))}
            {cantidad > 8 && (
              <span className="inline-block bg-gray-800 rounded px-2 py-0.5 text-xs font-mono text-gray-500">
                ...+{cantidad - 8} mas
              </span>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || cantidad < 1}
          className="w-full min-h-14 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-950 font-bold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Generar y Descargar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
