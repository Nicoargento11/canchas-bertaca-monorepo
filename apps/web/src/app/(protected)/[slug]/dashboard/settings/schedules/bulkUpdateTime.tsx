"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Complex } from "@/services/complex/complex";
import { bulkUpdateTimeFetch } from "@/services/schedule/schedule";
import { Loader2, Clock } from "lucide-react";
import { generateTimeOptions } from "@/utils/generateTimeOptions";

type Field = "startTime" | "endTime" | "both";

interface BulkUpdateTimeProps {
  complex: Complex;
}

const FIELD_OPTIONS: { value: Field; label: string }[] = [
  { value: "startTime", label: "Hora de inicio" },
  { value: "endTime", label: "Hora de fin" },
  { value: "both", label: "Ambas" },
];

export function BulkUpdateTime({ complex }: BulkUpdateTimeProps) {
  const router = useRouter();
  const [field, setField] = useState<Field>("both");
  const [oldTime, setOldTime] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const uniqueTimes = useMemo(() => {
    const times = new Set<string>();
    complex.schedules.forEach((s) => {
      if (field === "startTime" || field === "both") times.add(s.startTime);
      if (field === "endTime" || field === "both") times.add(s.endTime);
    });
    return Array.from(times).sort();
  }, [complex.schedules, field]);

  const affectedCount = useMemo(() => {
    if (!oldTime) return 0;
    return complex.schedules.filter((s) => {
      if (field === "startTime") return s.startTime === oldTime;
      if (field === "endTime") return s.endTime === oldTime;
      return s.startTime === oldTime || s.endTime === oldTime;
    }).length;
  }, [oldTime, field, complex.schedules]);

  const allTimeOptions = useMemo(() => generateTimeOptions(), []);

  const handleFieldChange = (value: Field) => {
    setField(value);
    setOldTime("");
    setNewTime("");
  };

  const handleApply = async () => {
    if (!oldTime || !newTime || oldTime === newTime) return;

    setIsProcessing(true);
    try {
      const { success, data, error } = await bulkUpdateTimeFetch(
        complex.id,
        oldTime,
        newTime,
        field
      );
      if (!success) throw new Error(error);
      toast.success(`${data?.updated ?? 0} horarios actualizados`);
      setOldTime("");
      setNewTime("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar horarios");
    } finally {
      setIsProcessing(false);
    }
  };

  if (complex.schedules.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-800">Cambio masivo de horario</h3>
      </div>
      <p className="text-sm text-gray-500">
        Cambiá un horario en todas las canchas y días de una sola vez.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Cambiar</Label>
          <Select value={field} onValueChange={handleFieldChange} disabled={isProcessing}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Horario actual</Label>
          <Select value={oldTime} onValueChange={setOldTime} disabled={isProcessing}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná" />
            </SelectTrigger>
            <SelectContent>
              {uniqueTimes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Nuevo horario</Label>
          <Select
            value={newTime}
            onValueChange={setNewTime}
            disabled={isProcessing || !oldTime}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná" />
            </SelectTrigger>
            <SelectContent>
              {allTimeOptions
                .filter((t) => t !== oldTime)
                .map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {oldTime && (
        <p className="text-sm font-medium text-amber-600">
          Se van a actualizar {affectedCount} slot{affectedCount !== 1 ? "s" : ""} en todas las
          canchas y días.
        </p>
      )}

      <Button
        onClick={handleApply}
        disabled={!oldTime || !newTime || oldTime === newTime || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Aplicando...
          </>
        ) : (
          "Aplicar a todas las canchas"
        )}
      </Button>
    </div>
  );
}
