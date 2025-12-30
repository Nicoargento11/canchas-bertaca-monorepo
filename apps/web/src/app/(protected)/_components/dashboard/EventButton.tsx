"use client";

import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";
import { useEventBookingModalStore } from "@/store/eventBookingModalStore";

export const EventButton = () => {
    const { onOpen } = useEventBookingModalStore();

    return (
        <Button
            onClick={onOpen}
            variant="outline"
            className="h-10 px-4 bg-purple-500 hover:bg-purple-600 text-white border-purple-600"
        >
            <PartyPopper className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Evento/Cumpleaños</span>
            <span className="sm:hidden">Evento</span>
        </Button>
    );
};
