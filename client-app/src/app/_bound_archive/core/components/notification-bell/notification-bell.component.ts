import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-notification-bell',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-bell.component.html',
    styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent {
    public notificationService = inject(NotificationService);
    showDropdown = false;

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
    }

    markAsRead(id: string, event: Event) {
        event.stopPropagation();
        this.notificationService.markAsRead(id);
    }
}
