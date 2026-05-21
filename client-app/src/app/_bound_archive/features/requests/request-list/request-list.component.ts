import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService, ScreeningRequest } from '../../../core/services/request.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-request-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './request-list.component.html',
    styleUrls: ['./request-list.component.scss']
})
export class RequestListComponent implements OnInit {
    private requestService = inject(RequestService);
    requests: ScreeningRequest[] = [];
    loading = true;

    ngOnInit(): void {
        // Current company ID placeholder
        const companyId = '00000000-0000-0000-0000-000000000001';
        this.requestService.getCompanyRequests(companyId).subscribe({
            next: (data) => {
                this.requests = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load requests', err);
                this.loading = false;
            }
        });
    }

    getStatusClass(status: number): string {
        switch (status) {
            case 0: return 'bg-warning-subtle text-warning';
            case 1: return 'bg-info-subtle text-info';
            case 2: return 'bg-success-subtle text-success';
            default: return 'bg-secondary-subtle text-secondary';
        }
    }

    getStatusLabel(status: number): string {
        switch (status) {
            case 0: return 'Pending';
            case 1: return 'Assigned';
            case 2: return 'Completed';
            default: return 'Unknown';
        }
    }
}
