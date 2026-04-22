/**
 * Medidas de etiqueta para impresión en navegador (@page y celdas en mm).
 * Son guías: el usuario puede afinar en el diálogo del sistema según su rollo.
 */

export type QrPrintPreset = {
  id: string;
  /** Texto visible en el selector */
  label: string;
  widthMm: number;
  heightMm: number;
  /** Lado aproximado del módulo QR en mm */
  qrSizeMm: number;
  /** Margen interior de la celda en mm */
  paddingMm: number;
};

/** Orden: Ribetec RT-420BE primero (opción por defecto en la UI). */
export const QR_PRINT_PRESETS: QrPrintPreset[] = [
  {
    id: 'ribetec-rt420be-40x30',
    label: 'Ribetec RT-420BE — 40 × 30 mm',
    widthMm: 40,
    heightMm: 30,
    qrSizeMm: 22,
    paddingMm: 2,
  },
  {
    id: 'ribetec-rt420be-50x30',
    label: 'Ribetec RT-420BE — 50 × 30 mm',
    widthMm: 50,
    heightMm: 30,
    qrSizeMm: 24,
    paddingMm: 2,
  },
  {
    id: 'generica-60x40',
    label: 'Etiqueta genérica — 60 × 40 mm',
    widthMm: 60,
    heightMm: 40,
    qrSizeMm: 28,
    paddingMm: 2,
  },
  {
    id: 'generica-50x25',
    label: 'Etiqueta genérica — 50 × 25 mm',
    widthMm: 50,
    heightMm: 25,
    qrSizeMm: 18,
    paddingMm: 1.5,
  },
];

export const QR_PRINT_DEFAULT_PRESET_ID = QR_PRINT_PRESETS[0].id;

export function getQrPrintPresetById(
  id: string | null | undefined
): QrPrintPreset | undefined {
  if (!id) return undefined;
  return QR_PRINT_PRESETS.find((p) => p.id === id);
}
