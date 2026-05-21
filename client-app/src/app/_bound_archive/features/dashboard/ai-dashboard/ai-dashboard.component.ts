import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardData } from '../../../core/services/dashboard.service';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-ai-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
<div class="container-fluid py-4 bg-light min-vh-100">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-1">AI Intelligence Dashboard</h2>
            <p class="text-muted">Predictive insights and real-time screening analytics.</p>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-white border shadow-sm"><i class="bi bi-download me-2"></i>Export Report</button>
            <a routerLink="/requests/wizard" class="btn btn-primary shadow-sm px-4">
                <i class="bi bi-plus-lg me-2"></i>New Request
            </a>
        </div>
    </div>

    <!-- Stats Row -->
    <div class="row g-4 mb-4" *ngIf="data">
        <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-primary text-white">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small opacity-75 fw-bold">TOTAL REQUESTS</span>
                    <i class="bi bi-clipboard-pulse fs-4"></i>
                </div>
                <h2 class="fw-bold mb-0">{{data.stats.totalRequests}}</h2>
                <div class="small mt-2 opacity-75"><i class="bi bi-arrow-up me-1"></i>12% from last month</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small text-muted fw-bold">PENDING ARRIVAL</span>
                    <i class="bi bi-hourglass-split text-warning fs-4"></i>
                </div>
                <h2 class="fw-bold mb-0 text-dark">{{data.stats.pendingArrived}}</h2>
                <div class="progress mt-3" style="height: 4px;">
                    <div class="progress-bar bg-warning" [style.width.%]="(data.stats.pendingArrived / data.stats.totalRequests) * 100"></div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small text-muted fw-bold">UNDER TESTING</span>
                    <i class="bi bi-activity text-info fs-4"></i>
                </div>
                <h2 class="fw-bold mb-0 text-dark">{{data.stats.underTesting}}</h2>
                <div class="progress mt-3" style="height: 4px;">
                    <div class="progress-bar bg-info" [style.width.%]="(data.stats.underTesting / data.stats.totalRequests) * 100"></div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small text-muted fw-bold">REPORTS READY</span>
                    <i class="bi bi-file-earmark-check text-success fs-4"></i>
                </div>
                <h2 class="fw-bold mb-0 text-dark">{{data.stats.reportsReady}}</h2>
                <div class="progress mt-3" style="height: 4px;">
                    <div class="progress-bar bg-success" [style.width.%]="(data.stats.reportsReady / data.stats.totalRequests) * 100"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content Row -->
    <div class="row g-4">
        <!-- AI Insights Sidebar -->
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm rounded-4 h-100">
                <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
                    <h5 class="fw-bold mb-0"><i class="bi bi-stars text-primary me-2"></i>AI Insights</h5>
                    <p class="small text-muted">Machine learning powered predictions.</p>
                </div>
                <div class="card-body px-4">
                    <div class="insight-card p-3 rounded-4 border mb-3" *ngFor="let insight of data?.aiInsights" [class.border-start-primary]="insight.colorClass === 'text-primary'">
                        <div class="d-flex gap-3">
                            <div class="icon-box rounded-circle shadow-sm" [ngClass]="insight.colorClass">
                                <i [class]="insight.icon"></i>
                            </div>
                            <div>
                                <h6 class="fw-bold mb-1">{{insight.header}}</h6>
                                <div class="badge-pill mb-2 px-2 py-1 fs-6 fw-bold" [ngClass]="insight.colorClass">{{insight.value}}</div>
                                <p class="small text-muted mb-0">{{insight.description}}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity Table -->
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 h-100">
                <div class="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="fw-bold mb-0">Recent Screening Requests</h5>
                        <p class="small text-muted">A summary of the latest 5 activities.</p>
                    </div>
                    <button class="btn btn-sm btn-light border" (click)="viewAllRequests()">View All</button>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="ps-4">Case ID</th>
                                    <th>Candidate</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th class="pe-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let r of data?.recentRequests">
                                    <td class="ps-4 fw-bold text-primary">{{r.caseId}}</td>
                                    <td>
                                        <div class="fw-bold">{{r.candidateName}}</div>
                                        <div class="small text-muted">{{r.companyName}}</div>
                                    </td>
                                    <td>
                                        <span class="badge rounded-pill fw-normal px-3 py-2" [ngClass]="getStatusClass(r.status)">
                                            {{r.status}}
                                        </span>
                                    </td>
                                    <td class="small">{{r.submissionDate | date:'mediumDate'}}</td>
                                    <td class="pe-4">
                                        <button class="btn btn-sm btn-icon border-0 bg-light rounded-circle" 
                                                title="View Details"
                                                (click)="viewRequestDetails(r.caseId)">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
    styles: [`
        .card { transition: transform 0.2s ease; }
        .icon-box { 
            width: 40px; height: 40px; background: #f8f9fa; 
            display: flex; align-items: center; justify-content: center;
        }
        .insight-card { transition: all 0.3s ease; }
        .insight-card:hover { background: #f8f9fa; transform: scale(1.02); }
        .border-start-primary { border-left: 4px solid #0d6efd !important; }
        .text-accent { color: #6f42c1 !important; }
        .bg-accent-subtle { background-color: #e2d9f3 !important; }
        .btn-icon { width: 32px; height: 32px; padding: 0; }
    `]
})
export class AiDashboardComponent implements OnInit {
    private dashboardService = inject(DashboardService);
    private router = inject(Router);
    data?: DashboardData;

    ngOnInit() {
        this.dashboardService.getDashboardData().subscribe(res => {
            this.data = res;
        });
    }

    viewAllRequests() {
        this.router.navigate(['/requests/list']);
    }

    viewRequestDetails(caseId: string) {
        // For now, just log - you can implement detailed view later
        console.log('View details for case:', caseId);
        // this.router.navigate(['/requests/details', caseId]);
    }

    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-warning-subtle text-warning';
            case 'undertesting': return 'bg-info-subtle text-info';
            case 'completed': return 'bg-success-subtle text-success';
            case 'reportready': return 'bg-primary-subtle text-primary';
            default: return 'bg-light text-muted';
        }
    }
}
