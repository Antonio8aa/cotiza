// Configuración de conexión a SQL Server para el sistema de cotizaciones
import sql from "mssql"

const config: sql.config = {
  server: process.env.SQL_SERVER_HOST || "ALMACEN",
  database: process.env.SQL_SERVER_DATABASE || "GrupoLiteCotizacione",
  user: process.env.SQL_SERVER_USER || "sa",
  password: process.env.SQL_SERVER_PASSWORD || "12345678",
  options: {
    encrypt: process.env.NODE_ENV === "production", // Usar SSL en producción
    trustServerCertificate: true, // Para desarrollo local
    enableArithAbort: true,
    connectionTimeout: 60000,
    requestTimeout: 60000,
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 300000, // 5 minutos
    acquireTimeoutMillis: 30000,
  },
}

let pool: sql.ConnectionPool | null = null
let connecting = false

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool
  }

  if (connecting) {
    while (connecting) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (pool && pool.connected) {
      return pool
    }
  }

  connecting = true
  
  try {
    if (pool) {
      try {
        await pool.close()
      } catch (e) {
        // Ignore
      }
      pool = null
    }

    pool = new sql.ConnectionPool(config)
    
    pool.on("error", (err) => {
      console.error("Pool error:", err)
    })

    await pool.connect()
    connecting = false
    
    return pool
  } catch (error) {
    connecting = false
    pool = null
    console.error("Database connection error:", error)
    throw error
  }
}

// Función helper para ejecutar queries
export async function executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
  const maxRetries = 2
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const connection = await getConnection()
      const request = connection.request()

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          request.input(key, value)
        })
      }

      const result = await request.query(query)
      return result.recordset
    } catch (error: any) {
      lastError = error
      
      if (attempt < maxRetries && (
        error.code === "ECONNCLOSED" || 
        error.code === "ENOTOPEN" ||
        error.code === "ETIMEOUT" ||
        error.message?.includes("Connection")
      )) {
        // Marcar el pool como no conectado para forzar reconexión
        if (pool) {
          pool = null
        }
        await new Promise(resolve => setTimeout(resolve, 500))
        continue
      }
      
      break
    }
  }
  
  throw lastError
}

// Función helper para ejecutar procedimientos almacenados
export async function executeProcedure<T = any>(procedureName: string, params?: Record<string, any>): Promise<T[]> {
  const maxRetries = 2
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const connection = await getConnection()
      const request = connection.request()

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          request.input(key, value)
        })
      }

      const result = await request.execute(procedureName)
      return result.recordset
    } catch (error: any) {
      lastError = error
      
      if (attempt < maxRetries && (
        error.code === "ECONNCLOSED" || 
        error.code === "ENOTOPEN" ||
        error.code === "ETIMEOUT" ||
        error.message?.includes("Connection")
      )) {
        // Marcar el pool como no conectado para forzar reconexión
        if (pool) {
          pool = null
        }
        await new Promise(resolve => setTimeout(resolve, 500))
        continue
      }
      
      break
    }
  }
  
  throw lastError
}

export { sql }
