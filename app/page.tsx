"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay token y redirigir automáticamente
    const token = document.cookie.includes("auth-token")
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-cyan-600">Grupo Lite</CardTitle>
          <CardDescription>Sistema de Cotizaciones de Luminarias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => router.push("/login")} className="w-full bg-cyan-600 hover:bg-cyan-700">
            Iniciar Sesión
          </Button>
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
            Ir al Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
