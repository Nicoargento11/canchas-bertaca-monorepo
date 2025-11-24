import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { DailySummaryResponse } from '../interfaces/reports.interface';

@Injectable()
export class ExcelGeneratorService {
  async generateDailySummaryExcel(
    summary: DailySummaryResponse,
    date: string,
  ): Promise<Buffer> {
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Partidos Ya';
    workbook.created = new Date();
    workbook.title = `Resumen Diario - ${summary.complexName}`;

    // Crear hoja principal
    const worksheet = workbook.addWorksheet('Resumen Diario');

    this.setupColumnWidths(worksheet);
    let currentRow = this.createHeader(worksheet, summary, date);
    currentRow = this.createTotalsSection(worksheet, summary, currentRow);
    currentRow = this.createCourtsSection(worksheet, summary, currentRow);
    currentRow = this.createProductsSection(worksheet, summary, currentRow);
    this.createPaymentMethodsSection(worksheet, summary, currentRow);

    // ExcelJS retorna Buffer en Node.js - casting a través de unknown para tipos estrictos
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }

  private setupColumnWidths(worksheet: ExcelJS.Worksheet) {
    worksheet.columns = [
      { width: 25 }, // A
      { width: 18 }, // B
      { width: 15 }, // C
      { width: 18 }, // D
      { width: 18 }, // E
      { width: 16 }, // F
      { width: 12 }, // G
    ];
  }

