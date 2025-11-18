# Configuración Local y en Vercel - Datos y Credenciales

## 📋 Descripción General

Este documento contiene toda la información necesaria para ejecutar **ULTIMOO** (Sistema de Cotizaciones Grupo Lite) en tu máquina local o en Vercel.

---

## 🔑 Credenciales de Acceso

### Usuarios Pre-cargados

| Email | Contraseña | Rol | Descripción |
|-------|-----------|-----|------------|
| `admin@grupolite.com` | `Admin123!` | Admin | Acceso completo al sistema y panel de administración |
| `usuario@grupolite.com` | `Usuario123!` | Usuario | Acceso estándar para crear y gestionar cotizaciones |
| `ventas@grupolite.com` | `Ventas123!` | Usuario | Acceso de ventas para crear y enviar cotizaciones |

---

## 🗄️ Base de Datos - Estructura y Datos

### Tablas Principales

#### 1. **usuarios**
- Almacena usuarios del sistema con roles (admin/usuario)
- Campos: id, nombre, email, password_hash, rol, activo, timestamps

#### 2. **marcas**
- Marcas de productos disponibles
- Incluidas: Philips, Ledvance, Sylvania, GE Lighting, Osram, Panasonic, LG, Samsung

#### 3. **productos**
- Catálogo de productos de iluminación
- Campos: código, nombre, descripción, marca, precio, categoría, especificaciones, imagen_url, tiempo_entrega
- Ejemplos: LED 100W, Paneles LED, Tubos LED, Downlights, Spots

#### 4. **descuentos_marca**
- Descuentos por cantidad según marca
- Philips/Ledvance: 5% desde 10 unidades
- Sylvania: 7% desde 20 unidades
- GE Lighting: 10% desde 50 unidades

#### 5. **cotizaciones**
- Cotizaciones creadas por usuarios
- Estados: pendiente, aprobado, rechazado
- 5 cotizaciones de ejemplo incluidas

#### 6. **detalles_cotizacion**
- Detalles de cada cotización (productos, cantidades, precios)
- Incluye descuentos y tiempos de entrega

#### 7. **productos_solicitudes**
- Solicitudes de nuevos productos por usuarios

#### 8. **notificaciones_admin**
- Registro de notificaciones del sistema

---

## 🚀 Instalación Local

### Requisitos Previos
- Node.js 18+
- SQL Server / SQL Server Express
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   \`\`\`bash
   git clone <repo-url>
   cd ULTIMOO
   \`\`\`

2. **Instalar dependencias**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configurar Variables de Entorno**
   
   Crear archivo `.env.local`:
   \`\`\`env
   # SQL Server Connection
   SQL_SERVER_HOST=localhost
   SQL_SERVER_DATABASE=ultimoo_db
   SQL_SERVER_USER=sa
   SQL_SERVER_PASSWORD=YourPassword123!
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_min_32_characters_long
   \`\`\`

4. **Crear Base de Datos**
   
   En SQL Server Management Studio:
   \`\`\`sql
   CREATE DATABASE ultimoo_db;
   USE ultimoo_db;
   \`\`\`

5. **Ejecutar Script de Inicialización**
   
   - Ejecutar primero el schema base (si existe)
   - Luego ejecutar `scripts/seed-data-local.sql` con el script de datos

6. **Ejecutar la Aplicación**
   \`\`\`bash
   npm run dev
   \`\`\`
   
   La aplicación estará disponible en: `http://localhost:3000`

---

## ☁️ Deployment en Vercel

### Pasos de Deployment

1. **Conectar Repositorio**
   - Push del código a GitHub
   - Conectar repositorio en Vercel Dashboard

2. **Configurar Variables de Entorno en Vercel**
   
   En Project Settings → Environment Variables:
   \`\`\`
   SQL_SERVER_HOST = <tu-servidor-sql>
   SQL_SERVER_DATABASE = <nombre-bd>
   SQL_SERVER_USER = <usuario-sql>
   SQL_SERVER_PASSWORD = <contraseña-sql>
   JWT_SECRET = <clave-jwt-segura>
   \`\`\`

3. **Base de Datos en la Nube**
   
   Opciones recomendadas:
   - **Azure SQL Database**
   - **Amazon RDS for SQL Server**
   - **Neon (si usas PostgreSQL)**
   - **Supabase (PostgreSQL alternativa)**

4. **Ejecutar Seed Data en Producción**
   
   Conectar a la BD en la nube y ejecutar `scripts/seed-data-local.sql`

5. **Deploy**
   - Vercel automáticamente construye y deploya
   - URL: `https://<proyecto>.vercel.app`

---

## 📊 Datos de Ejemplo Pre-cargados

### Usuarios (3)
- 1 Admin
- 2 Usuarios regulares

### Marcas (8)
- Philips, Ledvance, Sylvania, GE Lighting, Osram, Panasonic, LG, Samsung

### Productos (10)
- Variedad de bombillas LED, paneles LED, tubos LED, downlights y spots
- Precios entre $15.50 y $120.00
- Tiempos de entrega: 1-4 semanas

### Cotizaciones (5)
- Estados variados: 2 aprobadas, 2 pendientes, 1 rechazada
- Diferentes clientes y productos

### Descuentos por Cantidad
- Configurable por marca
- Aplica automáticamente según cantidad de productos

---

## 🧪 Testing Manual

### Flujo de Usuario Estándar

1. **Login**
   - Email: `usuario@grupolite.com`
   - Contraseña: `Usuario123!`

2. **Ver Productos**
   - Dashboard → Productos
   - Debería mostrar 10 productos de ejemplo

3. **Crear Cotización**
   - Dashboard → Nueva Cotización
   - Seleccionar productos de ejemplo
   - Aplicar descuentos según cantidad

4. **Aprobar Cotización (Admin)**
   - Login como admin
   - Dashboard → Administración
   - Aprobar/Rechazar cotizaciones pendientes

---

## 🔒 Seguridad

### Consideraciones Importantes

1. **Contraseñas**
   - NUNCA usar estas contraseñas en producción
   - Cambiar inmediatamente después del deployment
   - Usar contraseñas fuertes y únicas

2. **JWT Secret**
   - Generar una clave aleatoria segura
   - Mínimo 32 caracteres
   - Usar solo en variables de entorno

3. **SQL Server**
   - No exponer credenciales en código
   - Usar connection strings cifradas
   - Configurar firewall apropiadamente

4. **HTTPS**
   - Siempre usar HTTPS en producción
   - Vercel proporciona SSL gratuito

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
- Verificar SQL_SERVER_HOST y puerto
- Confirmar SQL Server está corriendo
- Revisar variables de entorno

### Error: "Invalid login"
- Confirmar usuario existe en BD
- Verificar contraseña en seed script
- Revisar credenciales en .env

### Error: "JWT token invalid"
- Regenerar JWT_SECRET
- Limpiar cookies del navegador
- Hacer logout e login nuevamente

### Productos no cargan
- Ejecutar seed data nuevamente
- Verificar tabla `productos` en BD
- Revisar conexión a base de datos

---

## 📝 Notas Adicionales

- Script `seed-data-local.sql` contiene comentarios SQL con instrucciones
- Las contraseñas mostradas son solo para desarrollo local
- En producción, implementar autenticación más segura (OAuth, 2FA)
- Mantener respaldo de base de datos regularly

---

**Última actualización:** 2024
**Versión:** 1.0
**Sistema:** Grupo Lite - ULTIMOO
