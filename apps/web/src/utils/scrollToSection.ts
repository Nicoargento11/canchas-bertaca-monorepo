export function scrollToSection(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault(); // Evita el comportamiento predeterminado del enlace

  const href = event.currentTarget.getAttribute("href");

  // Verifica si `href` existe y comienza con '#'
  if (!href || !href.startsWith("#")) {
    console.error(
      "El atributo 'href' no es válido o no contiene un ID de sección."
    );
    return;
  }

  const targetId = href.substring(1); // Elimina el '#' del inicio
  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    const navbarHeight = 65;
    const targetPosition = targetElement.offsetTop - navbarHeight;

    window.scroll({
      top: targetPosition,
      behavior: "smooth", // Cambiado a "smooth" para un desplazamiento suave
    });
  } else {
    console.error(`No se encontró el elemento con ID: ${targetId}`);
  }
}
