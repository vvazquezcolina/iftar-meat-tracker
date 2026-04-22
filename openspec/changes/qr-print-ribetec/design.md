# Diseño técnico: QR serie e impresión

## Constantes compartidas

- `src/lib/qr-serie.ts`: `QR_SERIE_MAX_TOTAL`, `QR_SERIE_WARN_FROM`, `formatQrSerieId`.
- `src/lib/qr-print-presets.ts`: arreglo de presets; el primero es Ribetec por defecto.

## API ZIP

- `src/app/api/qr/generate/route.ts`: valida `cantidad <= QR_SERIE_MAX_TOTAL` e `inicio >= 1`; usa `formatQrSerieId` para nombres de archivo y payload del QR.

## Admin UI

- `src/app/admin/qr-generate/page.tsx`: formulario desde/hasta, selector de preset, aviso informativo ≥500, acciones Descargar e Imprimir (navegación con query params).

## Impresión en navegador

- `src/app/admin/qr-print/page.tsx`: `Suspense` por `useSearchParams`.
- `src/app/admin/qr-print/QrPrintView.tsx`:
  - Generación por lotes con `import('qrcode')` y `requestAnimationFrame`.
  - `@page` dinámico según mm del preset.
  - `window.print()` automático al terminar, con guard global para evitar doble impresión en React Strict Mode.
  - Misma comprobación de sesión admin (`localStorage`) que el resto del panel.

## Riesgos

- Rangos grandes: CPU del cliente y tiempo de generación; mitigado con barra de progreso y aviso ≥500.
- ZIP grande: memoria en servidor; tope 5000 acotado.
