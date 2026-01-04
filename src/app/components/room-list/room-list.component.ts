import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, BookingModalComponent, NotificationComponent],
  templateUrl: './room-list.html',
  styleUrl: './room-list.css'
})
export class RoomListComponent implements OnInit {
  private roomService = inject(RoomService);

  // State Signals
  rooms = signal<Room[]>([]);
  isLoading = signal(true);
  selectedRoom = signal<Room | null>(null);

  // Filter Signals
  searchTerm = signal('');
  maxPriceFilter = signal(500);
  typeFilter = signal('All');
  onlyAvailable = signal(false);
  sortOrder = signal('none');

  // Logic: Combined Filter & Sort
  filteredRooms = computed(() => {
    let list = this.rooms().filter(r => {
      const search = this.searchTerm().toLowerCase();
      const matchSearch = r.name.toLowerCase().includes(search) || 
                          r.type.toLowerCase().includes(search);
      const matchPrice = r.price <= this.maxPriceFilter();
      const matchType = this.typeFilter() === 'All' || r.type === this.typeFilter();
      const matchAvail = !this.onlyAvailable() || r.isAvailable;
      
      return matchSearch && matchPrice && matchType && matchAvail;
    });

    if (this.sortOrder() === 'asc') list.sort((a, b) => a.price - b.price);
    if (this.sortOrder() === 'desc') list.sort((a, b) => b.price - a.price);
    
    return list;
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    // Simulating network delay for the CRT effect to be visible
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms.set(data);
        setTimeout(() => this.isLoading.set(false), 800); // Slight extra delay for aesthetic
      },
      error: () => this.isLoading.set(false)
    });
  }

  // Filter Update Handlers
  updateSearch(e: Event) {
    this.searchTerm.set((e.target as HTMLInputElement).value);
  }

  updatePrice(e: Event) {
    this.maxPriceFilter.set(+(e.target as HTMLInputElement).value);
  }

  updateType(e: Event) {
    this.typeFilter.set((e.target as HTMLSelectElement).value);
  }

  updateAvailable(e: Event) {
    this.onlyAvailable.set((e.target as HTMLInputElement).checked);
  }

  updateSort(e: Event) {
    this.sortOrder.set((e.target as HTMLSelectElement).value);
  }

  handleBookingSuccess() {
    this.selectedRoom.set(null);
    this.load(); // Refreshing shows the flicker effect again for "updating data"
  }
}