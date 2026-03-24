'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Product, DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (!storedName) {
      router.replace('/admin');
      return;
    }
    setUserName(storedName);
    fetchDashboard();
  }, [router]);

  const fetchDashboard = async () => {
    try {
      const name = localStorage.getItem('user_name') || '';
      const pin = localStorage.getItem('user_pin') || '';
      const res = await fetch('/api/dashboard', {
        headers: { 'x-user-name': name, 'x-user-pin': pin },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('user_name');
          localStorage.removeItem('user_pin');
          localStorage.removeItem('user_role');
          router.replace('/admin');
          return;
        }
        throw new Error('Error al cargar datos');
      }

      const data: DashboardStats = await res.json();
      setStats(data);
    } catch {
      setError('No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_pin');
    localStorage.removeItem('user_role');
    router.replace('/admin');
  };

  const getStatusBadge = (estatus: Product['estatus']) => {
    if (estatus === 'Disponible') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
          Disponible
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
        Vendido
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Back button */}
      <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Inicio
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-400">Hola, {userName}</p>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Salir
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
              <p className="text-3xl font-bold text-amber-500">{stats.total}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Registrados</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
              <p className="text-3xl font-bold text-emerald-400">{stats.disponibles}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Disponibles</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
              <p className="text-3xl font-bold text-red-400">{stats.vendidos}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Vendidos</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3 mb-8">
            <Link
              href="/admin/register"
              className="flex items-center gap-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-950 rounded-xl px-5 min-h-14 font-semibold text-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Escanear QR
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/prices"
                className="flex flex-col items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-4 min-h-20 font-semibold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Configurar Precios</span>
              </Link>

              <Link
                href="/admin/qr-generate"
                className="flex flex-col items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-4 min-h-20 font-semibold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-sm">Generar QR Codes</span>
              </Link>
            </div>

            <Link
              href="/pos"
              className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-5 min-h-14 font-semibold text-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="text-white">Punto de Venta</span>
            </Link>
          </div>

          {/* Recent Products */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Productos Recientes</h2>

            {stats.productos.length === 0 ? (
              <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
                <p className="text-gray-500">No hay productos registrados</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.productos.slice(0, 10).map((product) => (
                  <div
                    key={product.qr_id}
                    className="bg-gray-900 rounded-xl p-4 border border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono text-sm font-semibold text-amber-500">
                          {product.qr_id}
                        </p>
                        <p className="text-white font-medium mt-0.5">
                          {product.tipo_carne}
                        </p>
                      </div>
                      {getStatusBadge(product.estatus)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{product.peso_kg} kg</span>
                      <span className="font-semibold text-white">
                        ${product.precio_total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
