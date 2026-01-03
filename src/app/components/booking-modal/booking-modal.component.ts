// src/app/components/booking-modal/booking-modal.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';

/**
 * Custom Validator: Ensures Check-out is after Check-in
 */
export const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const checkIn = control.get('checkIn')?.value;
  const checkOut = control.get('checkOut')?.value;

  if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
    return { dateRangeInvalid: true };
  }
  return null;
};

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="modal d-block" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-black border border-info rounded-0 shadow-lg">
          
          <div class="modal-header border-bottom border-info border-opacity-25">
            <h5 class="modal-title text-info text-glow small fw-bold">ROOM RESERVATION // {{ room.name }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="onClose.emit()"></button>
          </div>

          <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
            <div class="modal-body p-4">
              
              <div class="mb-4">
                <label class="text-info small mb-1 fw-bold">FULL NAME</label>
                <input type="text" 
                       class="form-control bg-transparent text-white border-secondary rounded-0 shadow-none" 
                       [class.border-danger]="isFieldInvalid('guestName')"
                       placeholder="ENTER NAME"
                       formControlName="guestName">
                <div *ngIf="isFieldInvalid('guestName')" class="text-danger small mt-1">Name is required</div>
              </div>

              <div class="row">
                <div class="col-6">
                  <label class="text-info small mb-1 fw-bold">ARRIVAL DATE</label>
                  <input type="date" 
                         class="form-control bg-transparent text-white border-secondary rounded-0 shadow-none" 
                         formControlName="checkIn"
                         (click)="openPicker($event)">
                </div>
                <div class="col-6">
                  <label class="text-info small mb-1 fw-bold">DEPARTURE DATE</label>
                  <input type="date" 
                         class="form-control bg-transparent text-white border-secondary rounded-0 shadow-none" 
                         formControlName="checkOut"
                         (click)="openPicker($event)">
                </div>
              </div>

              <div *ngIf="bookingForm.errors?.['dateRangeInvalid']" class="alert alert-danger bg-transparent border-danger text-danger rounded-0 mt-3 small">
                CRITICAL_ERROR: Departure date must be after arrival date.
              </div>
            </div>

            <div class="modal-footer border-top border-info border-opacity-25 p-3">
              <button type="button" class="btn btn-outline-secondary rounded-0 flex-grow-1" (click)="onClose.emit()">
                CANCEL
              </button>
              <button type="submit" 
                      class="btn btn-info rounded-0 fw-bold flex-grow-1" 
                      [disabled]="bookingForm.invalid">
                CONFIRM_RESERVATION
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  `
})
export class BookingModalComponent {
  @Input({ required: true }) room!: Room;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private roomService = inject(RoomService);

  // Initialize form with local validator to avoid import issues
  bookingForm = this.fb.group({
    guestName: ['', [Validators.required, Validators.minLength(2)]],
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required]
  }, { validators: dateRangeValidator });

  /**
   * Helper to check if a field is touched and invalid
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      // Use getRawValue to ensure all data is captured
      const formValues = this.bookingForm.getRawValue();
      const bookingData = { 
        roomId: this.room.id, 
        ...formValues 
      };

      console.log('Initiating Reservation...', bookingData);

      this.roomService.bookRoom(bookingData as any).subscribe({
        next: (success) => {
          if (success) {
            this.onSuccess.emit();
          }
        },
        error: (err) => {
          console.error('Reservation Failed:', err);
          alert('SYSTEM_ERROR: Could not complete booking.');
        }
      });
    }
  }

  openPicker(event: Event) {
    const input = event.target as HTMLInputElement;
    try {
      // Some modern browsers support showPicker()
      if ('showPicker' in HTMLInputElement.prototype) {
        input.showPicker();
      }
    } catch (error) {
      console.log('Browser does not support showPicker(), falling back to default.');
    }
  }
}