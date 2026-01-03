// src/app/components/room-list/room-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, BookingModalComponent],
  template: `
    <nav class="navbar border-bottom border-info border-opacity-25 sticky-top bg-black py-3">
      <div class="container d-flex justify-content-between">
        <span class="navbar-brand text-info fw-bold letter-spacing-2 text-glow">CYBER-HOTEL v2.1</span>
        <span class="text-secondary small d-none d-md-inline fw-lighter">SYSTEM STATUS: <span class="text-info">ONLINE</span></span>
      </div>
    </nav>

    <div class="container py-5">
      <div class="row g-3 mb-5 p-4 border border-info border-opacity-25 bg-black shadow-lg">
        <div class="col-lg-3 col-md-6">
          <label class="small text-info mb-2 d-block fw-bold">SEARCH IDENTIFIER</label>
          <input type="text" class="form-control bg-transparent text-white border-secondary rounded-0 shadow-none" 
                 placeholder="ID / CATEGORY" (input)="updateSearch($event)">
        </div>
        
        <div class="col-lg-3 col-md-6">
          <label class="small text-info mb-2 d-block fw-bold">PRICE CAP: \${{ maxPriceFilter() }}</label>
          <input type="range" class="form-range" min="100" max="500" step="10" 
                 [value]="maxPriceFilter()" (input)="updatePrice($event)">
        </div>

        <div class="col-lg-2 col-md-4">
          <label class="small text-info mb-2 d-block fw-bold">SORT LOGIC</label>
          <select class="form-select bg-black text-white border-secondary rounded-0 shadow-none" (change)="updateSort($event)">
            <option value="none">DEFAULT</option>
            <option value="asc">PRICE: LOW TO HIGH</option>
            <option value="desc">PRICE: HIGH TO LOW</option>
          </select>
        </div>

        <div class="col-lg-2 col-md-4">
          <label class="small text-info mb-2 d-block fw-bold">CATEGORY FILTER</label>
          <select class="form-select bg-black text-white border-secondary rounded-0 shadow-none" (change)="updateType($event)">
            <option value="All">ALL UNITS</option>
            <option value="Single">SINGLE</option>
            <option value="Double">DOUBLE</option>
            <option value="Suite">SUITE</option>
          </select>
        </div>

        <div class="col-lg-2 col-md-4 d-flex align-items-end">
          <div class="form-check form-switch mb-2">
            <input class="form-check-input shadow-none" type="checkbox" (change)="updateAvailable($event)">
            <label class="text-secondary small ms-2">Available room only</label>
          </div>
        </div>
      </div>

      <div class="row g-4">
        @if (isLoading()) {
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="col-12 col-md-6 col-lg-4 crt-flicker">
              <div class="card h-100 cyber-card p-4 overflow-hidden" style="min-height: 280px;">
                <div class="scanline-overlay"></div>
                <div class="skeleton-box mb-3 w-25"></div>
                <div class="skeleton-box mb-4 w-75" style="height: 40px;"></div>
                <div class="skeleton-box mb-3 w-50"></div>
                <div class="skeleton-box mt-auto w-100" style="height: 45px;"></div>
                <div class="mt-2 text-info small opacity-50 fw-lighter">Fetching Information...</div>
              </div>
            </div>
          }
        } @else {
          @for (room of filteredRooms(); track room.id) {
            <div class="col-12 col-md-6 col-lg-4">
              <div class="card h-100 cyber-card">
                <div class="card-body p-4 d-flex flex-column">
                  <div class="d-flex justify-content-between mb-4">
                    <div class="text-secondary border-start border-info ps-2 small">ROOM {{ room.name }}</div>
                    <div [class]="room.isAvailable ? 'text-cyan' : 'text-danger'" class="small fw-bold">
                      {{ room.isAvailable ? '● READY' : '● OCCUPIED' }}
                    </div>
                  </div>
                  
                  <h2 class="h4 fw-light tracking-widest text-white mb-2">{{ room.type }}</h2>
                  <div class="mb-4">
                    <span class="h2 fw-bold text-glow">\${{ room.price }}</span>
                    <span class="text-secondary ms-2 small">/ night</span>
                  </div>

                  <button 
                    class="btn rounded-0 border-info mt-auto fw-bold btn-hover-glow" 
                    [disabled]="!room.isAvailable"
                    (click)="selectedRoom.set(room)">
                    {{ room.isAvailable ? 'INITIATE BOOKING' : 'RESERVED' }}
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12 text-center py-5 border border-info border-opacity-10">
              <h3 class="text-secondary fw-lighter">NO_MATCHING_UNITS_FOUND</h3>
              <p class="text-info small">ADJUST_SEARCH_PARAMETERS</p>
            </div>
          }
        }
      </div>
    </div>

    @if (selectedRoom()) {
      <app-booking-modal 
        [room]="selectedRoom()!" 
        (onClose)="selectedRoom.set(null)" 
        (onSuccess)="handleBookingSuccess()">
      </app-booking-modal>
    }
  `
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