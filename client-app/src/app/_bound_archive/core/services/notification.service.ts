import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';

export interface Notification {
    id: string;
    message: string;
    type: number;
    isRead: boolean;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private authService = inject(AuthService);
    private http = inject(HttpClient);
    private hubConnection?: signalR.HubConnection;
    private apiUrl = 'http://localhost:5284/api/Notification';

    public notifications = signal<Notification[]>([]);
    public unreadCount = signal<number>(0);

    constructor() {
        this.loadNotifications();
        this.initSignalR();
    }

    private loadNotifications() {
        if (!this.authService.isAuthenticated()) return;

        this.http.get<Notification[]>(this.apiUrl).subscribe({
            next: (notifs) => {
                this.notifications.set(notifs);
                this.unreadCount.set(notifs.filter(n => !n.isRead).length);
            },
            error: (err) => console.error('Failed to load notifications:', err)
        });
    }

    private initSignalR() {
        const token = this.authService.token;
        if (!token) return;

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5284/notificationHub', {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start().catch(err => console.error('SignalR Connection Error: ', err));

        this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
            this.notifications.update(n => [notification, ...n]);
            this.unreadCount.update(c => c + 1);
        });
    }

    markAsRead(id: string) {
        this.http.post(`${this.apiUrl}/${id}/mark-read`, {}).subscribe({
            next: () => {
                this.notifications.update(n => n.map(notif => notif.id === id ? { ...notif, isRead: true } : notif));
                this.unreadCount.update(c => Math.max(0, c - 1));
            },
            error: (err) => console.error('Failed to mark notification as read:', err)
        });
    }
}
