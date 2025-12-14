import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetDailySummaryDto } from './dto/get-daily-summary.dto';
import { GetDateRangeSummaryDto } from './dto/get-date-range-summary.dto';
import { GetDashboardDataDto } from './dto/dashboard.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-summary')
  @Roles(
    Role.SUPER_ADMIN,
    Role.ORGANIZACION_ADMIN,
    Role.COMPLEJO_ADMIN,
    Role.RECEPCION,
  )
  @ApiOperation({
    summary: 'Obtener resumen diario del complejo',
    description:
      'Obtiene un resumen completo de la actividad diaria incluyendo reservas por cancha y ventas de productos',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'complexId',
    required: true,
    type: String,
    description: 'ID del complejo deportivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen diario obtenido exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Complejo no encontrado',
  })
  async getDailySummary(@Query() query: GetDailySummaryDto) {
    try {
      const { date, complexId, cashSessionId } = query;

      // Validar formato de fecha
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new HttpException(
          'Formato de fecha inválido. Use YYYY-MM-DD',
          HttpStatus.BAD_REQUEST,
        );
      }

      const summary = await this.reportsService.getDailySummary(
        date,
        complexId,
        cashSessionId,
      );

      return {
        success: true,
        data: summary,
        message: 'Resumen diario obtenido exitosamente',
      };
    } catch (error) {
      if (error.message === 'Complejo no encontrado') {
        throw new HttpException('Complejo no encontrado', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('courts-summary')
  @Roles(
    Role.SUPER_ADMIN,
    Role.ORGANIZACION_ADMIN,
    Role.COMPLEJO_ADMIN,
    Role.RECEPCION,
  )
  @ApiOperation({
    summary: 'Obtener resumen de reservas por cancha',
    description:
      'Obtiene el resumen de reservas agrupado por cancha y tipo de deporte para una fecha específica',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'complexId',
    required: true,
    type: String,
    description: 'ID del complejo deportivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de canchas obtenido exitosamente',
  })
  async getCourtsSummary(@Query() query: GetDailySummaryDto) {
    try {
      const { date, complexId } = query;

      // Validar formato de fecha
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new HttpException(
          'Formato de fecha inválido. Use YYYY-MM-DD',
          HttpStatus.BAD_REQUEST,
        );
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const summary = await this.reportsService.getCourtsSummary(
        startOfDay,
        endOfDay,
        complexId,
      );

      return {
        success: true,
        data: summary,
        message: 'Resumen de canchas obtenido exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('products-summary')
  @Roles(
    Role.SUPER_ADMIN,
    Role.ORGANIZACION_ADMIN,
    Role.COMPLEJO_ADMIN,
    Role.RECEPCION,
  )
  @ApiOperation({
    summary: 'Obtener resumen de ventas de productos',
    description:
      'Obtiene el resumen de productos vendidos para una fecha específica',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'complexId',
    required: true,
    type: String,
    description: 'ID del complejo deportivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de productos obtenido exitosamente',
  })
  async getProductsSummary(@Query() query: GetDailySummaryDto) {
    try {
      const { date, complexId, cashSessionId } = query;

      // Validar formato de fecha
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new HttpException(
          'Formato de fecha inválido. Use YYYY-MM-DD',
          HttpStatus.BAD_REQUEST,
        );
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const summary = await this.reportsService.getProductsSummary(
        complexId,
        cashSessionId,
      );

      return {
        success: true,
        data: summary,
        message: 'Resumen de productos obtenido exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('date-range-summary')
  @Roles(
    Role.SUPER_ADMIN,
    Role.ORGANIZACION_ADMIN,
    Role.COMPLEJO_ADMIN,
    Role.RECEPCION,
  )
  @ApiOperation({
    summary: 'Obtener resumen por rango de fechas',
    description:
      'Obtiene un resumen de actividad para un rango de fechas específico (útil para reportes semanales o mensuales)',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Fecha de inicio en formato YYYY-MM-DD',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'Fecha de fin en formato YYYY-MM-DD',
    example: '2024-01-31',
  })
  @ApiQuery({
    name: 'complexId',
    required: true,
    type: String,
    description: 'ID del complejo deportivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen por rango de fechas obtenido exitosamente',
  })
  async getDateRangeSummary(@Query() query: GetDateRangeSummaryDto) {
    try {
      const { startDate, endDate, complexId } = query;

      // Validar formato de fechas
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        throw new HttpException(
          'Formato de fecha inválido. Use YYYY-MM-DD',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validar que la fecha de inicio sea anterior a la de fin
      if (new Date(startDate) > new Date(endDate)) {
        throw new HttpException(
          'La fecha de inicio debe ser anterior a la fecha de fin',
          HttpStatus.BAD_REQUEST,
        );
      }

      const summary = await this.reportsService.getDateRangeSummary(
        startDate,
        endDate,
        complexId,
      );

      return {
        success: true,
        data: summary,
        message: 'Resumen por rango de fechas obtenido exitosamente',
      };
    } catch (error) {
      if (error.message === 'Complejo no encontrado') {
        throw new HttpException('Complejo no encontrado', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('daily-summary/export/excel')
  @Roles(
    Role.SUPER_ADMIN,
    Role.ORGANIZACION_ADMIN,
    Role.COMPLEJO_ADMIN,
    Role.RECEPCION,
  )
  @ApiOperation({
    summary: 'Exportar resumen diario a Excel',
    description:
      'Genera y descarga un archivo Excel con el resumen diario del complejo',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'complexId',
    required: true,
    type: String,
    description: 'ID del complejo deportivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo Excel generado exitosamente',
    headers: {
      'Content-Type': {
        description:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      'Content-Disposition': {
        description: 'attachment; filename="resumen-diario-{date}.xlsx"',
      },
    },
  })
  async exportDailySummaryExcel(
    @Query() query: GetDailySummaryDto,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.reportsService.generateDailySummaryExcel(
        query.date,
        query.complexId,
      );

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="resumen-diario-${query.date}.xlsx"`,
        'Content-Length': buffer.length.toString(),
      });

      res.end(buffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error generando archivo Excel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('daily-summary/export/pdf')
  @Roles(
    Role.SUPER_ADMIN,
    Role.ORGANIZACION_ADMIN,
    Role.COMPLEJO_ADMIN,
    Role.RECEPCION,
  )
  @ApiOperation({
    summary: 'Exportar resumen diario a PDF',
    description:
      'Genera y descarga un archivo PDF con el resumen diario del complejo',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'complexId',
    required: true,
    type: String,
    description: 'ID del complejo deportivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo PDF generado exitosamente',
    headers: {
      'Content-Type': {
        description: 'application/pdf',
      },
      'Content-Disposition': {
        description: 'attachment; filename="resumen-diario-{date}.pdf"',
      },
    },
  })
  async exportDailySummaryPDF(
    @Query() query: GetDailySummaryDto,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.reportsService.generateDailySummaryPDF(
        query.date,
        query.complexId,
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resumen-diario-${query.date}.pdf"`,
        'Content-Length': buffer.length.toString(),
      });

      res.end(buffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error generando archivo PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===================================
  // ENDPOINTS TEMPORALES PARA TESTING (SIN AUTENTICACIÓN)
  // ===================================

  @Public()
  @Get('test/daily-summary/export/excel')
  @ApiOperation({
    summary: '[TESTING] Exportar resumen diario a Excel (sin auth)',
    description:
      'Endpoint temporal para testing - genera Excel sin autenticación',
  })
  async testExportDailySummaryExcel(
    @Query() query: GetDailySummaryDto,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.reportsService.generateDailySummaryExcel(
        query.date,
        query.complexId,
      );

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="resumen-diario-${query.date}.xlsx"`,
        'Content-Length': buffer.length.toString(),
      });

      res.end(buffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error generando archivo Excel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('test/daily-summary/export/pdf')
  @ApiOperation({
    summary: '[TESTING] Exportar resumen diario a PDF (sin auth)',
    description:
      'Endpoint temporal para testing - genera PDF sin autenticación',
  })
  async testExportDailySummaryPDF(
    @Query() query: GetDailySummaryDto,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.reportsService.generateDailySummaryPDF(
        query.date,
        query.complexId,
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resumen-diario-${query.date}.pdf"`,
        'Content-Length': buffer.length.toString(),
      });

      res.end(buffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error generando archivo PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('test/date-range')
  @ApiOperation({
    summary: '[TESTING] Obtener resumen por rango de fechas (sin auth)',
    description:
      'Endpoint temporal para testing - devuelve resumen de rango de fechas sin autenticación',
  })
  async testGetDateRangeSummary(@Query() query: GetDateRangeSummaryDto) {
    try {
      const { startDate, endDate, complexId } = query;

      // Validar formato de fechas
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        throw new HttpException(
          'Formato de fecha inválido. Use YYYY-MM-DD',
          HttpStatus.BAD_REQUEST,
        );
      }

      const summary = await this.reportsService.getDateRangeSummary(
        startDate,
        endDate,
        complexId,
      );

      return {
        success: true,
        data: summary,
        message: `Resumen obtenido exitosamente para el rango ${startDate} - ${endDate}`,
        timezone: 'Argentina (UTC-3)',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===================================
  // ENDPOINTS DEL DASHBOARD
  // ===================================

  @Get('dashboard')
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
  @ApiOperation({
    summary: 'Obtener datos del dashboard',
    description:
      'Obtiene todos los datos necesarios para el dashboard del complejo',
  })
  @ApiQuery({
    name: 'complexId',
    required: true,
    type: String,
    description: 'ID del complejo deportivo',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha de inicio en formato YYYY-MM-DD',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha de fin en formato YYYY-MM-DD',
    example: '2024-01-31',
  })
  @ApiQuery({
    name: 'cashSessionId',
    required: false,
    type: String,
    description: 'ID de la sesión de caja específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del dashboard obtenidos exitosamente',
  })
  async getDashboard(@Query() query: GetDashboardDataDto) {
    try {
      const { complexId, startDate, endDate, cashSessionId } = query;

      const dashboardData = await this.reportsService.getDashboardData(
        complexId,
        startDate,
        endDate,
        cashSessionId,
      );
      // log(dashboardData);

      return {
        success: true,
        data: dashboardData,
        message: 'Datos del dashboard obtenidos exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('test/dashboard')
  @ApiOperation({
    summary: '[TESTING] Obtener datos del dashboard (sin auth)',
    description:
      'Endpoint temporal para testing - devuelve datos del dashboard sin autenticación',
  })
  async testGetDashboard(@Query() query: GetDashboardDataDto) {
    try {
      const { complexId, startDate, endDate, cashSessionId } = query;

      const dashboardData = await this.reportsService.getDashboardData(
        complexId,
        startDate,
        endDate,
        cashSessionId,
      );

      return {
        success: true,
        data: dashboardData,
        message: 'Datos del dashboard obtenidos exitosamente (TEST)',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
