import { Controller, Post, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    const review = await this.reviewsService.create(createReviewDto);
    await this.reviewsService.sendEmailNotification(createReviewDto);
    return { success: true, review };
  }
}
