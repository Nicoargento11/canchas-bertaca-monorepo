"use client";
import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaMapMarkerAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Link from "next/link";
import { motion } from "framer-motion";

interface GlassCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  info: string;
  link: string;
  borderColor: string;
}

interface SocialIconProps {
  icon: React.ReactNode;
  link: string;
  color: string;
}

interface FooterLinkProps {
  href: string;
  text: string;
}

export const ContactSection = () => {
  return (
    <>
      {/* Sección de Contacto - Diseño Moderno */}
      <section
        className="relative py-20 bg-gradient-to-br from-Primary-dark to-Primary-darker overflow-hidden"
        id="Contacto"
      >
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-Accent-1 blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-Complementary blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Necesitas <span className="text-Accent-1">ayuda</span>?
            </h2>
            <p className="text-xl text-Neutral-light mb-10 max-w-2xl mx-auto">
              Estamos aquí para resolver tus dudas y ayudarte con tus reservas.
              Contáctanos por cualquier medio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              <GlassCard
                icon={<FaWhatsapp className="text-3xl text-green-400" />}
                title="WhatsApp"
                description="Respuesta inmediata"
                info="+54 379 5165059"
                link={`https://wa.me/+543795165059`}
                borderColor="border-green-400/30"
              />

              {/* <GlassCard
                icon={<FaPhoneAlt className="text-3xl text-blue-300" />}
                title="Llamada"
                description="Horario comercial"
                info="379 5165059"
                link="tel:+543795165059"
                borderColor="border-blue-400/30"
              /> */}

              <GlassCard
                icon={<MdEmail className="text-3xl text-red-300" />}
                title="Email"
                description="Respuesta en 24h"
                info="contacto@bertaca.com"
                link="mailto:contacto@bertaca.com"
                borderColor="border-red-400/30"
              />

              <GlassCard
                icon={<FaMapMarkerAlt className="text-3xl text-yellow-300" />}
                title="Ubicación"
                description="Visítanos"
                info="Ver en mapa"
                link="https://maps.app.goo.gl/csSJmhT7QrKzkErz6"
                borderColor="border-yellow-400/30"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Diseño Moderno */}
      <footer className="w-full bg-Primary-darker py-12 px-6 text-Neutral-light">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-Accent-1 mb-4">
                Canchas Bertaca
              </h3>
              <p className="mb-4">
                El mejor complejo de fútbol 5 en la región, con canchas de
                primer nivel y atención personalizada.
              </p>

              <div className="flex gap-4 mt-6">
                <SocialIcon
                  icon={<FaFacebook className="text-2xl" />}
                  link="https://www.facebook.com/ComplejoSarmientoF5"
                  color="hover:bg-[#1877F2]"
                />
                <SocialIcon
                  icon={<FaInstagram className="text-2xl" />}
                  link="https://www.instagram.com/sarmientof5"
                  color="hover:bg-[#E4405F]"
                />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-Accent-1 mb-4">
                Horarios
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span>Lunes a Viernes:</span>
                  <span className="font-medium">8:00 - 23:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Sábados:</span>
                  <span className="font-medium">9:00 - 00:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Domingos:</span>
                  <span className="font-medium">10:00 - 22:00</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-Accent-1 mb-4">
                Enlaces Rápidos
              </h3>
              <ul className="space-y-3">
                <FooterLink href="#Inicio" text="Inicio" />
                <FooterLink href="#Servicios" text="Servicios" />
                <FooterLink href="#Precios" text="Precios" />
                <FooterLink href="#Contacto" text="Contacto" />
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-Complementary/30">
            <p className="text-center text-Neutral-light">
              &copy; {new Date().getFullYear()} Canchas Bertaca. Todos los
              derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

const GlassCard: React.FC<GlassCardProps> = ({
  icon,
  title,
  description,
  info,
  link,
  borderColor,
}) => (
  <div
    className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border ${borderColor} transition-all duration-300 hover:bg-white/20 hover:shadow-xl relative overflow-hidden flex flex-col items-center text-center w-full`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

    {/* Icon Container */}
    <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-white text-3xl mb-4">
      {icon}
    </div>

    {/* Content */}
    <div className="relative z-10 flex flex-col h-full w-full">
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-neutral-300 text-sm leading-relaxed mb-4">
        {description}
      </p>

      {/* Link Button */}
      <div className="mt-auto w-full">
        <Link
          href={link}
          target="_blank"
          className="inline-flex items-center justify-center w-full text-sm font-medium text-white bg-accent-500 py-2 px-4 rounded-lg hover:bg-accent-600 transition-colors"
        >
          {info}
        </Link>
      </div>
    </div>
  </div>
);

const SocialIcon: React.FC<SocialIconProps> = ({ icon, link, color }) => (
  <Link
    href={link}
    target="_blank"
    className={`w-12 h-12 rounded-full bg-Primary-dark flex items-center justify-center ${color} transition-all hover:text-white`}
  >
    {icon}
  </Link>
);

const FooterLink: React.FC<FooterLinkProps> = ({ href, text }) => (
  <li>
    <Link
      href={href}
      className="hover:text-Accent-1 transition-colors flex items-center gap-2"
    >
      <span className="w-2 h-2 bg-Accent-1 rounded-full"></span>
      {text}
    </Link>
  </li>
);
