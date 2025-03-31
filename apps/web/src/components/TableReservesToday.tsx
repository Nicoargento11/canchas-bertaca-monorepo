"use client";

// import beerService from "@/utils/beerService";
// import priceDiscount from "@/utils/priceDiscount";

import { Check, X, Clock9 } from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";

import { TurnByDay } from "@/services/reserves/reserves";

const tableHead = ["Cancha 1", "Cancha 2", "Cancha 3", "Cancha 4"];
const courts = [1, 2, 3, 4];

interface TableReservesTodayProps {
  dayReserves: TurnByDay | null;
}

const TableReservesToday: React.FC<TableReservesTodayProps> = ({
  dayReserves,
}) => {
  return (
    <div className="bg-Neutral-light rounded-lg shadow-2xl overflow-auto border-2 border-Neutral">
      <table className="w-full text-left table-fixed">
        <thead>
          <tr>
            <th className="sticky top-0 bg-gradient-to-r from-Primary-dark to-Primary text-Neutral-light p-4 z-10">
              <h6 className="font-semibold leading-none text-center hidden md:block">
                Horarios
              </h6>
              <div className="flex justify-center">
                <Clock9
                  className="block md:hidden text-Neutral-light"
                  size={30}
                />
              </div>
            </th>
            {tableHead.map((head, index) => (
              <th
                key={head}
                className="sticky top-0 bg-gradient-to-r from-Primary-dark to-Primary text-Neutral-light p-4 z-10 text-center"
              >
                <div className="flex flex-col items-center md:hidden">
                  <div className="relative text-Primary-light opacity-90">
                    <GiSoccerField size={40} />
                  </div>
                  <div className="pt-2 absolute text-Neutral-light">
                    <p className="font-bold">{index + 1}</p>
                  </div>
                </div>
                <h6 className="font-semibold leading-none hidden md:block">
                  {head}
                </h6>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dayReserves &&
            dayReserves.map((turn) => (
              <tr key={turn.schedule} className="even:bg-Neutral/50">
                <td className="h-[80px] text-center font-semibold hidden md:flex md:justify-center md:items-center">
                  {turn.schedule}
                </td>
                <td className="h-[80px] text-center font-semibold flex justify-center md:hidden items-center">
                  {turn.schedule.split(" ")[0]}
                </td>
                {courts.map((court, index) =>
                  turn.court.includes(court) ? (
                    <td className="border-2 w-[100px] h-[80px]" key={index}>
                      <div className="bg-gradient-to-br from-Primary-light to-Primary text-blue-950 p-4 w-full h-full rounded-lg flex flex-col justify-center items-center font-bold text-lg relative shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex">
                          {/* {priceDiscount(turn.schedule) && (
                            <Tag size={25} className="text-Primary-dark" />
                          )} */}
                          {/* {beerService(turn.schedule) && (
                            <CupSoda size={25} className="text-Primary-dark" />
                          )} */}
                        </div>
                        <p className="hidden md:block">Disponible</p>
                        <Check className="block md:hidden" strokeWidth={3} />
                      </div>
                    </td>
                  ) : (
                    <td className="border-2 w-[100px] h-[80px]" key={index}>
                      <div className="bg-gradient-to-br from-Error to-Error-dark text-red-900 rounded-lg w-full h-full flex flex-col justify-center items-center p-2 font-bold text-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                        <p className="hidden md:block">Reservado</p>
                        <X size={25} className="block md:hidden" />
                      </div>
                    </td>
                  )
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableReservesToday;
