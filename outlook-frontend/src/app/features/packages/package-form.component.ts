import { Component, OnInit, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PackageService, MedicalService } from '../../core/services/package.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-package-form',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
<div class="form-container h-100 p-4 overflow-auto">
    <div class="max-width-1000 mx-auto">
        <!-- Breadcrumbs & Title -->
        <div class="mb-4">
            <nav class="small mb-2">
                <a routerLink="/packages" class="text-decoration-none text-muted">Service Bundles</a>
                <span class="mx-2 text-muted">/</span>
                <span class="text-primary fw-semibold">{{ isEditMode ? 'Modify' : 'New' }} Bundle</span>
            </nav>
            <h4 class="fw-bold text-dark mb-1">{{ isEditMode ? 'Bundle Configuration' : 'Create Diagnostic Bundle' }}</h4>
            <p class="text-muted small">Group individual medical services into logical screening packages.</p>
        </div>

        <form [formGroup]="packageForm" (ngSubmit)="onSubmit()">
            <div class="row g-4">
                <!-- Left: Bundle Details -->
                <div class="col-lg-7">
                    <div class="info-card">
                        <div class="card-header"><h6>Primary Details</h6></div>
                        <div class="card-body">
                            <div class="mb-4">
                                <label class="form-label small fw-bold text-secondary">Bundle Name</label>
                                <input type="text" class="form-control" formControlName="name" placeholder="e.g., Comprehensive Occupational Screening">
                                <div class="text-danger small mt-1" *ngIf="packageForm.get('name')?.touched && packageForm.get('name')?.errors?.['required']">
                                    A descriptive name is required
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="form-label small fw-bold text-secondary">Scope & Description</label>
                                <textarea class="form-control" formControlName="description" rows="5" placeholder="Detail the clinical scope and target industries for this bundle..."></textarea>
                            </div>

                            <div class="mb-0">
                                <label class="form-label small fw-bold text-secondary">Standard Pricing (SAR)</label>
                                <div class="input-group price-input-group">
                                    <span class="input-group-text">SAR</span>
                                    <input type="number" class="form-control" formControlName="price" placeholder="0.00">
                                </div>
                                <div class="text-danger small mt-1" *ngIf="packageForm.get('price')?.touched && packageForm.get('price')?.errors?.['required']">
                                    Price must be specified
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Service Composer -->
                <div class="col-lg-5">
                    <div class="info-card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6>Service Composer</h6>
                            <span class="badge-fluent small">{{ selectedCount() }} Included</span>
                        </div>
                        <div class="card-body">
                            <p class="text-muted small mb-3">Select available clinical services to include in this diagnostic bundle.</p>
                            
                            <div class="service-selection-list">
                                <div class="list-header d-flex justify-content-between">
                                    <span>Available Portfolio</span>
                                    <span>Rate (SAR)</span>
                                </div>
                                <div class="scroll-area custom-scrollbar">
                                    <div *ngFor="let svc of availableServices()" 
                                         class="service-item"
                                         [class.selected]="isServiceSelected(svc.id)"
                                         (click)="toggleService(svc.id)">
                                        <div class="check-box">
                                            <i class="bi bi-check-lg" *ngIf="isServiceSelected(svc.id)"></i>
                                        </div>
                                        <div class="service-info">
                                            <div class="name text-truncate">{{ svc.name }}</div>
                                            <div class="code">{{ svc.code }}</div>
                                        </div>
                                        <div class="service-price">
                                            {{ svc.price | number:'1.2-2' }}
                                        </div>
                                    </div>
                                    
                                    <div *ngIf="availableServices().length === 0" class="text-center py-5">
                                        <i class="bi bi-search text-muted opacity-25 d-block mb-2"></i>
                                        <div class="small text-muted">No services found in portfolio</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="text-danger small mt-2" *ngIf="packageForm.get('serviceIds')?.touched && packageForm.get('serviceIds')?.errors?.['required']">
                                Please select at least one medical service
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Footer -->
                <div class="col-12 mt-4">
                    <div class="d-flex justify-content-end gap-3 align-items-center">
                        <a routerLink="/packages" class="btn btn-light px-4 border">Discard</a>
                        <button type="submit" class="btn btn-primary px-5 shadow-sm" [disabled]="submitting() || loading()">
                            <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-2"></span>
                            {{ isEditMode ? 'Authorize Changes' : 'Initialize Bundle' }}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>
    `,
    styleUrls: ['./package-form.component.scss']
})
export class PackageFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private packageService = inject(PackageService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    packageForm: FormGroup;
    isEditMode = false;
    packageId: string | null = null;

    availableServices = signal<MedicalService[]>([]);
    loading = signal<boolean>(false);
    submitting = signal<boolean>(false);

    constructor() {
        this.packageForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            price: [0, [Validators.required, Validators.min(1)]],
            serviceIds: [[], [Validators.required, Validators.minLength(1)]]
        });
    }

    ngOnInit() {
        this.loadServices();
        this.route.paramMap.subscribe(params => {
            this.packageId = params.get('id');
            if (this.packageId) {
                this.isEditMode = true;
                this.loadPackage();
            }
        });
    }

    loadServices() {
        this.packageService.getServices().subscribe({
            next: (data: any) => {
                const list = (data && data.data) ? data.data : (Array.isArray(data) ? data : []);
                this.availableServices.set(list);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load services', err);
                this.cdr.detectChanges();
            }
        });
    }

    loadPackage() {
        if (!this.packageId) return;
        this.loading.set(true);
        this.packageService.getPackage(this.packageId).subscribe({
            next: (pkg: any) => {
                this.packageForm.patchValue({
                    name: pkg.name,
                    description: pkg.description,
                    price: pkg.price,
                    serviceIds: pkg.services.map((s: any) => s.id)
                });
                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load package', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    selectedCount(): number {
        return (this.packageForm.get('serviceIds')?.value as string[]).length;
    }

    onSubmit() {
        if (this.packageForm.invalid) {
            this.packageForm.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.cdr.detectChanges();

        const formData = {
            name: this.packageForm.value.name,
            description: this.packageForm.value.description,
            price: this.packageForm.value.price,
            serviceIds: this.packageForm.value.serviceIds
        };

        const request$: Observable<any> = (this.isEditMode && this.packageId)
            ? this.packageService.updatePackage(this.packageId, formData)
            : this.packageService.createPackage(formData);

        request$.subscribe({
            next: () => {
                this.router.navigate(['/packages']);
            },
            error: (err: any) => {
                console.error('Failed to save package', err);
                this.submitting.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    toggleService(serviceId: string) {
        const currentServices = [...(this.packageForm.get('serviceIds')?.value || [])] as string[];
        const index = currentServices.indexOf(serviceId);
        if (index === -1) {
            currentServices.push(serviceId);
        } else {
            currentServices.splice(index, 1);
        }
        this.packageForm.get('serviceIds')?.setValue(currentServices);
        this.packageForm.get('serviceIds')?.markAsDirty();
        this.cdr.detectChanges();
    }

    isServiceSelected(serviceId: string): boolean {
        const currentServices = this.packageForm.get('serviceIds')?.value as string[];
        return currentServices?.includes(serviceId) || false;
    }
}
