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
    this.transporter = nodemailer.createTransport({
      service: 'Gmail', // O el servicio que uses
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
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
