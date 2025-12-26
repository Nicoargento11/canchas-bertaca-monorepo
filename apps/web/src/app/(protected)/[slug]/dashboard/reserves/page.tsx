"use client";
import { useState, useEffect, useRef, JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  CheckCircle2,
  AlertCircle,
  CircleX,
  Hand,
  MonitorCheck,
  CalendarDays,
  Clock9,
  ArrowBigDownDash,
  ArrowBigUpDash,
  Icon,
  User,
  Mail,
  Phone,
  DollarSign,
  CreditCard,
  Globe,
  Trophy,
  GraduationCap,
  PartyPopper,
  Repeat,
  HelpCircle,
  Gift,
} from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { usePathname } from "next/navigation";

import formatDateUTC from "@/utils/formatDateUtc";
import { getPaginatedReserves, Reserve, Status, ReserveType } from "@/services/reserve/reserve";
import { soccerPitch } from "@lucide/lab";
import { DashboardHeader } from "../DashboardHeader";
import { getComplexBySlug } from "@/services/complex/complex";

const statusConfig: Record<Status, { label: string; className: string; icon: any }> = {
  APROBADO: {
    label: "Aprobado",
    className: "bg-Success/15 text-Success hover:bg-Success/25 border-Success/20",
    icon: CheckCircle2,
  },
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-Warning/15 text-Warning hover:bg-Warning/25 border-Warning/20",
    icon: AlertCircle,
  },
  RECHAZADO: {
    label: "Rechazado",
    className: "bg-Error/15 text-Error hover:bg-Error/25 border-Error/20",
    icon: CircleX,
  },
  CANCELADO: {
    label: "Cancelado",
    className: "bg-Error/15 text-Error hover:bg-Error/25 border-Error/20",
    icon: CircleX,
  },
  COMPLETADO: {
    label: "Completado",
    className: "bg-Success/15 text-Success hover:bg-Success/25 border-Success/20",
    icon: CheckCircle2,
  },
};

const reserveTypeConfig: Record<ReserveType, { label: string; className: string; icon: any }> = {
  MANUAL: {
    label: "Manual",
    className: "bg-gray-100 text-gray-700 border-gray-200",
    icon: Hand,
  },
  FIJO: {
    label: "Fijo",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Repeat,
  },
  ONLINE: {
    label: "Online",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Globe,
  },
  TORNEO: {
    label: "Torneo",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    icon: Trophy,
  },
  ESCUELA: {
    label: "Escuela",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: GraduationCap,
  },
  EVENTO: {
    label: "Evento",
    className: "bg-pink-50 text-pink-700 border-pink-200",
    icon: PartyPopper,
  },
  OTRO: {
    label: "Otro",
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: HelpCircle,
  },
};

const ITEMS_PER_PAGE = 10;

