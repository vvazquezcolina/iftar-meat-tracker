/**
 * Límites y formato de IDs de serie para etiquetas QR (admin).
 * Mantiene alineados cliente, API de ZIP y vista de impresión.
 */

/** Máximo de códigos por rango (descarga ZIP o cola de impresión en navegador). */
export const QR_SERIE_MAX_TOTAL = 5000;

/** A partir de cuántas piezas mostramos aviso de tiempo (solo UI). */
export const QR_SERIE_WARN_FROM = 500;

/**
 * Convierte el número de serie al texto que codifica el QR (ej. 1 → "QR-001").
 */
export function formatQrSerieId(num: number): string {
  return `QR-${String(num).padStart(3, '0')}`;
}
