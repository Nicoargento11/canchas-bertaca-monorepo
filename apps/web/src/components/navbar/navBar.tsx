"use client";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { scrollToSection } from "@/utils/scrollToSection";
import { ProfileMenu } from "./profile-menu";
import { navBarItems } from "@/constants";
import type { SessionPayload } from "@/services/auth/session";
import { useModal } from "@/contexts/modalContext";
import type { Complex } from "@/services/complex/complex";
import { useComplexTab } from "@/contexts/ComplexTabContext";

interface NavBarProps {
  currentUser?: SessionPayload | null;
  complex: Complex;
}

const NavBar = ({ currentUser, complex }: NavBarProps) => {
  const { openModal } = useModal();
  const { setActiveTab, activeTab } = useComplexTab();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current !== null) {
        return;
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const shouldBeScrolled = window.scrollY > 10;

        setScrolled((prev) => {
          if (prev !== shouldBeScrolled) {
            return shouldBeScrolled;
          }
          return prev;
        });

        rafIdRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    const targetId = href;
    const tabSpecificSections = ["TurnosHoy", "Precios", "Contacto"];

    if (tabSpecificSections.includes(targetId)) {
      const specificId = `${targetId}-${activeTab}`;
      const element = document.getElementById(specificId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setIsMobileMenuOpen(false);
        return;
      }
    }

    scrollToSection(event);
    setIsMobileMenuOpen(false);
  };

  const handleMobileLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string
  ) => {
    handleNavClick(event, href);
  };

  return (
    <div className="w-full fixed top-0 z-50">
      <nav
        className={`w-full py-3 px-4 lg:px-6 transition-all duration-300 flex justify-between items-center mx-auto 
        ${scrolled ? "bg-black/80 shadow-lg" : "bg-transparent"}`}
      >
        {/* Mobile menu button and user icon */}
        <div className="w-full flex justify-between items-center gap-4 lg:hidden">
          <button
            className="p-2 rounded-md hover:bg-white/20 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-white" />
            ) : (
              <Menu size={24} className="text-white" />
            )}
          </button>
          {currentUser && <ProfileMenu currentUser={currentUser} complex={complex} />}
        </div>

        {/* Logo */}
        <div className="hidden lg:flex items-center gap-3">
          <img
            src="/images/bertaca_logo.png"
            alt="Bertaca"
            className="h-12 w-auto object-contain"
          />
          <div className="h-12 w-[2px] bg-white/20"></div>
          <img
            src="/images/seven_logo.png"
            alt="Seven"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex gap-1 md:gap-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("bertaca");
                const element = document.getElementById("complejos");
                if (element) {
                  const offset = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - offset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className="relative text-white font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-Primary"
            >
              Bertaca
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("seven");
                const element = document.getElementById("complejos");
                if (element) {
                  const offset = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - offset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className="relative text-white font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-green-400"
            >
              Seven
            </button>
            {navBarItems.map(({ title, href }, index) => (
              <Link
                key={href}
                href={`#${href}`}
                className={`
          relative text-white font-medium transition-all duration-300
          px-3 py-2 rounded-lg
          hover:bg-white/10
          text-sm md:text-base
          after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-0 
          after:mx-auto after:transition-all after:duration-300 after:ease-in-out
          hover:after:w-full
          ${index % 3 === 0 ? "after:bg-Primary" : index % 3 === 1 ? "after:bg-Complementary" : "after:bg-Primary"}
        `}
                onClick={(e) => handleNavClick(e, href)}
              >
                {title}
              </Link>
            ))}
          </div>
          {currentUser ? (
            <ProfileMenu currentUser={currentUser} complex={complex} />
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Botón de Login (verde) */}
              <button
                onClick={() => openModal("LOGIN", { complexId: complex?.id })}
                className="flex items-center justify-center rounded-lg border border-green-500 bg-transparent px-4 py-2 text-white transition-all duration-300 hover:bg-green-500/10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <LogIn size={16} className="mr-2" />
                <span className="text-sm sm:text-base">Iniciar Sesión</span>
              </button>
              {/* Botón de Registro (azul) */}
              <button
                onClick={() => openModal("REGISTER", { complexId: complex?.id })}
                className="flex items-center justify-center rounded-lg border border-blue-500 bg-transparent px-4 py-2 text-white transition-all duration-300 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <UserPlus size={16} className="mr-2" />
                <span className="text-sm sm:text-base">Registrarse</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-center items-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
              aria-label="Close menu"
            >
              <X size={32} />
            </button>

            <div className="w-full max-w-xs space-y-6 p-6">
              <div className="flex flex-col gap-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("bertaca");
                    const element = document.getElementById("complejos");
                    if (element) {
                      const offset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 text-xl font-bold text-white border-b border-white/10 hover:text-Primary transition-colors text-center"
                >
                  Sede Bertaca
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("seven");
                    const element = document.getElementById("complejos");
                    if (element) {
                      const offset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 text-xl font-bold text-white border-b border-white/10 hover:text-green-400 transition-colors text-center"
                >
                  Sede Seven
                </button>
                {navBarItems.map(({ title, href }) => (
                  <Link
                    key={href}
                    href={`#${href}`}
                    className="w-full py-4 text-xl font-bold text-white border-b border-white/10 hover:text-Primary transition-colors text-center"
                    onClick={(e) => handleMobileLinkClick(e, href)}
                  >
                    {title}
                  </Link>
                ))}
              </div>

              {!currentUser && (
                <div className="flex flex-col gap-4 pt-6">
                  <button
                    onClick={() => {
                      openModal("LOGIN", { complexId: complex?.id });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-xl bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={20} />
                    Iniciar Sesión
                  </button>

                  <button
                    onClick={() => {
                      openModal("REGISTER", { complexId: complex?.id });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-xl bg-Primary text-white font-bold hover:bg-Primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-Primary/20"
                  >
                    <UserPlus size={20} />
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavBar;
