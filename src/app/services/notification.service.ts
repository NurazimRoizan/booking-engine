import { Injectable, signal } from '@angular/core';

export interface CyberNotification {
  message: string;
  type: 'SUCCESS' | 'ERROR';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  activeNotification = signal<CyberNotification | null>(null);

  show(message: string, type: 'SUCCESS' | 'ERROR' = 'SUCCESS') {
    this.activeNotification.set({ message, type });
    setTimeout(() => this.activeNotification.set(null), 5000); // Auto-dismiss after 5s
  }
}