"use client";

import { User } from "@/services/user/user";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, User as UserIcon, Clock, ArrowLeft, Tag, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import dateLocal from "@/utils/dateLocal";
import { deleteReserve, updateReserveStatus } from "@/services/reserve/reserve";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Import new components
import { PlayerHeader } from "./components/PlayerHeader";
import { UpcomingBookings } from "./components/UpcomingBookings";
import { BookingHistory } from "./components/BookingHistory";
import { ProfileForm } from "./components/ProfileForm";
import { FixedSchedules } from "./components/FixedSchedules";

interface PlayerProfileProps {
  userData: User;
}

export default function PlayerProfile({ userData }: PlayerProfileProps) {
  const router = useRouter();
  const [reserves, setReserves] = useState(userData?.reserves || []);

  // Calculate dates
  const today = dateLocal();
  today.setUTCHours(0, 0, 0, 0);

  // Split reserves into active and history
  const { activeReserves, historyReserves } = useMemo(() => {
    const cancelledStatuses = ["RECHAZADO", "CANCELADO"];
    const active = reserves.filter(
      (reserve) => new Date(reserve.date) >= today && !cancelledStatuses.includes(reserve.status)
    );
    const history = reserves.filter(
      (reserve) => new Date(reserve.date) < today || cancelledStatuses.includes(reserve.status)
    );
    return { activeReserves: active, historyReserves: history };
  }, [reserves, today]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalReserves = reserves.length;
    const completedReserves = historyReserves.filter((res) => res.status === "COMPLETADO").length;
    const activeReservesCount = activeReserves.length;

    // Calculate reliability score (ejemplo simple)
    const reliabilityScore =
      totalReserves > 0 ? Math.round((completedReserves / totalReserves) * 100) : 0;

    return {
      totalReserves,
      completedReserves,
      activeReserves: activeReservesCount,
      reliabilityScore,
    };
  }, [reserves, activeReserves, historyReserves]);

  const handleCancelBooking = async (id: string) => {
    try {
      const result = await updateReserveStatus(id, "CANCELADO");
      if (result.success) {
        toast.success("Reserva cancelada exitosamente");
        // Actualizar el status localmente en vez de eliminar
        setReserves(reserves.map((reserve) =>
          reserve.id === id ? { ...reserve, status: "CANCELADO" } : reserve
        ));
      } else {
        toast.error(result.error || "Error al cancelar la reserva");
      }
    } catch (error) {
      toast.error("Ocurrió un error al cancelar la reserva");
    }
  };

  const handleUpdateProfile = async (data: any) => {
    // TODO: Implementar actualización con API
    console.log("Actualizar perfil:", data);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Back Button - Fixed Top Left on Mobile */}
      <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-lg border-b border-white/10 md:hidden">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/`)}
            className="text-white hover:bg-white/10 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
        {/* Desktop Back Button */}
        <div className="hidden md:block mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/`)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al inicio
          </Button>
        </div>

        {/* Player Header */}
        <div className="mb-6 sm:mb-8">
          <PlayerHeader user={userData} stats={stats} />
        </div>

        {/* Mobile-First Tabs Navigation */}
        <Tabs defaultValue="upcoming" className="space-y-4 sm:space-y-6">
          {/* Tabs List - Full Width on Mobile, Sticky */}
          <div className="sticky top-14 md:top-4 z-10 bg-Primary-darker/95 backdrop-blur-lg -mx-4 px-4 py-3 border-y border-Primary/30 md:mx-0 md:px-0 md:border-0 md:bg-transparent md:backdrop-blur-none">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 p-1 h-auto">
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-Primary data-[state=active]:text-white text-white/70 hover:text-white text-xs sm:text-sm py-2 sm:py-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
              >
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Próximos</span>
                <span className="sm:hidden">Próx.</span>
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-Primary data-[state=active]:text-white text-white/70 hover:text-white text-xs sm:text-sm py-2 sm:py-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Historial</span>
                <span className="sm:hidden">Hist.</span>
              </TabsTrigger>

              <TabsTrigger
                value="fixed"
                className="data-[state=active]:bg-Primary data-[state=active]:text-white text-white/70 hover:text-white text-xs sm:text-sm py-2 sm:py-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Fijos</span>
                <span className="sm:hidden">Fijos</span>
              </TabsTrigger>

              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-Primary data-[state=active]:text-white text-white/70 hover:text-white text-xs sm:text-sm py-2 sm:py-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
              >
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Perfil</span>
                <span className="sm:hidden">Perfil</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="pb-20 md:pb-8">
            {/* Upcoming Bookings */}
            <TabsContent value="upcoming" className="mt-0 pt-4">
              <UpcomingBookings reserves={activeReserves} onCancelBooking={handleCancelBooking} />
            </TabsContent>

            {/* Booking History */}
            <TabsContent value="history" className="mt-0">
              <BookingHistory reserves={historyReserves} />
            </TabsContent>

            {/* Fixed Schedules */}
            <TabsContent value="fixed" className="mt-0">
              <FixedSchedules schedules={userData.fixedSchedules} />
            </TabsContent>

            {/* Profile Form */}
            <TabsContent value="profile" className="mt-0 space-y-6">
              <ProfileForm user={userData} onUpdate={handleUpdateProfile} />

              {/* Promociones usadas */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4 sm:p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-purple-400" />
                  Mis Descuentos
                </h3>

                {(() => {
                  const reservesWithPromo = reserves.filter(r => r.promotion);
                  const promoCount = reservesWithPromo.length;

                  if (promoCount === 0) {
                    return (
                      <div className="text-center py-6 text-white/50">
                        <Tag className="w-12 h-12 mx-auto mb-2 opacity-40" />
                        <p>Aún no has usado promociones</p>
                        <p className="text-sm">Las promociones aplicadas aparecerán aquí</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500 text-white rounded-lg">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-purple-300">Promociones usadas</p>
                            <p className="text-sm text-purple-400">{promoCount} {promoCount === 1 ? 'vez' : 'veces'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {reservesWithPromo.slice(0, 5).map((reserve) => (
                          <div
                            key={reserve.id}
                            className="flex items-center justify-between py-2 px-3 bg-purple-500/5 rounded-lg border border-purple-500/10"
                          >
                            <span className="text-sm font-medium text-purple-300">
                              {reserve.promotion?.name}
                            </span>
                            <span className="text-xs text-purple-400">
                              {format(new Date(reserve.date), "dd MMM", { locale: es })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
