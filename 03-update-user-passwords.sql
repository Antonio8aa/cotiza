-- Script para actualizar las contraseñas de los usuarios de prueba
-- Contraseña: password123

USE GrupoLiteCotizaciones;
GO

-- Actualizar contraseñas con hash bcrypt (password123)
UPDATE usuarios 
SET password_hash = '$2b$12$LQv3c1yqBwEHFl5yCuHJ2uOzrNIAXs.sUadkqPjGxW/o/C.rFkn5.'
WHERE email IN ('admin@grupolite.com', 'usuario@grupolite.com');

PRINT 'Contraseñas actualizadas. Usuario: password123';
