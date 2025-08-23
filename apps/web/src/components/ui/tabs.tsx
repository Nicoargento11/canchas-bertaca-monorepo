"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} className={cn("flex flex-col w-full", className)} {...props} />
));
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <div className="relative mb-4">
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex w-full overflow-x-auto pb-2 gap-1",
        "scrollbar-hide", // Oculta la barra de scroll
        className
      )}
      {...props}
    />
    <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
  </div>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex-1",
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow",
      "border-b-2 border-transparent data-[state=active]:border-gray-900", // Borde inferior solo para activo
      "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900",
      "border border-gray-200",
      "min-w-[100px]", // Ancho mínimo para cada tab
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-0 w-full rounded-lg bg-white p-6 shadow-sm border border-gray-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
