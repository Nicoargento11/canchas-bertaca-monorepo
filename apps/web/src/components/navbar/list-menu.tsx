import Link from "next/link";
import { navBarItems } from "@/constants";

function scrollToSection(event) {
  event.preventDefault();
  const targetId = event.currentTarget.getAttribute("href").substring(1);
  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    const navbarHeight = 65;
    const targetPosition = targetElement.offsetTop - navbarHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
}

export const ListMenu = () => {
  return (
    <ul className="flex justify-center gap-6">
      {navBarItems.map(({ title, href }, index) => (
        <li key={index}>
          <Link
            href={`#${href}`}
            className="text-Complementary text-md font-semibold relative group"
            onClick={(event) => scrollToSection(event)}
          >
            {title}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-Complementary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
