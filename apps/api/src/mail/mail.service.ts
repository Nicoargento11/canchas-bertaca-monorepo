import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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

  async sendMail(mailOptions: { to: string; subject: string; text: string }) {
    try {
      console.log(mailOptions);
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        ...mailOptions,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
