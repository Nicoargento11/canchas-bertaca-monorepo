"use client";
import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { scrollToSection } from "@/utils/scrollToSection";
import { ProfileMenu } from "./profile-menu";
import { navBarItems } from "@/constants";
import type { SessionPayload } from "@/services/auth/session";
import { useModal } from "@/contexts/modalContext";
import type { Complex } from "@/services/complex/complex";

interface NavBarProps {
  currentUser?: SessionPayload | null;
  complex: Complex;
}

const NavBar = ({ currentUser, complex }: NavBarProps) => {
  const { openModal } = useModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileLinkClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    scrollToSection(event);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="w-full fixed top-0 z-50">
      <nav
        className={`w-full py-3 px-4 lg:px-6 transition-all duration-300 flex justify-between items-center mx-auto 
        ${scrolled ? "backdrop-blur-md bg-black/30 shadow-lg" : "bg-transparent"}`}
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
        <div className="hidden lg:block">
          <img
            src="/images/bertaca_logo.png"
            alt="Logo bertaca"
            className="h-20 w-24 object-contain"
          />
          {/* LOGO */}
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex gap-1 md:gap-4">
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
                onClick={scrollToSection}
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed top-14 left-0 w-full backdrop-blur-md bg-black/70 shadow-lg"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              {navBarItems.map(({ title, href }, index) => (
                <Link
                  key={href}
                  href={`#${href}`}
                  className={`
                    px-4 py-3 rounded-md hover:bg-white/10 text-white font-medium text-center transition-colors
                    }
                  `}
                  onClick={(e) => handleMobileLinkClick(e)}
                >
                  {title}
                </Link>
              ))}

              {!currentUser && (
                <div className="flex flex-col gap-3 pt-3 border-t border-white/20">
                  {/* Mobile Login Button */}
                  <button
                    onClick={() => {
                      openModal("LOGIN", { complexId: complex?.id });
                      setIsMobileMenuOpen(false);
                    }}
                    className="relative group flex items-center justify-center overflow-hidden rounded-lg border-0 bg-gradient-to-br from-green-600 to-green-700 p-0.5 font-medium text-white transition-all duration-300 ease-out hover:bg-gradient-to-br hover:from-green-500 hover:to-green-600 hover:shadow-md hover:shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.98]"
                  >
                    <span className="relative flex w-full items-center justify-center gap-2 rounded-md bg-black/30 px-4 py-2.5 transition-all duration-300 ease-out group-hover:bg-transparent">
                      <LogIn
                        size={18}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                      <span>Iniciar Sesión</span>
                    </span>
                  </button>

                  {/* Mobile Register Button */}
                  <button
                    onClick={() => {
                      openModal("REGISTER", { complexId: complex?.id });
                      setIsMobileMenuOpen(false);
                    }}
                    className="relative group flex items-center justify-center overflow-hidden rounded-lg border-0 bg-gradient-to-br from-red-600 to-red-700 p-0.5 font-medium text-white transition-all duration-300 ease-out hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:shadow-md hover:shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-[0.98]"
                  >
                    <span className="relative flex w-full items-center justify-center gap-2 rounded-md bg-black/30 px-4 py-2.5 transition-all duration-300 ease-out group-hover:bg-transparent">
                      <UserPlus
                        size={18}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                      <span>Registrarse</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavBar;
