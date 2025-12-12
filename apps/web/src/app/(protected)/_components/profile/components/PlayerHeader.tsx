"use client";

import { User } from "@/services/user/user";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Award, TrendingUp } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PlayerHeaderProps {
  user: User;
  stats: {
    totalReserves: number;
    completedReserves: number;
    activeReserves: number;
    reliabilityScore: number;
  };
}

export const PlayerHeader = ({ user, stats }: PlayerHeaderProps) => {
  const memberSince = user?.createdAt
    ? format(new Date(user.createdAt), "MMM yyyy", { locale: es })
    : "N/A";

  const getReliabilityBadge = (score: number) => {
    if (score >= 95) return { label: "Elite", color: "bg-Warning" };
    if (score >= 85) return { label: "Confiable", color: "bg-Success" };
    if (score >= 70) return { label: "Bueno", color: "bg-Primary" };
    return { label: "Nuevo", color: "bg-Neutral" };
  };

  const reliability = getReliabilityBadge(stats.reliabilityScore);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-white/10">
      {/* Header Background Pattern */}
      <div className="relative h-24 sm:h-32 bg-gradient-to-r from-Primary to-Primary-light">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
      </div>

      <div className="relative px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
        {/* Avatar */}
        <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6 md:left-8">
          {user?.image ? (
            <Image
              alt="Profile"
              width={96}
              height={96}
              src={user.image}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-gray-900 shadow-2xl bg-gray-900 object-cover"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-Primary to-Primary-dark rounded-full border-4 border-gray-900 shadow-2xl flex items-center justify-center">
              <span className="text-3xl sm:text-5xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}

          {/* Reliability Badge on Avatar */}
          <div
            className={`absolute -bottom-1 -right-1 ${reliability.color} text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-gray-900 shadow-lg`}
          >
            {reliability.label}
          </div>
        </div>

        {/* User Info */}
        <div className="pt-14 sm:pt-20 space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
              {user?.name || "Jugador"}
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge className="bg-Primary/20 text-Primary-light border-Primary/30 text-xs sm:text-sm backdrop-blur-sm">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Desde {memberSince}
              </Badge>
              <Badge className="bg-Success/20 text-Success-light border-Success/30 text-xs sm:text-sm backdrop-blur-sm">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {stats.reliabilityScore}% asistencia
              </Badge>
            </div>
          </div>

          {/* Contact Info - Horizontal on Desktop, Vertical on Mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-Primary flex-shrink-0" />
              <span className="truncate">{user?.email || "Sin email"}</span>
            </div>

            {user?.phone && (
              <>
                <span className="hidden sm:inline text-white/30">•</span>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-Primary flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              </>
            )}
          </div>

          {/* Stats Row - Mobile First */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/10">
            <StatItem label="Partidos" value={stats.totalReserves} icon="" />
            <StatItem label="Completados" value={stats.completedReserves} icon="" highlight />
            <StatItem label="Activos" value={stats.activeReserves} icon="" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatItemProps {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}

const StatItem = ({ label, value, icon, highlight }: StatItemProps) => (
  <div
    className={`text-center p-3 rounded-xl ${highlight ? "bg-Success/10 border border-Success/30" : "bg-white/5"}`}
  >
    <div className="text-xl sm:text-2xl mb-1">{icon}</div>
    <div
      className={`text-2xl sm:text-3xl font-black ${highlight ? "text-Success" : "text-Primary"}`}
    >
      {value}
    </div>
    <div className="text-xs sm:text-sm text-white/70 font-medium">{label}</div>
  </div>
);
