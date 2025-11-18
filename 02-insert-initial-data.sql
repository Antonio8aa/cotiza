-- Script para insertar datos iniciales del sistema de cotizaciones Grupo Lite

USE GrupoLiteCotizaciones;
GO

SELECT*FROM usuarios

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES 
('Administrador', 'admin@grupolite.com', '$2b$10$example_hash_here', 'admin'),
('Usuario Demo', 'usuario@grupolite.com', '$2b$10$example_hash_here', 'usuario');

-- Insertar marcas de luminarias
INSERT INTO marcas (nombre, descripcion) VALUES 
('Philips', 'Luminarias Philips - Calidad premium'),
('Osram', 'Luminarias Osram - Tecnología alemana'),
('GE Lighting', 'General Electric - Soluciones de iluminación'),
('Cree', 'Cree LED - Tecnología LED avanzada'),
('Lithonia', 'Lithonia Lighting - Iluminación comercial'),
('Cooper', 'Cooper Lighting - Soluciones profesionales');

-- Insertar descuentos por marca
INSERT INTO descuentos_marca (marca_id, porcentaje_descuento, descripcion) VALUES 
(1, 15.00, 'Descuento estándar Philips'),
(2, 12.00, 'Descuento estándar Osram'),
(3, 10.00, 'Descuento estándar GE'),
(4, 18.00, 'Descuento estándar Cree'),
(5, 8.00, 'Descuento estándar Lithonia'),
(6, 14.00, 'Descuento estándar Cooper');

-- Insertar configuración de utilidades (4 niveles)
INSERT INTO configuracion_utilidades (nombre, porcentaje, descripcion) VALUES 
('Utilidad Básica', 25.00, 'Margen de utilidad básico para proyectos estándar'),
('Utilidad Estándar', 35.00, 'Margen de utilidad estándar para proyectos comerciales'),
('Utilidad Premium', 45.00, 'Margen de utilidad premium para proyectos especiales'),
('Utilidad VIP', 60.00, 'Margen de utilidad máximo para clientes VIP');

-- Insertar formas de pago
INSERT INTO formas_pago (nombre, descripcion, descuento_porcentaje) VALUES 
('Contado', 'Pago de contado al entregar', 5.00),
('30 días', 'Pago a 30 días', 0.00),
('60 días', 'Pago a 60 días', 0.00),
('90 días', 'Pago a 90 días', 0.00),
('Transferencia', 'Pago por transferencia bancaria', 3.00);

-- Insertar productos de ejemplo
INSERT INTO productos (codigo, nombre, descripcion, marca_id, precio_base, variable_plano, categoria, especificaciones) VALUES 
('PH-LED-001', 'Panel LED 60x60 40W', 'Panel LED empotrable 60x60cm, 40W, 4000K', 1, 1250.00, 'P1', 'Paneles LED', '{"potencia": "40W", "temperatura": "4000K", "flujo": "4000lm"}'),
('OS-TUB-002', 'Tubo LED T8 18W', 'Tubo LED T8 1.2m, 18W, luz fría', 2, 180.00, 'T1', 'Tubos LED', '{"potencia": "18W", "longitud": "1.2m", "temperatura": "6500K"}'),
('GE-DOWN-003', 'Downlight LED 15W', 'Downlight empotrable LED 15W, regulable', 3, 320.00, 'D1', 'Downlights', '{"potencia": "15W", "regulable": true, "corte": "150mm"}'),
('CR-HIGH-004', 'Campana LED 150W', 'Campana LED industrial 150W, IP65', 4, 2800.00, 'C1', 'Industriales', '{"potencia": "150W", "ip": "IP65", "flujo": "18000lm"}'),
('LI-TROV-005', 'Troffer LED 2x4 50W', 'Troffer LED 2x4 pies, 50W, superficie', 5, 1850.00, 'TR1', 'Comerciales', '{"potencia": "50W", "dimensiones": "2x4ft", "montaje": "superficie"}'),
('CO-WALL-006', 'Wall Pack LED 30W', 'Luminaria de pared LED 30W, exterior', 6, 950.00, 'W1', 'Exteriores', '{"potencia": "30W", "ip": "IP65", "sensor": "opcional"}');

INSERT INTO cotizaciones (
    numero_cotizacion,
    cliente_nombre,
    cliente_email,
    cliente_telefono,
    cliente_empresa,
    proyecto_nombre,
    usuario_id,
    utilidad_id,
    forma_pago_id,
    subtotal,
    descuento_total,
    utilidad_total,
    total,
    estado,
    observaciones,
    fecha_posible_venta
)
VALUES (
    'COT-2025-001',                 -- numero_cotizacion (debe ser único)
    'Juan Pérez',                   -- cliente_nombre
    'juan.perez@example.com',       -- cliente_email
    '8112345678',                   -- cliente_telefono
    'Empresa Ejemplo S.A. de C.V.', -- cliente_empresa
    'Proyecto de Automatización',   -- proyecto_nombre
    1,                              -- usuario_id (debe existir en la tabla usuarios)
    1,                              -- utilidad_id (debe existir en configuracion_utilidades)
    1,                              -- forma_pago_id (debe existir en formas_pago)
    15000.00,                       -- subtotal
    500.00,                         -- descuento_total
    3000.00,                        -- utilidad_total
    17500.00,                       -- total
    'borrador',                     -- estado (borrador, enviada, aprobada, rechazada)
    'Primera cotización para el cliente.', -- observaciones
    '2025-09-15 10:00:00'           -- fecha_posible_venta
);


PRINT 'Datos iniciales insertados correctamente';
