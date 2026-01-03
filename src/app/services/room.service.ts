// src/app/services/room.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, tap } from 'rxjs';
import { Room, Booking } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private rooms: Room[] = [
    { id: 101, name: '101', type: 'Single', price: 100, isAvailable: true },
    { id: 102, name: '102', type: 'Double', price: 150, isAvailable: true },
    { id: 103, name: '103', type: 'Suite', price: 350, isAvailable: true },
    { id: 201, name: '201', type: 'Single', price: 110, isAvailable: false },
    { id: 202, name: '202', type: 'Double', price: 160, isAvailable: true },
    { id: 203, name: '203', type: 'Suite', price: 400, isAvailable: true },
    { id: 301, name: '301', type: 'Double', price: 170, isAvailable: true },
    { id: 302, name: '302', type: 'Suite', price: 450, isAvailable: true },
    { id: 303, name: '303', type: 'Single', price: 120, isAvailable: true }
  ];

  private roomsSubject = new BehaviorSubject<Room[]>(this.rooms);

  getRooms(): Observable<Room[]> {
    return this.roomsSubject.asObservable().pipe(delay(400));
  }

  bookRoom(booking: Booking): Observable<boolean> {
    return of(true).pipe(
      delay(600),
      tap(() => {
        const updated = this.roomsSubject.value.map(r => 
          r.id === booking.roomId ? { ...r, isAvailable: false } : r
        );
        this.roomsSubject.next(updated);
      })
    );
  }
}