const PageDashboardReserves = () => {
  const pathname = usePathname();
  const slug = pathname.split("/")[1]; // Extraer slug de /[slug]/dashboard/reserves

  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalReserves, setTotalReserves] = useState(0);
  const [complexId, setComplexId] = useState<string | null>(null);
  const observerTarget = useRef(null);

  // Obtener el complexId desde el slug
  useEffect(() => {
    const fetchComplex = async () => {
      if (slug) {
        const { data: complex } = await getComplexBySlug(slug);
        if (complex) {
          setComplexId(complex.id);
        }
      }
    };
    fetchComplex();
  }, [slug]);

  // Carga inicial de datos
  useEffect(() => {
    const loadInitialData = async () => {
      if (!complexId) return;

      setIsLoading(true);
      const { success, data, error } = await getPaginatedReserves(1, ITEMS_PER_PAGE, complexId);
      if (success && data) {
        setReserves(data.reserves);
        setTotalReserves(data.total);
        setHasMore(data.reserves.length === ITEMS_PER_PAGE);
      } else {
        console.error("Error loading initial data:", error);
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, [complexId]);

  // Carga más datos cuando se llega al final
  const loadMoreData = async () => {
    if (!hasMore || isLoading || !complexId) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const { success, data } = await getPaginatedReserves(nextPage, ITEMS_PER_PAGE, complexId);

    if (success && data && data.reserves.length > 0) {
      setReserves((prev) => [...prev, ...data.reserves]);
      setPage(nextPage);
      setHasMore(data.reserves.length === ITEMS_PER_PAGE);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  };

  // Configuración del Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreData();
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoading]);

  return (
    <div className="w-full p-4 space-y-4">
      <DashboardHeader title="Gestión de Reservas" />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">{reserves.length}</span> de{" "}
          <span className="font-medium text-foreground">{totalReserves}</span> reservas
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableCell className="font-medium text-muted-foreground">Cliente</TableCell>
              <TableCell className="font-medium text-muted-foreground">Detalles</TableCell>
              <TableCell className="font-medium text-muted-foreground text-center">
                Estado
              </TableCell>
              <TableCell className="font-medium text-muted-foreground">Pago</TableCell>
              <TableCell className="font-medium text-muted-foreground text-center">
                Origen
              </TableCell>
              <TableCell className="font-medium text-muted-foreground text-center">
                Promo
              </TableCell>
              <TableCell className="font-medium text-muted-foreground text-right">Fechas</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reserves.map((reserve) => {
              const StatusIcon = statusConfig[reserve.status].icon;
              // Determinar el tipo de reserva, fallback a MANUAL si no existe o es null
              const type = reserve.reserveType || "MANUAL";
              const typeConfig = reserveTypeConfig[type] || reserveTypeConfig["MANUAL"];
              const TypeIcon = typeConfig.icon;

              const pendingAmount = (reserve.price || 0) - (reserve.reservationAmount || 0);

              return (
                <TableRow key={reserve.id} className="hover:bg-gray-50/50">
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <User className="h-4 w-4 text-gray-500" />
                        {reserve.clientName || reserve.user?.name || "Sin nombre"}
                      </div>
                      {reserve.user?.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {reserve.user.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {reserve.phone || "Sin teléfono"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarDays className="h-4 w-4 text-Primary" />
                        {formatDateUTC(new Date(reserve.date).toUTCString())}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock9 className="h-3 w-3" />
                        {reserve.schedule}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon iconNode={soccerPitch} className="h-3 w-3" />
                        Cancha {reserve.court.name}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="align-top text-center">
                    <Badge
                      variant="outline"
                      className={`gap-1.5 pr-2.5 pl-1.5 py-0.5 font-normal ${statusConfig[reserve.status].className
                        }`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusConfig[reserve.status].label}
                    </Badge>
                  </TableCell>

                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <DollarSign className="h-4 w-4 text-gray-500" />${reserve.price}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pagado:{" "}
                        <span className="text-Success font-medium">
                          ${reserve.reservationAmount}
                        </span>
                      </div>
                      {pendingAmount > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Pendiente:{" "}
                          <span className="text-Error font-medium">${pendingAmount}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="align-top text-center">
                    <Badge
                      variant="secondary"
                      className={`gap-1 font-normal ${typeConfig.className}`}
                    >
                      <TypeIcon className="h-3 w-3" />
                      {typeConfig.label}
                    </Badge>
                  </TableCell>

                  <TableCell className="align-top text-center">
                    {reserve.promotion ? (
                      <Badge
                        variant="outline"
                        className="gap-1 font-normal bg-amber-50 text-amber-700 border-amber-200"
                      >
                        <Gift className="h-3 w-3" />
                        {reserve.promotion.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="align-top text-right">
                    <div className="flex flex-col gap-1 items-end text-xs text-muted-foreground">
                      <div className="flex items-center gap-1" title="Creado">
                        <ArrowBigUpDash className="h-3 w-3 text-gray-400" />
                        {new Date(reserve.createdAt).toLocaleDateString("es-AR")}
                      </div>
                      <div className="flex items-center gap-1" title="Actualizado">
                        <ArrowBigDownDash className="h-3 w-3 text-gray-400" />
                        {new Date(reserve.updatedAt).toLocaleDateString("es-AR")}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            <tr ref={observerTarget} className="h-2"></tr>
          </TableBody>
        </Table>
      </div>

      {isLoading && (
        <div className="w-full flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Primary"></div>
        </div>
      )}

      {!hasMore && reserves.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No hay más reservas para mostrar
        </div>
      )}
    </div>
  );
};

export default PageDashboardReserves;
