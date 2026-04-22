# Propuesta: impresión masiva de QR con presets Ribetec

## Resumen

Extender el módulo de administración para generar rangos de códigos `QR-xxx` por **serie desde/hasta**, advertir cuando el volumen es alto (≥500), permitir hasta **5000** códigos por solicitud, elegir **tamaño de etiqueta** (Ribetec RT-420BE por defecto) y **imprimir** desde el navegador con el diálogo del sistema, además del **ZIP** existente.

## Lógica de negocio

- Los IDs siguen siendo el texto embebido en el QR (ej. `QR-001`).
- La descarga ZIP sigue centralizada en el API para mantener un solo formato PNG.
- La impresión masiva genera los QR en el **cliente** para no duplicar carga pesada en el servidor y alinear el aviso de tiempo con la experiencia real del navegador.

## Alcance

- Incluido: presets en mm, vista `/admin/qr-print`, límites alineados API/UI.
- Fuera de alcance: impresión silenciosa sin diálogo del SO, drivers nativos Ribetec.
