'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeypad = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = async () => {
    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 digitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('admin-pin', pin);
        router.push('/admin/dashboard');
      } else {
        setError('PIN incorrecto');
        setPin('');
      }
    } catch {
      setError('Error de conexion. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo / Title */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">QR Carne Tracker</h1>
          <p className="text-amber-500 font-semibold mt-1 text-lg">Panel Admin</p>
        </div>

        {/* PIN Display */}
        <div className="flex gap-3 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                i < pin.length
                  ? 'bg-amber-500 border-amber-500 scale-110'
                  : 'border-gray-600 bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm font-medium text-center -mt-4">
            {error}
          </p>
        )}

        {/* Keypad */}
        <div className="w-full max-w-xs mx-auto flex flex-col gap-3">
          {keypadRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-3 justify-center">
              {row.map((key) => {
                if (key === '') {
                  return <div key="empty" className="w-20 h-14" />;
                }
                if (key === 'del') {
                  return (
                    <button
                      key="del"
                      type="button"
                      onClick={handleDelete}
                      className="w-20 h-14 rounded-xl bg-gray-800 hover:bg-gray-700 active:bg-gray-600 flex items-center justify-center transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l7-7 12 0v14H10L3 12z" />
                      </svg>
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypad(key)}
                    className="w-20 h-14 rounded-xl bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-2xl font-semibold text-white transition-colors"
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || pin.length < 4}
          className="w-full max-w-xs min-h-14 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-950 font-bold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verificando...
            </span>
          ) : (
            'Entrar'
          )}
        </button>
      </div>
    </div>
  );
}
