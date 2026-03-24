'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Price } from '@/lib/types';

interface PriceRow extends Price {
  isNew?: boolean;
  saving?: boolean;
  saved?: boolean;
}

export default function PricesPage() {
  const router = useRouter();
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [userPin, setUserPin] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (!storedName) {
      router.replace('/admin');
      return;
    }
    setUserName(storedName);
    setUserPin(localStorage.getItem('user_pin') || '');
    fetchPrices();
  }, [router]);

  const fetchPrices = async () => {
    try {
      const name = localStorage.getItem('user_name') || '';
      const pin = localStorage.getItem('user_pin') || '';
      const res = await fetch('/api/prices', {
        headers: { 'x-user-name': name, 'x-user-pin': pin },
      });
      if (!res.ok) throw new Error();
      const data: Price[] = await res.json();
      setPrices(data.map((p) => ({ ...p })));
    } catch {
      setError('No se pudieron cargar los precios');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handlePriceChange = (index: number, value: string) => {
    setPrices((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        precio_por_kg: parseFloat(value) || 0,
        saved: false,
      };
      return updated;
    });
  };

  const handleNameChange = (index: number, value: string) => {
    setPrices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], tipo_carne: value, saved: false };
      return updated;
    });
  };

  const handleSave = async (index: number) => {
    const price = prices[index];
    if (!price.tipo_carne.trim()) {
      setError('El nombre del tipo de carne no puede estar vacio');
      return;
    }
    if (price.precio_por_kg <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    setPrices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], saving: true };
      return updated;
    });
    setError('');

    try {
      const res = await fetch('/api/prices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': userName,
          'x-user-pin': userPin,
        },
        body: JSON.stringify({
          tipo_carne: price.tipo_carne,
          precio_por_kg: price.precio_por_kg,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar');
      }

      setPrices((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          saving: false,
          saved: true,
          isNew: false,
        };
        return updated;
      });
      showToast(`Precio de "${price.tipo_carne}" guardado`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar precio');
      setPrices((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], saving: false };
        return updated;
      });
    }
  };

  const handleAddType = () => {
    setPrices((prev) => [
      ...prev,
      { tipo_carne: '', precio_por_kg: 0, isNew: true },
    ]);
  };

  const handleRemoveNew = (index: number) => {
    setPrices((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400">Cargando precios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg font-medium text-sm animate-fade-in">
          {toast}
        </div>
      )}

      {/* Back button */}
      <button onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">Configurar Precios</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Price List */}
      <div className="flex flex-col gap-3 mb-6">
        {prices.length === 0 && (
          <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
            <p className="text-gray-500">No hay tipos de carne configurados</p>
          </div>
        )}

        {prices.map((price, index) => (
          <div
            key={`${price.tipo_carne}-${index}`}
            className={`bg-gray-900 rounded-xl border p-4 transition-colors ${
              price.saved
                ? 'border-emerald-500/30'
                : 'border-gray-800'
            }`}
          >
            {price.isNew ? (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Nombre del tipo
                </label>
                <input
                  type="text"
                  value={price.tipo_carne}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder="Ej: Res, Pollo, Cordero..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                />
              </div>
            ) : (
              <p className="text-white font-semibold mb-3">{price.tipo_carne}</p>
            )}

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Precio por kg
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price.precio_por_kg || ''}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {price.isNew && (
                  <button
                    type="button"
                    onClick={() => handleRemoveNew(index)}
                    className="min-h-10 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium text-sm transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSave(index)}
                  disabled={price.saving}
                  className={`min-h-10 px-4 rounded-lg font-semibold text-sm transition-colors disabled:opacity-40 ${
                    price.saved
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500 hover:bg-amber-400 text-gray-950'
                  }`}
                >
                  {price.saving ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : price.saved ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add new type button */}
      <button
        type="button"
        onClick={handleAddType}
        className="w-full min-h-12 rounded-xl border-2 border-dashed border-gray-700 hover:border-amber-500/50 text-gray-400 hover:text-amber-500 font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Agregar Tipo de Carne
      </button>
    </div>
  );
}
