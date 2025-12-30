"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  createFixedReserve,
  updateFixedReserve,
  FixedReserve,
} from "@/services/fixed-reserve/fixed-reserve";
import { createUser } from "@/services/user/user";
import { searchUsers } from "@/services/user/user"; // Assuming this exists or I'll create it
import { User } from "@/services/user/user";
import { Loader2, UserPlus, Search } from "lucide-react";
import { Complex } from "@/services/complex/complex";
import { SportType } from "@/services/sport-types/sport-types";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { useApplicablePromotions } from "@/hooks/useApplicablePromotions";

interface CreateFixedReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  complex: Complex;
  initialData: {
    courtId: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number; // 0-6
    sportType: SportType;
  } | null;
  editingReserve?: FixedReserve | null;
}

const DAYS = [
  { id: 0, label: "Domingo" },
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
];

export const CreateFixedReserveModal = ({
  isOpen,
  onClose,
  onSuccess,
  complex,
  initialData,
  editingReserve,
}: CreateFixedReserveModalProps) => {
  const { toast } = useToast();
  const { state } = useReservationDashboard();

  // Calculate next occurrence date for promotion check
  const nextOccurrenceDate = initialData ? (() => {
    const today = new Date();
    const targetDay = initialData.dayOfWeek;
    const diff = (targetDay - today.getDay() + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (diff === 0 ? 0 : diff));
    return targetDate;
  })() : undefined;

  // Use same hook as reserveForm to find applicable promotions
  const { bestPromotion } = useApplicablePromotions({
    promotions: complex.promotions,
    date: nextOccurrenceDate,
    schedule: initialData ? `${initialData.startTime.slice(0, 5)} - ${initialData.endTime.slice(0, 5)}` : undefined,
    courtId: initialData?.courtId,
    sportTypeId: initialData?.sportType.id,
  });
  const [step, setStep] = useState<"USER_SELECTION" | "DETAILS">("USER_SELECTION");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // User Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // New User State
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");

  // Form State for Details Step
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    courtId: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (editingReserve) {
        setStep("DETAILS");
        setSelectedUser(editingReserve.user);
        if (editingReserve.scheduleDay) {
          setSelectedDays([editingReserve.scheduleDay.dayOfWeek]);
        }
        setFormData({
          startTime: editingReserve.startTime,
          endTime: editingReserve.endTime,
          courtId: editingReserve.courtId,
        });
      } else if (initialData) {
        setStep("USER_SELECTION");
        setSelectedUser(null);
        setSelectedDays([initialData.dayOfWeek]);
        setFormData({
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          courtId: initialData.courtId,
        });
      }

      setSearchQuery("");
      setSearchResults([]);
      setIsCreatingUser(false);
      setNewUserName("");
      setNewUserPhone("");
    }
  }, [isOpen, initialData, editingReserve]);

  // Search Users
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const result = await searchUsers(searchQuery);
          if (result.success && result.data) {
            setSearchResults(result.data);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleCreateUser = async () => {
    if (!newUserName || !newUserPhone) {
      toast({
        title: "Error",
        description: "Nombre y teléfono son requeridos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUser({
        name: newUserName,
        phone: newUserPhone,
        email: `temp_${Date.now()}@example.com`, // Temporary email if backend still requires it, but we made it optional
        password: "temp_password", // Temporary password
        role: "USUARIO",
      });

      if (result.success && result.data) {
        setSelectedUser(result.data);
        setStep("DETAILS");
        toast({ title: "Usuario creado", description: "El usuario ha sido creado exitosamente." });
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo crear el usuario",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFixedReserve = async () => {
    if (!selectedUser || !editingReserve || selectedDays.length === 0) return;

    setIsLoading(true);
    try {
      // For update, we only handle the first selected day (since we are updating a single record)
      const dayId = selectedDays[0];
      const scheduleDay = complex.scheduleDays.find((sd) => sd.dayOfWeek === dayId);

      if (!scheduleDay) {
        toast({
          title: "Error",
          description: "Día no válido para este complejo",
          variant: "destructive",
        });
        return;
      }

      // We use the initialData (which might be updated if we added inputs for time/court in DETAILS step)
      // But currently DETAILS step only shows static info.
      // If we want to allow editing time/court, we need inputs there.
      // For now, assuming we only edit User and Day (and maybe implicitly time/court if we opened it from a different slot? No, modal opens with fixed data)

      // Wait, if I click "Edit", I expect to be able to change things.
      // The current modal design relies on `initialData` passed from the grid click.
      // If I am editing, `initialData` should come from `editingReserve`.

      // Let's assume for now we just update User and Day.
      // If we want to update Time/Court, we need UI for it in DETAILS step.
      // Given the user said "editar a los fijos", they probably want to change everything.
      // But the grid UI implies clicking a slot sets the time.
      // If I edit, I might want to change the time.

      // For this iteration, I will stick to updating User and Day (and implicitly re-linking scheduleDay).
      // If the user wants to change time, they might need to delete and create new, OR we add time pickers here.
      // Adding time pickers is better.

      const result = await updateFixedReserve(editingReserve.id, {
        userId: selectedUser.id,
        scheduleDayId: scheduleDay.id,
        startTime: formData.startTime,
        endTime: formData.endTime,
        courtId: formData.courtId,
      });

      if (result.success) {
        toast({ title: "Éxito", description: "Reserva fija actualizada." });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al actualizar",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFixedReserve = async () => {
    if (!selectedUser || !initialData) return;

    setIsLoading(true);
    try {
      const promises = selectedDays.map(async (dayId) => {
        const scheduleDay = complex.scheduleDays.find((sd) => sd.dayOfWeek === dayId);
        if (!scheduleDay) {
          console.warn(`No schedule day found for day ${dayId}`);
          return;
        }

        // Find the correct rate from the backend data (reservationsByDay)
        const scheduleKey = `${initialData.startTime.slice(0, 5)} - ${initialData.endTime.slice(0, 5)}`;
        const reservationSlot = state.reservationsByDay?.find(r => r.schedule === scheduleKey);

        let rateId = complex.rates[0]?.id; // Fallback

        if (reservationSlot?.courtInfo) {
          // Try to find rate for this specific court
          const courtData = reservationSlot.courtInfo.courts?.find(
            c => c.courtId === initialData.courtId
          );

          if (courtData?.rates && courtData.rates.length > 0) {
            rateId = courtData.rates[0].id;
          } else if (reservationSlot.courtInfo.rates && reservationSlot.courtInfo.rates.length > 0) {
            rateId = reservationSlot.courtInfo.rates[0].id;
          }
        }

        return createFixedReserve({
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          courtId: initialData.courtId,
          scheduleDayId: scheduleDay.id,
          rateId: rateId,
          userId: selectedUser.id,
          complexId: complex.id,
          isActive: true,
          promotionId: bestPromotion?.id, // Use bestPromotion from hook
        });
      });

      await Promise.all(promises);

      toast({ title: "Éxito", description: "Turnos fijos creados correctamente." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear los turnos fijos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingReserve ? "Editar Turno Fijo" : "Nuevo Turno Fijo"}</DialogTitle>
        </DialogHeader>

        {step === "USER_SELECTION" && (
          <div className="space-y-4 py-4">
            {!isCreatingUser ? (
              <>
                <div className="space-y-2">
                  <Label>Buscar Cliente</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Nombre, teléfono o email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Search Results */}
                  {isSearching && (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                    <div className="mt-2 border rounded-md divide-y max-h-[200px] overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            setSelectedUser(user);
                            setStep("DETAILS");
                          }}
                        >
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.phone || user.email}</p>
                          </div>
                          <Button size="sm" variant="ghost">
                            Seleccionar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isSearching && searchQuery.length > 2 && searchResults.length === 0 && (
                    <div className="text-center p-4 text-sm text-gray-500">
                      No se encontraron usuarios.
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">O</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsCreatingUser(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Nuevo Cliente
                </Button>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="Ej: 3624..."
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreatingUser(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser} disabled={isLoading} className="flex-1">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Crear y Seleccionar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "DETAILS" && (
          <div className="space-y-6 py-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500">Cliente:</span>
                <span className="font-medium">{selectedUser?.name}</span>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora Inicio</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(val) => setFormData({ ...formData, startTime: val })}
                    disabled={!editingReserve}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Generate hours */}
                      {Array.from({ length: 16 }, (_, i) => i + 8).map((hour) => (
                        <SelectItem key={hour} value={`${String(hour).padStart(2, "0")}:00`}>
                          {`${String(hour).padStart(2, "0")}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hora Fin</Label>
                  <Select
                    value={formData.endTime}
                    onValueChange={(val) => setFormData({ ...formData, endTime: val })}
                    disabled={!editingReserve}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 16 }, (_, i) => i + 9).map((hour) => (
                        <SelectItem key={hour} value={`${String(hour).padStart(2, "0")}:00`}>
                          {`${String(hour).padStart(2, "0")}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Court Selection */}
              <div className="space-y-2">
                <Label>Cancha</Label>
                <Select
                  value={formData.courtId}
                  onValueChange={(val) => setFormData({ ...formData, courtId: val })}
                  disabled={!editingReserve}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Cancha" />
                  </SelectTrigger>
                  <SelectContent>
                    {complex.courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Días a repetir</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.id}`}
                      checked={selectedDays.includes(day.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDays([...selectedDays, day.id]);
                        } else {
                          setSelectedDays(selectedDays.filter((d) => d !== day.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={`day-${day.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "DETAILS" && (
            <div className="flex gap-2 w-full justify-end">
              {editingReserve && (
                <Button variant="outline" onClick={() => setStep("USER_SELECTION")}>
                  Cambiar Cliente
                </Button>
              )}
              <Button
                onClick={editingReserve ? handleUpdateFixedReserve : handleCreateFixedReserve}
                disabled={isLoading || selectedDays.length === 0}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingReserve ? "Guardar Cambios" : "Confirmar Fijo"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
