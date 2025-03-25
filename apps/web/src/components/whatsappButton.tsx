import Link from "next/link";
import React from "react";

import { FaWhatsapp } from "@react-icons/all-files/fa/FaWhatsapp";

export const WhatsappButton = () => {
  return (
    <Link
      href={`https://wa.me/+543795165059`}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaWhatsapp size={25} />
      <span>Enviar mensaje por WhatsApp</span>
    </Link>
  );
};
