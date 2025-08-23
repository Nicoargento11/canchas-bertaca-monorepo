import { Injectable } from '@nestjs/common';
import { DailySummaryResponse } from '../interfaces/reports.interface';

@Injectable()
export class PdfGeneratorService {
  async generateDailySummaryPDF(
    summary: DailySummaryResponse,
    date: string,
  ): Promise<Buffer> {
    const puppeteer = await import('puppeteer');

    // Crear HTML para el PDF
    const html = this.generateHTMLReport(summary, date);

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        printBackground: true,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private generateHTMLReport(
    summary: DailySummaryResponse,
    date: string,
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Resumen Diario - ${summary.complexName}</title>
        <style>
            ${this.getStylesheet()}
        </style>
    </head>
    <body>
        ${this.generateHeader(summary, date)}
        ${this.generateTotalsSection(summary)}
        ${this.generateCourtsSection(summary)}
        ${this.generateProductsSection(summary)}
        ${this.generatePaymentMethodsSection(summary)}
        ${this.generateFooter()}
    </body>
    </html>
    `;
  }

  private getStylesheet(): string {
    return `
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #007bff;
        padding-bottom: 20px;
      }
      .header h1 {
        margin: 0;
        color: #007bff;
        font-size: 24px;
      }
      .header h2 {
        margin: 10px 0 0 0;
        color: #666;
        font-size: 18px;
      }
      .summary-section {
        margin-bottom: 30px;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
      }
      .summary-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #007bff;
        text-align: center;
      }
      .totals-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }
      .total-item {
        background: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .total-label {
        font-weight: bold;
        color: #666;
        margin-bottom: 5px;
      }
      .total-value {
        font-size: 20px;
        color: #007bff;
        font-weight: bold;
      }
      .total-general {
        background: #007bff;
        color: white;
        text-align: center;
        padding: 15px;
        border-radius: 5px;
        margin-top: 10px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      th {
        background: #007bff;
        color: white;
        padding: 12px;
        text-align: left;
        font-weight: bold;
      }
      td {
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      tr:hover {
        background: #f8f9fa;
      }
      .section-title {
        font-size: 20px;
        font-weight: bold;
        margin: 30px 0 15px 0;
        color: #007bff;
        border-bottom: 2px solid #007bff;
        padding-bottom: 5px;
      }
      .currency {
        color: #28a745;
        font-weight: bold;
      }
    `;
  }

  private generateHeader(summary: DailySummaryResponse, date: string): string {
    return `
      <div class="header">
        <h1>Resumen Diario</h1>
        <h2>${summary.complexName}</h2>
        <p><strong>Fecha: ${date}</strong></p>
      </div>
    `;
  }

  private generateTotalsSection(summary: DailySummaryResponse): string {
    return `
      <div class="summary-section">
        <div class="summary-title">TOTALES GENERALES</div>
        <div class="totals-grid">
          <div class="total-item">
            <div class="total-label">Total Reservas</div>
            <div class="total-value">${summary.totals.totalReservations}</div>
          </div>
          <div class="total-item">
            <div class="total-label">Ingresos Reservas</div>
            <div class="total-value currency">$${summary.totals.totalRevenueReserves}</div>
          </div>
          <div class="total-item">
            <div class="total-label">Productos Vendidos</div>
            <div class="total-value">${summary.totals.totalProductsSold}</div>
          </div>
          <div class="total-item">
            <div class="total-label">Ingresos Productos</div>
            <div class="total-value currency">$${summary.totals.totalRevenueProducts}</div>
          </div>
        </div>
        <div class="total-general">
          <strong>TOTAL GENERAL: $${summary.totals.totalRevenue}</strong>
        </div>
      </div>
    `;
  }

  private generateCourtsSection(summary: DailySummaryResponse): string {
    if (summary.courts.length === 0) return '';

    const courtsRows = summary.courts
      .map(
        (court) => `
          <tr>
            <td><strong>${court.courtName}</strong></td>
            <td>${court.sportTypeName}</td>
            <td>${court.totalReservations}</td>
            <td class="currency">$${court.totalPaid}</td>
            <td>
              ${court.paymentsByMethod
                .map(
                  (payment) =>
                    `${payment.method}: $${payment.amount} (${payment.count}x)`,
                )
                .join('<br>')}
            </td>
          </tr>
        `,
      )
      .join('');

    return `
      <div class="section-title">RESUMEN POR CANCHAS</div>
      <table>
        <thead>
          <tr>
            <th>Cancha</th>
            <th>Deporte</th>
            <th>Reservas</th>
            <th>Total Pagado</th>
            <th>Métodos de Pago</th>
          </tr>
        </thead>
        <tbody>
          ${courtsRows}
        </tbody>
      </table>
    `;
  }

  private generateProductsSection(summary: DailySummaryResponse): string {
    if (summary.products.length === 0) return '';

    const productsRows = summary.products
      .map((product) => {
        // Agrupar ventas por método de pago
        const paymentsByMethod = new Map();
        product.sales.forEach((sale) => {
          const saleAmount = sale.price * sale.quantity - (sale.discount || 0);
          const existing = paymentsByMethod.get(sale.paymentMethod);
          if (existing) {
            existing.amount += saleAmount;
            existing.count += 1;
          } else {
            paymentsByMethod.set(sale.paymentMethod, {
              amount: saleAmount,
              count: 1,
            });
          }
        });

        const paymentMethodsDisplay = Array.from(paymentsByMethod.entries())
          .map(
            ([method, data]) => `${method}: $${data.amount} (${data.count}x)`,
          )
          .join('<br>');

        return `
          <tr>
            <td><strong>${product.productName}</strong></td>
            <td>${product.category}</td>
            <td>${product.totalQuantity}</td>
            <td class="currency">$${product.totalRevenue}</td>
            <td>${paymentMethodsDisplay}</td>
          </tr>
        `;
      })
      .join('');

    return `
      <div class="section-title">PRODUCTOS VENDIDOS</div>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Ingresos</th>
            <th>Métodos de Pago</th>
          </tr>
        </thead>
        <tbody>
          ${productsRows}
        </tbody>
      </table>
    `;
  }

  private generatePaymentMethodsSection(summary: DailySummaryResponse): string {
    if (summary.totals.paymentMethodSummary.length === 0) return '';

    const paymentRows = summary.totals.paymentMethodSummary
      .map(
        (payment) => `
          <tr>
            <td><strong>${payment.method}</strong></td>
            <td class="currency">$${payment.amount}</td>
            <td>${payment.count}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <div class="section-title">RESUMEN DE MÉTODOS DE PAGO</div>
      <table style="background: #fffbf0;">
        <thead>
          <tr style="background: #ffc107;">
            <th>Método de Pago</th>
            <th>Total Ingresado</th>
            <th>Cantidad Transacciones</th>
          </tr>
        </thead>
        <tbody>
          ${paymentRows}
        </tbody>
      </table>
    `;
  }

  private generateFooter(): string {
    return `
      <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
        <p>Generado automáticamente por Partidos Ya - ${new Date().toLocaleString()}</p>
      </div>
    `;
  }
}
