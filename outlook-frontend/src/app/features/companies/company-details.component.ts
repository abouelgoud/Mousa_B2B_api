import { Component, inject, signal, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CompanyService, Company } from '../../core/services/company.service';

@Component({
    selector: 'app-company-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
<div class="details-container h-100 d-flex flex-column overflow-hidden">
    <!-- Header -->
    <header class="toolbar d-flex justify-content-between align-items-center shadow-sm">
        <div class="d-flex align-items-center gap-3">
            <button class="btn btn-light btn-sm rounded-0 border" routerLink="/companies">
                <i class="bi bi-arrow-left"></i>
            </button>
            @if (company(); as comp) {
                <div>
                    <h4 class="mb-0">{{ comp.legalName }}</h4>
                    <div class="d-flex align-items-center gap-2" style="font-size: 13px;">
                        <span class="text-primary fw-semibold">Corporate Partner</span>
                        <span class="text-muted">|</span>
                        <span class="text-secondary"><i class="bi bi-geo-alt me-1"></i>{{ comp.headOfficeAddress }}</span>
                    </div>
                </div>
            }
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-primary d-flex align-items-center gap-2" (click)="editCompany()">
                <i class="bi bi-pencil-square"></i>
                <span>Edit Profile</span>
            </button>
        </div>
    </header>

    <!-- Main Content -->
    <div class="flex-grow-1 overflow-auto p-4">
        @if (!loading() && company(); as comp) {
            <div class="container-fluid py-2">
                <div class="row content-row g-4">
                    
                    <!-- Sidebar -->
                    <div class="col-lg-4">
                        <div class="profile-header-card shadow-sm">
                            <div class="stat-label">Total Workforce</div>
                            <div class="stat-value">{{ comp.totalEmployees }}</div>
                            <div class="mt-3" style="font-size: 12px; opacity: 0.9;">
                                Active screening partnership since 2024
                            </div>
                        </div>

                        <div class="info-card">
                            <div class="card-header"><h6>Key Metrics</h6></div>
                            <div class="card-body">
                                <div class="data-row">
                                    <span class="label">Monthly Volume</span>
                                    <span class="value">{{ comp.estimatedMonthlyScreeningVolume }} cases</span>
                                </div>
                                <div class="data-row">
                                    <span class="label">Industry</span>
                                    <span class="value">{{ comp.businessActivity }}</span>
                                </div>
                                <div class="data-row">
                                    <span class="label">CR Number</span>
                                    <span class="value text-primary">{{ comp.crNumber }}</span>
                                </div>
                                <div class="data-row">
                                    <span class="label">VAT ID</span>
                                    <span class="value">{{ comp.vatRegistrationNumber || 'N/A' }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="info-card">
                            <div class="card-header"><h6>Operational Mode</h6></div>
                            <div class="card-body">
                                <div class="d-flex align-items-center gap-3 p-3 bg-light rounded shadow-none border">
                                    <i class="bi bi-cpu text-primary fs-3"></i>
                                    <div>
                                        <div class="fw-bold text-dark small">{{ getAssignmentModeLabel(comp.defaultProviderAssignmentMode) }}</div>
                                        <div class="text-muted" style="font-size: 11px;">Automatic routing is enabled</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Content Area -->
                    <div class="col-lg-8">
                        <div class="info-card bg-white">
                            <ul class="nav nav-fluent px-4 mt-2">
                                <li class="nav-item">
                                    <a class="nav-link active" href="javascript:void(0)">Portfolio & Docs</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="javascript:void(0)">Screening History</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="javascript:void(0)">Locations</a>
                                </li>
                            </ul>

                            <div class="card-body pt-0">
                                <h6 class="fw-bold mb-3 text-secondary text-uppercase" style="font-size: 11px;">Compliance Documents</h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="doc-pill">
                                            <div class="doc-icon"><i class="bi bi-file-earmark-pdf"></i></div>
                                            <div class="flex-grow-1">
                                                <div class="fw-semibold small">CR Certificate</div>
                                                <div class="text-muted" style="font-size: 11px;">Validated Document</div>
                                            </div>
                                            <button class="btn btn-sm btn-link text-primary"><i class="bi bi-download"></i></button>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="doc-pill opacity-50">
                                            <div class="doc-icon bg-light text-secondary"><i class="bi bi-lock-fill"></i></div>
                                            <div class="flex-grow-1">
                                                <div class="fw-semibold small">SLA Agreement</div>
                                                <div class="text-muted" style="font-size: 11px;">Pending Upload</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h6 class="fw-bold mt-5 mb-3 text-secondary text-uppercase" style="font-size: 11px;">Partner Performance</h6>
                                <div class="empty-placeholder">
                                    <i class="bi bi-activity"></i>
                                    <p>Operational analytics will be available once the first batch of candidate screenings is processed.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Branch List -->
                        <div class="info-card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h6>Registered Branches</h6>
                                <button class="btn btn-sm btn-link text-primary text-decoration-none fw-semibold">Add Branch</button>
                            </div>
                            <div class="card-body p-0">
                                <div class="list-group list-group-flush">
                                    <div class="list-group-item d-flex align-items-center gap-3 py-3 border-0">
                                        <div class="bg-primary-subtle text-primary rounded p-2">
                                            <i class="bi bi-geo-alt"></i>
                                        </div>
                                        <div class="flex-grow-1">
                                            <div class="fw-semibold small">Main Head Office</div>
                                            <div class="text-muted" style="font-size: 12px;">{{ comp.headOfficeAddress }}</div>
                                        </div>
                                        <span class="badge-fluent small">Primary Hub</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        } @else if (loading()) {
            <!-- Loading State -->
            <div class="text-center py-5 h-100 d-flex flex-column align-items-center justify-content-center">
                <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                <div class="mt-2 text-muted small">Accessing corporate profile...</div>
            </div>
        }
    </div>
</div>
    `,
    styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit {
    private companyService = inject(CompanyService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    company = signal<Company | null>(null);
    loading = signal<boolean>(true);

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadCompany(id);
            }
        });
    }

    loadCompany(id: string) {
        this.loading.set(true);
        this.companyService.getCompany(id).subscribe({
            next: (c: any) => {
                const data = c.data || c;
                this.company.set(data);
                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load company', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    getAssignmentModeLabel(mode: number): string {
        switch (mode) {
            case 0: return 'Automatic Smart Routing';
            case 1: return 'Manual Quality Approval';
            case 2: return 'Direct Preferred Network';
            default: return 'Default';
        }
    }

    editCompany() {
        if (this.company()) {
            this.router.navigate(['/companies/edit', this.company()?.id]);
        }
    }
}
