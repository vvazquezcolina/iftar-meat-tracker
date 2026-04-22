'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  QR_PRINT_DEFAULT_PRESET_ID,
  QR_PRINT_PRESETS,
} from '@/lib/qr-print-presets';
import {
  formatQrSerieId,
  QR_SERIE_MAX_TOTAL,
  QR_SERIE_WARN_FROM,
} from '@/lib/qr-serie';

export default function QrGeneratePage() {
  const router = useRouter();
  const [desde, setDesde] = useState(1);
  const [hasta, setHasta] = useState(50);
  const [presetId, setPresetId] = useState(QR_PRINT_DEFAULT_PRESET_ID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPin, setUserPin] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (!storedName) {
      router.replace('/admin');
      return;
    }
    setUserName(storedName);
    setUserPin(localStorage.getItem('user_pin') || '');
  }, [router]);

  const total = useMemo(() => {
    if (!Number.isFinite(desde) || !Number.isFinite(hasta)) return 0;
    if (hasta < desde) return 0;
    return hasta - desde + 1;
  }, [desde, hasta]);

  const showSlowWarning = total >= QR_SERIE_WARN_FROM;

  const previewStart =
    hasta >= desde && desde >= 1 ? formatQrSerieId(desde) : '—';
  const previewEnd =
    hasta >= desde && hasta >= 1 ? formatQrSerieId(hasta) : '—';

  const validateRange = (): string | null => {
    if (desde < 1 || hasta < 1) {
      return 'Desde y Hasta deben ser al menos 1';
    }
    if (hasta < desde) {
      return 'Hasta debe ser mayor o igual que Desde';
    }
    if (total > QR_SERIE_MAX_TOTAL) {
      return `El rango supera ${QR_SERIE_MAX_TOTAL} códigos por solicitud`;
    }
    return null;
  };

  const handleDownload = async () => {
    const v = validateRange();
    if (v) {
      setError(v);
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
          'x-user-name': userName,
          'x-user-pin': userPin,
        },
        body: JSON.stringify({ cantidad: total, inicio: desde }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al generar QR codes');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-codes-${previewStart}-a-${previewEnd}.zip`;
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

  const handlePrint = () => {
    const v = validateRange();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setSuccess(false);
    const q = new URLSearchParams({
      inicio: String(desde),
      hasta: String(hasta),
      preset: presetId,
    });
    router.push(`/admin/qr-print?${q.toString()}`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <button
        type="button"
        onClick={() => router.push('/admin/dashboard')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Volver
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">Generar QR Codes</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          ZIP descargado correctamente
        </div>
      )}

      {showSlowWarning && validateRange() === null && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
          <p className="font-semibold text-amber-400 mb-1">
            Aviso: {total} códigos
          </p>
          <p>
            Generar o imprimir tantas etiquetas puede tardar varios minutos y
            hacer pesado el navegador o la descarga. Puedes continuar; solo
            ten paciencia.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Serie desde
                </label>
                <input
                  type="number"
                  min={1}
                  value={desde}
                  onChange={(e) => {
                    setDesde(parseInt(e.target.value, 10) || 0);
                    setSuccess(false);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Serie hasta
                </label>
                <input
                  type="number"
                  min={1}
                  value={hasta}
                  onChange={(e) => {
                    setHasta(parseInt(e.target.value, 10) || 0);
                    setSuccess(false);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-lg"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Máximo {QR_SERIE_MAX_TOTAL} códigos por solicitud ({total}{' '}
              seleccionados)
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Tamaño de etiqueta (impresión)
              </label>
              <select
                value={presetId}
                onChange={(e) => {
                  setPresetId(e.target.value);
                  setSuccess(false);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base"
              >
                {QR_PRINT_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Si el rollo no coincide, ajusta en el diálogo de impresión del
                sistema (Ribetec RT-420BE u otra).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Vista previa</h3>
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
                {total > 0 ? total : '—'} códigos
              </span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            <div className="flex flex-col items-center">
              <span className="font-mono text-amber-500 font-semibold text-lg">
                {previewEnd}
              </span>
              <span className="text-xs text-gray-500">Último</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {total === 0 && hasta < desde && (
              <p className="text-sm text-red-400 w-full">
                Corrige el rango: Hasta debe ser ≥ Desde
              </p>
            )}
            {total > 0 &&
              total <= 8 &&
              Array.from({ length: total }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block bg-gray-800 rounded px-2 py-0.5 text-xs font-mono text-gray-400"
                >
                  {formatQrSerieId(desde + i)}
                </span>
              ))}
            {total > 8 && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className="inline-block bg-gray-800 rounded px-2 py-0.5 text-xs font-mono text-gray-400"
                  >
                    {formatQrSerieId(desde + i)}
                  </span>
                ))}
                <span className="inline-block bg-gray-800 rounded px-2 py-0.5 text-xs font-mono text-gray-500">
                  … +{total - 8} más …
                </span>
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={`e-${i}`}
                    className="inline-block bg-gray-800 rounded px-2 py-0.5 text-xs font-mono text-gray-400"
                  >
                    {formatQrSerieId(hasta - 3 + i)}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading || total < 1}
            className="w-full min-h-14 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-950 font-bold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generando ZIP…
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Descargar ZIP
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={loading || total < 1}
            className="w-full min-h-14 rounded-xl bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-950 font-bold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Imprimir (vista lista)
          </button>
          <p className="text-xs text-gray-500 text-center">
            Se abrirá la hoja de impresión; elige tu Ribetec y confirma. En
            rangos grandes primero verás una barra de progreso.
          </p>
        </div>
      </div>
    </div>
  );
}
