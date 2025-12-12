"use client";
import React, { useEffect, useState, useRef } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Throttle con requestAnimationFrame
    const handleScroll = () => {
      if (rafIdRef.current !== null) {
        return; // Ya hay un frame pendiente
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const shouldShow = window.scrollY > 100;

        // Solo actualizar si el estado cambió
        setIsVisible((prev) => {
          if (prev !== shouldShow) {
            return shouldShow;
          }
          return prev;
        });

        rafIdRef.current = null;
      });
    };

    // Agregar un event listener para el desplazamiento
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Eliminar el event listener cuando se desmonta el componente
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return isVisible ? (
    <button
      className="fixed z-30 bottom-6 right-6 bg-Primary hover:bg-green-800 p-1 text-white rounded-full cursor-pointer"
      onClick={scrollToTop}
    >
      <ChevronUp size={30} />
    </button>
  ) : (
    <></>
  );
};

export default ScrollToTopButton;
