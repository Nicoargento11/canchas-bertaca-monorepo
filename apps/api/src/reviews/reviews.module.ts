import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, MailService, PrismaService],
})
export class ReviewsModule {}
