"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, Plus, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useSession } from "next-auth/react"

export default function CalendarComponent() {
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession();
  const [newEvent, setNewEvent] = useState({
    userId: 1,
    taskName: "Nuevo Task",
    title: "",
    description: "",
    date: new Date().toISOString(),
    status: "pendiente",
    startTime: "",
    endTime: "",
  })


  const handleAddEvent = async () => {
    try {

      const eventToAdd = {
        ...newEvent,
        date: date ? date.toISOString() : new Date().toISOString(),
      }
 console.log (session.user)

      const tempId = Date.now()
      const tempEvent = { ...eventToAdd, id: tempId }
      setEvents([...events, tempEvent])


      setIsOpen(false)

      setNewEvent({
        userId: 1,
        taskName: "Nuevo Task",
        title: "",
        description: "",
        date: date ? date.toISOString() : new Date().toISOString(),
        status: "pendiente",
        startTime: "",
        endTime: "",
      })


      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventToAdd),
      })

      if (response.ok) {
        const savedEvent = await response.json()

        setEvents((prev) => prev.map((e) => (e.id === tempId ? savedEvent : e)))
      } else {

        setEvents((prev) => prev.filter((e) => e.id !== tempId))
        console.error("Error al guardar el evento")
      }
    } catch (error) {
      console.error("Error al agregar evento:", error)
    }
  }

  const handleDeleteEvent = async (id) => {
    try {

      setEvents((prev) => prev.filter((e) => e.id !== id))


      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/task/${id}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error al eliminar evento:", error)

      fetchEvents()
    }
  }


  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/task`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Error al obtener eventos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar eventos por fecha seleccionada
  useEffect(() => {
    if (date && events.length > 0) {
      const selectedDate = new Date(date)
      selectedDate.setHours(0, 0, 0, 0)

      const filtered = events.filter((event) => {
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate.getTime() === selectedDate.getTime()
      })

      setFilteredEvents(filtered)
    } else {
      setFilteredEvents([])
    }
  }, [date, events])

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEvents()
  }, [])

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completado":
        return "bg-green-500"
      case "en progreso":
        return "bg-blue-500"
      case "pendiente":
      default:
        return "bg-yellow-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">Calendario de Eventos</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Organiza tus actividades y mantén un seguimiento de tus tareas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendario */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="bg-green-600 text-white">
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2" />
                  Calendario
                </CardTitle>
                <CardDescription className="text-green-100">
                  Selecciona una fecha para ver o agregar eventos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={es}
                  className="rounded-md border"
                  classNames={{
                    day_selected: "bg-green-600 text-white hover:bg-green-700",
                    day_today: "bg-green-100 text-green-900",
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de eventos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-7"
          >
            <Card className="border-0 shadow-xl h-full">
              <CardHeader className="bg-green-600 text-white flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Eventos para {date ? format(date, "PPPP", { locale: es }) : ""}</CardTitle>
                  <CardDescription className="text-green-100">
                    {filteredEvents.length} evento(s) programado(s)
                  </CardDescription>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="bg-white text-green-600 hover:bg-green-50">
                      <Plus className="mr-2 h-5 w-5" /> Agregar Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-green-600 dark:text-green-400">
                        Agregar Nuevo Evento
                      </DialogTitle>
                      <DialogDescription>
                        Ingresa los detalles del evento para el día {date ? format(date, "PPP", { locale: es }) : ""}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                          id="title"
                          placeholder="Título del evento"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe el evento"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select
                          value={newEvent.status}
                          onValueChange={(value) => setNewEvent({ ...newEvent, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="en progreso">En Progreso</SelectItem>
                            <SelectItem value="completado">Completado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="startTime">Hora de Inicio</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={newEvent.startTime}
                            onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="endTime">Hora de Fin</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={newEvent.endTime}
                            onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddEvent} className="bg-green-600 hover:bg-green-700">
                        Guardar Evento
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-6 overflow-auto max-h-[500px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <AnimatePresence>
                    {filteredEvents.map((event, index) => (
                      <motion.div
                        key={event.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card
                          className="mb-4 border-l-4 hover:shadow-md transition-shadow"
                          style={{
                            borderLeftColor:
                              event.status === "completado"
                                ? "#10B981"
                                : event.status === "en progreso"
                                  ? "#3B82F6"
                                  : "#F59E0B",
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{event.title}</h3>
                                {event.description && (
                                  <p className="text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                                )}
                                <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {event.startTime} - {event.endTime}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(event.status)}>
                                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => event.id && handleDeleteEvent(event.id)}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No hay eventos programados para este día</p>
                    <Button onClick={() => setIsOpen(true)} variant="outline" className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar el primer evento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

