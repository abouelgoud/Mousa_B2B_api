import { Component, inject, signal, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CompanyService, Company } from '../../core/services/company.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-company-onboarding',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
<div class="onboarding-container h-100 d-flex flex-column overflow-hidden">
    <!-- Header -->
    <header class="toolbar d-flex justify-content-between align-items-center shadow-sm">
        <div class="d-flex align-items-center gap-3">
            <button class="btn btn-light btn-sm rounded-0 border" routerLink="/companies">
                <i class="bi bi-arrow-left"></i>
            </button>
            <div>
                <h4 class="mb-0">{{ isEditMode ? 'Edit Corporate Profile' : 'Onboard New Partner' }}</h4>
                <p class="text-muted small mb-0">{{ isEditMode ? 'Update company details and compliance' : 'Setup a new business partnership' }}</p>
            </div>
        </div>
        <div class="d-none d-md-block">
            <span class="badge bg-light text-primary border rounded-pill px-3">Step {{ currentStep() }} of {{ totalSteps }}</span>
        </div>
    </header>

    <!-- Main Content -->
    <div class="flex-grow-1 overflow-auto p-4">
        <div class="container py-2">
            <div class="row justify-content-center">
                <div class="col-lg-9">
                    
                    <!-- Stepper -->
                    <div class="stepper d-flex justify-content-between align-items-center">
                        <div class="stepper-line">
                            <div class="line-active" [style.width.%]="((currentStep() - 1) / (totalSteps - 1)) * 100"></div>
                        </div>
                        
                        <div *ngFor="let s of [1,2,3]" class="step-item d-flex flex-column align-items-center">
                            <div class="step-circle d-flex align-items-center justify-content-center shadow-sm"
                                 [class.active]="currentStep() === s"
                                 [class.completed]="currentStep() > s">
                                <i *ngIf="currentStep() > s" class="bi bi-check-lg"></i>
                                <span *ngIf="currentStep() <= s">{{ s }}</span>
                            </div>
                            <span class="step-label" [class.active]="currentStep() === s">{{ getStepTitle(s) }}</span>
                        </div>
                    </div>

                    <!-- Form Card -->
                    <div class="form-card">
                        <div class="card-body p-5">
                            <form [formGroup]="onboardingForm" (ngSubmit)="onSubmit()">
                                
                                <!-- Step 1: Company Profile -->
                                <div *ngIf="currentStep() === 1" class="form-step">
                                    <h5><i class="bi bi-building"></i>Organization Credentials</h5>
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="fluent-group">
                                                <label for="legalName">Legal Entity Name</label>
                                                <input type="text" id="legalName" formControlName="legalName" placeholder="e.g. Saudi Health Solutions Ltd.">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="fluent-group">
                                                <label for="crNumber">Commercial Registration #</label>
                                                <input type="text" id="crNumber" formControlName="crNumber" placeholder="CR Number">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="fluent-group">
                                                <label for="businessActivity">Sector / Industry</label>
                                                <input type="text" id="businessActivity" formControlName="businessActivity" placeholder="Industry Type">
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="fluent-group">
                                                <label for="headOfficeAddress">HQ Address</label>
                                                <textarea id="headOfficeAddress" formControlName="headOfficeAddress" rows="2" placeholder="Full legal address"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Step 2: Operations -->
                                <div *ngIf="currentStep() === 2" class="form-step">
                                    <h5><i class="bi bi-graph-up-arrow"></i>Operational Metrics</h5>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="fluent-group">
                                                <label for="totalEmployees">Total Workforce</label>
                                                <input type="number" id="totalEmployees" formControlName="totalEmployees">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="fluent-group">
                                                <label for="volume">Est. Monthly Volume</label>
                                                <input type="number" id="volume" formControlName="estimatedMonthlyScreeningVolume">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="fluent-group">
                                                <label for="size">Company Tier</label>
                                                <select id="size" formControlName="companySize">
                                                    <option [value]="0">Small (1-50)</option>
                                                    <option [value]="1">Medium (51-250)</option>
                                                    <option [value]="2">Large (251-1000)</option>
                                                    <option [value]="3">Enterprise (1000+)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="fluent-group">
                                                <label for="mode">Service Assignment</label>
                                                <select id="mode" formControlName="defaultProviderAssignmentMode">
                                                    <option [value]="0">Automatic (Al-Guided)</option>
                                                    <option [value]="1">Manual Selection</option>
                                                    <option [value]="2">Preferred Network Only</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Step 3: Compliance -->
                                <div *ngIf="currentStep() === 3" class="form-step">
                                    <h5><i class="bi bi-shield-check"></i>Compliance & Regulatory</h5>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="fluent-group">
                                                <label for="vat">VAT Registration #</label>
                                                <input type="text" id="vat" formControlName="vatRegistrationNumber" placeholder="Optional">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="fluent-group">
                                                <label>CR Digital Duplicate</label>
                                                <div class="upload-area" (click)="crInput.click()">
                                                    <i class="bi bi-cloud-upload d-block fs-3 text-primary mb-1"></i>
                                                    <span class="small fw-semibold text-dark d-block">
                                                        {{ selectedFiles['CRCertificateFile']?.name || 'Browse or Drop CR Certificate' }}
                                                    </span>
                                                    <input #crInput type="file" class="d-none" (change)="onFileSelect($event, 'CRCertificateFile')">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 mt-3">
                                            <div class="alert bg-light border-0 d-flex gap-3 p-4">
                                                <i class="bi bi-shield-lock-fill fs-3 text-success"></i>
                                                <div class="small">
                                                    <div class="fw-bold text-dark mb-1">Authorization & Consent</div>
                                                    <p class="mb-0 text-secondary">By proceeding, you confirm that you have the authority to register this organization and agree to transmit medical data securely according to national regulatory guidelines.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="actions-footer">
                                    <button type="button" class="btn btn-link text-decoration-none text-secondary px-0" 
                                            (click)="prevStep()" [disabled]="currentStep() === 1">
                                        <i class="bi bi-chevron-left me-1"></i>Back
                                    </button>
                                    
                                    <div class="d-flex gap-2">
                                        <button *ngIf="currentStep() < totalSteps" type="button" 
                                                class="btn btn-primary btn-fluent shadow-sm" 
                                                (click)="nextStep()">
                                            Continue
                                        </button>
                                        
                                        <button *ngIf="currentStep() === totalSteps" type="submit" 
                                                class="btn btn-primary btn-fluent shadow-sm" 
                                                [disabled]="submitting() || (onboardingForm.invalid && !isEditMode)">
                                            <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-2"></span>
                                            <span>{{ isEditMode ? 'Authorize Update' : 'Initialize Partnership' }}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
    styleUrls: ['./company-onboarding.component.scss']
})
export class CompanyOnboardingComponent implements OnInit {
    private fb = inject(FormBuilder);
    private companyService = inject(CompanyService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    currentStep = signal<number>(1);
    totalSteps = 3;
    isEditMode = false;
    companyId: string | null = null;
    submitting = signal<boolean>(false);

    onboardingForm: FormGroup;
    selectedFiles: { [key: string]: File } = {};

    constructor() {
        this.onboardingForm = this.fb.group({
            legalName: ['', [Validators.required]],
            crNumber: ['', [Validators.required]],
            businessActivity: ['', [Validators.required]],
            headOfficeAddress: ['', [Validators.required]],
            totalEmployees: [100, [Validators.required, Validators.min(1)]],
            estimatedMonthlyScreeningVolume: [50, [Validators.required, Validators.min(0)]],
            companySize: [1, [Validators.required]],
            defaultProviderAssignmentMode: [0, [Validators.required]],
            vatRegistrationNumber: [''],
            designatedContactPersonId: ['00000000-0000-0000-0000-000000000000']
        });
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.companyId = params.get('id');
            if (this.companyId) {
                this.isEditMode = true;
                this.loadCompany();
            }
        });
    }

    loadCompany() {
        if (!this.companyId) return;
        this.companyService.getCompany(this.companyId).subscribe({
            next: (c: any) => {
                const data = c.data || c;
                this.onboardingForm.patchValue(data);
                this.cdr.detectChanges();
            }
        });
    }

    getStepTitle(step: number): string {
        switch (step) {
            case 1: return 'Identity';
            case 2: return 'Operations';
            case 3: return 'Compliance';
            default: return '';
        }
    }

    nextStep() {
        if (this.currentStep() < this.totalSteps) {
            this.currentStep.set(this.currentStep() + 1);
            this.cdr.detectChanges();
        }
    }

    prevStep() {
        if (this.currentStep() > 1) {
            this.currentStep.set(this.currentStep() - 1);
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
        if (this.onboardingForm.invalid && !this.isEditMode) return;

        this.submitting.set(true);
        const formData = new FormData();
        const formValue = this.onboardingForm.value;

        Object.keys(formValue).forEach(key => {
            if (formValue[key] !== null) {
                formData.append(key, formValue[key]);
            }
        });

        Object.keys(this.selectedFiles).forEach(key => {
            formData.append(key, this.selectedFiles[key]);
        });

        const action$: Observable<any> = this.isEditMode && this.companyId
            ? this.companyService.updateCompany(this.companyId, formValue)
            : this.companyService.registerCompany(formData);

        action$.subscribe({
            next: () => {
                this.submitting.set(false);
                this.router.navigate(['/companies']);
            },
            error: (err) => {
                console.error('Company action failed', err);
                this.submitting.set(false);
                this.cdr.detectChanges();
            }
        });
    }
}
