import { useState, useEffect } from "react";

function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Agregar un event listener para el evento resize
    window.addEventListener("resize", handleResize);

    // Llamar a la función handleResize una vez para obtener el tamaño inicial de la ventana
    handleResize();

    // Limpiar el event listener en el cleanup de useEffect
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Solo se ejecuta una vez, ya que no hay dependencias

  return windowSize;
}

export default useWindowSize;
