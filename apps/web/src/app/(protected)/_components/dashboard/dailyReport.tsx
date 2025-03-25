import React, { useState, useCallback } from "react";

type SalesData = {
  [key: string]: { transfer?: number; cash?: number };
};

type ReportData = {
  sales: SalesData;
  courts: SalesData;
  initialCash: number;
  school: { transfer: number; cash: number };
};

const initialData: ReportData = {
  sales: {
    "Coca cola": { transfer: 8, cash: 7 },
    Pepsi: { transfer: 5 },
    Fanta: { transfer: 56, cash: 76 },
    Sprite: { transfer: 8, cash: 8 },
    "Seven up": { transfer: 6 },
    Brahma: { transfer: 45, cash: 4 },
    quilmes: { transfer: 6, cash: 7 },
    Gatorade: { transfer: 7, cash: 5 },
    Aquarius: { transfer: 34 },
  },
  courts: {
    Court1: { transfer: 100, cash: 200 },
    Court2: { transfer: 150, cash: 250 },
  },
  initialCash: 500,
  school: { transfer: 50, cash: 60 },
};

const DailyReport = () => {
  const [data, setData] = useState<ReportData>(initialData);

  const calculateTotals = useCallback(() => {
    let totalTransfer = 0;
    let totalCash = 0;
    let totalTransactions = 0;

    const sumSales = (salesData: SalesData) => {
      let transfer = 0;
      let cash = 0;
      for (const item in salesData) {
        const sales = salesData[item];
        if (sales.transfer) {
          transfer += sales.transfer;
          totalTransactions++;
        }
        if (sales.cash) {
          cash += sales.cash;
          totalTransactions++;
        }
      }
      return { transfer, cash };
    };

    const productTotals = sumSales(data.sales);
    const courtTotals = sumSales(data.courts);

    totalTransfer =
      productTotals.transfer + courtTotals.transfer + data.school.transfer;
    totalCash = productTotals.cash + courtTotals.cash + data.school.cash;

    const totalSales = totalTransfer + totalCash;
    const netTotal = totalSales + data.initialCash;

    return {
      totalTransfer,
      totalCash,
      totalSales,
      netTotal,
      totalTransactions,
    };
  }, [data]);

  const totals = calculateTotals();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reporte Diario de Ventas</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Resumen General</h2>
        <div className="grid grid-cols-2 gap-4">
          <p>
            Total Ventas (Efectivo):{" "}
            <span className="font-medium">${totals.totalCash}</span>
          </p>
          <p>
            Total Ventas (Transferencia):{" "}
            <span className="font-medium">${totals.totalTransfer}</span>
          </p>
          <p>
            Total Ventas (General):{" "}
            <span className="font-medium">${totals.totalSales}</span>
          </p>
          <p>
            Cantidad Total de Ventas:{" "}
            <span className="font-medium">{totals.totalTransactions}</span>
          </p>
          <p>
            Caja Inicial:{" "}
            <span className="font-medium">${data.initialCash}</span>
          </p>
          <p>
            Total Neto del Día:{" "}
            <span className="font-medium">${totals.netTotal}</span>
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Detalles por Producto</h2>
        <ul className="list-disc pl-5">
          {Object.entries(data.sales).map(([product, sales]) => (
            <li key={product} className="mb-1">
              <strong>{product}:</strong> Efectivo - ${sales.cash || 0},
              Transferencia - ${sales.transfer || 0}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Detalles por Cancha</h2>
        <ul className="list-disc pl-5">
          {Object.entries(data.courts).map(([court, sales]) => (
            <li key={court} className="mb-1">
              <strong>{court}:</strong> Efectivo - ${sales.cash || 0},
              Transferencia - ${sales.transfer || 0}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Escuelita</h2>
        <p>
          Transferencia:{" "}
          <span className="font-medium">${data.school.transfer}</span>
        </p>
        <p>
          Efectivo: <span className="font-medium">${data.school.cash}</span>
        </p>
      </section>
    </div>
  );
};

export default DailyReport;
