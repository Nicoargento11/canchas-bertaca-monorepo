"use client";
import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Función para controlar la visibilidad del botón
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Agregar un event listener para el desplazamiento
    window.addEventListener("scroll", handleScroll);

    // Eliminar el event listener cuando se desmonta el componente
    return () => {
      window.removeEventListener("scroll", handleScroll);
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
