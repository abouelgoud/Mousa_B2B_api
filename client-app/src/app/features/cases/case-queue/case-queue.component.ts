import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../../core/services/case.service';
import { AuthService } from '../../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-case-queue',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './case-queue.component.html',
    styleUrls: ['./case-queue.component.scss']
})
export class CaseQueueComponent implements OnInit {
    private caseService = inject(CaseService);
    private authService = inject(AuthService);

    worklist: any[] = [];
    loading = true;
    stats = {
        awaitingVitals: 0,
        pendingLab: 0,
        readyForPhysician: 0,
        total: 0
    };

    ngOnInit(): void {
        const user = this.authService.currentUser();
        if (user && user.providerId) {
            this.caseService.getProviderWorklist(user.providerId).subscribe({
                next: (data) => {
                    this.worklist = data;
                    this.calculateStats();
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Failed to load worklist', err);
                    this.loading = false;
                }
            });
        }
    }

    calculateStats() {
        this.stats = {
            awaitingVitals: this.worklist.filter(item => item.status === 1).length,
            pendingLab: this.worklist.filter(item => [2, 3, 4].includes(item.status)).length,
            readyForPhysician: this.worklist.filter(item => item.status === 8).length,
            total: this.worklist.length
        };
    }

    getStatusClass(status: number): string {
        switch (status) {
            case 1: return 'bg-primary-subtle text-primary';
            case 2: return 'bg-info-subtle text-info';
            case 3: return 'bg-warning-subtle text-warning';
            case 4: return 'bg-purple-subtle text-purple';
            case 8: return 'bg-success-subtle text-success';
            default: return 'bg-secondary-subtle text-secondary';
        }
    }

    getStatusLabel(status: number): string {
        switch (status) {
            case 1: return 'Assigned';
            case 2: return 'Arrived';
            case 3: return 'Testing';
            case 4: return 'Lab Processing';
            case 8: return 'Report Ready';
            default: return 'Active';
        }
    }
}
