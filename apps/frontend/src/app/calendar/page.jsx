"use client";

import { useState, useEffect, useCallback } from "react";
import { format, isToday, isBefore, startOfDay, addHours } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import {
  CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Registrar el locale español para DatePicker
registerLocale("es", es);

export default function CalendarComponent() {
  const { data: session } = useSession();
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const currentHour = format(new Date(), "HH");
  const currentMinute = format(new Date(), "mm");

  const [newEvent, setNewEvent] = useState({
    userId: session?.user?.id || "",
    taskName: "Nueva Tarea",
    title: "",
    description: "",
    date: new Date(),
    status: "pendiente",
    startDate: new Date(),
    endDate: addHours(new Date(), 1),
  });

  const showNotification = useCallback(
    (title, description, variant = "default") => {
      toast({
        title,
        description,
        variant,
      });
    },
    [],
  );

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

      // Usar la fecha seleccionada en el calendario para la fecha base
      const eventDate = new Date(date);
      eventDate.setHours(0, 0, 0, 0);

      const eventToAdd = {
        userId: session?.user.id,
        taskName: "Nueva Tarea",
        title: newEvent.title,
        description: newEvent.description || "",
        date: eventDate.getTime(),
        status: newEvent.status || "pendiente",
        startTime: newEvent.startDate.getTime(),
        endTime: newEvent.endDate.getTime(),
      };

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
        startDate: new Date(),
        endDate: addHours(new Date(), 1),
      });

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
        startTime: newEvent.startDate.getTime(),
        endTime: newEvent.endDate.getTime(),
      };

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
          startDate: new Date(),
          endDate: addHours(new Date(), 1),
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

    // Extraer fecha y hora del startTime y endTime
    const startDate = event.startTime
      ? new Date(event.startTime)
      : new Date(event.date);
    const endDate = event.endTime
      ? new Date(event.endTime)
      : addHours(new Date(event.date), 1);

    setNewEvent({
      userId: event.userId,
      taskName: event.taskName,
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      status: event.status,
      startDate: startDate,
      endDate: endDate,
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

  const fetchEvents = useCallback(async () => {
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
  }, [session?.user?.id, session?.accessToken, showNotification]);

  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session, fetchEvents]);

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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completado":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "en progreso":
        return "bg-green-500 hover:bg-green-600";
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

  const formatTime = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return "--:--";
    return format(new Date(date), "HH:mm");
  };

  // Función para navegar al mes anterior
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  // Función para navegar al mes siguiente
  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Función para renderizar los días del calendario
  const getDayEvents = (day) => {
    return events.filter((event) => {
      if (!event.date || isNaN(new Date(event.date).getTime())) return false;

      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === day.getFullYear() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getDate() === day.getDate()
      );
    });
  };

  // Modificar la función isPastDay para que solo considere días pasados si todos los eventos están completados
  const isPastDay = (day) => {
    // Si es un día anterior a hoy, verificamos si todos los eventos están completados
    if (isBefore(day, startOfDay(new Date())) && !isToday(day)) {
      const dayEvents = getDayEvents(day);

      // Si no hay eventos, no lo marcamos como pasado
      if (dayEvents.length === 0) return false;

      // Solo marcamos como pasado si TODOS los eventos están completados
      return dayEvents.every((event) => event.status === "completado");
    }
    return false;
  };

  // Actualizar la función renderCalendarDays para mostrar correctamente los días
  const renderDayContent = (day) => {
    const dayEvents = getDayEvents(day);
    const isPast = isPastDay(day);
    const hasInProgressEvent = dayEvents.some(
      (event) => event.status === "en progreso",
    );

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className={isPast ? "text-gray-400 line-through" : ""}>
          {day.getDate()}
        </span>
        {dayEvents.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5">
            {dayEvents.map((event, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  event.status === "completado"
                    ? "bg-emerald-500"
                    : event.status === "en progreso"
                      ? "bg-green-500"
                      : "bg-amber-500"
                }`}
              ></span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Actualizar la función renderCalendarDays para aplicar el estilo correcto
  const renderCalendarDays = () => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    ).getDay();
    const daysFromPrevMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Ajuste para que la semana comience en lunes (0 = domingo)

    const days = [];

    // Días del mes anterior
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const daysInPrevMonth = new Date(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
      0,
    ).getDate();

    for (
      let i = daysInPrevMonth - daysFromPrevMonth + 1;
      i <= daysInPrevMonth;
      i++
    ) {
      const dayDate = new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth(),
        i,
      );
      days.push({ day: i, date: dayDate, isCurrentMonth: false });
    }

    // Modificar la parte donde se renderizan los días
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        i,
      );
      const dayEvents = getDayEvents(dayDate);
      const allEventsCompleted =
        dayEvents.length > 0 &&
        dayEvents.every((event) => event.status === "completado");

      days.push({
        day: i,
        date: dayDate,
        isCurrentMonth: true,
        allEventsCompleted: allEventsCompleted,
      });
    }

    // Días del mes siguiente para completar la última semana
    const totalDaysDisplayed =
      Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;
    const daysFromNextMonth =
      totalDaysDisplayed - (daysFromPrevMonth + daysInMonth);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    for (let i = 1; i <= daysFromNextMonth; i++) {
      const dayDate = new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        i,
      );
      days.push({ day: i, date: dayDate, isCurrentMonth: false });
    }

    return days;
  };

  // Función para verificar si un día tiene eventos en progreso
  const hasInProgressEvents = (day) => {
    const dayEvents = getDayEvents(day);
    return dayEvents.some((event) => event.status === "en progreso");
  };

  // Función para verificar si un día es el seleccionado
  const isSelectedDay = (day) => {
    return (
      day.getFullYear() === date.getFullYear() &&
      day.getMonth() === date.getMonth() &&
      day.getDate() === date.getDate()
    );
  };

  // Función para verificar si un día es hoy
  const isDayToday = (day) => {
    return isToday(day);
  };

  // Función para manejar el clic en un día
  const handleDayClick = (day) => {
    setDate(day);
  };

  // Personalización de DatePicker
  const CustomDatePickerInput = ({ value, onClick, label }) => (
    <div className="relative">
      <Button
        type="button"
        onClick={onClick}
        variant="outline"
        className="w-full justify-start text-left font-normal bg-gray-900 border-gray-700 hover:bg-gray-800 text-white"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-emerald-400 mb-2">
            Calendario de Eventos
          </h1>
          <p className="text-gray-300">
            Organiza tus actividades y mantén un seguimiento de tus tareas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sección del Calendario */}
          <motion.div className="lg:col-span-5">
            <Card className="overflow-hidden border-0 shadow-xl bg-gray-800/60 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-500 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <CalendarIcon className="mr-2" />
                    Calendario
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToPreviousMonth}
                      className="text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="text-lg font-medium">
                      {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToNextMonth}
                      className="text-white hover:bg-white/20"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Calendario personalizado */}
                <div className="mb-6">
                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 mb-2 text-center">
                    {["lu", "ma", "mi", "ju", "vi", "sá", "do"].map(
                      (day, index) => (
                        <div
                          key={index}
                          className="text-sm font-medium text-emerald-400 py-2"
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>

                  {/* Días del mes */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarDays().map((dayInfo, index) => {
                      const dayEvents = getDayEvents(dayInfo.date);
                      const hasInProgress = hasInProgressEvents(dayInfo.date);
                      const isSelected = isSelectedDay(dayInfo.date);
                      const isToday = isDayToday(dayInfo.date);
                      const allEventsCompleted = dayInfo.allEventsCompleted;

                      return (
                        <button
                          key={index}
                          onClick={() => handleDayClick(dayInfo.date)}
                          className={cn(
                            "h-10 w-full rounded-md flex flex-col items-center justify-center relative",
                            !dayInfo.isCurrentMonth && "text-gray-500",
                            dayInfo.isCurrentMonth &&
                              allEventsCompleted &&
                              "text-gray-500 line-through",
                            dayInfo.isCurrentMonth &&
                              !allEventsCompleted &&
                              !isSelected &&
                              !isToday &&
                              !hasInProgress &&
                              "text-white",
                            isSelected && "bg-emerald-600 text-white",
                            isToday &&
                              !isSelected &&
                              "bg-emerald-900/30 text-emerald-300 font-bold",
                            hasInProgress &&
                              !isSelected &&
                              "bg-green-900/30 text-green-300",
                            "hover:bg-gray-700 transition-colors",
                          )}
                        >
                          <span className="text-sm">{dayInfo.day}</span>

                          {/* Indicadores de eventos */}
                          {dayEvents.length > 0 && (
                            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                              {dayEvents.length <= 3 ? (
                                dayEvents.map((event, i) => (
                                  <span
                                    key={i}
                                    className={cn(
                                      "h-1 w-1 rounded-full",
                                      event.status === "completado"
                                        ? "bg-emerald-500"
                                        : event.status === "en progreso"
                                          ? "bg-green-500"
                                          : "bg-amber-500",
                                    )}
                                  ></span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">
                                  {dayEvents.length}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resumen de eventos */}
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium text-emerald-400 flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Resumen del mes
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-emerald-900/30 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-400">
                        {events.filter((e) => e.status === "completado").length}
                      </p>
                      <p className="text-xs text-emerald-500">Completados</p>
                    </div>
                    <div className="bg-green-900/30 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-green-400">
                        {
                          events.filter((e) => e.status === "en progreso")
                            .length
                        }
                      </p>
                      <p className="text-xs text-green-500">En progreso</p>
                    </div>
                    <div className="bg-amber-900/30 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-amber-400">
                        {events.filter((e) => e.status === "pendiente").length}
                      </p>
                      <p className="text-xs text-amber-500">Pendientes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Eventos */}
          <motion.div className="lg:col-span-7">
            <Card className="border-0 shadow-xl h-full bg-gray-800/60 backdrop-blur-sm">
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
                        startDate: new Date(),
                        endDate: addHours(new Date(), 1),
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
                  <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-emerald-400">
                        {editingEvent
                          ? "Editar Evento"
                          : "Agregar Nuevo Evento"}
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        {editingEvent
                          ? `Editando evento para el ${format(new Date(editingEvent.date), "PPP", { locale: es })}`
                          : `Ingresa los detalles del evento para el día ${format(date, "PPP", { locale: es })}`}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="title" className="text-emerald-400">
                          Título
                        </Label>
                        <Input
                          id="title"
                          placeholder="Título del evento"
                          value={newEvent.title}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                          }
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Label
                          htmlFor="description"
                          className="text-emerald-400"
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
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="status" className="text-emerald-400">
                          Estado
                        </Label>
                        <Select
                          value={newEvent.status}
                          onValueChange={(value) =>
                            setNewEvent({ ...newEvent, status: value })
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="pendiente">
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                Pendiente
                              </div>
                            </SelectItem>
                            <SelectItem value="en progreso">
                              <div className="flex items-center">
                                <Clock3 className="h-4 w-4 mr-2 text-green-500" />
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

                      {/* Fecha y hora de inicio */}
                      <div className="grid grid-cols-1 gap-2">
                        <Label className="text-emerald-400">
                          Fecha y hora de inicio
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          <DatePicker
                            selected={newEvent.startDate}
                            onChange={(date) =>
                              setNewEvent({ ...newEvent, startDate: date })
                            }
                            locale="es"
                            dateFormat="dd 'de' MMMM 'de' yyyy"
                            customInput={<CustomDatePickerInput />}
                            calendarClassName="bg-gray-800 border border-gray-700 text-white shadow-lg rounded-md"
                            dayClassName={(date) =>
                              cn(
                                "rounded hover:bg-gray-700",
                                isToday(date) &&
                                  "bg-emerald-900/30 text-emerald-300",
                                isPastDay(date) && "text-gray-500",
                              )
                            }
                          />
                          <DatePicker
                            selected={newEvent.startDate}
                            onChange={(date) =>
                              setNewEvent({ ...newEvent, startDate: date })
                            }
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Hora"
                            dateFormat="HH:mm"
                            locale="es"
                            customInput={<CustomDatePickerInput />}
                            calendarClassName="bg-gray-800 border border-gray-700 text-white shadow-lg rounded-md"
                          />
                        </div>
                      </div>

                      {/* Fecha y hora de fin */}
                      <div className="grid grid-cols-1 gap-2">
                        <Label className="text-emerald-400">
                          Fecha y hora de fin
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          <DatePicker
                            selected={newEvent.endDate}
                            onChange={(date) =>
                              setNewEvent({ ...newEvent, endDate: date })
                            }
                            locale="es"
                            dateFormat="dd 'de' MMMM 'de' yyyy"
                            customInput={<CustomDatePickerInput />}
                            calendarClassName="bg-gray-800 border border-gray-700 text-white shadow-lg rounded-md"
                            dayClassName={(date) =>
                              cn(
                                "rounded hover:bg-gray-700",
                                isToday(date) &&
                                  "bg-emerald-900/30 text-emerald-300",
                                isPastDay(date) && "text-gray-500",
                              )
                            }
                          />
                          <DatePicker
                            selected={newEvent.endDate}
                            onChange={(date) =>
                              setNewEvent({ ...newEvent, endDate: date })
                            }
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Hora"
                            dateFormat="HH:mm"
                            locale="es"
                            customInput={<CustomDatePickerInput />}
                            calendarClassName="bg-gray-800 border border-gray-700 text-white shadow-lg rounded-md"
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
                        <Skeleton className="h-12 w-12 rounded-md bg-gray-700" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4 bg-gray-700" />
                          <Skeleton className="h-4 w-1/2 bg-gray-700" />
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
                          className="mb-4 border-l-4 hover:shadow-md transition-all duration-200 hover:translate-x-1 bg-gray-800/60"
                          style={{
                            borderLeftColor:
                              event.status === "completado"
                                ? "#10B981"
                                : event.status === "en progreso"
                                  ? "#22C55E"
                                  : "#F59E0B",
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-white">
                                  {event.title}
                                </h3>
                                {event.description && (
                                  <p className="text-gray-300 mt-1">
                                    {event.description}
                                  </p>
                                )}
                                <div className="flex items-center mt-2 text-sm text-gray-400">
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
                                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                    <SelectItem value="pendiente">
                                      <div className="flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                        Pendiente
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="en progreso">
                                      <div className="flex items-center">
                                        <Clock3 className="h-4 w-4 mr-2 text-green-500" />
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
                                  className="text-gray-400 hover:text-blue-400"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-gray-400 hover:text-red-400"
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-900/30 text-emerald-400 mb-4">
                      <CalendarIcon className="h-8 w-8" />
                    </div>
                    <p className="text-gray-400">
                      No hay eventos programados para este día
                    </p>
                    <Button
                      onClick={() => setIsOpen(true)}
                      variant="outline"
                      className="mt-4 border-emerald-800 text-emerald-400 hover:bg-emerald-900/50"
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
