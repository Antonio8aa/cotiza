-- Agregar campo tiempo_entrega a productos existentes
ALTER TABLE productos 
ADD tiempo_entrega NVARCHAR(100) NULL;

-- Crear tabla para solicitudes de productos
CREATE TABLE productos_solicitudes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo NVARCHAR(50) NOT NULL,
    nombre NVARCHAR(200) NOT NULL,
    descripcion NVARCHAR(MAX) NULL,
    marca_id INT NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    categoria NVARCHAR(100) NULL,
    tiempo_entrega NVARCHAR(100) NULL,
    usuario_solicitante_id INT NOT NULL,
    estado NVARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    fecha_solicitud DATETIME2 DEFAULT GETDATE(),
    fecha_respuesta DATETIME2 NULL,
    admin_respuesta_id INT NULL,
    comentarios_admin NVARCHAR(MAX) NULL,
    FOREIGN KEY (marca_id) REFERENCES marcas(id),
    FOREIGN KEY (usuario_solicitante_id) REFERENCES usuarios(id),
    FOREIGN KEY (admin_respuesta_id) REFERENCES usuarios(id)
);

-- Crear tabla para notificaciones de administradores
CREATE TABLE notificaciones_admin (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo NVARCHAR(50) NOT NULL,
    titulo NVARCHAR(200) NOT NULL,
    mensaje NVARCHAR(MAX) NOT NULL,
    datos_adicionales NVARCHAR(MAX) NULL,
    leida BIT DEFAULT 0,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_lectura DATETIME2 NULL
);

-- Agregar campo tiempo_entrega a detalles de cotización
ALTER TABLE detalles_cotizacion 
ADD tiempo_entrega NVARCHAR(100) NULL;

-- Insertar datos de ejemplo para tiempo de entrega en productos existentes
UPDATE productos 
SET tiempo_entrega = '2-3 semanas' 
WHERE tiempo_entrega IS NULL AND activo = 1;
