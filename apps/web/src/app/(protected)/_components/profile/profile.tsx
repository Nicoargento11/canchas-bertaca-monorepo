"use client";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

import { UserCircle2, Clock9, UserRound, Mail, Phone } from "lucide-react";

import { useEffect, useState } from "react";
import { ButtonBack } from "@/components/ButtonBack";
import { ReserveItem } from "./reserveItem";
import { User } from "@/services/users/users";
import { format } from "date-fns";
import dateLocal from "@/utils/dateLocal";

interface ProfileProps {
  userData: User | null;
}
const Profile = ({ userData }: ProfileProps) => {
  // useState<Reserva[] | null>(userData?.Reserves ?? null);
  const [reserves, setReservas] = useState(userData?.Reserve);
  console.log(userData?.FixedSchedule);

  const deleteReserve = (id: string) => {
    if (reserves) {
      setReservas(reserves.filter((reserve) => reserve.id !== id));
    }
  };

  const today = dateLocal();
  today.setUTCHours(0, 0, 0, 0);
  const todayFormat = today.toISOString();
  const activeReserves = reserves?.filter(
    (reserve) => reserve.date >= todayFormat && reserve.status !== "RECHAZADO"
  );

  const historyReserves = reserves?.filter(
    (reserve) => reserve.date < todayFormat || reserve.status === "RECHAZADO"
  );

  useEffect(() => {
    setReservas(userData?.Reserve || []);
  }, [userData]);

  return (
    <div className="relative flex justify-center border-gray-300 pt-5 bg-white border-2 rounded-xl w-full">
      <div className="absolute top-2 left-2">
        <ButtonBack />
      </div>
      <Tabs
        defaultValue="reserves"
        className="flex flex-col justify-center items-center w-full pb-5"
      >
        {/*1er tablist  reserva y perfil */}
        <TabsList className="bg-gray-200">
          <TabsTrigger className="px-2" value="reserves">
            <p className="flex items-center gap-1">
              <Clock9 className="text-Primary" size={20} /> Reservas
            </p>
          </TabsTrigger>
          <TabsTrigger className="px-2" value="account">
            <p className="flex items-center gap-1 font-semibold">
              <UserRound className="text-Complementary" size={20} /> Perfil
            </p>
          </TabsTrigger>
        </TabsList>
        {/* Datos del perfil */}
        <div className="flex flex-col justify-center items-center my-5">
          <div className="relative">
            {userData?.image ? (
              <Image
                alt="Profile"
                width={170}
                height={170}
                src={userData.image}
                className="rounded-full border-4 border-Primary shadow-lg"
              />
            ) : (
              <div className="flex items-center justify-center w-[170px] h-[170px] bg-gray-200 rounded-full">
                <UserCircle2 size={100} className="text-gray-400" />
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="flex items-center justify-center gap-2 font-semibold text-xl">
              <UserRound className="text-Complementary" size={20} />
              {userData?.name || "Usuario sin nombre"}
            </p>

            <p className="flex items-center justify-center gap-2 text-gray-600">
              <Mail className="text-Complementary" size={20} />
              {userData?.email || "Correo no disponible"}
            </p>

            {userData?.phone && (
              <p className="flex items-center justify-center gap-2 text-gray-600">
                <Phone className="text-Complementary" size={20} />
                {userData.phone}
              </p>
            )}

            <span
              className={`inline-block mt-3 px-3 py-1 text-sm font-semibold text-white rounded-full ${
                userData?.role === "ADMIN"
                  ? "bg-red-500"
                  : userData?.role === "MODERADOR"
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
            >
              {userData?.role || "Sin rol"}
            </span>
          </div>
        </div>

        <Separator />
        {/*1er tabContent de reservas */}
        <TabsContent value="reserves" className="w-full">
          <Tabs
            className="flex flex-col justify-center items-center w-full"
            defaultValue="activas"
          >
            {/*2do tablist reserva activas e historial */}

            <TabsList className="">
              <TabsTrigger value="activas">Reservas activas</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>
            {/*2do tabContent de reservas activas */}
            <TabsContent
              value="activas"
              className="w-full flex flex-col justify-center items-center gap-3"
            >
              {reserves && reserves?.length > 0 ? (
                activeReserves && activeReserves?.length > 0 ? (
                  activeReserves.map((reserve) => (
                    <ReserveItem
                      key={reserve.id}
                      reserve={reserve}
                      deleteReserve={deleteReserve}
                    />
                  ))
                ) : (
                  <p>No tienes reservas activas</p>
                )
              ) : (
                <p>No tienes reservas</p>
              )}
            </TabsContent>
            {/*2do tabContent de reservas historial */}
            <TabsContent
              value="historial"
              className="w-full flex flex-col justify-center items-center gap-3"
            >
              {historyReserves && historyReserves?.length !== 0 ? (
                historyReserves.map((reserve) => (
                  <ReserveItem
                    key={reserve.id}
                    reserve={reserve}
                    deleteReserve={deleteReserve}
                  />
                ))
              ) : (
                <p>No tienes reservas</p>
              )}
            </TabsContent>
          </Tabs>
          {/*1er tabContent de perfil */}
        </TabsContent>
        <TabsContent value="account">
          <div className="font-semibold text-lg text-center mb-4 text-Primary">
            Información del perfil
          </div>

          <div className="flex flex-col items-center gap-5 p-6 bg-Neutral-light rounded-xl shadow-md w-full">
            {/* Datos básicos del usuario */}
            {/* <div className="w-full space-y-3">
              <p className="flex items-center gap-2">
                <UserRound className="text-Complementary" size={20} />
                <span>
                  <strong>Nombre:</strong> {userData?.name || "No disponible"}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <Mail className="text-Complementary" size={20} />
                <span>
                  <strong>Email:</strong> {userData?.email || "No disponible"}
                </span>
              </p>

              {userData?.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="text-Complementary" size={20} />
                  <span>
                    <strong>Teléfono:</strong> {userData.phone}
                  </span>
                </p>
              )}

              <p className="flex items-center gap-2">
                <UserCircle2 className="text-Complementary" size={20} />
                <span>
                  <strong>Rol:</strong> {userData?.role || "Sin rol"}
                </span>
              </p>

              <Separator />
            </div> */}

            {/* Resumen de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="bg-Primary-light text-white p-4 rounded-lg text-center">
                <p className="text-lg font-bold">
                  {(activeReserves && activeReserves.length) || 0}
                </p>
                <p>Reservas activas</p>
              </div>

              <div className="bg-Accent-2 text-white p-4 rounded-lg text-center">
                <p className="text-lg font-bold">
                  {userData?.Reserve?.filter(
                    (res) => new Date(res.date) < new Date()
                  ).length || 0}
                </p>
                <p>Historial de reservas</p>
              </div>

              <div className="bg-Success text-white p-4 rounded-lg text-center">
                <p className="text-lg font-bold">
                  {userData?.FixedSchedule?.length || 0}
                </p>
                <p>Horarios fijos</p>
              </div>

              <div className="bg-Info text-white p-4 rounded-lg text-center">
                <p className="text-lg font-bold">
                  {userData?.createdAt
                    ? format(new Date(userData.createdAt), "dd/MM/yyyy")
                    : "No disponible"}
                </p>
                <p>Fecha de registro</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
