# Tareas: QR serie e impresión Ribetec

- [x] Añadir `qr-serie.ts` y `qr-print-presets.ts` con Ribetec primero.
- [x] Validar tope máximo en `POST /api/qr/generate` y formato de ID.
- [x] Refactorizar `/admin/qr-generate` (desde/hasta, aviso, preset, dos botones).
- [x] Crear `/admin/qr-print` con generación cliente, CSS mm, auto-print.
- [x] Documentar cambio en OpenSpec (esta carpeta).

## Criterios de aceptación

1. Rango inválido (`hasta < desde`) muestra error y no descarga ni imprime.
2. Con ≥500 códigos válidos se muestra aviso; aún se permite continuar.
3. El selector lista Ribetec RT-420BE antes que genéricas.
4. Tras “Imprimir (vista lista)”, al completarse la generación se abre el diálogo del sistema (máximo un disparo por carga gracias al guard).
5. `npm run build` compila sin errores.
