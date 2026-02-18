"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  CircleX,
  Hand,
  Globe,
  Trophy,
  GraduationCap,
  PartyPopper,
  Repeat,
  HelpCircle,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Phone,
  User,
  DollarSign,
  CreditCard,
  Clock9,
  Filter,
  Gift,
  Banknote,
  ArrowUpDown,
  Loader2,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import formatDateUTC from "@/utils/formatDateUtc";
import { getPaginatedReserves, Reserve, Status, ReserveType } from "@/services/reserve/reserve";
import { updatePayment, deletePayment, PaymentMethod } from "@/services/payment/payment";
import { getSession, SessionPayload } from "@/services/auth/session";
import { DashboardHeader } from "../DashboardHeader";
import { getComplexBySlug } from "@/services/complex/complex";

const statusConfig: Record<Status, { label: string; className: string; dotColor: string; icon: any }> = {
  APROBADO: {
    label: "Aprobado",
    className: "bg-green-50 text-green-700 border-green-200",
    dotColor: "bg-green-500",
    icon: CheckCircle2,
  },
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    icon: AlertCircle,
  },
  RECHAZADO: {
    label: "Rechazado",
    className: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-500",
    icon: CircleX,
  },
  CANCELADO: {
    label: "Cancelado",
    className: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-500",
    icon: CircleX,
  },
  COMPLETADO: {
    label: "Completado",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
    icon: CheckCircle2,
  },
};

const reserveTypeConfig: Record<string, { label: string; className: string; icon: any }> = {
  MANUAL: { label: "Manual", className: "bg-gray-100 text-gray-700 border-gray-200", icon: Hand },
  FIJO: { label: "Fijo", className: "bg-violet-50 text-violet-700 border-violet-200", icon: Repeat },
  ONLINE: { label: "Online", className: "bg-sky-50 text-sky-700 border-sky-200", icon: Globe },
  TORNEO: { label: "Torneo", className: "bg-orange-50 text-orange-700 border-orange-200", icon: Trophy },
  ESCUELA: { label: "Escuela", className: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: GraduationCap },
  EVENTO: { label: "Evento", className: "bg-pink-50 text-pink-700 border-pink-200", icon: PartyPopper },
  OTRO: { label: "Otro", className: "bg-gray-50 text-gray-600 border-gray-200", icon: HelpCircle },
};

const paymentMethodLabels: Record<string, { label: string; icon: any }> = {
  EFECTIVO: { label: "Efectivo", icon: Banknote },
  TARJETA_CREDITO: { label: "Tarjeta", icon: CreditCard },
  TRANSFERENCIA: { label: "Transfer.", icon: ArrowUpDown },
  MERCADOPAGO: { label: "MercadoPago", icon: DollarSign },
};

const ITEMS_PER_PAGE = 15;

