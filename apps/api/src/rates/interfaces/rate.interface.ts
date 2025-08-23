export interface Rate {
  id: string;
  name: string;
  price: number;
  reservationAmount: number;
  complexId: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
