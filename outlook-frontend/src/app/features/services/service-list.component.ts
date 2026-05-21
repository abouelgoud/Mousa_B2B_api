import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { PackageService, MedicalService } from '../../core/services/package.service';

@Component({
    selector: 'app-service-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
<div class="h-100 d-flex flex-column overflow-hidden">
    <!-- Toolbar -->
    <header class="toolbar d-flex justify-content-between align-items-center">
        <div>
            <h5 class="mb-0"><i class="bi bi-shield-plus me-2 text-primary"></i>Medical Portfolio</h5>
            <p class="text-muted small mb-0">Define and manage diagnostic services available for candidate screening.</p>
        </div>
        <a routerLink="/services/add" class="btn btn-primary d-flex align-items-center">
            <i class="bi bi-plus-lg me-2"></i>New Service
        </a>
    </header>

    <!-- Content -->
    <div class="content-area flex-grow-1 overflow-auto p-4">
        <div class="row g-3">
            <div class="col-md-4 col-lg-3" *ngFor="let service of services()">
                <div class="service-card p-4 h-100">
                    <div class="actions-dropdown">
                        <div class="dropdown">
                            <button class="btn btn-action" type="button" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                                <li><a class="dropdown-item small" [routerLink]="['/services/edit', service.id]"><i class="bi bi-pencil me-2"></i>Edit Profile</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item small text-danger" href="javascript:void(0)" (click)="deleteService(service.id, $event)"><i class="bi bi-trash me-2"></i>Remove</a></li>
                            </ul>
                        </div>
                    </div>

                    <div class="service-icon">
                        <i class="bi bi-activity"></i>
                    </div>

                    <span class="service-code">{{service.code}}</span>
                    <h6 class="fw-bold mt-2 mb-1 text-dark">{{service.name}}</h6>
                    <p class="text-muted small mb-0 overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        {{service.description}}
                    </p>
                    
                    <div class="price-tag">
                        {{service.price | currency:'SAR ':'symbol':'1.2-2'}}
                    </div>
                </div>
            </div>
            
            <!-- Empty State -->
            <div *ngIf="services().length === 0 && !loading()" class="col-12 text-center py-5">
                <i class="bi bi-shield-x display-4 opacity-10 d-block mb-3"></i>
                <h6 class="fw-semibold text-muted">No diagnostic services defined</h6>
                <p class="small text-secondary">Start by adding your first medical service to the portfolio.</p>
                <a routerLink="/services/add" class="btn btn-primary btn-sm px-4 mt-2">Add First Service</a>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading()" class="col-12 text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="small text-muted mt-2">Loading portfolio...</div>
            </div>
        </div>
    </div>
</div>
    `,
    styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {
    private packageService = inject(PackageService);
    private cdr = inject(ChangeDetectorRef);

    services = signal<MedicalService[]>([]);
    loading = signal<boolean>(true);

    ngOnInit() {
        this.loadServices();
    }

    loadServices() {
        this.loading.set(true);
        this.packageService.getServices().subscribe({
            next: (data: any) => {
                console.log('Services loaded:', data);
                // Robust check for wrapped data
                if (data && data.data && Array.isArray(data.data)) {
                    this.services.set(data.data);
                } else if (Array.isArray(data)) {
                    this.services.set(data);
                } else {
                    this.services.set([]);
                }
                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load services', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    deleteService(id: string, event: Event) {
        event.preventDefault();
        if (confirm('Are you sure you want to delete this service?')) {
            this.packageService.deleteService(id).subscribe({
                next: () => {
                    this.services.update(prev => prev.filter(s => s.id !== id));
                    this.cdr.detectChanges();
                },
                error: (err: any) => console.error('Failed to delete service', err)
            });
        }
    }
}
