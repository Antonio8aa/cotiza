/**
 * Configuración de Seed Data para Desarrollo
 * 
 * Este archivo contiene referencias a los usuarios, productos y
 * configuraciones pre-cargadas para desarrollo local.
 */

// ===================================================================
// USUARIOS DE EJEMPLO PARA DESARROLLO
// ===================================================================

export const SEED_USERS = {
  admin: {
    email: 'admin@grupolite.com',
    password: 'Admin123!',
    nombre: 'Administrador',
    rol: 'admin',
  },
  usuario: {
    email: 'usuario@grupolite.com',
    password: 'Usuario123!',
    nombre: 'Usuario Regular',
    rol: 'usuario',
  },
  ventas: {
    email: 'ventas@grupolite.com',
    password: 'Ventas123!',
    nombre: 'Equipo de Ventas',
    rol: 'usuario',
  },
}

// ===================================================================
// MARCAS DE EJEMPLO
// ===================================================================

export const SEED_BRANDS = [
  'Philips',
  'Ledvance',
  'Sylvania',
  'GE Lighting',
  'Osram',
  'Panasonic',
  'LG',
  'Samsung',
]

// ===================================================================
// CATEGORÍAS DE PRODUCTOS
// ===================================================================

export const PRODUCT_CATEGORIES = [
  'Bombillas LED',
  'Paneles LED',
  'Tubos LED',
  'Downlights',
  'Spots y Focos',
  'Accesorios',
]

// ===================================================================
// INFORMACIÓN ÚTIL PARA DESARROLLO
// ===================================================================

export const DEVELOPMENT_INFO = {
  localUrl: 'http://localhost:3000',
  productionUrl: 'https://ultimoo.vercel.app',
  databaseType: 'SQL Server',
  apiPrefix: '/api',
  requiredEnvVars: [
    'SQL_SERVER_HOST',
    'SQL_SERVER_DATABASE',
    'SQL_SERVER_USER',
    'SQL_SERVER_PASSWORD',
    'JWT_SECRET',
  ],
  seedDataFile: 'scripts/seed-data-local.sql',
}

// ===================================================================
// VALIDACIÓN DE CONFIGURACIÓN
// ===================================================================

export function validateDevEnvironment(): {
  isValid: boolean
  missingVars: string[]
  warnings: string[]
} {
  const requiredVars = DEVELOPMENT_INFO.requiredEnvVars
  const missingVars: string[] = []
  const warnings: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  // Advertencias
  if (process.env.NODE_ENV === 'production') {
    warnings.push('Asegúrate de cambiar las contraseñas de los usuarios de desarrollo en producción')
    warnings.push('El JWT_SECRET debe ser diferente en cada entorno')
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  }
}

// ===================================================================
// EJEMPLO DE COTIZACIÓN PARA TESTING
// ===================================================================

export const EXAMPLE_QUOTATION = {
  numero_cotizacion: 'COT-TEST-2024',
  cliente_nombre: 'Cliente de Prueba',
  cliente_email: 'test@example.com',
  cliente_telefono: '555-1234',
  estado: 'pendiente',
  items: [
    {
      producto: 'PH-LED-100W',
      cantidad: 10,
      precio_unitario: 45.50,
      descuento_porcentaje: 5,
    },
    {
      producto: 'PH-PANEL-24W',
      cantidad: 5,
      precio_unitario: 85.00,
      descuento_porcentaje: 0,
    },
  ],
}

export default {
  SEED_USERS,
  SEED_BRANDS,
  PRODUCT_CATEGORIES,
  DEVELOPMENT_INFO,
  EXAMPLE_QUOTATION,
  validateDevEnvironment,
}
