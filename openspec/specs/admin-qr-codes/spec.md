# Especificación: códigos QR (admin)

## Generación y descarga

- El administrador define un rango numérico **desde** / **hasta** (inclusive).
- El sistema genera códigos `QR-NNN` (relleno mínimo de 3 dígitos en la parte numérica cuando aplica) y permite descargar un ZIP de PNG.
- Límite máximo por solicitud: **5000** códigos (ZIP e impresión comparten el mismo tope de rango).

## Impresión

- El administrador elige un **preset de etiqueta** en milímetros; el predeterminado es Ribetec RT-420BE (40×30 mm).
- La vista de impresión genera los QR en el navegador y usa el diálogo de impresión del sistema.

## Avisos

- A partir de **500** códigos en el rango se muestra un aviso informativo sobre tiempo de espera; no bloquea.
