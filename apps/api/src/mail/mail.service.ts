import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string; // HTML es opcional
}

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    // Validar que las variables de entorno estén configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  EMAIL_USER o EMAIL_PASS no están configurados. El servicio de correo estará deshabilitado.');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // Puerto TLS (más compatible que SSL 465)
      secure: true, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: true, // Verificar certificados SSL
      },
      connectionTimeout: 10000, // 10 segundos timeout
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  async sendMail(mailOptions: MailOptions) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html, // se envía si existe
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
