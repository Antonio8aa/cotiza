-- Script para crear la base de datos y esquema inicial del sistema de cotizaciones Grupo Lite
-- SQL Server

-- Crear base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'GrupoLiteCotizaciones')
BEGIN
    CREATE DATABASE GrupoLiteCotizaciones;
END
GO

USE GrupoLiteCotizaciones;
GO

-- Tabla de usuarios con roles
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    rol NVARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'usuario')),
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE()
);

-- Tabla de marcas de luminarias
CREATE TABLE marcas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL UNIQUE,
    descripcion NVARCHAR(255),
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE()
);

-- Tabla de productos (luminarias)
CREATE TABLE productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo NVARCHAR(50) NOT NULL UNIQUE,
    nombre NVARCHAR(200) NOT NULL,
    descripcion NVARCHAR(500),
    marca_id INT NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    variable_plano NVARCHAR(10), -- Variable para identificar en planos (ej: L1, L2, etc.)
    categoria NVARCHAR(100),
    especificaciones NVARCHAR(MAX), -- JSON con especificaciones técnicas
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (marca_id) REFERENCES marcas(id)
);

-- Tabla de descuentos por marca
CREATE TABLE descuentos_marca (
    id INT IDENTITY(1,1) PRIMARY KEY,
    marca_id INT NOT NULL,
    porcentaje_descuento DECIMAL(5,2) NOT NULL CHECK (porcentaje_descuento >= 0 AND porcentaje_descuento <= 100),
    descripcion NVARCHAR(255),
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (marca_id) REFERENCES marcas(id)
);

-- Tabla de configuración de utilidades (4 porcentajes)
CREATE TABLE configuracion_utilidades (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(50) NOT NULL, -- ej: 'Utilidad Básica', 'Utilidad Premium', etc.
    porcentaje DECIMAL(5,2) NOT NULL CHECK (porcentaje >= 0),
    descripcion NVARCHAR(255),
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE()
);

-- Tabla de formas de pago
CREATE TABLE formas_pago (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(255),
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0, -- Descuento adicional por forma de pago
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE()
);

-- Tabla de cotizaciones
CREATE TABLE cotizaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero_cotizacion NVARCHAR(20) NOT NULL UNIQUE,
    cliente_nombre NVARCHAR(200) NOT NULL,
    cliente_email NVARCHAR(150),
    cliente_telefono NVARCHAR(20),
    cliente_empresa NVARCHAR(200),
    proyecto_nombre NVARCHAR(200),
    usuario_id INT NOT NULL,
    utilidad_id INT NOT NULL,
    forma_pago_id INT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    descuento_total DECIMAL(12,2) DEFAULT 0,
    utilidad_total DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    estado NVARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada', 'aprobada', 'rechazada')),
    observaciones NVARCHAR(MAX),
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE(),
    fecha_posible_venta DATETIME2,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (utilidad_id) REFERENCES configuracion_utilidades(id),
    FOREIGN KEY (forma_pago_id) REFERENCES formas_pago(id)
);

-- Tabla de detalle de cotizaciones
CREATE TABLE detalle_cotizaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cotizacion_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    precio_con_descuento DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    variable_asignada NVARCHAR(10), -- Variable específica asignada en esta cotización
    observaciones NVARCHAR(255),
    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IX_productos_marca_id ON productos(marca_id);
CREATE INDEX IX_productos_codigo ON productos(codigo);
CREATE INDEX IX_cotizaciones_usuario_id ON cotizaciones(usuario_id);
CREATE INDEX IX_cotizaciones_numero ON cotizaciones(numero_cotizacion);
CREATE INDEX IX_detalle_cotizacion_id ON detalle_cotizaciones(cotizacion_id);
CREATE INDEX IX_usuarios_email ON usuarios(email);

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE TRIGGER tr_usuarios_update ON usuarios
AFTER UPDATE AS
BEGIN
    UPDATE usuarios 
    SET fecha_actualizacion = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

CREATE TRIGGER tr_productos_update ON productos
AFTER UPDATE AS
BEGIN
    UPDATE productos 
    SET fecha_actualizacion = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

CREATE TRIGGER tr_cotizaciones_update ON cotizaciones
AFTER UPDATE AS
BEGIN
    UPDATE cotizaciones 
    SET fecha_actualizacion = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO
