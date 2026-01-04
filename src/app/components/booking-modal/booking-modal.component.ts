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
  templateUrl: './booking-modal.html',
  styleUrl: './booking-modal.css'
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