import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AIService, AIRiskResult } from '../../../core/services/ai.service';
import { catchError, of } from 'rxjs';

@Component({
    selector: 'app-ai-insight',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ai-insight.component.html',
    styleUrl: './ai-insight.component.scss'
})
export class AIInsightComponent implements OnInit {
    @Input({ required: true }) requestId!: string;

    private aiService = inject(AIService);
    insight?: AIRiskResult;
    loading = true;
    error?: string;

    ngOnInit() {
        this.fetchInsight();
    }

    fetchInsight() {
        this.loading = true;
        this.aiService.analyzeRisk(this.requestId)
            .pipe(
                catchError(err => {
                    this.error = 'Unable to fetch AI insights.';
                    this.loading = false;
                    return of(null);
                })
            )
            .subscribe(res => {
                if (res) {
                    this.insight = res;
                }
                this.loading = false;
            });
    }

    getRiskBadgeClass() {
        switch (this.insight?.riskLevel?.toLowerCase()) {
            case 'low': return 'bg-success';
            case 'medium': return 'bg-warning text-dark';
            case 'high': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
}
