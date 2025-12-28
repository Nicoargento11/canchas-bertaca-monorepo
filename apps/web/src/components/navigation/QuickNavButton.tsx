"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuickNavButtonProps {
    href: string;
    icon: React.ReactElement<LucideIcon>;
    label: string;
}

export function QuickNavButton({ href, icon, label }: QuickNavButtonProps) {
    return (
        <Link href={href}>
            <Button
                className="fixed bottom-6 right-6 rounded-full shadow-2xl z-50 
                  bg-primary hover:bg-primary/90 text-white
                  h-14 px-6 gap-2 transition-all hover:scale-105"
            >
                {icon}
                <span className="hidden sm:inline font-medium">{label}</span>
            </Button>
        </Link>
    );
}
