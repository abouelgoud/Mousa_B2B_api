import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardData } from '../../core/services/dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
    private dashboardService = inject(DashboardService);

    stats: any[] = [];
    recentRequests: any[] = [];
    aiInsights: any[] = [];

    ngOnInit() {
        this.dashboardService.getDashboardData().subscribe({
            next: (data: DashboardData) => {
                this.stats = [
                    { label: 'Total Requests', value: data.stats.totalRequests.toLocaleString(), icon: 'bi-file-earmark-medical', color: '#0078d4' },
                    { label: 'Pending Arrived', value: data.stats.pendingArrived.toLocaleString(), icon: 'bi-person-check', color: '#107c10' },
                    { label: 'Under Testing', value: data.stats.underTesting.toLocaleString(), icon: 'bi-flask', color: '#5c2d91' },
                    { label: 'Reports Ready', value: data.stats.reportsReady.toLocaleString(), icon: 'bi-check-circle', color: '#d83b01' }
                ];
                // Map the request status to match the template expectations if needed, or update template
                // The template uses 'UnderTesting', 'ReportReady' etc matching the Enum strings from backend
                this.recentRequests = data.recentRequests;
                this.aiInsights = data.aiInsights;
            },
            error: (err) => {
                console.error('Failed to load dashboard data', err);
            }
        });
    }
}
