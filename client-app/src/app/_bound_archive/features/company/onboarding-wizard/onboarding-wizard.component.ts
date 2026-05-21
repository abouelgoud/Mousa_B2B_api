import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-onboarding-wizard',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './onboarding-wizard.component.html',
    styleUrls: ['./onboarding-wizard.component.scss']
})
export class OnboardingWizardComponent {
    private fb = inject(FormBuilder);
    private companyService = inject(CompanyService);
    private router = inject(Router);

    currentStep = 1;
    totalSteps = 3;

    onboardingForm = this.fb.group({
        legalName: ['', [Validators.required]],
        crNumber: ['', [Validators.required]],
        headOfficeAddress: ['', [Validators.required]],
        companySize: [0, [Validators.required, Validators.min(1)]],
        totalEmployees: [0, [Validators.required, Validators.min(1)]],
        businessActivity: ['', [Validators.required]],
        estimatedMonthlyScreeningVolume: [0, [Validators.required]],
        vatRegistrationNumber: [''],
        defaultProviderAssignmentMode: [0]
    });

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    submit() {
        if (this.onboardingForm.valid) {
            this.companyService.createCompany(this.onboardingForm.value as any).subscribe({
                next: () => {
                    this.router.navigate(['/company/list']);
                },
                error: (err) => {
                    console.error('Onboarding failed', err);
                }
            });
        }
    }
}
