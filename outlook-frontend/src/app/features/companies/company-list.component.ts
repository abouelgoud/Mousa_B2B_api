import { Component, inject, signal, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CompanyService, Company } from '../../core/services/company.service';
import { AuthService } from '../../core/services/auth.service';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { AppPermissions } from '../../core/constants/permissions';

@Component({
    selector: 'app-company-list',
    standalone: true,
    imports: [CommonModule, RouterModule, HasPermissionDirective],
    template: `
<div class="h-100 d-flex flex-column overflow-hidden">
    <!-- Header -->
    <header class="toolbar d-flex justify-content-between align-items-center">
        <div>
            <h4 class="mb-1"><i class="bi bi-building-check me-2 text-primary"></i>Corporate Clients</h4>
            <p class="text-muted mb-0">Manage partner organizations, screening volumes, and service agreements.</p>
        </div>
        <button *hasPermission="'Companies.Manage'" class="btn btn-primary d-flex align-items-center" (click)="onboardNewCompany()">
            <i class="bi bi-building-add me-2"></i>Onboard Company
        </button>
    </header>

    <!-- Content -->
    <div class="content-area flex-grow-1 overflow-auto p-4">
        <div class="table-container shadow-sm bg-white">
            <table class="table table-hover align-middle">
                <thead>
                    <tr>
                        <th class="ps-4" style="width: 350px;">Organization</th>
                        <th class="text-center">Size</th>
                        <th>Volume</th>
                        <th>Assignment</th>
                        <th class="text-end pe-4">Actions</th>
                    </tr>
                </thead>
                <tbody *ngIf="!loading()">
                    <tr *ngFor="let c of companies()" class="cursor-pointer" (click)="viewDetails(c.id)">
                        <td class="ps-4">
                            <div class="d-flex align-items-center gap-3">
                                <div class="avatar-building">
                                    <i class="bi bi-briefcase"></i>
                                </div>
                                <div>
                                    <div class="fw-semibold">{{ c.legalName }}</div>
                                    <div class="small text-secondary">CR: {{ c.crNumber }} • {{c.businessActivity}}</div>
                                </div>
                            </div>
                        </td>
                        <td class="text-center">
                            <span class="badge-fluent" [ngClass]="getCompanySizeLabel(c.companySize).toLowerCase()">
                                {{ getCompanySizeLabel(c.companySize) }}
                            </span>
                            <div class="mt-1" style="font-size: 11px; color: #616161;">{{ c.totalEmployees }} Staff</div>
                        </td>
                        <td>
                            <div style="width: 120px;">
                                <div class="d-flex justify-content-between mb-1" style="font-size: 11px;">
                                    <span class="fw-semibold">{{ c.estimatedMonthlyScreeningVolume }} cases</span>
                                    <span class="text-muted">{{getVolumePercentage(c.estimatedMonthlyScreeningVolume)}}%</span>
                                </div>
                                <div class="progress-fluent">
                                    <div class="progress-bar" role="progressbar" 
                                         [style.width.%]="getVolumePercentage(c.estimatedMonthlyScreeningVolume)">
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="small text-secondary">
                                <i class="bi bi-cpu me-1"></i> {{ getAssignmentModeLabel(c.defaultProviderAssignmentMode) }}
                            </span>
                        </td>
                        <td class="pe-4 text-end">
                            <div class="d-flex justify-content-end gap-2 align-items-center">
                                <button class="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0" (click)="viewDetails(c.id); $event.stopPropagation()">
                                    Manage
                                </button>
                                <div class="dropdown" *hasPermission="'Companies.Manage'">
                                    <button class="btn-action-round border-0 bg-transparent" type="button" data-bs-toggle="dropdown" (click)="$event.stopPropagation()">
                                        <i class="bi bi-three-dots"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0">
                                        <li><button class="dropdown-item py-2 small" (click)="editCompany(c.id); $event.stopPropagation()"><i class="bi bi-pencil me-2"></i>Edit Profile</button></li>
                                        <li><button class="dropdown-item py-2 small" (click)="viewDetails(c.id); $event.stopPropagation()"><i class="bi bi-file-earmark-text me-2"></i>Contracts</button></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><button class="dropdown-item py-2 small text-danger" (click)="deleteCompany(c.id); $event.stopPropagation()"><i class="bi bi-trash me-2"></i>Deactivate</button></li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Empty State -->
            <div *ngIf="!loading() && companies().length === 0" class="text-center py-5">
                <i class="bi bi-building display-4 text-muted opacity-25 d-block mb-3"></i>
                <h6 class="fw-semibold">No organizations yet</h6>
                <p class="small text-secondary">Ready to onboard your first corporate client?</p>
                <button *hasPermission="'Companies.Manage'" class="btn btn-primary btn-sm px-4 mt-2" (click)="onboardNewCompany()">
                    Start Onboarding
                </button>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading()" class="text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="small text-muted mt-2">Loading corporate registry...</div>
            </div>
        </div>
    </div>
</div>
    `,
    styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
    private companyService = inject(CompanyService);
    private cdr = inject(ChangeDetectorRef);
    private router = inject(Router);

    companies = signal<Company[]>([]);
    loading = signal<boolean>(true);

    ngOnInit() {
        this.loadCompanies();
    }

    loadCompanies() {
        this.loading.set(true);
        this.companyService.getCompanies().subscribe({
            next: (data: any) => {
                let list: Company[] = [];
                if (data && data.data && Array.isArray(data.data)) {
                    list = data.data;
                } else if (Array.isArray(data)) {
                    list = data;
                }
                this.companies.set(list);
                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load companies', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    getCompanySizeLabel(size: number): string {
        switch (size) {
            case 0: return 'Small';
            case 1: return 'Medium';
            case 2: return 'Large';
            case 3: return 'Enterprise';
            default: return 'Other';
        }
    }

    getCompanySizeClass(size: number): string {
        switch (size) {
            case 0: return 'bg-success-subtle text-success border-success';
            case 1: return 'bg-info-subtle text-info border-info';
            case 2: return 'bg-warning-subtle text-warning border-warning';
            case 3: return 'bg-danger-subtle text-danger border-danger';
            default: return 'bg-light text-secondary border-secondary';
        }
    }

    getAssignmentModeLabel(mode: number): string {
        switch (mode) {
            case 0: return 'Automatic (Smart)';
            case 1: return 'Manual Approval';
            case 2: return 'Direct to Preferred';
            default: return 'Default';
        }
    }

    getVolumePercentage(volume: number): number {
        return Math.min(Math.round((volume / 2000) * 100), 100);
    }

    viewDetails(id: string) {
        this.router.navigate(['/companies/details', id]);
    }

    editCompany(id: string) {
        this.router.navigate(['/companies/edit', id]);
    }

    deleteCompany(id: string) {
        if (confirm('Are you sure you want to deactivate this company? This will affect its associated users and requests.')) {
            // Implementation...
            this.companies.update(prev => prev.filter(c => c.id !== id));
            this.cdr.detectChanges();
        }
    }

    onboardNewCompany() {
        this.router.navigate(['/companies/onboarding']);
    }
}
