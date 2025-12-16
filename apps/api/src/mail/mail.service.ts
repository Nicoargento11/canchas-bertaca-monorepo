import { Injectable } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private apiInstance: brevo.TransactionalEmailsApi;
  private isConfigured: boolean;

  constructor() {
    // Validar que la API key esté configurada
    if (!process.env.BREVO_API_KEY) {
      console.warn('⚠️  BREVO_API_KEY no está configurado. El servicio de correo estará deshabilitado.');
      this.isConfigured = false;
      return;
    }

    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );
    this.isConfigured = true;
    console.log('✅ Brevo mail service configurado correctamente');
  }

  async sendMail(mailOptions: MailOptions) {
    if (!this.isConfigured) {
      console.warn('⚠️  Mail service no configurado. Email NO enviado a:', mailOptions.to);
      return;
    }

    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      // Configurar remitente
      sendSmtpEmail.sender = {
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@reservasfutbol.com.ar',
        name: process.env.BREVO_SENDER_NAME || 'Canchas Bertaca & Seven'
      };

      // Configurar destinatario
      sendSmtpEmail.to = [{ email: mailOptions.to }];

      // Configurar contenido
      sendSmtpEmail.subject = mailOptions.subject;
      sendSmtpEmail.htmlContent = mailOptions.html || `<p>${mailOptions.text}</p>`;

      // Enviar email
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Email enviado correctamente a:', mailOptions.to);
      return response;

    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }
  }
}
