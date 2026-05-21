import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../../core/services/case.service';
import { RouterModule } from '@angular/router';

import { AIInsightComponent } from '../../../shared/components/ai-insight/ai-insight.component';

@Component({
    selector: 'app-case-review',
    standalone: true,
    imports: [CommonModule, RouterModule, AIInsightComponent],
    templateUrl: './case-review.component.html',
    styleUrls: ['./case-review.component.scss']
})
export class CaseReviewComponent implements OnInit {
    private caseService = inject(CaseService);

    reviewQueue: any[] = [];
    loading = true;

    ngOnInit(): void {
        this.caseService.getAdminQueue().subscribe({
            next: (data) => {
                this.reviewQueue = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load review queue', err);
                this.loading = false;
            }
        });
    }

    approveCase(id: string) {
        this.caseService.reviewCase({ requestId: id, approved: true, comments: 'Result verified by medical review team.' }).subscribe(() => {
            this.reviewQueue = this.reviewQueue.filter(q => q.id !== id);
        });
    }
}
