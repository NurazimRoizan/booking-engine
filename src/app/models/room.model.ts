export interface Room {
  id: number;
  name: string;
  type: 'Single' | 'Double' | 'Suite' | 'Twin';
  price: number;
  isAvailable: boolean;
}

export interface Booking {
  roomId: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
}