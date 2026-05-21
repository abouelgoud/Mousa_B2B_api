import { Component, inject, signal, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProviderService, Provider } from '../../core/services/provider.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-provider-onboarding',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
<div class="onboarding-container h-100 p-4 overflow-auto">
    <div class="max-width-1000 mx-auto">
        <!-- Breadcrumbs & Title -->
        <div class="mb-4">
            <nav class="small mb-2">
                <a routerLink="/people" class="text-decoration-none text-muted">Healthcare Network</a>
                <span class="mx-2 text-muted">/</span>
                <span class="text-primary fw-semibold">{{ isEditMode ? 'Modify Affiliate' : 'New Affiliation' }}</span>
            </nav>
            <h4 class="fw-bold text-dark mb-1">{{ isEditMode ? 'Governance Profile' : 'Affiliate Healthcare Partner' }}</h4>
            <p class="text-muted small">Register and authorize clinical facilities within the national screening network.</p>
        </div>

        <div class="onboarding-card">
            <!-- Steps -->
            <div class="step-indicator">
                <div class="step-item" [class.active]="currentStep() === 1" [class.completed]="currentStep() > 1">
                    <div class="step-number">
                        <i class="bi bi-check-lg" *ngIf="currentStep() > 1"></i>
                        <span *ngIf="currentStep() <= 1">1</span>
                    </div>
                    <div class="step-label">Organization</div>
                </div>
                <div class="step-item" [class.active]="currentStep() === 2" [class.completed]="currentStep() > 2">
                    <div class="step-number">
                        <i class="bi bi-check-lg" *ngIf="currentStep() > 2"></i>
                        <span *ngIf="currentStep() <= 2">2</span>
                    </div>
                    <div class="step-label">Credentials</div>
                </div>
                <div class="step-item" [class.active]="currentStep() === 3">
                    <div class="step-number">3</div>
                    <div class="step-label">Presence</div>
                </div>
            </div>

            <!-- Form Body -->
            <div class="form-body">
                <form [formGroup]="onboardingForm" (ngSubmit)="onSubmit()">
                    
                    <!-- Step 1: Organization -->
                    <div *ngIf="currentStep() === 1">
                        <div class="row g-4">
                            <div class="col-12">
                                <label class="form-label small fw-bold text-secondary">Legal Agency Name</label>
                                <input type="text" class="form-control" formControlName="legalName" placeholder="e.g. Al-Dauwi Specialized Hospital">
                                <div class="text-danger small mt-1" *ngIf="onboardingForm.get('legalName')?.touched && onboardingForm.get('legalName')?.errors?.['required']">
                                    Legal name is required for governance
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Network Tier</label>
                                <select class="form-select" formControlName="tierId">
                                    <option [value]="1">Premium / Tertiary Care</option>
                                    <option [value]="2">Standard / Secondary Care</option>
                                    <option [value]="3">Basic / Primary Care</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Throughput Capacity (Daily)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" formControlName="estimatedDailyOperationalCapacity">
                                    <span class="input-group-text small">SPD</span>
                                </div>
                            </div>

                            <div class="col-12">
                                <label class="form-label small fw-bold text-secondary">Diagnostic Laboratory Configuration</label>
                                <div class="lab-radio-group">
                                    <div class="lab-option">
                                        <input type="radio" formControlName="labSetup" [value]="0" id="labComp">
                                        <label for="labComp">
                                            <div class="name">Full-Scope Automation</div>
                                            <div class="desc">High complexity automated path-lab.</div>
                                        </label>
                                    </div>
                                    <div class="lab-option">
                                        <input type="radio" formControlName="labSetup" [value]="1" id="labBasic">
                                        <label for="labBasic">
                                            <div class="name">In-house Basic</div>
                                            <div class="desc">Limited scope rapid diagnostic unit.</div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Credentials -->
                    <div *ngIf="currentStep() === 2">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Commercial Registration</label>
                                <div class="upload-zone" [class.has-file]="selectedFiles['CRCertificateFile']" (click)="crInput.click()">
                                    <i class="bi" [ngClass]="selectedFiles['CRCertificateFile'] ? 'bi-file-check-fill' : 'bi-cloud-arrow-up'"></i>
                                    <div class="title">{{ selectedFiles['CRCertificateFile']?.name || 'Authorize CR PDF' }}</div>
                                    <div class="hint">Upload authorized CR certificate for this region.</div>
                                    <input #crInput type="file" class="d-none" (change)="onFileSelect($event, 'CRCertificateFile')">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Medical Facility License (MOH)</label>
                                <div class="upload-zone" [class.has-file]="selectedFiles['MOHLicenseFile']" (click)="mohInput.click()">
                                    <i class="bi" [ngClass]="selectedFiles['MOHLicenseFile'] ? 'bi-shield-lock-fill' : 'bi-shield-check'"></i>
                                    <div class="title">{{ selectedFiles['MOHLicenseFile']?.name || 'Authorize MOH License' }}</div>
                                    <div class="hint">Upload valid Ministry of Health operating license.</div>
                                    <input #mohInput type="file" class="d-none" (change)="onFileSelect($event, 'MOHLicenseFile')">
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="p-3 bg-light border rounded small text-muted">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Accreditation bodies such as CBAHI or JCI can be linked in the individual branch governance section after initial affiliation.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 3: Presence -->
                    <div *ngIf="currentStep() === 3">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Global Latitude</label>
                                <input type="number" class="form-control" formControlName="latitude">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Global Longitude</label>
                                <input type="number" class="form-control" formControlName="longitude">
                            </div>
                            <div class="col-12">
                                <div class="alert alert-primary border-0 shadow-none d-flex gap-3 align-items-center mb-0">
                                    <i class="bi bi-check2-all fs-4"></i>
                                    <div class="small">
                                        <div class="fw-bold">Ready for Authorization</div>
                                        By submitting this affiliation, you confirm that the healthcare provider meets the regional clinical governance standards.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="d-flex justify-content-between mt-5 pt-4 border-top">
                        <button type="button" class="btn btn-light px-4 border" (click)="prevStep()" *ngIf="currentStep() > 1">
                            Back
                        </button>
                        <div class="ms-auto d-flex gap-3">
                            <a routerLink="/people" class="btn btn-link text-muted text-decoration-none">Discard</a>
                            
                            <button *ngIf="currentStep() < totalSteps" type="button" class="btn btn-primary px-5" (click)="nextStep()">
                                Continue
                            </button>
                            
                            <button *ngIf="currentStep() === totalSteps" type="submit" class="btn btn-primary px-5 shadow-sm" [disabled]="submitting() || (onboardingForm.invalid && !isEditMode)">
                                <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-2"></span>
                                {{ isEditMode ? 'Authorize Changes' : 'Initialize Affiliation' }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
    `,
    styleUrls: ['./provider-onboarding.component.scss']
})
export class ProviderOnboardingComponent implements OnInit {
    private fb = inject(FormBuilder);
    private providerService = inject(ProviderService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    currentStep = signal<number>(1);
    totalSteps = 3;
    isEditMode = false;
    providerId: string | null = null;
    submitting = signal<boolean>(false);

    onboardingForm: FormGroup;
    selectedFiles: { [key: string]: File } = {};

    constructor() {
        this.onboardingForm = this.fb.group({
            legalName: ['', [Validators.required]],
            estimatedDailyOperationalCapacity: [100, [Validators.required, Validators.min(1)]],
            labSetup: [0, [Validators.required]],
            tierId: [1, [Validators.required]],
            primaryContactPersonId: ['00000000-0000-0000-0000-000000000000'],
            bankAccountId: ['00000000-0000-0000-0000-000000000000'],
            latitude: [24.7136],
            longitude: [46.6753],
            // File fields (validated manually or via hidden inputs)
            CRCertificateFile: [null],
            MOHLicenseFile: [null]
        });
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.providerId = params.get('id');
            if (this.providerId) {
                this.isEditMode = true;
                this.loadProvider();
            }
        });
    }

    loadProvider() {
        if (!this.providerId) return;
        this.providerService.getProvider(this.providerId).subscribe({
            next: (p) => {
                this.onboardingForm.patchValue(p);
                this.cdr.detectChanges();
            }
        });
    }

    getStepTitle(step: number): string {
        switch (step) {
            case 1: return 'General Info';
            case 2: return 'Documentation';
            case 3: return 'Location';
            default: return '';
        }
    }

    nextStep() {
        if (this.currentStep() < this.totalSteps) {
            this.currentStep.update(s => s + 1);
            this.cdr.detectChanges();
        }
    }

    prevStep() {
        if (this.currentStep() > 1) {
            this.currentStep.update(s => s - 1);
            this.cdr.detectChanges();
        }
    }

    onFileSelect(event: any, field: string) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFiles[field] = file;
            this.cdr.detectChanges();
        }
    }

    onSubmit() {
        if (this.onboardingForm.valid || this.isEditMode) {
            this.submitting.set(true);
            const formData = new FormData();
            const formValue = this.onboardingForm.value;

            // Append textual data
            Object.keys(formValue).forEach(key => {
                if (formValue[key] !== null) {
                    formData.append(key, formValue[key]);
                }
            });

            // Append files
            Object.keys(this.selectedFiles).forEach(key => {
                formData.append(key, this.selectedFiles[key]);
            });

            const action$: Observable<any> = this.isEditMode && this.providerId
                ? this.providerService.updateProvider(this.providerId, formValue)
                : this.providerService.registerProvider(formData);

            action$.subscribe({
                next: () => {
                    this.submitting.set(false);
                    this.router.navigate(['/people']);
                },
                error: (err: any) => {
                    console.error('Action failed', err);
                    this.submitting.set(false);
                    this.cdr.detectChanges();
                }
            });
        }
    }
}
