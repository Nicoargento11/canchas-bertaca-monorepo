"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock } from "lucide-react";

interface TimeSlotSelectorProps {
  selectedSlots: string[];
  onSelect: (slots: string[]) => void;
  availableSlots?: string[];
}

export function TimeSlotSelector({
  selectedSlots,
  onSelect,
  availableSlots,
}: TimeSlotSelectorProps) {
  const allTimeSlots = [
    "08:00 - 10:00",
    "10:00 - 12:00",
    "12:00 - 14:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "18:00 - 20:00",
    "20:00 - 22:00",
    "22:00 - 00:00",
  ];

  const toggleSlot = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      onSelect(selectedSlots.filter((s) => s !== slot));
    } else {
      onSelect([...selectedSlots, slot]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Clock className="mr-2 h-4 w-4" />
          {selectedSlots.length > 0
            ? `${selectedSlots.length} horarios seleccionados`
            : "Seleccionar horarios"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-2 gap-2">
          {allTimeSlots.map((slot) => {
            const isAvailable = availableSlots
              ? availableSlots.includes(slot)
              : true;
            const isSelected = selectedSlots.includes(slot);

            return (
              <Button
                key={slot}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => isAvailable && toggleSlot(slot)}
                disabled={!isAvailable}
              >
                {slot.split(" ")[0]}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
