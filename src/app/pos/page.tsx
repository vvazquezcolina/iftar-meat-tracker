'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Product } from '@/lib/types';

// Dynamically import QrScanner - renders fallback if not available
const QrScanner = dynamic(() => import('@/components/QrScanner'), {
  ssr: false,
  loading: () => null,
});

type ViewState = 'idle' | 'scanning' | 'loading' | 'product' | 'sold' | 'error';

export default function POSPage() {
  const [view, setView] = useState<ViewState>('idle');
  const [product, setProduct] = useState<Product | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selling, setSelling] = useState(false);
  const [scannerAvailable, setScannerAvailable] = useState<boolean | null>(null);

  // Check if QrScanner component exists
  useEffect(() => {
    import('@/components/QrScanner')
      .then(() => setScannerAvailable(true))
      .catch(() => setScannerAvailable(false));
  }, []);

  const startScan = () => {
    setView('scanning');
    setProduct(null);
    setErrorMsg('');
  };

  const handleScan = useCallback(async (result: string) => {
    setView('loading');
    try {
      const res = await fetch(`/api/product?id=${encodeURIComponent(result)}`);
      if (res.status === 404) {
        setErrorMsg('Producto no registrado');
        setView('error');
        return;
      }
      if (!res.ok) {
        setErrorMsg('Error al buscar producto');
        setView('error');
        return;
      }
      const data: Product = await res.json();
      setProduct(data);
      setView('product');
    } catch {
      setErrorMsg('Error de conexión');
      setView('error');
    }
  }, []);

  const handleSell = async () => {
    if (!product) return;
    setSelling(true);
    try {
      const res = await fetch('/api/product/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_id: product.qr_id }),
      });
      if (res.ok) {
        setProduct({ ...product, estatus: 'Vendido' });
        setView('sold');
      } else {
        setErrorMsg('Error al registrar venta');
        setView('error');
      }
    } catch {
      setErrorMsg('Error de conexión');
      setView('error');
    } finally {
      setSelling(false);
    }
  };

  const reset = () => {
    setView('idle');
    setProduct(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col px-4 py-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">French Kebab</h1>
          <p className="text-gray-400 text-lg mt-1">Punto de Venta</p>
        </header>

        {/* Idle - Scan Button */}
        {view === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="w-24 h-24 rounded-2xl bg-gray-800 flex items-center justify-center">
              <svg
                className="w-14 h-14 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h3c.621 0 1.125.504 1.125 1.125v3c0 .621-.504 1.125-1.125 1.125h-3A1.125 1.125 0 013.75 7.875v-3zM3.75 15.375c0-.621.504-1.125 1.125-1.125h3c.621 0 1.125.504 1.125 1.125v3c0 .621-.504 1.125-1.125 1.125h-3a1.125 1.125 0 01-1.125-1.125v-3zM14.25 4.875c0-.621.504-1.125 1.125-1.125h3c.621 0 1.125.504 1.125 1.125v3c0 .621-.504 1.125-1.125 1.125h-3a1.125 1.125 0 01-1.125-1.125v-3zM14.25 14.25h4.5v4.5h-4.5v-4.5z"
                />
              </svg>
            </div>
            <button
              onClick={startScan}
              className="w-full min-h-16 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xl font-bold rounded-2xl transition-colors duration-150 shadow-lg shadow-green-500/25"
            >
              Escanear QR
            </button>
            <Link
              href="/pos/historial"
              className="text-gray-400 hover:text-gray-300 text-sm underline underline-offset-4 transition-colors"
            >
              Ver ventas del día
            </Link>
          </div>
        )}

        {/* Scanning */}
        {view === 'scanning' && (
          <div className="flex-1 flex flex-col gap-4">
            {scannerAvailable ? (
              <QrScanner onScan={handleScan} />
            ) : (
              <ManualInput onScan={handleScan} />
            )}
            <button
              onClick={reset}
              className="w-full min-h-14 bg-gray-800 hover:bg-gray-700 text-gray-300 text-lg font-semibold rounded-2xl transition-colors duration-150"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Loading */}
        {view === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-lg">Buscando producto...</p>
          </div>
        )}

        {/* Product Found */}
        {view === 'product' && product && (
          <div className="flex-1 flex flex-col gap-5 animate-[fade-in_0.3s_ease-out]">
            <ProductCard product={product} />

            {product.estatus === 'Disponible' ? (
              <button
                onClick={handleSell}
                disabled={selling}
                className="w-full min-h-16 bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white text-2xl font-bold rounded-2xl transition-colors duration-150 shadow-lg shadow-green-500/25 flex items-center justify-center gap-3"
              >
                {selling ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'VENDIDO'
                )}
              </button>
            ) : (
              <div className="w-full min-h-16 bg-red-900/40 border border-red-500/30 text-red-400 text-xl font-bold rounded-2xl flex items-center justify-center">
                Ya vendido
              </div>
            )}

            <button
              onClick={reset}
              className="w-full min-h-14 bg-gray-800 hover:bg-gray-700 text-gray-300 text-lg font-semibold rounded-2xl transition-colors duration-150"
            >
              Escanear Otro
            </button>
          </div>
        )}

        {/* Sold Success */}
        {view === 'sold' && product && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-[fade-in_0.3s_ease-out]">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-[scale-in_0.5s_ease-out]">
              <svg
                className="w-14 h-14 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-500 mb-2">
                Venta Registrada
              </h2>
              <p className="text-gray-400 text-lg">{product.qr_id}</p>
              <p className="text-white text-xl font-semibold mt-1">
                {product.tipo_carne}
              </p>
              <p className="text-green-400 text-3xl font-bold mt-3">
                ${product.precio_total.toFixed(2)}
              </p>
            </div>

            <button
              onClick={reset}
              className="w-full min-h-16 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xl font-bold rounded-2xl transition-colors duration-150 shadow-lg shadow-green-500/25 mt-4"
            >
              Escanear Otro
            </button>
            <Link
              href="/pos/historial"
              className="text-gray-400 hover:text-gray-300 text-sm underline underline-offset-4 transition-colors"
            >
              Ver ventas del día
            </Link>
          </div>
        )}

        {/* Error */}
        {view === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-[fade-in_0.3s_ease-out]">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-14 h-14 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-400 text-xl font-semibold text-center">
              {errorMsg}
            </p>
            <button
              onClick={reset}
              className="w-full min-h-14 bg-gray-800 hover:bg-gray-700 text-gray-300 text-lg font-semibold rounded-2xl transition-colors duration-150"
            >
              Escanear Otro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-mono">{product.qr_id}</span>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            product.estatus === 'Disponible'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {product.estatus}
        </span>
      </div>

      <h3 className="text-2xl font-bold">{product.tipo_carne}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Peso</p>
          <p className="text-lg font-semibold">{product.peso_kg.toFixed(2)} kg</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Precio/kg</p>
          <p className="text-lg font-semibold">${product.precio_kg.toFixed(2)}</p>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-700">
        <p className="text-gray-400 text-sm">Precio Total</p>
        <p className="text-3xl font-bold text-green-400">
          ${product.precio_total.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function ManualInput({ onScan }: { onScan: (result: string) => void }) {
  const [manualId, setManualId] = useState('');

  return (
    <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
      <p className="text-gray-400 text-sm text-center">
        Escáner QR no disponible. Ingresa el ID manualmente:
      </p>
      <input
        type="text"
        value={manualId}
        onChange={(e) => setManualId(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && manualId.trim()) onScan(manualId.trim());
        }}
        placeholder="Ej: QR-001"
        className="w-full min-h-14 bg-gray-700 text-white text-lg rounded-xl px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        autoFocus
      />
      <button
        onClick={() => {
          if (manualId.trim()) onScan(manualId.trim());
        }}
        disabled={!manualId.trim()}
        className="w-full min-h-14 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl transition-colors duration-150"
      >
        Buscar Producto
      </button>
    </div>
  );
}
