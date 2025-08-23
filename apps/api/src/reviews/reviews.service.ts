import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    // Aquí guardarías en tu base de datos si es necesario
    return createReviewDto;
  }

  async sendEmailNotification(review: CreateReviewDto) {
    const complex = await this.prisma.complex.findUnique({
      where: { id: review.complexId },
    });

    if (!complex || !complex.email) {
      throw new NotFoundException(
        'Complejo no encontrado o sin email configurado',
      );
    }
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

    const subject = `Nueva reseña recibida en ${complex.name}`;

    const text = `
📢 ¡Has recibido una nueva reseña!

🏟️ Complejo: ${complex.name}
⭐ Calificación: ${stars}

📝 Comentario:
"${review.comment}"

${review.email ? `📩 Remitente: ${review.email}` : '🕵️‍♂️ Reseña anónima'}

Fecha: ${new Date().toLocaleString('es-AR')}
`;

    await this.mailService.sendMail({
      to: complex.email,
      subject,
      text,
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>📢 ¡Nueva reseña para <strong>${complex.name}</strong>!</h2>
      <p><strong>⭐ Calificación:</strong> ${stars}</p>
      <p><strong>📝 Comentario:</strong><br/>"${review.comment}"</p>
      <p>${review.email ? `📩 <strong>Remitente:</strong> ${review.email}` : '🕵️‍♂️ <em>Reseña anónima</em>'}</p>
      <p style="font-size: 0.9em; color: #555;">Fecha: ${new Date().toLocaleString('es-AR')}</p>
    </div>
  `,
    });
  }
}
