"use client";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

import {
  UserCircle2,
  Clock9,
  UserRound,
  Mail,
  Phone,
  Shield,
  UserPlus,
  History,
  Clock,
  CalendarDays,
  Activity,
  TrendingUp,
  Award,
  MapPin,
} from "lucide-react";

import { useEffect, useState } from "react";
import { ReserveItem } from "./reserveItem";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import dateLocal from "@/utils/dateLocal";
import { Role, User } from "@/services/user/user";
import { ButtonBack } from "./ButtonBack";

interface ProfileProps {
  userData: User;
  slug: string;
}

const Profile = ({ userData, slug }: ProfileProps) => {
  const [reserves, setReservas] = useState(userData?.reserves);

  const deleteReserve = (id: string) => {
    if (reserves) {
      setReservas(reserves.filter((reserve) => reserve.id !== id));
    }
  };

  const today = dateLocal();
  today.setUTCHours(0, 0, 0, 0);
  const todayFormat = today;
  const activeReserves = reserves?.filter(
    (reserve) => new Date(reserve.date) >= todayFormat && reserve.status !== "RECHAZADO"
  );

  const historyReserves = reserves?.filter(
    (reserve) => new Date(reserve.date) < todayFormat || reserve.status === "RECHAZADO"
  );

  useEffect(() => {
    setReservas(userData?.reserves || []);
  }, [userData]);

  const totalReserves = reserves?.length || 0;
  const completedReserves =
    historyReserves?.filter((res) => res.status === "COMPLETADO")?.length || 0;
  const memberSince = userData?.createdAt
    ? format(new Date(userData.createdAt), "MMMM yyyy", { locale: es })
    : "N/A";

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-Error text-white";
      case "ADMIN":
        return "bg-Warning text-white";
      case "USUARIO":
        return "bg-Primary text-white";
      default:
        return "bg-Neutral text-Neutral-dark";
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "COMPLEJO_ADMIN":
        return "complejo admin";
      case "RECEPCION":
        return "recepcionista";
      case "USUARIO":
        return "Usuario";
      default:
        return "Sin rol";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-Primary-darker via-Primary to-Primary-light relative">
      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header del perfil */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8 overflow-hidden">
            <div className="relative bg-gradient-to-r from-Primary to-Primary-light h-32">
              {/* Botón de regreso dentro del header */}
              <div className="absolute top-4 left-4">
                <ButtonBack slug={slug} />
              </div>
            </div>
            <div className="relative px-8 pb-8">
              {/* Avatar */}
              <div className="absolute -top-16 left-8">
                {userData?.image ? (
                  <Image
                    alt="Profile"
                    width={120}
                    height={120}
                    src={userData.image}
                    className="rounded-full border-4 border-white shadow-lg bg-white"
                  />
                ) : (
                  <div className="flex items-center justify-center w-[120px] h-[120px] bg-Neutral-light rounded-full border-4 border-white shadow-lg">
                    <UserCircle2 size={60} className="text-Primary" />
                  </div>
                )}
              </div>

              {/* Información del usuario */}
              <div className="pt-16 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-Neutral-dark">
                      {userData?.name || "Usuario sin nombre"}
                    </h1>
                    <Badge className={`${getRoleColor(userData?.role || "")} px-3 py-1`}>
                      {getRoleLabel(userData?.role || "")}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-Neutral-dark/70">
                    <div className="flex items-center gap-2">
                      <Mail className="text-Primary" size={18} />
                      <span>{userData?.email || "Correo no disponible"}</span>
                    </div>

                    {userData?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="text-Primary" size={18} />
                        <span>{userData.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <UserPlus className="text-Primary" size={18} />
                      <span>Miembro desde {memberSince}</span>
                    </div>
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="flex gap-6 mt-6 md:mt-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-Primary">{totalReserves}</div>
                    <div className="text-sm text-Neutral-dark/70">Total reservas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-Success">{completedReserves}</div>
                    <div className="text-sm text-Neutral-dark/70">Completadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-Warning">
                      {activeReserves?.length || 0}
                    </div>
                    <div className="text-sm text-Neutral-dark/70">Activas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido con tabs */}
          <Tabs defaultValue="reserves" className="space-y-6">
            <TabsList className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg p-1">
              <TabsTrigger
                value="reserves"
                className="data-[state=active]:bg-Primary data-[state=active]:text-white px-6 py-3"
              >
                <Clock9 size={20} className="mr-2" />
                Mis Reservas
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-Primary data-[state=active]:text-white px-6 py-3"
              >
                <Activity size={20} className="mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="data-[state=active]:bg-Primary data-[state=active]:text-white px-6 py-3"
              >
                <UserRound size={20} className="mr-2" />
                Mi Perfil
              </TabsTrigger>
            </TabsList>

            {/* Tab de Reservas */}
            <TabsContent value="reserves" className="space-y-6">
              <Tabs defaultValue="activas" className="space-y-4">
                <TabsList className="bg-white/90 backdrop-blur-sm">
                  <TabsTrigger
                    value="activas"
                    className="data-[state=active]:bg-Primary data-[state=active]:text-white"
                  >
                    <CalendarDays size={16} className="mr-2" />
                    Reservas Activas ({activeReserves?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="historial"
                    className="data-[state=active]:bg-Primary data-[state=active]:text-white"
                  >
                    <History size={16} className="mr-2" />
                    Historial ({historyReserves?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="activas">
                  <div className="grid gap-4">
                    {activeReserves && activeReserves.length > 0 ? (
                      activeReserves.map((reserve) => (
                        <div
                          key={reserve.id}
                          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
                        >
                          <ReserveItem reserve={reserve} deleteReserve={deleteReserve} />
                        </div>
                      ))
                    ) : (
                      <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <CalendarDays className="text-Primary/50 mb-4" size={48} />
                          <h3 className="text-lg font-semibold text-Neutral-dark mb-2">
                            No tienes reservas activas
                          </h3>
                          <p className="text-Neutral-dark/70 text-center">
                            Cuando realices una reserva, aparecerá aquí.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="historial">
                  <div className="grid gap-4">
                    {historyReserves && historyReserves.length > 0 ? (
                      historyReserves.map((reserve) => (
                        <div
                          key={reserve.id}
                          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
                        >
                          <ReserveItem reserve={reserve} deleteReserve={deleteReserve} />
                        </div>
                      ))
                    ) : (
                      <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <History className="text-Primary/50 mb-4" size={48} />
                          <h3 className="text-lg font-semibold text-Neutral-dark mb-2">
                            Sin historial de reservas
                          </h3>
                          <p className="text-Neutral-dark/70 text-center">
                            Tu historial de reservas aparecerá aquí.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Tab de Dashboard */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Reservas Activas"
                  value={activeReserves?.length || 0}
                  icon={<CalendarDays className="h-6 w-6" />}
                  trend="+12%"
                  trendUp={true}
                  color="bg-gradient-to-br from-Primary to-Primary-dark"
                />

                <StatsCard
                  title="Total Reservas"
                  value={totalReserves}
                  icon={<Activity className="h-6 w-6" />}
                  trend="+5%"
                  trendUp={true}
                  color="bg-gradient-to-br from-Success to-Success-dark"
                />

                <StatsCard
                  title="Horarios Fijos"
                  value={userData?.fixedSchedules?.length || 0}
                  icon={<Clock className="h-6 w-6" />}
                  trend="0%"
                  trendUp={false}
                  color="bg-gradient-to-br from-Warning to-Warning-dark"
                />

                <StatsCard
                  title="Reservas Completadas"
                  value={completedReserves}
                  icon={<Award className="h-6 w-6" />}
                  trend="+8%"
                  trendUp={true}
                  color="bg-gradient-to-br from-Info to-Info-dark"
                />
              </div>

              {/* Gráfico o información adicional */}
              <Card className="mt-6 bg-white/90 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-Neutral-dark">
                    <TrendingUp className="h-5 w-5 text-Primary" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reserves?.slice(0, 5).map((reserve, index) => (
                      <div
                        key={reserve.id}
                        className="flex items-center justify-between py-2 border-b border-Neutral/30 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-Primary"></div>
                          <span className="text-Neutral-dark">
                            Reserva en Cancha {reserve.court.name}
                          </span>
                        </div>
                        <span className="text-sm text-Neutral-dark/70">
                          {format(new Date(reserve.date), "dd MMM", { locale: es })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Perfil */}
            <TabsContent value="account">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información personal */}
                <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-Neutral-dark">
                      <UserRound className="h-5 w-5 text-Primary" />
                      Información Personal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <UserDetailCard
                        icon={<UserRound className="h-5 w-5" />}
                        label="Nombre completo"
                        value={userData?.name || "No disponible"}
                      />
                      <UserDetailCard
                        icon={<Mail className="h-5 w-5" />}
                        label="Correo electrónico"
                        value={userData?.email || "No disponible"}
                      />
                      <UserDetailCard
                        icon={<Phone className="h-5 w-5" />}
                        label="Teléfono"
                        value={userData?.phone || "No disponible"}
                      />
                      <UserDetailCard
                        icon={<Shield className="h-5 w-5" />}
                        label="Rol del usuario"
                        value={getRoleLabel(userData?.role || "")}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Resumen de estadísticas */}
                <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-Neutral-dark">
                      <Activity className="h-5 w-5 text-Primary" />
                      Resumen de Actividad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-Primary/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-Primary" />
                        <span className="text-sm font-medium text-Neutral-dark">
                          Total reservas
                        </span>
                      </div>
                      <span className="font-bold text-Primary">{totalReserves}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-Success/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-Success" />
                        <span className="text-sm font-medium text-Neutral-dark">Completadas</span>
                      </div>
                      <span className="font-bold text-Success">{completedReserves}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-Warning/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-Warning" />
                        <span className="text-sm font-medium text-Neutral-dark">
                          Horarios fijos
                        </span>
                      </div>
                      <span className="font-bold text-Warning">
                        {userData?.fixedSchedules?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-Info/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-Info" />
                        <span className="text-sm font-medium text-Neutral-dark">Miembro desde</span>
                      </div>
                      <span className="font-bold text-Info text-sm">{memberSince}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;

// Componentes auxiliares
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp: boolean;
  color: string;
}

const StatsCard = ({ title, value, icon, trend, trendUp, color }: StatsCardProps) => (
  <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color} text-white`}>{icon}</div>
        {/* <div className={`text-sm font-medium ${trendUp ? "text-Success" : "text-Neutral-dark/70"}`}>
          {trendUp ? "↗" : "→"} {trend}
        </div> */}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-Neutral-dark">{value}</div>
        <div className="text-sm text-Neutral-dark/70">{title}</div>
      </div>
    </CardContent>
  </Card>
);

interface UserDetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const UserDetailCard = ({ icon, label, value }: UserDetailCardProps) => (
  <div className="p-4 bg-Neutral-light/50 rounded-lg border border-Neutral/20">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-full bg-Primary/10 text-Primary">{icon}</div>
      <span className="text-sm font-medium text-Neutral-dark/70">{label}</span>
    </div>
    <p className="font-semibold text-Neutral-dark ml-11">{value}</p>
  </div>
);
