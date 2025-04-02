"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";

export default function CalendarComponent() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    startTime: "",
    endTime: "",
  });

  const handleAddEvent = () => {
    const event = {
      ...newEvent,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents([...events, event]);
    setNewEvent({
      title: "",
      description: "",
      date: new Date(),
      startTime: "",
      endTime: "",
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 text-black dark:text-gray-100 p-4">
      <div className="w-full max-w-6xl dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-gray-600"
              classNames={{
                day_selected:
                  "bg-green-600 text-white hover:bg-green-700 focus:bg-green-700",
                day_today: "bg-gray-700 text-white",
              }}
            />
          </div>
          <div className="lg:w-1/2 p-6 border-t lg:border-t-0 lg:border-l border-gray-700">
            <h2 className="text-3xl font-bold mb-6">
              Eventos para {date?.toLocaleDateString()}
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mb-6 w-full">
                  <Plus className="mr-2 h-5 w-5" /> Agregar Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Evento</DialogTitle>
                  <DialogDescription>
                    Ingresa los detalles del evento aquí. Haz clic en guardar
                    cuando hayas terminado.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Título
                    </Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          description: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start-time" className="text-right">
                      Hora de inicio
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end-time" className="text-right">
                      Hora de fin
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddEvent}>
                    Guardar evento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-4">
              {events
                .filter(
                  (event) => event.date.toDateString() === date?.toDateString(),
                )
                .map((event) => (
                  <div key={event.id} className="bg-gray-700 p-4 rounded-md">
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="text-gray-300">{event.description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