const PageDashboardReserves = () => {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];

  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalReserves, setTotalReserves] = useState(0);
  const [complexId, setComplexId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editMethod, setEditMethod] = useState<string>("");
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const observerTarget = useRef(null);

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch session for role check
  useEffect(() => {
    getSession().then(setSession);
  }, []);

  // Get complexId from slug
  useEffect(() => {
    const fetchComplex = async () => {
      if (slug) {
        const { data: complex } = await getComplexBySlug(slug);
        if (complex) setComplexId(complex.id);
      }
    };
    fetchComplex();
  }, [slug]);

  const buildFilters = useCallback(() => {
    const filters: any = {};
    if (search.trim()) filters.search = search.trim();
    if (statusFilter) filters.status = statusFilter;
    if (typeFilter) filters.reserveType = typeFilter;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [search, statusFilter, typeFilter, dateFrom, dateTo]);

  // Fetch data — resets when filters change
  const fetchReserves = useCallback(
    async (pageNum: number, append = false) => {
      if (!complexId) return;
      setIsLoading(true);
      const { success, data } = await getPaginatedReserves(
        pageNum,
        ITEMS_PER_PAGE,
        complexId,
        buildFilters()
      );
      if (success && data) {
        setReserves((prev) => (append ? [...prev, ...data.reserves] : data.reserves));
        setTotalReserves(data.total);
        setHasMore(data.reserves.length === ITEMS_PER_PAGE);
        setPage(pageNum);
      }
      setIsLoading(false);
    },
    [complexId, buildFilters]
  );

  // Reset & fetch when filters change
  useEffect(() => {
    if (!complexId) return;
    setExpandedId(null);
    fetchReserves(1, false);
  }, [complexId, statusFilter, typeFilter, dateFrom, dateTo]);

  // Debounced search
  useEffect(() => {
    if (!complexId) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setExpandedId(null);
      fetchReserves(1, false);
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  // Load more
  const loadMore = () => {
    if (hasMore && !isLoading) fetchReserves(page + 1, true);
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) loadMore();
      },
      { threshold: 0.1 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isLoading, page]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = search || statusFilter || typeFilter || dateFrom || dateTo;

  return (
    <div className="w-full p-4 space-y-4">
      <DashboardHeader title="Gestión de Reservas" />

      {/* Search & Filters Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, teléfono, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Status Filter Chips */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Estado
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(statusConfig) as Status[]).map((s) => {
                  const cfg = statusConfig[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${statusFilter === s
                        ? cfg.className + " ring-2 ring-offset-1 ring-gray-300"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Type Filter Chips */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Tipo
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(reserveTypeConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setTypeFilter(typeFilter === key ? "" : key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${typeFilter === key
                      ? cfg.className + " ring-2 ring-offset-1 ring-gray-300"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                  Desde
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                  Hasta
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white text-sm"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-500">
                <X className="h-3 w-3 mr-1" /> Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          <span className="font-semibold text-gray-900">{totalReserves}</span> reservas encontradas
          {hasActiveFilters && (
            <span className="ml-2 text-xs text-blue-600 font-medium">(filtros activos)</span>
          )}
        </span>
        <span className="text-xs text-gray-400">Mostrando {reserves.length}</span>
      </div>

      {/* Reserves List */}
      <div className="space-y-2">
        {reserves.map((reserve) => {
          const isExpanded = expandedId === reserve.id;
          const type = reserve.reserveType || "MANUAL";
          const typeConfig = reserveTypeConfig[type] || reserveTypeConfig["MANUAL"];
          const TypeIcon = typeConfig.icon;
          const statusCfg = statusConfig[reserve.status];
          const StatusIcon = statusCfg.icon;

          // Real payment calculations
          const totalPaid =
            reserve.payment?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
          const pendingAmount = (reserve.price || 0) - totalPaid;
          const paymentCount = reserve.payment?.length || 0;

          return (
            <div
              key={reserve.id}
              className={`bg-white rounded-lg border overflow-hidden hover:shadow-sm transition-shadow border-l-[3px] ${reserve.status === "COMPLETADO" ? "border-l-blue-500" :
                reserve.status === "APROBADO" ? "border-l-emerald-500" :
                  reserve.status === "PENDIENTE" ? "border-l-amber-500" :
                    reserve.status === "CANCELADO" || reserve.status === "RECHAZADO" ? "border-l-red-400" :
                      "border-l-gray-300"
                } border-gray-200`}
            >
              {/* Main Row — clickable */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : reserve.id)}
                className="w-full text-left p-3 md:p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Client + Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate text-sm">
                        {reserve.clientName || reserve.user?.name || "Sin nombre"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5 flex-wrap">
                      <span>{formatDateUTC(new Date(reserve.date).toUTCString())}</span>
                      <span>·</span>
                      <span>{reserve.schedule}</span>
                      <span>·</span>
                      <span>C{reserve.court?.courtNumber || reserve.court?.name}</span>
                      <span>·</span>
                      <span className={`font-medium ${type === "FIJO" ? "text-violet-600" :
                        type === "EVENTO" ? "text-pink-600" :
                          type === "ONLINE" ? "text-sky-600" :
                            type === "ESCUELA" ? "text-cyan-600" :
                              type === "TORNEO" ? "text-orange-600" :
                                "text-gray-500"
                        }`}>{typeConfig.label}</span>
                    </div>
                  </div>

                  {/* Right: Price + Status text */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-sm text-gray-900">
                        ${(reserve.price || 0).toLocaleString()}
                      </div>
                      <div className={`text-[11px] font-medium ${reserve.status === "COMPLETADO" ? "text-blue-600" :
                        reserve.status === "APROBADO" && pendingAmount <= 0 ? "text-emerald-600" :
                          reserve.status === "APROBADO" ? "text-amber-600" :
                            reserve.status === "PENDIENTE" ? "text-amber-500" :
                              "text-red-500"
                        }`}>
                        {reserve.status === "COMPLETADO" ? "Completado" :
                          reserve.status === "APROBADO" && pendingAmount > 0 ? `Debe $${pendingAmount.toLocaleString()}` :
                            reserve.status === "APROBADO" ? "Pagado" :
                              statusCfg.label}
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 animate-in slide-in-from-top-1 duration-150">
                  {/* Info Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {/* Client Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-4 w-4 text-blue-500" />
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide">Cliente</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Nombre</span>
                          <span className="font-medium text-gray-900">{reserve.clientName || reserve.user?.name || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Teléfono</span>
                          <span className="font-medium text-gray-900">{reserve.phone || "—"}</span>
                        </div>
                        {reserve.user?.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-800 text-xs truncate max-w-[180px]">{reserve.user.email}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">ID</span>
                          <span className="font-mono text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{reserve.id.slice(0, 14)}...</span>
                        </div>
                      </div>
                    </div>

                    {/* Reserve Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-violet-500" />
                        <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wide">Reserva</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Fecha</span>
                          <span className="font-medium text-gray-900">{formatDateUTC(new Date(reserve.date).toUTCString())}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Horario</span>
                          <span className="font-medium text-gray-900">{reserve.schedule}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Cancha</span>
                          <span className="font-medium text-gray-900">{reserve.court?.courtNumber || reserve.court?.name}</span>
                        </div>
                        {reserve.promotion && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Promo</span>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-[10px]">
                              <Gift className="h-3 w-3" />
                              {reserve.promotion.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payments Section */}
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                        Pagos ({paymentCount})
                      </h4>
                    </div>
                    {paymentCount > 0 ? (
                      <div className="space-y-2">
                        {reserve.payment?.map((payment: any, idx: number) => {
                          const methodInfo = paymentMethodLabels[payment.method] || {
                            label: payment.method,
                            icon: DollarSign,
                          };
                          const MethodIcon = methodInfo.icon;
                          const isEditing = editingPaymentId === payment.id;
                          const isDeleting = deletingPaymentId === payment.id;

                          // Edit mode
                          if (isEditing) {
                            return (
                              <div
                                key={payment.id || idx}
                                className="bg-blue-50 rounded-lg border border-blue-200 px-3 py-3 space-y-2"
                              >
                                <div className="text-xs font-medium text-blue-700 mb-1">Editando pago</div>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    placeholder="Monto"
                                    className="h-8 text-sm bg-white"
                                  />
                                  <select
                                    value={editMethod}
                                    onChange={(e) => setEditMethod(e.target.value)}
                                    className="h-8 text-sm border rounded-md px-2 bg-white"
                                  >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA_CREDITO">Tarjeta</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                    <option value="MERCADOPAGO">MercadoPago</option>
                                    <option value="OTRO">Otro</option>
                                  </select>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setEditingPaymentId(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                    onClick={async () => {
                                      const amt = Number(editAmount);
                                      if (!amt || amt <= 0) {
                                        toast.error("El monto debe ser mayor a 0");
                                        return;
                                      }
                                      const { success } = await updatePayment(payment.id, {
                                        amount: amt,
                                        method: editMethod as PaymentMethod,
                                      });
                                      if (success) {
                                        toast.success("Pago actualizado");
                                        setEditingPaymentId(null);
                                        fetchReserves(1, false);
                                      } else {
                                        toast.error("Error al actualizar el pago");
                                      }
                                    }}
                                  >
                                    <Check className="h-3 w-3 mr-1" /> Guardar
                                  </Button>
                                </div>
                              </div>
                            );
                          }

                          // Delete confirmation
                          if (isDeleting) {
                            return (
                              <div
                                key={payment.id || idx}
                                className="bg-red-50 rounded-lg border border-red-200 px-3 py-3 flex items-center justify-between"
                              >
                                <span className="text-sm text-red-700 font-medium">
                                  ¿Eliminar pago de ${payment.amount.toLocaleString()}?
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setDeletingPaymentId(null)}
                                  >
                                    No
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 text-xs"
                                    onClick={async () => {
                                      const { success } = await deletePayment(payment.id);
                                      if (success) {
                                        toast.success("Pago eliminado");
                                        setDeletingPaymentId(null);
                                        fetchReserves(1, false);
                                      } else {
                                        toast.error("Error al eliminar el pago");
                                      }
                                    }}
                                  >
                                    Sí, eliminar
                                  </Button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={payment.id || idx}
                              className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-3 py-2.5 hover:border-gray-200 transition-colors group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                  <MethodIcon className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-800 block">
                                    {methodInfo.label}
                                  </span>
                                  <span className="text-[11px] text-gray-400">
                                    {new Date(payment.createdAt).toLocaleDateString("es-AR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="font-bold text-sm text-gray-900 block">
                                    ${payment.amount.toLocaleString()}
                                  </span>
                                  {payment.cashSessionId ? (
                                    <span className="text-[10px] text-green-600 font-medium">Caja</span>
                                  ) : (
                                    <span className="text-[10px] text-blue-600 font-medium">Online</span>
                                  )}
                                </div>
                                {isSuperAdmin && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        setEditingPaymentId(payment.id);
                                        setEditAmount(String(payment.amount));
                                        setEditMethod(payment.method);
                                      }}
                                      className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                      title="Editar pago"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingPaymentId(payment.id)}
                                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                      title="Eliminar pago"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {/* Payment summary bar */}
                        <div className={`rounded-lg p-3 mt-1 ${pendingAmount > 0 ? "bg-amber-50 border border-amber-100" : "bg-emerald-50 border border-emerald-100"}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Total pagado</span>
                            <span className="font-bold text-gray-900">${totalPaid.toLocaleString()}</span>
                          </div>
                          {pendingAmount > 0 ? (
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-semibold text-amber-600">Resta pagar</span>
                              <span className="font-bold text-amber-600">${pendingAmount.toLocaleString()}</span>
                            </div>
                          ) : (
                            <div className="text-xs text-emerald-600 font-medium mt-0.5">✓ Totalmente pagado</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        Sin pagos registrados
                      </div>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-4 text-[11px] text-gray-400 bg-gray-50/50">
                    <span>Creado: {new Date(reserve.createdAt).toLocaleString("es-AR")}</span>
                    <span>·</span>
                    <span>Actualizado: {new Date(reserve.updatedAt).toLocaleString("es-AR")}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Observer target for infinite scroll */}
        <div ref={observerTarget} className="h-2" />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && reserves.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <Search className="h-10 w-10 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-medium">No se encontraron reservas</p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm text-blue-600">
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* End of list */}
      {!hasMore && reserves.length > 0 && (
        <div className="text-center py-4 text-xs text-gray-400">
          No hay más reservas para mostrar
        </div>
      )}
    </div>
  );
};

export default PageDashboardReserves;
