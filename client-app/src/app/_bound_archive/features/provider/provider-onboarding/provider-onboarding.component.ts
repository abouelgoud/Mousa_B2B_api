import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProviderService } from '../../../core/services/provider.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-provider-onboarding',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './provider-onboarding.component.html',
    styleUrls: ['./provider-onboarding.component.scss']
})
export class ProviderOnboardingComponent {
    private fb = inject(FormBuilder);
    private providerService = inject(ProviderService);
    private router = inject(Router);

    currentStep = 1;
    totalSteps = 3;

    onboardingForm = this.fb.group({
        legalName: ['', [Validators.required]],
        crCertificatePath: ['', [Validators.required]],
        mohLicensePath: ['', [Validators.required]],
        cbahiAccreditationPath: [''],
        labAccreditationPath: [''],
        estimatedDailyOperationalCapacity: [100, [Validators.required, Validators.min(1)]],
        labSetup: [0, [Validators.required]],
        tierId: [1, [Validators.required]],
        primaryContactPersonId: ['00000000-0000-0000-0000-000000000000'],
        bankAccountId: ['00000000-0000-0000-0000-000000000000'],
        latitude: [0],
        longitude: [0]
    });

    nextStep() { if (this.currentStep < this.totalSteps) this.currentStep++; }
    prevStep() { if (this.currentStep > 1) this.currentStep--; }

    // File Storage
    selectedFiles: { [key: string]: File } = {};

    onFileSelect(event: any, field: string) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFiles[field] = file;
            // Update form control to satisfy validation if needed (dummy valid value)
            this.onboardingForm.patchValue({ [field]: file.name });
        }
    }

    submit() {
        if (this.onboardingForm.valid) {
            const formData = new FormData();
            const formValue = this.onboardingForm.value;

            // Append textual data
            Object.keys(formValue).forEach(key => {
                if (formValue[key as keyof typeof formValue] !== null && key !== 'crCertificatePath' && key !== 'mohLicensePath' && key !== 'cbahiAccreditationPath' && key !== 'labAccreditationPath') {
                    formData.append(key, formValue[key as keyof typeof formValue] as string);
                }
            });

            // Append Files (matching backend DTO names: CRCertificateFile, MOHLicenseFile, etc.)
            // Note: Keys in DTO are different from Form Controls. We map them here.

            if (this.selectedFiles['crCertificatePath'])
                formData.append('CRCertificateFile', this.selectedFiles['crCertificatePath']);

            if (this.selectedFiles['mohLicensePath'])
                formData.append('MOHLicenseFile', this.selectedFiles['mohLicensePath']);

            if (this.selectedFiles['cbahiAccreditationPath'])
                formData.append('CBAHIAccreditationFile', this.selectedFiles['cbahiAccreditationPath']);

            if (this.selectedFiles['labAccreditationPath'])
                formData.append('LabAccreditationFile', this.selectedFiles['labAccreditationPath']);

            this.providerService.registerProvider(formData).subscribe({
                next: () => this.router.navigate(['/provider/list']),
                error: (err) => console.error('Provider onboarding failed', err)
            });
        }
    }
}
