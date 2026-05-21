import { Component, inject, signal, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProviderService, Provider } from '../../core/services/provider.service';

@Component({
    selector: 'app-provider-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
<div class="h-100 d-flex flex-column bg-light overflow-hidden">
    <!-- Header -->
    <div class="p-4 bg-white border-bottom d-flex justify-content-between align-items-center shadow-sm z-3">
        <div class="d-flex align-items-center gap-3">
            <button class="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" 
                    routerLink="/people" style="width: 40px; height: 40px;">
                <i class="bi bi-arrow-left fs-5"></i>
            </button>
            <div *ngIf="provider() as p">
                <h4 class="fw-bold mb-0 text-dark">{{ p.legalName }}</h4>
                <div class="d-flex align-items-center gap-2 small">
                    <span class="badge" [ngClass]="p.tierId === 1 ? 'bg-warning text-dark' : 'bg-primary-subtle text-primary border border-primary-subtle'">
                        {{ p.tierId === 1 ? 'Premium Network' : 'Standard Network' }}
                    </span>
                    <span class="text-muted"><i class="bi bi-buildings me-1"></i>0 branches</span>
                </div>
            </div>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-primary rounded-pill px-4 shadow-sm fw-bold" (click)="editProvider()">
                <i class="bi bi-pencil me-2"></i>Edit Profile
            </button>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow-1 overflow-auto p-4 custom-scrollbar">
        <div class="container py-2" *ngIf="provider() as p">
            <div class="row g-4">
                <!-- Left Column: Metrics & Info -->
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm rounded-4 mb-4">
                        <div class="card-body p-4">
                            <h6 class="fw-bold mb-4 text-secondary text-uppercase small">Operational Metrics</h6>
                            <div class="mb-4">
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="text-muted">Daily Capacity</span>
                                    <span class="fw-bold text-dark">{{ p.estimatedDailyOperationalCapacity }} cases</span>
                                </div>
                                <div class="progress" style="height: 8px;">
                                    <div class="progress-bar rounded-pill bg-success" [style.width.%]="75"></div>
                                </div>
                                <small class="text-muted mt-1 d-block">Current utilization: 375 cases active</small>
                            </div>
                            
                            <hr class="my-4 opacity-5">
                            
                            <div class="d-flex align-items-center gap-3 mb-3">
                                <div class="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    <i class="bi bi-star-fill"></i>
                                </div>
                                <div>
                                    <div class="fw-bold text-dark">4.5 / 5.0</div>
                                    <small class="text-muted">Quality Rating</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm rounded-4">
                        <div class="card-body p-4">
                            <h6 class="fw-bold mb-4 text-secondary text-uppercase small">Credentials</h6>
                            <div class="list-group list-group-flush border-0">
                                <a href="#" class="list-group-item list-group-item-action border-0 px-0 d-flex align-items-center gap-3 py-3">
                                    <i class="bi bi-file-earmark-pdf text-danger fs-4"></i>
                                    <div>
                                        <div class="fw-bold text-dark small">CR Certificate</div>
                                        <small class="text-muted">Valid until Dec 2026</small>
                                    </div>
                                    <i class="bi bi-download ms-auto text-muted"></i>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action border-0 px-0 d-flex align-items-center gap-3 py-3">
                                    <i class="bi bi-file-earmark-pdf text-danger fs-4"></i>
                                    <div>
                                        <div class="fw-bold text-dark small">MOH License</div>
                                        <small class="text-muted">Active (Verified)</small>
                                    </div>
                                    <i class="bi bi-download ms-auto text-muted"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Detail Tabs / Sections -->
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-4 mb-4">
                        <div class="card-header bg-white border-bottom p-4">
                            <ul class="nav nav-pills card-header-pills">
                                <li class="nav-item">
                                    <a class="nav-link active rounded-pill px-4 fw-bold" href="#">Laboratory Setup</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link rounded-pill px-4 fw-bold text-muted" href="#">Branches</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link rounded-pill px-4 fw-bold text-muted" href="#">Service Audit</a>
                                </li>
                            </ul>
                        </div>
                        <div class="card-body p-4">
                            <div class="p-4 bg-light rounded-4 border-2 border-dashed text-center py-5">
                                <i class="bi bi-gear-wide-connected display-4 text-primary opacity-25 mb-3 d-block"></i>
                                <h5 class="fw-bold text-dark">{{ getLabSetupLabel(p.labSetup) }}</h5>
                                <p class="text-muted">This provider is configured with {{ p.labSetup === 0 ? 'full-scale automation and high complexity diagnostic capabilities.' : 'standard diagnostic facilities.' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Location Mockup -->
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden" style="height: 300px;">
                        <div class="bg-secondary bg-opacity-10 h-100 d-flex align-items-center justify-content-center flex-column text-muted">
                            <i class="bi bi-map display-5 mb-2"></i>
                            <p class="mb-0 fw-bold">Interactive Location Map</p>
                            <small>{{ p.latitude }}, {{ p.longitude }}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div *ngIf="loading()" class="text-center py-5 h-100 d-flex flex-column align-items-center justify-content-center">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3 text-muted">Loading organization profile...</p>
        </div>
    </div>
</div>
    `,
    styles: [`
        .progress { background-color: #f0f0f0; }
        .nav-pills .nav-link.active { background-color: var(--bs-primary); }
    `]
})
export class ProviderDetailsComponent implements OnInit {
    private providerService = inject(ProviderService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    provider = signal<Provider | null>(null);
    loading = signal<boolean>(true);

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadProvider(id);
            }
        });
    }

    loadProvider(id: string) {
        this.loading.set(true);
        this.providerService.getProvider(id).subscribe({
            next: (p: any) => {
                // Handle potential wrapping
                if (p && p.data) this.provider.set(p.data);
                else this.provider.set(p);

                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load provider', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    getLabSetupLabel(setup?: number): string {
        switch (setup) {
            case 0: return 'High Complexity Lab';
            case 1: return 'Basic In-house Lab';
            default: return 'Outsourced Services';
        }
    }

    editProvider() {
        if (this.provider()) {
            this.router.navigate(['/people/edit', this.provider()?.id]);
        }
    }
}