  private createHeader(
    worksheet: ExcelJS.Worksheet,
    summary: DailySummaryResponse,
    date: string,
  ): number {
    // Header principal
    worksheet.mergeCells('A1:G2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `📊 RESUMEN DIARIO - ${summary.complexName.toUpperCase()}`;
    titleCell.font = {
      size: 18,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E79' },
    };
    titleCell.border = {
      top: { style: 'thick', color: { argb: 'FF1F4E79' } },
      left: { style: 'thick', color: { argb: 'FF1F4E79' } },
      bottom: { style: 'thick', color: { argb: 'FF1F4E79' } },
      right: { style: 'thick', color: { argb: 'FF1F4E79' } },
    };

    // Fecha
    worksheet.mergeCells('A3:G3');
    const dateCell = worksheet.getCell('A3');
    dateCell.value = `📅 ${new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;
    dateCell.font = {
      size: 14,
      bold: true,
      color: { argb: 'FF1F4E79' },
    };
    dateCell.alignment = { horizontal: 'center' };
    dateCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' },
    };

    return 5; // Retorna la siguiente fila disponible
  }

  private createTotalsSection(
    worksheet: ExcelJS.Worksheet,
    summary: DailySummaryResponse,
    startRow: number,
  ): number {
    let currentRow = startRow;

    // Título de sección
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const totalsTitle = worksheet.getCell(`A${currentRow}`);
    totalsTitle.value = '💰 TOTALES GENERALES';
    this.applySectionTitleStyle(totalsTitle, 'FF28A745');
    currentRow += 2;

    // Headers
    worksheet.getCell(`A${currentRow}`).value = 'Concepto';
    worksheet.getCell(`B${currentRow}`).value = 'Cantidad';
    worksheet.getCell(`D${currentRow}`).value = 'Concepto';
    worksheet.getCell(`E${currentRow}`).value = 'Ingresos';

    this.applyHeaderStyle(worksheet, currentRow, ['A', 'B', 'D', 'E']);
    currentRow++;

    // Datos
    this.addTotalRow(
      worksheet,
      currentRow,
      '🏟️ Total Reservas',
      summary.totals.totalReservations,
      '💵 Ingresos Reservas',
      summary.totals.totalRevenueReserves,
    );
    currentRow++;

    this.addTotalRow(
      worksheet,
      currentRow,
      '🛒 Total Productos',
      summary.totals.totalProductsSold,
      '💵 Ingresos Productos',
      summary.totals.totalRevenueProducts,
    );
    currentRow++;

    // Total general
    currentRow++;
    this.createTotalGeneralRow(
      worksheet,
      currentRow,
      summary.totals.totalRevenue,
    );

    return currentRow + 3;
  }

  private createCourtsSection(
    worksheet: ExcelJS.Worksheet,
    summary: DailySummaryResponse,
    startRow: number,
  ): number {
    if (summary.courts.length === 0) return startRow;

    let currentRow = startRow;

    // Título de sección
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const courtsTitle = worksheet.getCell(`A${currentRow}`);
    courtsTitle.value = '🏟️ RESUMEN POR CANCHAS';
    this.applySectionTitleStyle(courtsTitle, 'FF6F42C1');
    currentRow += 2;

    // Headers
    const headers = [
      'Cancha',
      'Deporte',
      'Reservas',
      'Total Pagado',
      'Método Pago',
      'Monto',
      'Count',
    ];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
    });
    this.applyHeaderStyle(worksheet, currentRow, [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
    ]);
    currentRow++;

    // Datos de canchas
    summary.courts.forEach((court, courtIndex) => {
      const isEvenRow = courtIndex % 2 === 0;

      worksheet.getCell(`A${currentRow}`).value = court.courtName;
      worksheet.getCell(`B${currentRow}`).value = court.sportTypeName;
      worksheet.getCell(`C${currentRow}`).value = court.totalReservations;
      worksheet.getCell(`D${currentRow}`).value = court.totalPaid;
      worksheet.getCell(`D${currentRow}`).numFmt = '"$"#,##0.00';

      // Métodos de pago
      court.paymentsByMethod.forEach((payment, payIndex) => {
        if (payIndex > 0) currentRow++;
        worksheet.getCell(`E${currentRow}`).value = payment.method;
        worksheet.getCell(`F${currentRow}`).value = payment.amount;
        worksheet.getCell(`F${currentRow}`).numFmt = '"$"#,##0.00';
        worksheet.getCell(`G${currentRow}`).value = payment.count;
      });

      this.applyRowStyle(
        worksheet,
        currentRow,
        ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        isEvenRow,
      );
      currentRow++;
    });

    return currentRow + 2;
  }

  private createProductsSection(
    worksheet: ExcelJS.Worksheet,
    summary: DailySummaryResponse,
    startRow: number,
  ): number {
    if (summary.products.length === 0) return startRow;

    let currentRow = startRow;

    // Título de sección
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const productsTitle = worksheet.getCell(`A${currentRow}`);
    productsTitle.value = '🛒 RESUMEN DE PRODUCTOS VENDIDOS';
    this.applySectionTitleStyle(productsTitle, 'FFFD7E14');
    currentRow += 2;

    // Headers
    const headers = [
      'Producto',
      'Categoría',
      'Cantidad',
      'Ingresos',
      'Método Pago',
      'Monto',
      'Count',
    ];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
    });
    this.applyHeaderStyle(worksheet, currentRow, [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
    ]);
    currentRow++;

    // Datos de productos
    summary.products.forEach((product, productIndex) => {
      const isEvenRow = productIndex % 2 === 0;

      worksheet.getCell(`A${currentRow}`).value = product.productName;
      worksheet.getCell(`B${currentRow}`).value = product.category;
      worksheet.getCell(`C${currentRow}`).value = product.totalQuantity;
      worksheet.getCell(`D${currentRow}`).value = product.totalRevenue;
      worksheet.getCell(`D${currentRow}`).numFmt = '"$"#,##0.00';

      // Agrupar ventas por método de pago
      const paymentsByMethod = this.groupPaymentsByMethod(product.sales);
      const paymentMethods = Array.from(paymentsByMethod.entries());

      paymentMethods.forEach(([method, data], payIndex) => {
        if (payIndex > 0) currentRow++;
        worksheet.getCell(`E${currentRow}`).value = method;
        worksheet.getCell(`F${currentRow}`).value = data.amount;
        worksheet.getCell(`F${currentRow}`).numFmt = '"$"#,##0.00';
        worksheet.getCell(`G${currentRow}`).value = data.count;
      });

      this.applyRowStyle(
        worksheet,
        currentRow,
        ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        isEvenRow,
      );
      currentRow++;
    });

    return currentRow + 2;
  }

  private createPaymentMethodsSection(
    worksheet: ExcelJS.Worksheet,
    summary: DailySummaryResponse,
    startRow: number,
  ): number {
    if (summary.totals.paymentMethodSummary.length === 0) return startRow;

    let currentRow = startRow;

    // Título de sección
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const paymentTitle = worksheet.getCell(`A${currentRow}`);
    paymentTitle.value = '💳 RESUMEN DE MÉTODOS DE PAGO (TOTAL)';
    this.applySectionTitleStyle(paymentTitle, 'FF20C997');
    currentRow += 2;

    // Headers
    const headers = [
      'Método de Pago',
      'Total Ingresado',
      'Cantidad Transacciones',
    ];
    headers.forEach((header, index) => {
      if (header) {
        const cell = worksheet.getCell(currentRow, index + 1);
        cell.value = header;
      }
    });
    this.applyHeaderStyle(worksheet, currentRow, ['A', 'B', 'C']);
    currentRow++;

    // Datos
    summary.totals.paymentMethodSummary.forEach((payment, paymentIndex) => {
      const isEvenRow = paymentIndex % 2 === 0;

      worksheet.getCell(`A${currentRow}`).value = payment.method;
      worksheet.getCell(`B${currentRow}`).value = payment.amount;
      worksheet.getCell(`B${currentRow}`).numFmt = '"$"#,##0.00';
      worksheet.getCell(`C${currentRow}`).value = payment.count;

      this.applyRowStyle(worksheet, currentRow, ['A', 'B', 'C'], isEvenRow);
      currentRow++;
    });

    return currentRow;
  }

  // Métodos auxiliares para estilos
  private applySectionTitleStyle(cell: ExcelJS.Cell, bgColor: string) {
    cell.font = {
      size: 16,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: bgColor },
    };
    cell.border = {
      top: { style: 'medium', color: { argb: bgColor } },
      left: { style: 'medium', color: { argb: bgColor } },
      bottom: { style: 'medium', color: { argb: bgColor } },
      right: { style: 'medium', color: { argb: bgColor } },
    };
  }

  private applyHeaderStyle(
    worksheet: ExcelJS.Worksheet,
    row: number,
    columns: string[],
  ) {
    columns.forEach((col) => {
      const cell = worksheet.getCell(`${col}${row}`);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF495057' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  }

  private applyRowStyle(
    worksheet: ExcelJS.Worksheet,
    row: number,
    columns: string[],
    isEvenRow: boolean,
  ) {
    const bgColor = isEvenRow ? 'FFF8F9FA' : 'FFFFFFFF';

    columns.forEach((col) => {
      const cell = worksheet.getCell(`${col}${row}`);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  }

  private addTotalRow(
    worksheet: ExcelJS.Worksheet,
    row: number,
    concept1: string,
    value1: number,
    concept2: string,
    value2: number,
  ) {
    worksheet.getCell(`A${row}`).value = concept1;
    worksheet.getCell(`B${row}`).value = value1;
    worksheet.getCell(`D${row}`).value = concept2;
    worksheet.getCell(`E${row}`).value = value2;
    worksheet.getCell(`E${row}`).numFmt = '"$"#,##0.00';
  }

  private createTotalGeneralRow(
    worksheet: ExcelJS.Worksheet,
    row: number,
    totalValue: number,
  ) {
    worksheet.mergeCells(`A${row}:D${row}`);
    const totalGeneralLabel = worksheet.getCell(`A${row}`);
    totalGeneralLabel.value = '🏆 TOTAL GENERAL';
    totalGeneralLabel.font = {
      size: 14,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    totalGeneralLabel.alignment = { horizontal: 'center', vertical: 'middle' };
    totalGeneralLabel.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC3545' },
    };

    const totalGeneralValue = worksheet.getCell(`E${row}`);
    totalGeneralValue.value = totalValue;
    totalGeneralValue.numFmt = '"$"#,##0.00';
    totalGeneralValue.font = {
      size: 14,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    totalGeneralValue.alignment = { horizontal: 'center', vertical: 'middle' };
    totalGeneralValue.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC3545' },
    };

    [totalGeneralLabel, totalGeneralValue].forEach((cell) => {
      cell.border = {
        top: { style: 'thick', color: { argb: 'FFDC3545' } },
        left: { style: 'thick', color: { argb: 'FFDC3545' } },
        bottom: { style: 'thick', color: { argb: 'FFDC3545' } },
        right: { style: 'thick', color: { argb: 'FFDC3545' } },
      };
    });
  }

  private groupPaymentsByMethod(
    sales: any[],
  ): Map<string, { amount: number; count: number }> {
    const paymentsByMethod = new Map<
      string,
      { amount: number; count: number }
    >();

    sales.forEach((sale) => {
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

    return paymentsByMethod;
  }
}
