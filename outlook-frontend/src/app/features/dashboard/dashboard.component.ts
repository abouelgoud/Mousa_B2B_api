import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
    dashboardService = inject(DashboardService);
    private cdr = inject(ChangeDetectorRef);
    data = signal<any>(null);
    loading = signal<boolean>(true);

    constructor() {
        this.dashboardService.getDashboardData().subscribe({
            next: (result: any) => {
                const unwrapped = (result && result.data) ? result.data : result;
                this.data.set(unwrapped);
                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Dashboard data fetch failed', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }
}
