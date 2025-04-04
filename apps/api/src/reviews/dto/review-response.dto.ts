export class ReviewResponseDto {
  success: boolean;
  message?: string;
  review?: {
    rating: number;
    comment: string;
    createdAt?: Date;
  };
}
