"use client";
import { motion } from "framer-motion";
import { Trophy, Cake, Clock, CheckCircle } from "lucide-react";

export const EventSection = () => {
  const pricingData = {
    regular: [
      { time: "09:00 - 12:00", price: "$50.000" },
      { time: "12:00 - 15:00", price: "$60.000" },
      { time: "15:00 - 18:00", price: "$70.000" },
      { time: "18:00 - 21:00", price: "$80.000" },
      { time: "Fines de semana", price: "+20%" },
    ],
    soccerSchool: {
      description: "Escuelita de fútbol para niños de 5-12 años",
      packages: [
        { name: "1 clase semanal", price: "$100.000/mes" },
        { name: "2 clases semanales", price: "$180.000/mes" },
        { name: "Pack familiar (2 niños)", price: "$300.000/mes" },
      ],
      benefits: [
        "Entrenadores certificados",
        "Material deportivo incluido",
        "Partidos amistosos mensuales",
      ],
    },
    birthdays: {
      basic: {
        price: "$250.000",
        includes: [
          "2 horas de cancha",
          "Arco de cumpleaños",
          "Área de refrigerios",
        ],
      },
      premium: {
        price: "$400.000",
        includes: [
          "3 horas de cancha",
          "Decoración temática",
          "Refrigerios básicos",
          "Álbum de fotos digital",
        ],
      },
    },
  };

  return (
    <section
      id="precios"
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
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-Primary-light to-Primary-dark bg-clip-text text-transparent mb-4">
            Nuestros Precios y Ofertas
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Encuentra el plan perfecto para disfrutar del fútbol con amigos y
            familia
          </p>
        </motion.div>

        {/* Contenedor principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tarjeta de Horarios Regulares */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-Primary-light transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-Primary-dark/20 rounded-lg">
                <Clock className="text-Primary-light" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">
                Horarios Regulares
              </h3>
            </div>

            <ul className="space-y-4">
              {pricingData.regular.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-700/50"
                >
                  <span className="text-gray-300">{item.time}</span>
                  <span className="font-medium text-white">{item.price}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-sm text-gray-400">
              * Precios por hora para equipos de hasta 10 personas
            </div>
          </motion.div>

          {/* Tarjeta de Escuelita de Fútbol */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Trophy className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">
                Escuelita de Fútbol
              </h3>
            </div>

            <p className="text-gray-300 mb-6">
              {pricingData.soccerSchool.description}
            </p>

            <ul className="space-y-4 mb-6">
              {pricingData.soccerSchool.packages.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-700/50"
                >
                  <span className="text-gray-300">{item.name}</span>
                  <span className="font-medium text-green-400">
                    {item.price}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">
                Beneficios incluidos:
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {pricingData.soccerSchool.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="text-green-400 mt-0.5" size={16} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Tarjeta de Cumpleaños */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Cake className="text-yellow-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">
                Paquetes de Cumpleaños
              </h3>
            </div>

            <div className="mb-8">
              <div className="bg-yellow-500/10 p-4 rounded-lg mb-4 border border-yellow-500/30">
                <h4 className="font-bold text-yellow-400 mb-2">
                  Paquete Básico
                </h4>
                <p className="text-2xl font-bold text-white mb-3">
                  {pricingData.birthdays.basic.price}
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  {pricingData.birthdays.basic.includes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle
                        className="text-yellow-400 mt-0.5"
                        size={16}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                <h4 className="font-bold text-yellow-400 mb-2">
                  Paquete Premium
                </h4>
                <p className="text-2xl font-bold text-white mb-3">
                  {pricingData.birthdays.premium.price}
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  {pricingData.birthdays.premium.includes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle
                        className="text-yellow-400 mt-0.5"
                        size={16}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              * Todos los paquetes incluyen árbitro y seguro básico
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
