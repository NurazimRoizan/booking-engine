// src/app/models/room.model.ts
export interface Room {
  id: number;
  name: string;
  type: 'Single' | 'Double' | 'Suite';
  price: number;
  isAvailable: boolean;
}

export interface Booking {
  roomId: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
}