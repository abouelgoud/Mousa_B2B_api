import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../core/services/reports.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
    reportsService = inject(ReportsService);
    summary = signal<any>(null);

    constructor() {
        this.reportsService.getPlatformSummary().subscribe({
            next: (data) => this.summary.set(data),
            error: (err) => console.error('Failed to load reports', err)
        });
    }
}
