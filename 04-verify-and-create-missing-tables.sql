-- Verificar y crear tablas faltantes para cotizaciones

-- Verificar si existe la tabla configuracion_utilidades
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='configuracion_utilidades' AND xtype='U')
BEGIN
    CREATE TABLE configuracion_utilidades (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        porcentaje DECIMAL(5,2) NOT NULL,
        descripcion NVARCHAR(255),
        activo BIT DEFAULT 1,
        fecha_creacion DATETIME DEFAULT GETDATE()
    );
    
    -- Insertar datos iniciales
    INSERT INTO configuracion_utilidades (nombre, porcentaje, descripcion) VALUES
    ('Utilidad Básica', 15.00, 'Utilidad estándar para productos básicos'),
    ('Utilidad Estándar', 35.00, 'Utilidad estándar para la mayoría de productos'),
    ('Utilidad Premium', 50.00, 'Utilidad para productos premium'),
    ('Utilidad Especial', 75.00, 'Utilidad para productos especiales o personalizados');
    
    PRINT 'Tabla configuracion_utilidades creada e inicializada';
END
ELSE
BEGIN
    PRINT 'Tabla configuracion_utilidades ya existe';
END

-- Verificar si existe la tabla formas_pago
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='formas_pago' AND xtype='U')
BEGIN
    CREATE TABLE formas_pago (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
        descripcion NVARCHAR(255),
        activo BIT DEFAULT 1,
        fecha_creacion DATETIME DEFAULT GETDATE()
    );
    
    -- Insertar datos iniciales
    INSERT INTO formas_pago (nombre, descuento_porcentaje, descripcion) VALUES
    ('Contado', 5.00, 'Pago inmediato en efectivo o transferencia'),
    ('Crédito 30 días', 0.00, 'Pago a 30 días'),
    ('Crédito 60 días', -2.00, 'Pago a 60 días con recargo'),
    ('Tarjeta de Crédito', 0.00, 'Pago con tarjeta de crédito');
    
    PRINT 'Tabla formas_pago creada e inicializada';
END
ELSE
BEGIN
    PRINT 'Tabla formas_pago ya existe';
END

-- Verificar datos existentes
SELECT 'configuracion_utilidades' as tabla, COUNT(*) as registros FROM configuracion_utilidades;
SELECT 'formas_pago' as tabla, COUNT(*) as registros FROM formas_pago;

-- Mostrar datos para verificación
SELECT * FROM configuracion_utilidades WHERE activo = 1;
SELECT * FROM formas_pago WHERE activo = 1;
