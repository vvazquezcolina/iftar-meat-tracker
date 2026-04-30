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
    } = body as {
      cantidad?: number;
      inicio?: number;
      presetId?: string;
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
    const qrSizePt = mmToPt(preset.qrSizeMm);
    const paddingPt = mmToPt(preset.paddingMm);
    const gapPt = mmToPt(1.5);
    const textSizePt = mmToPt(2.8);

    const origin = new URL(request.url).origin;

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(`Etiquetas QR ${formatQrSerieId(startNum)}-${formatQrSerieId(startNum + cantidad - 1)}`);
    pdfDoc.setProducer('iftar-meat-tracker');
    const font = await pdfDoc.embedFont(StandardFonts.Courier);

    // QR PNG a alta resolución para que no pixelee en impresión 203 dpi.
    // ~600 px en un QR de 40 mm ≈ 380 dpi efectivo. Suficiente para térmicas.
    const qrPxSize = Math.max(400, Math.round(preset.qrSizeMm * 15));

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

      // Composición vertical centrada: padding superior, QR, gap, texto,
      // padding inferior. Si no entra perfecto, recortamos del padding.
      const totalContentHeight = qrSizePt + gapPt + textSizePt;
      const verticalSlack = pageHeightPt - totalContentHeight - paddingPt * 2;
      const topPadding = paddingPt + Math.max(0, verticalSlack / 2);

      // pdf-lib origin = bottom-left; convertimos pensando "desde arriba".
      const qrTopFromTop = topPadding;
      const qrYBottom = pageHeightPt - qrTopFromTop - qrSizePt;
      const qrX = (pageWidthPt - qrSizePt) / 2;

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
