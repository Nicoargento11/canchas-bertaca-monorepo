import * as ExcelJS from 'exceljs';

export class ExcelReportGenerator {
  static async generateDailySummaryExcel(
    summary: any,
    date: string,
  ): Promise<Buffer> {
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Partidos Ya';
    workbook.created = new Date();
    workbook.title = `Resumen Diario - ${summary.complexName}`;

    // Crear hoja principal
    const worksheet = workbook.addWorksheet('Resumen Diario');

    // Configurar anchos de columnas
    worksheet.columns = [
      { width: 25 }, // A
      { width: 18 }, // B
      { width: 15 }, // C
      { width: 18 }, // D
      { width: 18 }, // E
      { width: 16 }, // F
      { width: 12 }, // G
    ];

    let currentRow = 1;

    // HEADER PRINCIPAL
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

    currentRow = 5;

    // SECCIÓN TOTALES
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const totalsTitle = worksheet.getCell(`A${currentRow}`);
    totalsTitle.value = '💰 TOTALES GENERALES';
    totalsTitle.font = {
      size: 16,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    totalsTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    totalsTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF28A745' },
    };
    this.applyBorder(totalsTitle, 'medium', 'FF28A745');
    currentRow += 2;

    // Headers de totales
    const totalsHeaders = ['Concepto', 'Cantidad', '', 'Concepto', 'Ingresos'];
    totalsHeaders.forEach((header, index) => {
      if (header) {
        const cell = worksheet.getCell(currentRow, index + 1);
        cell.value = header;
        this.applyHeaderStyle(cell);
      }
    });
    currentRow++;

    // Datos de totales
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
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const totalLabel = worksheet.getCell(`A${currentRow}`);
    totalLabel.value = '🏆 TOTAL GENERAL';
    this.applyTotalGeneralStyle(totalLabel);

    const totalValue = worksheet.getCell(`E${currentRow}`);
    totalValue.value = summary.totals.totalRevenue;
    totalValue.numFmt = '"$"#,##0.00';
    this.applyTotalGeneralStyle(totalValue);

    currentRow += 3;

    // SECCIÓN CANCHAS
    if (summary.courts.length > 0) {
      currentRow = this.addCourtsSection(worksheet, currentRow, summary.courts);
    }

    // SECCIÓN PRODUCTOS
    if (summary.products.length > 0) {
      currentRow = this.addProductsSection(
        worksheet,
        currentRow,
        summary.products,
      );
    }

    // SECCIÓN MÉTODOS DE PAGO
    if (summary.totals.paymentMethodSummary.length > 0) {
      this.addPaymentMethodsSection(
        worksheet,
        currentRow,
        summary.totals.paymentMethodSummary,
      );
    }

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }

  private static applyHeaderStyle(cell: ExcelJS.Cell) {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6C757D' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    this.applyBorder(cell, 'thin');
  }

  private static applyTotalGeneralStyle(cell: ExcelJS.Cell) {
    cell.font = {
      size: 14,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC3545' },
    };
    this.applyBorder(cell, 'thick', 'FFDC3545');
  }

  private static applyBorder(
    cell: ExcelJS.Cell,
    style: string = 'thin',
    color: string = '000000',
  ) {
    cell.border = {
      top: { style: style as any, color: { argb: color } },
      left: { style: style as any, color: { argb: color } },
      bottom: { style: style as any, color: { argb: color } },
      right: { style: style as any, color: { argb: color } },
    };
  }

  private static addTotalRow(
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

    // Aplicar estilo alterno
    const bgColor = row % 2 === 0 ? 'FFF8F9FA' : 'FFFFFFFF';
    ['A', 'B', 'D', 'E'].forEach((col) => {
      const cell = worksheet.getCell(`${col}${row}`);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      this.applyBorder(cell);
    });
  }

