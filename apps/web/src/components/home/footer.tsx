import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import Link from "next/link";

export const FooterHome = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-Primary-darker p-8 text-Neutral-light">
      <div className="flex flex-col md:flex-row justify-between items-center gap-y-6 gap-x-12 text-center md:justify-between">
        <div className="flex items-center">
          <p className="ml-2 font-semibold text-Accent-1 text-2xl">
            Canchas Bertaca
          </p>
        </div>

        <div className="flex flex-col gap-2 items-center md:items-start">
          <Link
            target="_blank"
            href="https://maps.app.goo.gl/csSJmhT7QrKzkErz6"
            className="flex gap-2 text-white transition-all hover:scale-105 items-center"
          >
            <FaMapMarkerAlt />
            <p>Donde encontrarnos</p>
          </Link>
          <Link
            target="_blank"
            href={`https://wa.me/+543795165059`}
            className="flex gap-2 text-white transition-all hover:scale-105 items-center"
          >
            <FaPhoneAlt />
            +543795165059
          </Link>
        </div>

        <div className="flex gap-4">
          <Link
            href="https://www.facebook.com/ComplejoSarmientoF5"
            target="_blank"
          >
            <FaFacebook className="text-[#1877F2] text-2xl hover:scale-110 transition-transform" />
          </Link>

          <Link href="https://www.instagram.com/sarmientof5" target="_blank">
            <FaInstagram className="text-[#E4405F] text-2xl hover:scale-110 transition-transform" />
          </Link>
        </div>
      </div>

      <hr className="my-8 border-Complementary/30" />
      <p className="font-sans text-white text-center">
        &copy; {year} Bertaca. Todos los derechos reservados.
      </p>
    </footer>
  );
};
