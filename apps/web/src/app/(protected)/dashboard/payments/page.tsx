import React from "react";
import { Payment, MercadoPagoConfig } from "mercadopago";
import { PaymentSearch } from "mercadopago/dist/clients/payment/search/types";
import { SideBarButton } from "../../_components/dashboard/sideBarButton";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const PageDashboardPayments = async () => {
  const pagos: PaymentSearch = await new Payment(mercadopago).search({
    options: {
      limit: 1000,
      begin_date: "NOW-7DAYS",
      end_date: "NOW",
      sort: "date_created",
      criteria: "desc",
    },
  });

  return (
    <section className="p-2 overflow-x-auto">
      <div className="p-2 w-full flex justify-end">
        <SideBarButton />
      </div>
      <table className="min-w-full bg-white border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-200 px-4 py-2">
              Email del Pagador
            </th>
            {/* <th className="border border-gray-200 px-4 py-2">ID del Pagador</th> */}
            {/* <th className="border border-gray-200 px-4 py-2">
          Identificación del Pagador
        </th> */}
            <th className="border border-gray-200 px-4 py-2">Descripción</th>
            <th className="border border-gray-200 px-4 py-2">
              Monto Transacción
            </th>
            <th className="border border-gray-200 px-4 py-2">
              Monto Neto Recibido
            </th>
            <th className="border border-gray-200 px-4 py-2">Método de Pago</th>
            <th className="border border-gray-200 px-4 py-2">Tipo de Pago</th>
            <th className="border border-gray-200 px-4 py-2">ID del Pago</th>
            <th className="border border-gray-200 px-4 py-2">
              Fecha de Creación
            </th>
            <th className="border border-gray-200 px-4 py-2">
              Fecha de Aprobación
            </th>
            <th className="border border-gray-200 px-4 py-2">
              Última Actualización
            </th>
            <th className="border border-gray-200 px-4 py-2">Estado</th>
            <th className="border border-gray-200 px-4 py-2">
              Estado Detallado
            </th>
            {/* <th className="border border-gray-200 px-4 py-2">
              Referencia Externa
            </th> */}
            {/* <th className="border border-gray-200 px-4 py-2">IP del Pagador</th> */}
            {/* <th className="border border-gray-200 px-4 py-2">
              Monto de la Comisión
            </th> */}
            <th className="border border-gray-200 px-4 py-2">Moneda</th>
            {/* <th className="border border-gray-200 px-4 py-2">Modo en Vivo</th> */}
            <th className="border border-gray-200 px-4 py-2">Cuotas</th>
            {/* <th className="border border-gray-200 px-4 py-2">Monto Devuelto</th> */}
            <th className="border border-gray-200 px-4 py-2">
              Fecha de Expiración
            </th>
            <th className="border border-gray-200 px-4 py-2">
              Fecha de Liberación del Dinero
            </th>
          </tr>
        </thead>
        <tbody>
          {pagos.results &&
            pagos.results.map((pago, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border border-gray-200 px-4 py-2">
                  {pago.payer?.email}
                </td>
                {/* <td className="border border-gray-200 px-4 py-2">
                  {pago.payer?.id}
                </td> */}
                {/* <td className="border border-gray-200 px-4 py-2">
                  {pago.payer?.identification?.type}:{" "}
                  {pago.payer?.identification?.number}
                </td> */}
                <td className="border border-gray-200 px-4 py-2">
                  {pago.description}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  ${pago.transaction_amount}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  ${pago.transaction_details?.net_received_amount}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {pago.payment_method_id}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {pago.payment_type_id}
                </td>
                <td className="border border-gray-200 px-4 py-2">{pago.id}</td>
                <td className="border border-gray-200 px-4 py-2">
                  {pago.date_created
                    ? new Date(pago.date_created).toLocaleString()
                    : "N/A"}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {pago.date_approved
                    ? new Date(pago.date_approved).toLocaleString()
                    : "N/A"}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {pago.date_last_updated
                    ? new Date(pago.date_last_updated).toLocaleString()
                    : "N/A"}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {pago.status}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {pago.status_detail}
                </td>
                {/* <td className="border border-gray-200 px-4 py-2">
                  {pago.external_reference}
                </td> */}
                {/* <td className="border border-gray-200 px-4 py-2">
                  {pago.additional_info?.ip_address}
                </td> */}
                {/* <td className="border border-gray-200 px-4 py-2">
                  ${pago.fee_details?.[0]?.amount}
                </td> */}
                <td className="border border-gray-200 px-4 py-2">
                  {pago.currency_id}
                </td>
                {/* <td className="border border-gray-200 px-4 py-2">
                  {pago.live_mode ? "Sí" : "No"}
                </td> */}
                <td className="border border-gray-200 px-4 py-2">
                  {pago.installments}
                </td>
                {/* <td className="border border-gray-200 px-4 py-2">
                  ${pago.transaction_amount_refunded}
                </td> */}
                <td className="border border-gray-200 px-4 py-2">
                  {pago.date_of_expiration
                    ? new Date(pago.date_of_expiration).toLocaleString()
                    : "N/A"}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {pago.money_release_date
                    ? new Date(pago.money_release_date).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  );
};

export default PageDashboardPayments;