  private static addCourtsSection(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    courts: any[],
  ): number {
    let currentRow = startRow;

    // Título de sección
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const title = worksheet.getCell(`A${currentRow}`);
    title.value = '🏟️ RESUMEN POR CANCHAS';
    title.font = {
      size: 16,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    title.alignment = { horizontal: 'center', vertical: 'middle' };
    title.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6F42C1' },
    };
    this.applyBorder(title, 'medium', 'FF6F42C1');
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
      this.applyHeaderStyle(cell);
    });
    currentRow++;

    // Datos
    courts.forEach((court, courtIndex) => {
      const bgColor = courtIndex % 2 === 0 ? 'FFF8F9FA' : 'FFFFFFFF';

      worksheet.getCell(`A${currentRow}`).value = court.courtName;
      worksheet.getCell(`B${currentRow}`).value = court.sportTypeName;
      worksheet.getCell(`C${currentRow}`).value = court.totalReservations;
      worksheet.getCell(`D${currentRow}`).value = court.totalPaid;
      worksheet.getCell(`D${currentRow}`).numFmt = '"$"#,##0.00';

      court.paymentsByMethod.forEach((payment: any, payIndex: number) => {
        if (payIndex > 0) currentRow++;
        worksheet.getCell(`E${currentRow}`).value = payment.method;
        worksheet.getCell(`F${currentRow}`).value = payment.amount;
        worksheet.getCell(`F${currentRow}`).numFmt = '"$"#,##0.00';
        worksheet.getCell(`G${currentRow}`).value = payment.count;
      });

      // Aplicar estilo a la fila
      ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((col) => {
        const cell = worksheet.getCell(`${col}${currentRow}`);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        this.applyBorder(cell);
      });

      currentRow++;
    });

    return currentRow + 2;
  }

  private static addProductsSection(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    products: any[],
  ): number {
    let currentRow = startRow;

    // Título de sección
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const title = worksheet.getCell(`A${currentRow}`);
    title.value = '🛒 RESUMEN DE PRODUCTOS VENDIDOS';
    title.font = {
      size: 16,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    title.alignment = { horizontal: 'center', vertical: 'middle' };
    title.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFD7E14' },
    };
    this.applyBorder(title, 'medium', 'FFFD7E14');
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
      this.applyHeaderStyle(cell);
    });
    currentRow++;

    // Datos
    products.forEach((product, productIndex) => {
      const bgColor = productIndex % 2 === 0 ? 'FFF8F9FA' : 'FFFFFFFF';

      worksheet.getCell(`A${currentRow}`).value = product.productName;
      worksheet.getCell(`B${currentRow}`).value = product.category;
      worksheet.getCell(`C${currentRow}`).value = product.totalQuantity;
      worksheet.getCell(`D${currentRow}`).value = product.totalRevenue;
      worksheet.getCell(`D${currentRow}`).numFmt = '"$"#,##0.00';

      // Agrupar métodos de pago
      const paymentsByMethod = new Map<
        string,
        { amount: number; count: number }
      >();
      product.sales.forEach((sale: any) => {
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

      // Mostrar métodos de pago
      const paymentMethods = Array.from(paymentsByMethod.entries());
      paymentMethods.forEach(([method, data], payIndex) => {
        if (payIndex > 0) currentRow++;
        worksheet.getCell(`E${currentRow}`).value = method;
        worksheet.getCell(`F${currentRow}`).value = data.amount;
        worksheet.getCell(`F${currentRow}`).numFmt = '"$"#,##0.00';
        worksheet.getCell(`G${currentRow}`).value = data.count;
      });

      // Aplicar estilo a la fila
      ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((col) => {
        const cell = worksheet.getCell(`${col}${currentRow}`);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        this.applyBorder(cell);
      });

      currentRow++;
    });

    return currentRow + 2;
  }

  private static addPaymentMethodsSection(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    paymentMethods: any[],
  ): number {
    let currentRow = startRow;

    // Título de sección
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const title = worksheet.getCell(`A${currentRow}`);
    title.value = '💳 RESUMEN DE MÉTODOS DE PAGO (TOTAL)';
    title.font = {
      size: 16,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    title.alignment = { horizontal: 'center', vertical: 'middle' };
    title.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF20C997' },
    };
    this.applyBorder(title, 'medium', 'FF20C997');
    currentRow += 2;

    // Headers
    const headers = [
      'Método de Pago',
      'Total Ingresado',
      'Cantidad Transacciones',
    ];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
      this.applyHeaderStyle(cell);
    });
    currentRow++;

    // Datos
    paymentMethods.forEach((payment, paymentIndex) => {
      const bgColor = paymentIndex % 2 === 0 ? 'FFF8F9FA' : 'FFFFFFFF';

      worksheet.getCell(`A${currentRow}`).value = payment.method;
      worksheet.getCell(`B${currentRow}`).value = payment.amount;
      worksheet.getCell(`B${currentRow}`).numFmt = '"$"#,##0.00';
      worksheet.getCell(`C${currentRow}`).value = payment.count;

      // Aplicar estilo
      ['A', 'B', 'C'].forEach((col) => {
        const cell = worksheet.getCell(`${col}${currentRow}`);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        this.applyBorder(cell);
      });

      currentRow++;
    });

    return currentRow;
  }
}
