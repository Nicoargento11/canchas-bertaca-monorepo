"use client";
import { motion } from "framer-motion";
import {
  FaFacebook,
  FaInstagram,
  FaMapMarkerAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Link from "next/link";

export const ContactSection = () => {
  const contactData = {
    whatsapp: {
      icon: <FaWhatsapp className="text-green-400" size={24} />,
      title: "WhatsApp",
      description: "Respuesta inmediata",
      info: "+54 379 5165059",
      link: "https://wa.me/+543795165059",
    },
    email: {
      icon: <MdEmail className="text-red-300" size={24} />,
      title: "Email",
      description: "Respuesta en 24h",
      info: "contacto@bertaca.com",
      link: "mailto:contacto@bertaca.com",
    },
    location: {
      icon: <FaMapMarkerAlt className="text-yellow-300" size={24} />,
      title: "Ubicación",
      description: "Visítanos",
      info: "Ver en mapa",
      link: "https://maps.app.goo.gl/csSJmhT7QrKzkErz6",
    },
  };

  const footerData = {
    about:
      "El mejor complejo de fútbol 5 en la región, con canchas de primer nivel y atención personalizada.",
    social: [
      {
        icon: <FaFacebook size={20} className="text-white" />,
        link: "https://www.facebook.com/ComplejoSarmientoF5",
        color: "bg-[#1877F2] hover:bg-[#1877F2]/90 transition-colors",
      },
      {
        icon: <FaInstagram size={20} className="text-white" />,
        link: "https://www.instagram.com/sarmientof5",
        color:
          "bg-gradient-to-r from-[#FEDA75] via-[#FA7E1E] to-[#D62976] hover:opacity-90 transition-opacity",
      },
    ],
    schedule: [
      { day: "Lunes a Viernes:", time: "8:00 - 23:00" },
      { day: "Sábados:", time: "9:00 - 00:00" },
      { day: "Domingos:", time: "10:00 - 22:00" },
    ],
    links: [
      { href: "#Inicio", text: "Inicio" },
      { href: "#Servicios", text: "Servicios" },
      { href: "#Precios", text: "Precios" },
      { href: "#Contacto", text: "Contacto" },
    ],
  };

  return (
    <>
      {/* Sección de Contacto */}
      <section
        id="Contacto"
        className="py-16 bg-gradient-to-b from-gray-900 to-gray-950"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Título de la sección */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-Accent-1 to-Complementary bg-clip-text text-transparent mb-4">
              ¿Necesitas ayuda?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Estamos aquí para resolver tus dudas y ayudarte con tus reservas.
              Contáctanos por cualquier medio.
            </p>
          </motion.div>

          {/* Tarjetas de contacto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* WhatsApp */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-green-400 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 Prbg-Complementarygreen-400/20 rounded-lg">
                  {contactData.whatsapp.icon}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {contactData.whatsapp.title}
                </h3>
              </div>

              <p className="text-gray-300 mb-6">
                {contactData.whatsapp.description}
              </p>

              <Link
                href={contactData.whatsapp.link}
                target="_blank"
                className="w-full inline-flex justify-center items-center py-2 px-4 rounded-lg Prbg-Complementarygreen-400/10 border border-green-400/30 text-green-400 hover:bg-green-400/20 transition-colors"
              >
                {contactData.whatsapp.info}
              </Link>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-red-300 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-300/20 rounded-lg">
                  {contactData.email.icon}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {contactData.email.title}
                </h3>
              </div>

              <p className="text-gray-300 mb-6">
                {contactData.email.description}
              </p>

              <Link
                href={contactData.email.link}
                target="_blank"
                className="w-full inline-flex justify-center items-center py-2 px-4 rounded-lg bg-red-300/10 border border-red-300/30 text-red-300 hover:bg-red-300/20 transition-colors"
              >
                {contactData.email.info}
              </Link>
            </motion.div>

            {/* Ubicación */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-yellow-300 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-300/20 rounded-lg">
                  {contactData.location.icon}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {contactData.location.title}
                </h3>
              </div>

              <p className="text-gray-300 mb-6">
                {contactData.location.description}
              </p>

              <Link
                href={contactData.location.link}
                target="_blank"
                className="w-full inline-flex justify-center items-center py-2 px-4 rounded-lg bg-yellow-300/10 border border-yellow-300/30 text-yellow-300 hover:bg-yellow-300/20 transition-colors"
              >
                {contactData.location.info}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-950 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Información */}
            <div>
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-Primary-light mb-4"
              >
                Canchas Bertaca
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="mb-4 text-gray-300"
              >
                {footerData.about}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-4 mt-6"
              >
                {footerData.social.map((social, index) => (
                  <Link
                    key={index}
                    href={social.link}
                    target="_blank"
                    className={`w-10 h-10 rounded-full  flex items-center justify-center ${social.color} transition-all hover:text-white`}
                  >
                    {social.icon}
                  </Link>
                ))}
              </motion.div>
            </div>

            {/* Horarios */}
            <div>
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-Primary-light mb-4"
              >
                Horarios
              </motion.h3>
              <motion.ul
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-3 text-gray-300"
              >
                {footerData.schedule.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.day}</span>
                    <span className="font-medium">{item.time}</span>
                  </li>
                ))}
              </motion.ul>
            </div>

            {/* Enlaces */}
            <div>
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-Primary-light mb-4"
              >
                Enlaces Rápidos
              </motion.h3>
              <motion.ul
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-3 text-gray-300"
              >
                {footerData.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="hover:text-Primary-light transition-colors flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-Primary-lighter rounded-full"></span>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="pt-8 border-t border-gray-700"
          >
            <p className="text-center text-gray-400">
              &copy; {new Date().getFullYear()} Canchas Bertaca. Todos los
              derechos reservados.
            </p>
          </motion.div>
        </div>
      </footer>
    </>
  );
};
