-- Agregar columna imagen_url a detalle_cotizaciones
ALTER TABLE detalle_cotizaciones 
ADD imagen_url NVARCHAR(MAX) NULL;

-- Agregar columna imagen_url a productos
ALTER TABLE productos 
ADD imagen_url NVARCHAR(MAX) NULL;

-- Agregar columna imagen_url a productos_solicitudes
ALTER TABLE productos_solicitudes 
ADD imagen_url NVARCHAR(MAX) NULL;

-- Agregar campo ubicacion_entrega y moneda a cotizaciones
ALTER TABLE cotizaciones 
ADD ubicacion_entrega NVARCHAR(255) NULL,
    moneda NVARCHAR(10) DEFAULT 'MXN' CHECK (moneda IN ('MXN', 'USD'));
