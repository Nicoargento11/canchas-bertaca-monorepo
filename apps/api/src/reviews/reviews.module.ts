import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, MailService],
})
export class ReviewsModule {}
