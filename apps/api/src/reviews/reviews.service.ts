import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly mailService: MailService) {}

  async create(createReviewDto: CreateReviewDto) {
    // Aquí guardarías en tu base de datos si es necesario
    return createReviewDto;
  }

  async sendEmailNotification(review: CreateReviewDto) {
    const subject = `Nueva reseña recibida: ${review.rating} estrellas`;
    const text = `Has recibido una nueva reseña:\n\n
      Calificación: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}\n
      Comentario: ${review.comment}\n\n
      ${review.email ? `Email del remitente: ${review.email}` : 'Reseña anónima'}`;

    const mailSend = await this.mailService.sendMail({
      to: 'valdes.nicoedu@gmail.com', // Tu email de recepción
      subject,
      text,
    });
    console.log(mailSend);
  }
}
