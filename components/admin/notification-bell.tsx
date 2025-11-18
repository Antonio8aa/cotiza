"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"

interface Notificacion {
  id: number
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  fecha_creacion: string
}

export function NotificationBell() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [toastNotification, setToastNotification] = useState<Notificacion | null>(null)
  const notificacionesRef = useRef<Notificacion[]>([])

  useEffect(() => {
    loadNotificaciones()
    const interval = setInterval(loadNotificaciones, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toastNotification])

  const loadNotificaciones = async () => {
    try {
      const response = await fetch("/api/admin/notificaciones", {
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        const nuevoCount = data.data.filter((n: Notificacion) => !n.leida).length
        const prevCount = notificacionesRef.current.filter((n) => !n.leida).length
        
        if (nuevoCount > prevCount && nuevoCount > 0) {
          const nuevaNotificacion = data.data.find(
            (n: Notificacion) => !n.leida && !notificacionesRef.current.find((p) => p.id === n.id)
          )
          if (nuevaNotificacion) {
            setToastNotification(nuevaNotificacion)
            playNotificationSound()
          }
        }
        
        notificacionesRef.current = data.data
        setNotificaciones(data.data)
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.error("Error reproduciendo sonido:", error)
    }
  }

  const marcarComoLeida = async (id: number) => {
    try {
      await fetch("/api/admin/notificaciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, accion: "marcar_leida" }),
      })

      setNotificaciones((prev) => prev.map((notif) => (notif.id === id ? { ...notif, leida: true } : notif)))
    } catch (error) {
      console.error("Error marcando notificación:", error)
    }
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  return (
    <>
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
          <Card className="border-primary shadow-lg bg-card p-4 max-w-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground">{toastNotification.titulo}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{toastNotification.mensaje}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToastNotification(null)}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {noLeidas > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {noLeidas}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-64">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Cargando...</div>
            ) : notificaciones.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No hay notificaciones</div>
            ) : (
              notificaciones.slice(0, 10).map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex flex-col items-start p-3 cursor-pointer"
                  onClick={() => !notif.leida && marcarComoLeida(notif.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-sm font-medium ${!notif.leida ? "text-primary" : "text-muted-foreground"}`}>
                      {notif.titulo}
                    </span>
                    {!notif.leida && <div className="h-2 w-2 bg-primary rounded-full" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.mensaje}</p>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.fecha_creacion).toLocaleDateString()}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
