"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isBefore, startOfDay } from "date-fns";

import { es } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function CalendarComponent() {
  const { data: session } = useSession();
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const currentHour = format(new Date(), "HH");
  const currentMinute = format(new Date(), "mm");
  const defaultStartTime = `${currentHour}:${currentMinute}`;

  const [newEvent, setNewEvent] = useState({
    userId: session?.user.id || "",
    taskName: "Nueva Tarea",
    title: "",
    description: "",
    date: new Date(),
    status: "pendiente",
    startTime: defaultStartTime,
    endTime: "",
  });

  if (!date || isNaN(new Date(date).getTime())) {
    return <div>Fecha no válida</div>;
  }

  const showNotification = (title, description, variant = "default") => {
    toast({
      title,
      description,
      variant,
    });
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const eventToUpdate = events.find((e) => e.id === eventId);
      const {
        id,
        createdAt,
        updatedAt,
        deletedAt,
        userId,
        ...updatedEventWithoutId
      } = {
        ...eventToUpdate,
        status: newStatus,
        date: new Date(eventToUpdate.date).getTime(),
        startTime: eventToUpdate.startTime
          ? new Date(eventToUpdate.startTime).getTime()
          : null,
        endTime: eventToUpdate.endTime
          ? new Date(eventToUpdate.endTime).getTime()
          : null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/task/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: session?.accessToken
              ? `Bearer ${session.accessToken}`
              : "",
          },
          body: JSON.stringify(updatedEventWithoutId),
        },
      );

      if (!response.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? eventToUpdate : e)),
        );
        showNotification(
          "Error",
          "No se pudo actualizar el estado",
          "destructive",
        );
      } else {
        const result = await response.json();
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? result.data : e)),
        );
        showNotification(
          "Éxito",
          "Estado actualizado correctamente",
          "success",
        );
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      showNotification(
        "Error",
        "Ocurrió un problema al actualizar el estado",
        "destructive",
      );
      fetchEvents();
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      showNotification(
        "Error",
        "El título del evento es obligatorio",
        "destructive",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const eventDate = new Date(date);
      eventDate.setHours(0, 0, 0, 0);

      const eventToAdd = {
        userId: session?.user.id,
        taskName: "Nueva Tarea",
        title: newEvent.title,
        description: newEvent.description || "",
        date: eventDate.getTime(),
        status: newEvent.status || "pendiente",
      };

      if (newEvent.startTime) {
        const [hours, minutes] = newEvent.startTime.split(":");
        const startDate = new Date(eventDate);
        startDate.setHours(Number.parseInt(hours), Number.parseInt(minutes));
        eventToAdd.startTime = startDate.getTime();
      }

      if (newEvent.endTime) {
        const [hours, minutes] = newEvent.endTime.split(":");
        const endDate = new Date(eventDate);
        endDate.setHours(Number.parseInt(hours), Number.parseInt(minutes));
        eventToAdd.endTime = endDate.getTime();
      }

      const tempId = `temp-${Date.now()}`;
      const tempEvent = {
        ...eventToAdd,
        id: tempId,
        date: new Date(eventToAdd.date),
        startTime: eventToAdd.startTime ? new Date(eventToAdd.startTime) : null,
        endTime: eventToAdd.endTime ? new Date(eventToAdd.endTime) : null,
      };

      setEvents((prev) => [...prev, tempEvent]);
      setIsOpen(false);

      setNewEvent({
        userId: session?.user.id || "",
        taskName: "Nueva Tarea",
        title: "",
        description: "",
        date: new Date(),
        status: "pendiente",
        startTime: defaultStartTime,
        endTime: "",
      });
      console.log(eventToAdd);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/task`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: session?.accessToken
              ? `Bearer ${session.accessToken}`
              : "",
          },
          body: JSON.stringify(eventToAdd),
        },
      );

      if (response.ok) {
        const result = await response.json();
        const savedEvent = result.data;

        setEvents((prev) => [
          ...prev.filter((e) => e.id !== tempId),
          {
            ...savedEvent,
            date: new Date(savedEvent.date),
            startTime: savedEvent.startTime
              ? new Date(savedEvent.startTime)
              : null,
            endTime: savedEvent.endTime ? new Date(savedEvent.endTime) : null,
          },
        ]);

        showNotification("Éxito", "Evento agregado correctamente", "success");
      } else {
        setEvents((prev) => prev.filter((e) => e.id !== tempId));
        showNotification(
          "Error",
          "No se pudo guardar el evento",
          "destructive",
        );
      }
    } catch (error) {
      console.error("Error al agregar evento:", error);
      showNotification(
        "Error",
        "Ocurrió un problema al agregar el evento",
        "destructive",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !newEvent.title.trim()) {
      showNotification(
        "Error",
        "El título del evento es obligatorio",
        "destructive",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const eventDate = new Date(date);
      eventDate.setHours(0, 0, 0, 0);
      const eventToUpdate = {
        taskName: newEvent.taskName,
        title: newEvent.title,
        description: newEvent.description || "",
        date: eventDate.getTime(),
        status: newEvent.status || "pendiente",
      };
      if (newEvent.startTime) {
        const [hours, minutes] = newEvent.startTime.split(":");
        const startDate = new Date(eventDate);
        startDate.setHours(Number(hours), Number(minutes));
        eventToUpdate.startTime = startDate.getTime();
      }

      if (newEvent.endTime) {
        const [hours, minutes] = newEvent.endTime.split(":");
        const endDate = new Date(eventDate);
        endDate.setHours(Number(hours), Number(minutes));
        eventToUpdate.endTime = endDate.getTime();
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/task/${editingEvent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: session?.accessToken
              ? `Bearer ${session.accessToken}`
              : "",
          },
          body: JSON.stringify(eventToUpdate),
        },
      );
      console.log("oosos", response);

      if (response.ok) {
        const result = await response.json();
        const savedEvent = result.data;

        setEvents((prev) =>
          prev.map((e) =>
            e.id === editingEvent.id
              ? {
                  ...savedEvent,
                  date: new Date(savedEvent.date),
                  startTime: savedEvent.startTime
                    ? new Date(savedEvent.startTime)
                    : null,
                  endTime: savedEvent.endTime
                    ? new Date(savedEvent.endTime)
                    : null,
                }
              : e,
          ),
        );

        setIsOpen(false);
        setEditingEvent(null);
        setNewEvent({
          userId: session?.user.id || "",
          taskName: "Nueva Tarea",
          title: "",
          description: "",
          date: new Date(),
          status: "pendiente",
          startTime: defaultStartTime,
          endTime: "",
        });

        showNotification(
          "Éxito",
          "Evento actualizado correctamente",
          "success",
        );
      } else {
        showNotification(
          "Error",
          "No se pudo actualizar el evento",
          "destructive",
        );
        fetchEvents();
      }
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      showNotification(
        "Error",
        "Ocurrió un problema al actualizar el evento",
        "destructive",
      );
      fetchEvents();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({
      userId: event.userId,
      taskName: event.taskName,
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      status: event.status,
      startTime: event.startTime
        ? format(new Date(event.startTime), "HH:mm")
        : defaultStartTime,
      endTime: event.endTime ? format(new Date(event.endTime), "HH:mm") : "",
    });
    setIsOpen(true);
  };

  const handleDeleteEvent = async (id) => {
    try {
      const eventToDelete = events.find((e) => e.id === id);
      setEvents((prev) => prev.filter((e) => e.id !== id));

      showNotification("Evento eliminado", "El evento ha sido eliminado");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/task/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: session?.accessToken
              ? `Bearer ${session.accessToken}`
              : "",
          },
        },
      );

      if (!response.ok) {
        setEvents((prev) => [...prev, eventToDelete]);
        showNotification(
          "Error",
          "No se pudo eliminar el evento",
          "destructive",
        );
      }
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      showNotification(
        "Error",
        "Ocurrió un problema al eliminar el evento",
        "destructive",
      );
      fetchEvents();
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/task?userId=${session?.user.id}`,
        {
          headers: {
            Authorization: session?.accessToken
              ? `Bearer ${session.accessToken}`
              : "",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.data.map((event) => ({
          ...event,
          date: new Date(event.date),
          startTime: event.startTime ? new Date(event.startTime) : null,
          endTime: event.endTime ? new Date(event.endTime) : null,
        }));
        setEvents(formattedEvents);
      } else {
        showNotification(
          "Error",
          "No se pudieron cargar los eventos",
          "destructive",
        );
        setEvents([]);
      }
    } catch (error) {
      console.error("Error al obtener eventos:", error);
      showNotification(
        "Error",
        "Ocurrió un problema al cargar los eventos",
        "destructive",
      );
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (date && Array.isArray(events)) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      const filtered = events.filter((event) => {
        if (!event.date || isNaN(new Date(event.date).getTime())) return false;

        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);

        return eventDate.getTime() === selectedDate.getTime();
      });

      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  }, [date, events]);

  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session]);

  const isDateDisabled = (date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completado":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "en progreso":
        return "bg-blue-500 hover:bg-blue-600";
      case "pendiente":
      default:
        return "bg-amber-500 hover:bg-amber-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completado":
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case "en progreso":
        return <Clock3 className="h-4 w-4 mr-1" />;
      case "pendiente":
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  };

  const renderDayContent = (day) => {
    const dayEvents = events.filter((event) => {
      if (!event.date || isNaN(new Date(event.date).getTime())) return false;

      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === day.getFullYear() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getDate() === day.getDate()
      );
    });

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {day.getDate()}
        {dayEvents.length > 0 && (
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        )}
      </div>
    );
  };

  const formatTime = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return "--:--";
    return format(new Date(date), "HH:mm");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            Calendario de Eventos
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Organiza tus actividades y mantén un seguimiento de tus tareas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sección del Calendario */}
          <motion.div className="lg:col-span-5">
            <Card className="overflow-hidden border-0 shadow-xl dark:bg-gray-800/60 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-500 text-white">
                <CardTitle className="flex items-center text-xl">
                  <CalendarIcon className="mr-2" />
                  Calendario
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  {format(date, "MMMM yyyy", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={es}
                  className="rounded-md border"
                  disabled={isDateDisabled}
                  components={{
                    DayContent: (props) => renderDayContent(props.date),
                  }}
                  classNames={{
                    day_selected:
                      "bg-emerald-600 text-white hover:bg-emerald-700",
                    day_today: "bg-emerald-100 text-emerald-900 font-bold",
                    day_disabled: "text-gray-400 dark:text-gray-600",
                    day: cn(
                      "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    ),
                  }}
                />

                {/* Resumen de eventos */}
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Resumen del mes
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {events.filter((e) => e.status === "completado").length}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500">
                        Completados
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {
                          events.filter((e) => e.status === "en progreso")
                            .length
                        }
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-500">
                        En progreso
                      </p>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                        {events.filter((e) => e.status === "pendiente").length}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        Pendientes
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Eventos */}
          <motion.div className="lg:col-span-7">
            <Card className="border-0 shadow-xl h-full dark:bg-gray-800/60 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-500 text-white flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    {isToday(date) && (
                      <span className="bg-white text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                        HOY
                      </span>
                    )}
                    Eventos para {format(date, "PPPP", { locale: es })}
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    {filteredEvents.length} evento(s) programado(s)
                  </CardDescription>
                </div>
                <Dialog
                  open={isOpen}
                  onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) {
                      setEditingEvent(null);
                      setNewEvent({
                        userId: session?.user.id || "",
                        taskName: "Nueva Tarea",
                        title: "",
                        description: "",
                        date: new Date(),
                        status: "pendiente",
                        startTime: defaultStartTime,
                        endTime: "",
                      });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white text-emerald-600 hover:bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
                    >
                      <Plus className="mr-2 h-5 w-5" /> Agregar Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-emerald-600 dark:text-emerald-400">
                        {editingEvent
                          ? "Editar Evento"
                          : "Agregar Nuevo Evento"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingEvent
                          ? `Editando evento para el ${format(new Date(editingEvent.date), "PPP", { locale: es })}`
                          : `Ingresa los detalles del evento para el día ${format(date, "PPP", { locale: es })}`}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 gap-2">
                        <Label
                          htmlFor="title"
                          className="text-emerald-700 dark:text-emerald-400"
                        >
                          Título
                        </Label>
                        <Input
                          id="title"
                          placeholder="Título del evento"
                          value={newEvent.title}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                          }
                          className="border-emerald-200 focus:border-emerald-500 dark:border-emerald-800"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Label
                          htmlFor="description"
                          className="text-emerald-700 dark:text-emerald-400"
                        >
                          Descripción
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe el evento"
                          value={newEvent.description}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              description: e.target.value,
                            })
                          }
                          className="border-emerald-200 focus:border-emerald-500 dark:border-emerald-800"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Label
                          htmlFor="status"
                          className="text-emerald-700 dark:text-emerald-400"
                        >
                          Estado
                        </Label>
                        <Select
                          value={newEvent.status}
                          onValueChange={(value) =>
                            setNewEvent({ ...newEvent, status: value })
                          }
                        >
                          <SelectTrigger className="border-emerald-200 focus:border-emerald-500 dark:border-emerald-800">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                Pendiente
                              </div>
                            </SelectItem>
                            <SelectItem value="en progreso">
                              <div className="flex items-center">
                                <Clock3 className="h-4 w-4 mr-2 text-blue-500" />
                                En Progreso
                              </div>
                            </SelectItem>
                            <SelectItem value="completado">
                              <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                                Completado
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 gap-2">
                          <Label
                            htmlFor="startTime"
                            className="text-emerald-700 dark:text-emerald-400"
                          >
                            Hora de Inicio
                          </Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={newEvent.startTime}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                startTime: e.target.value,
                              })
                            }
                            className="border-emerald-200 focus:border-emerald-500 dark:border-emerald-800"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <Label
                            htmlFor="endTime"
                            className="text-emerald-700 dark:text-emerald-400"
                          >
                            Hora de Fin
                          </Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={newEvent.endTime}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                endTime: e.target.value,
                              })
                            }
                            className="border-emerald-200 focus:border-emerald-500 dark:border-emerald-800"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={
                          editingEvent ? handleUpdateEvent : handleAddEvent
                        }
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            {editingEvent ? "Actualizando..." : "Guardando..."}
                          </>
                        ) : (
                          <>
                            {editingEvent
                              ? "Actualizar Evento"
                              : "Guardar Evento"}
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-6 overflow-auto max-h-[500px]">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start space-x-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <AnimatePresence>
                    {filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          className="mb-4 border-l-4 hover:shadow-md transition-all duration-200 hover:translate-x-1 dark:bg-gray-800/60"
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
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                                  {event.title}
                                </h3>
                                {event.description && (
                                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    {event.description}
                                  </p>
                                )}
                                <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatTime(event.startTime)} -{" "}
                                  {formatTime(event.endTime)}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Select
                                  value={event.status}
                                  onValueChange={(value) =>
                                    handleStatusChange(event.id, value)
                                  }
                                >
                                  <SelectTrigger
                                    className={`w-32 ${getStatusColor(event.status)} text-white border-0`}
                                  >
                                    <SelectValue>
                                      <div className="flex items-center">
                                        {getStatusIcon(event.status)}
                                        {event.status.charAt(0).toUpperCase() +
                                          event.status.slice(1)}
                                      </div>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendiente">
                                      <div className="flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                        Pendiente
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="en progreso">
                                      <div className="flex items-center">
                                        <Clock3 className="h-4 w-4 mr-2 text-blue-500" />
                                        En Progreso
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="completado">
                                      <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                                        Completado
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditEvent(event)}
                                  className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CalendarIcon className="h-8 w-8" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay eventos programados para este día
                    </p>
                    <Button
                      onClick={() => setIsOpen(true)}
                      variant="outline"
                      className="mt-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                    >
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
  );
}
