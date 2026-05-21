import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../../core/services/case.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-waiting-queue',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './waiting-queue.component.html',
    styleUrls: ['./waiting-queue.component.scss']
})
export class WaitingQueueComponent implements OnInit {
    private caseService = inject(CaseService);

    waitingQueue: any[] = [];
    loading = true;

    ngOnInit(): void {
        this.loadQueue();
    }

    loadQueue() {
        this.loading = true;
        this.caseService.getWaitingQueue().subscribe({
            next: (data) => {
                this.waitingQueue = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load waiting queue', err);
                this.loading = false;
            }
        });
    }

    getStatusClass(status: number): string {
        switch (status) {
            case 1: return 'bg-primary-subtle text-primary'; // Assigned
            case 2: return 'bg-info-subtle text-info'; // Arrived
            case 3: return 'bg-warning-subtle text-warning'; // UnderTesting
            case 4: return 'bg-purple-subtle text-purple'; // LabProcessing
            default: return 'bg-secondary-subtle text-secondary';
        }
    }

    getStatusLabel(status: number): string {
        switch (status) {
            case 1: return 'Assigned';
            case 2: return 'Arrived';
            case 3: return 'Under Testing';
            case 4: return 'Lab Processing';
            default: return 'Active';
        }
    }
}
