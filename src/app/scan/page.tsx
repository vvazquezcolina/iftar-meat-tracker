'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type { Product } from '@/lib/types';

function ScanContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [selling, setSelling] = useState(false);
  const [sold, setSold] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/product?id=${encodeURIComponent(id!)}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setError('Error al buscar producto');
          return;
        }
        const data: Product = await res.json();
        setProduct(data);
      } catch {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

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
        setSold(true);
      } else {
        setError('Error al registrar venta');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSelling(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-lg">Buscando producto...</p>
      </div>
    );
  }

  // Not found
  if (notFound) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <svg
            className="w-14 h-14 text-yellow-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-yellow-500 mb-2">
            No Registrado
          </h2>
          <p className="text-gray-400">
            Este QR no ha sido registrado aún
          </p>
          {id && (
            <p className="text-gray-500 text-sm font-mono mt-2">{id}</p>
          )}
        </div>
      </div>
    );
  }

  // Error (no product loaded)
  if (error && !product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
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
          {error}
        </p>
      </div>
    );
  }

  // Sold confirmation
  if (sold && product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
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
      </div>
    );
  }

  // Product found
  if (product) {
    return (
      <div className="flex-1 flex flex-col gap-5">
        {/* Product Card */}
        <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm font-mono">
              {product.qr_id}
            </span>
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
              <p className="text-lg font-semibold">
                {product.peso_kg.toFixed(2)} kg
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Precio/kg</p>
              <p className="text-lg font-semibold">
                ${product.precio_kg.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-700">
            <p className="text-gray-400 text-sm">Precio Total</p>
            <p className="text-3xl font-bold text-green-400">
              ${product.precio_total.toFixed(2)}
            </p>
          </div>

          {product.estatus === 'Vendido' && product.hora_venta && (
            <div className="pt-2 border-t border-gray-700">
              <p className="text-gray-400 text-sm">Vendido</p>
              <p className="text-base text-red-400">
                {product.fecha_venta} a las {product.hora_venta}
              </p>
            </div>
          )}
        </div>

        {/* Action */}
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
              'Marcar como Vendido'
            )}
          </button>
        ) : (
          <div className="w-full min-h-16 bg-red-900/40 border border-red-500/30 text-red-400 text-xl font-bold rounded-2xl flex items-center justify-center">
            Ya vendido
          </div>
        )}

        {error && (
          <p className="text-red-400 text-center text-sm">{error}</p>
        )}
      </div>
    );
  }

  return null;
}

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col px-4 py-6">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">French Kebab</h1>
          <p className="text-gray-400 text-sm mt-1">Información de Producto</p>
        </header>

        <Suspense
          fallback={
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin" />
              <p className="text-gray-400 text-lg">Cargando...</p>
            </div>
          }
        >
          <ScanContent />
        </Suspense>
      </div>
    </div>
  );
}
