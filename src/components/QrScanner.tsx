"use client";

import { useEffect, useRef, useState } from "react";

interface QrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export default function QrScanner({ onScan, onError }: QrScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<import("html5-qrcode").Html5Qrcode | null>(
    null
  );
  const [isStarting, setIsStarting] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!mounted || !scannerRef.current) return;

        const scannerId = "qr-reader";
        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (mounted) {
              onScan(decodedText);
            }
          },
          () => {
            // QR code scan failure — silent, this fires continuously
          }
        );

        if (mounted) {
          setIsStarting(false);
        }
      } catch (err) {
        if (!mounted) return;

        const errorMessage =
          err instanceof Error ? err.message : "Error al iniciar la camara";

        if (
          errorMessage.toLowerCase().includes("permission") ||
          errorMessage.toLowerCase().includes("denied") ||
          errorMessage.toLowerCase().includes("notallowed")
        ) {
          setPermissionDenied(true);
        }

        setIsStarting(false);
        onError?.(errorMessage);
      }
    };

    startScanner();

    return () => {
      mounted = false;
      const scanner = html5QrCodeRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => {
            scanner.clear();
          })
          .catch(() => {
            // Scanner may already be stopped
          });
        html5QrCodeRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-900 p-8 text-center">
        <div className="mb-4 text-4xl">📷</div>
        <h3 className="mb-2 text-lg font-semibold text-red-400">
          Acceso a la camara denegado
        </h3>
        <p className="text-sm text-gray-400">
          Por favor, permite el acceso a la camara en la configuracion de tu
          navegador para escanear codigos QR.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {isStarting && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-900 p-8">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Iniciando camara...</p>
        </div>
      )}
      <div
        id="qr-reader"
        ref={scannerRef}
        className="w-full max-w-sm overflow-hidden rounded-2xl"
      />
    </div>
  );
}
