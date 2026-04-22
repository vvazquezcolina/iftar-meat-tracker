import { Suspense } from 'react';
import QrPrintView from './QrPrintView';

function PrintFallback() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <p className="text-sm text-gray-400">Cargando vista de impresión…</p>
    </div>
  );
}

export default function QrPrintPage() {
  return (
    <Suspense fallback={<PrintFallback />}>
      <QrPrintView />
    </Suspense>
  );
}
