"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "../DashboardHeader";
import {
  getComplexBySlug,
  checkMercadoPagoStatus,
  deactivateMercadoPagoConfig,
  exchangeMercadoPagoOAuth,
} from "@/services/complex/complex";
import { searchPayments } from "@/services/payment/payment";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Unlink,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Zap,
  History,
  Wallet,
} from "lucide-react";

const MP_CLIENT_ID = process.env.NEXT_PUBLIC_MP_CLIENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const PageDashboardPayments = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [complex, setComplex] = useState<any>(null);
  const [hasConfig, setHasConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const code = searchParams.get("code");
  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    loadComplex();
  }, [slug]);

  useEffect(() => {
    if (complex?.id && hasConfig) {
      loadPayments(complex.id);
    }
  }, [complex, hasConfig]);

  const loadPayments = async (complexId: string) => {
    setLoadingPayments(true);
    try {
      const result = await searchPayments(complexId);
      if (result.success && result.data?.results) {
        setPayments(result.data.results);
      }
    } catch (error) {
      console.error("Error cargando pagos:", error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadComplex = async () => {
    try {
      const { data } = await getComplexBySlug(slug);
      if (!data) {
        return;
      }
      setComplex(data);

      // Verificar si tiene MP configurado
      const statusResult = await checkMercadoPagoStatus(data.id);
      setHasConfig((statusResult.success && statusResult.data?.hasConfig) || false);
    } catch (error) {
      console.error("Error cargando complejo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (code: string) => {
    setLoading(true);

    try {
      const redirectUri = `${APP_URL}/${slug}/dashboard/payments`;

      const result = await exchangeMercadoPagoOAuth(complex.id, code, redirectUri);

      if (result.success) {
        setHasConfig(true);
        router.push(`/${slug}/dashboard/payments?success=1`);
      } else {
        router.push(`/${slug}/dashboard/payments?error=save_failed`);
      }
    } catch (error: any) {
      router.push(`/${slug}/dashboard/payments?error=oauth_failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (
      !confirm(
        "¿Estás seguro de que querés desvincular tu cuenta de Mercado Pago? Dejarás de recibir pagos online."
      )
    )
      return;

    setActionLoading(true);
    try {
      const result = await deactivateMercadoPagoConfig(complex.id);
      if (result.success) {
        setHasConfig(false);
        router.push(`/${slug}/dashboard/payments`); // Limpiar params
      }
    } catch (error: any) {
      console.error("Error desvinculando:", error);
      if (error?.response?.status === 401) {
        alert("Tu sesión expiró. Por favor, iniciá sesión nuevamente.");
        // Opcional: router.push('/auth/login');
      } else {
        alert("Error al desvincular la cuenta. Intentá de nuevo.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="p-6 space-y-6">
        <DashboardHeader title="Gestión de Pagos" />
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Cargando información de pagos...</p>
        </div>
      </section>
    );
  }

  const redirectUri = `${APP_URL}/${slug}/dashboard/payments`;
  const urlConnect = `https://auth.mercadopago.com.ar/authorization?client_id=${MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;

  return (
    <section className="p-6 space-y-8 max-w-6xl mx-auto">
      <DashboardHeader title="Gestión de Pagos" />

      {/* Status Messages */}
      {successParam && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">¡Conexión exitosa!</h3>
            <p className="text-green-700 text-sm">
              Tu cuenta de Mercado Pago ha sido vinculada correctamente. Ya podés recibir pagos.
            </p>
          </div>
        </div>
      )}

      {errorParam && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error de conexión</h3>
            <p className="text-red-700 text-sm">
              {errorParam === "oauth_failed"
                ? "El código de autorización expiró o es inválido."
                : "No se pudo guardar la configuración."}{" "}
              Por favor, intentá nuevamente.
            </p>
          </div>
        </div>
      )}

      {/* Main Integration Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${
                  hasConfig ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                }`}
              >
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Integración con Mercado Pago
                </h2>
                <p className="text-gray-500 mt-1">
                  {hasConfig
                    ? "Tu cuenta está conectada y lista para procesar pagos."
                    : "Conectá tu cuenta para automatizar el cobro de señas y reservas."}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hasConfig ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        hasConfig ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    {hasConfig ? "Conectado" : "No conectado"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {hasConfig ? (
                <button
                  onClick={handleUnlink}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Unlink className="h-4 w-4 mr-2" />
                  )}
                  Desvincular cuenta
                </button>
              ) : (
                <a
                  href={urlConnect}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#009EE3] hover:bg-[#008ED6] shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009EE3]"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Conectar Mercado Pago
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        {!hasConfig && (
          <div className="bg-gray-50 px-6 py-6 sm:px-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Cobro automático</h4>
                  <p className="text-gray-500 text-xs mt-1">
                    Las señas se acreditan instantáneamente en tu cuenta.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Seguridad garantizada</h4>
                  <p className="text-gray-500 text-xs mt-1">
                    Procesamiento seguro con los estándares de Mercado Pago.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <History className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Conciliación simple</h4>
                  <p className="text-gray-500 text-xs mt-1">
                    Registro automático de pagos en tu panel de administración.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Payments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <History className="h-5 w-5 text-gray-400" />
            Historial de Pagos
          </h3>
          {hasConfig && (
            <a
              href="https://www.mercadopago.com.ar/activities"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Ver en Mercado Pago <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Usuario
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Concepto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Monto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingPayments ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                        <p className="font-medium">Cargando pagos...</p>
                      </div>
                    </td>
                  </tr>
                ) : payments.length > 0 ? (
                  payments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.payer?.email || "Anónimo"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.description || "Pago de reserva"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        $ {payment.transaction_amount?.toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status === "approved"
                            ? "Aprobado"
                            : payment.status === "pending"
                              ? "Pendiente"
                              : "Rechazado"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.date_created).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                          <CreditCard className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="font-medium">No hay pagos recientes</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Los pagos que recibas aparecerán aquí.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageDashboardPayments;
