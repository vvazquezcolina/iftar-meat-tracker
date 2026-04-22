# Delta de especificación: códigos QR en admin

## ADDED

### Generación por serie

- **GIVEN** un administrador autenticado en `/admin/qr-generate`
- **WHEN** indica serie **desde** y **hasta** válidas (hasta ≥ desde, cantidad ≤ 5000)
- **THEN** puede descargar un ZIP con un PNG por código en el rango
- **AND** puede abrir la vista de impresión con el preset de etiqueta seleccionado

### Aviso de volumen

- **GIVEN** un rango cuyo tamaño es ≥ 500
- **WHEN** el usuario ve el formulario
- **THEN** se muestra un aviso de posible lentitud sin bloquear las acciones

### Presets de etiqueta

- **GIVEN** el selector de tamaño de etiqueta
- **WHEN** carga la página
- **THEN** la opción por defecto corresponde a Ribetec RT-420BE (40×30 mm)
- **AND** existen otras opciones de respaldo (Ribetec 50×30 y genéricas)

### Impresión desde el navegador

- **GIVEN** la vista `/admin/qr-print` con parámetros válidos
- **WHEN** termina la generación de imágenes en el cliente
- **THEN** se invoca el flujo de impresión del sistema al menos una vez
- **AND** el usuario puede volver a imprimir con un botón explícito
