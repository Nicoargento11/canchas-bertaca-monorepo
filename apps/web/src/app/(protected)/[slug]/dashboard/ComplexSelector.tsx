"use client";

import { useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

type Complex = {
  id: string;
  name: string;
  slug: string;
};

type ComplexSelectorProps = {
  currentComplex: Complex;
  availableComplexes: Complex[];
  userRole: string;
};

export function ComplexSelector({
  currentComplex,
  availableComplexes,
  userRole,
}: ComplexSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Solo mostrar selector para SUPER_ADMIN y ORGANIZACION_ADMIN
  if (userRole !== "SUPER_ADMIN" && userRole !== "ORGANIZACION_ADMIN") {
    return null;
  }

  // Si solo hay un complejo, no mostrar selector
  if (availableComplexes.length <= 1) {
    return null;
  }

  const handleComplexChange = (slug: string) => {
    // Navegar a la nueva URL con el slug del complejo
    router.push(`/${slug}/dashboard`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-primary transition-all min-w-[200px]"
      >
        <Building2 className="w-5 h-5 text-primary" />
        <div className="flex-1 text-left">
          <p className="text-xs text-gray-500">Complejo</p>
          <p className="font-semibold text-gray-900">{currentComplex.name}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown menu */}
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {availableComplexes.map((complex) => (
              <button
                key={complex.id}
                onClick={() => handleComplexChange(complex.slug)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                  complex.id === currentComplex.id
                    ? "bg-primary/5 text-primary font-semibold"
                    : "text-gray-700"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>{complex.name}</span>
                {complex.id === currentComplex.id && (
                  <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full">
                    Actual
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
