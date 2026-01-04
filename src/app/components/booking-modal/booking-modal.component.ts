import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { NotificationService } from '../../services/notification.service';

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
  private notificationService = inject(NotificationService);

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
      const formValues = this.bookingForm.getRawValue();
      this.roomService.bookRoom({ roomId: this.room.id, ...formValues } as any).subscribe({
        next: (success) => {
          if (success) {
            // Trigger the new notification
            this.notificationService.show(`UNIT ${this.room.name} RESERVATION CONFIRMED. SEE YOU THERE.`);
            this.onSuccess.emit();
          }
        },
        error: () => {
          this.notificationService.show('CONNECTION INTERRUPTED. RESERVATION FAILED.', 'ERROR');
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