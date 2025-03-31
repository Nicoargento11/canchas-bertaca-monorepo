"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileMenu } from "@/components/navbar/profile-menu";
import { navBarItems } from "@/constants";
import { Session } from "@/services/auth/session";
import { Button } from "../ui/button";
import { useModal } from "@/contexts/modalContext";
import { scrollToSection } from "@/utils/scrollToSection";

interface NavBarProps {
  currentUser?: Session | null;
}

const NavBar = ({ currentUser }: NavBarProps) => {
  const { handleChangeLogin, handleChangeRegister } = useModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    scrollToSection(event);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="w-full fixed top-0 z-50">
      <nav
        className={`w-full py-3 px-4 lg:px-6 transition-all duration-300 flex justify-between items-center max-w-7xl mx-auto 
        ${scrolled ? " backdrop-blur-md" : "bg-transparent"}`}
      >
        {/* Botón de menú móvil e icono de usuario */}
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
          {currentUser && <ProfileMenu currentUser={currentUser} />}
        </div>

        {/* Logo */}
        <div className="text-white font-bold text-xl hidden lg:block">LOGO</div>

        {/* Navegación desktop */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex gap-1 md:gap-4">
            {navBarItems.map(({ title, href }) => (
              <Link
                key={href}
                href={`#${href}`}
                className={`
        relative text-white font-medium transition-all duration-300
        px-3 py-2 rounded-lg
        hover:bg-white/10
        before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-0.5 
        before:bg-Complementary before:transition-all before:duration-300
        hover:before:left-0 hover:before:w-full
        text-sm md:text-base
      `}
                onClick={scrollToSection}
              >
                {title}
              </Link>
            ))}
          </div>
          {currentUser ? (
            <ProfileMenu currentUser={currentUser} />
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={handleChangeLogin}
              >
                Iniciar Sesión
              </Button>
              <Button
                className="bg-Primary hover:bg-Primary-dark"
                onClick={handleChangeRegister}
              >
                Registrarse
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Menú móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed top-14 left-0 w-full  backdrop-blur-md shadow-lg"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              {navBarItems.map(({ title, href }) => (
                <Link
                  key={href}
                  href={`#${href}`}
                  className="px-4 py-3 rounded-md hover:bg-white/10 text-white font-medium text-center transition-colors"
                  onClick={(e) => handleMobileLinkClick(e)}
                >
                  {title}
                </Link>
              ))}

              {!currentUser && (
                <div className="flex flex-col gap-3 pt-3 border-t border-white/20">
                  <Button
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white/10"
                    onClick={() => {
                      handleChangeLogin();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    className="w-full bg-Primary hover:bg-Primary-dark"
                    onClick={() => {
                      handleChangeRegister();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Registrarse
                  </Button>
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
