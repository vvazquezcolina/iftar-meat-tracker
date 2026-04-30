import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  buildQrScanUrl,
  formatQrSerieId,
  QR_SERIE_MAX_TOTAL,
} from '@/lib/qr-serie';
import {
  getQrPrintPresetById,
  QR_PRINT_DEFAULT_PRESET_ID,
} from '@/lib/qr-print-presets';

// Node runtime: pdf-lib + qrcode usan APIs Node y archivos binarios.
export const runtime = 'nodejs';

// 1 mm = 1/25.4 in y 1 in = 72 pt → 1 mm ≈ 2.83465 pt.
const MM_TO_PT = 72 / 25.4;
const mmToPt = (mm: number) => mm * MM_TO_PT;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cantidad,
      inicio = 1,
      presetId = QR_PRINT_DEFAULT_PRESET_ID,
      includeId = false,
    } = body as {
      cantidad?: number;
      inicio?: number;
      presetId?: string;
      includeId?: boolean;
    };

    if (!cantidad || cantidad < 1) {
      return NextResponse.json(
        { error: 'Falta el campo requerido: cantidad' },
        { status: 400 }
      );
    }

    if (cantidad > QR_SERIE_MAX_TOTAL) {
      return NextResponse.json(
        {
          error: `La cantidad no puede superar ${QR_SERIE_MAX_TOTAL} por solicitud`,
        },
        { status: 400 }
      );
    }

    const startNum =
      typeof inicio === 'number' ? inicio : parseInt(String(inicio), 10);
    if (!Number.isFinite(startNum) || startNum < 1) {
      return NextResponse.json(
        { error: 'inicio debe ser un entero mayor o igual a 1' },
        { status: 400 }
      );
    }

    const preset =
      getQrPrintPresetById(presetId) ??
      getQrPrintPresetById(QR_PRINT_DEFAULT_PRESET_ID)!;

    const pageWidthPt = mmToPt(preset.widthMm);
    const pageHeightPt = mmToPt(preset.heightMm);
    // Sin texto: aprovechamos el lado más corto de la etiqueta para que el
    // QR sea lo más grande posible (con un mínimo de padding por seguridad).
    // Con texto: respetamos el qrSizeMm del preset y reservamos espacio abajo.
    const safetyPaddingPt = mmToPt(2);
    const qrSizePt = includeId
      ? mmToPt(preset.qrSizeMm)
      : Math.min(pageWidthPt, pageHeightPt) - safetyPaddingPt * 2;
    const paddingPt = mmToPt(preset.paddingMm);
    const gapPt = mmToPt(1.5);
    const textSizePt = mmToPt(2.8);

    const origin = new URL(request.url).origin;

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(`Etiquetas QR ${formatQrSerieId(startNum)}-${formatQrSerieId(startNum + cantidad - 1)}`);
    pdfDoc.setProducer('iftar-meat-tracker');
    const font = includeId
      ? await pdfDoc.embedFont(StandardFonts.Courier)
      : null;

    // QR PNG a alta resolución para que no pixelee en impresión 203 dpi.
    // Usamos el tamaño físico final del QR para escalar.
    const qrTargetMm = qrSizePt / MM_TO_PT;
    const qrPxSize = Math.max(400, Math.round(qrTargetMm * 15));

    for (let i = 0; i < cantidad; i++) {
      const num = startNum + i;
      const id = formatQrSerieId(num);
      const url = buildQrScanUrl(origin, id);

      const qrPng = await QRCode.toBuffer(url, {
        type: 'png',
        width: qrPxSize,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      const qrImage = await pdfDoc.embedPng(qrPng);

      const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

      const qrX = (pageWidthPt - qrSizePt) / 2;

      if (includeId && font) {
        // Composición vertical centrada: padding superior, QR, gap, texto,
        // padding inferior. Si no entra perfecto, recortamos del padding.
        const totalContentHeight = qrSizePt + gapPt + textSizePt;
        const verticalSlack = pageHeightPt - totalContentHeight - paddingPt * 2;
        const topPadding = paddingPt + Math.max(0, verticalSlack / 2);
        const qrYBottom = pageHeightPt - topPadding - qrSizePt;

        page.drawImage(qrImage, {
          x: qrX,
          y: qrYBottom,
          width: qrSizePt,
          height: qrSizePt,
        });

        const textWidth = font.widthOfTextAtSize(id, textSizePt);
        const textBaseline = qrYBottom - gapPt - textSizePt * 0.78; // ~ascent
        page.drawText(id, {
          x: (pageWidthPt - textWidth) / 2,
          y: Math.max(paddingPt * 0.5, textBaseline),
          size: textSizePt,
          font,
          color: rgb(0, 0, 0),
        });
      } else {
        // Solo QR, centrado vertical y horizontalmente en la etiqueta.
        const qrYBottom = (pageHeightPt - qrSizePt) / 2;
        page.drawImage(qrImage, {
          x: qrX,
          y: qrYBottom,
          width: qrSizePt,
          height: qrSizePt,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();

    const filename = `qr-labels-${formatQrSerieId(startNum)}-a-${formatQrSerieId(startNum + cantidad - 1)}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generando PDF de etiquetas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
