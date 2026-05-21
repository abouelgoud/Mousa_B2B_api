import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PackageService, MedicalService } from '../../../core/services/package.service';

@Component({
    selector: 'app-service-form',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './service-form.component.html'
})
export class ServiceFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private packageService = inject(PackageService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    serviceForm: FormGroup;
    isEditMode = false;
    serviceId: string | null = null;
    loading = false;
    submitting = false;

    constructor() {
        this.serviceForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            code: ['', [Validators.required]],
            description: [''],
            price: [0, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.serviceId = params.get('id');
            if (this.serviceId) {
                this.isEditMode = true;
                this.loadService();
            }
        });
    }

    loadService() {
        if (!this.serviceId) return;
        this.loading = true;
        this.packageService.getService(this.serviceId).subscribe({
            next: (svc) => {
                this.serviceForm.patchValue(svc);
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load service', err);
                this.loading = false;
            }
        });
    }

    onSubmit() {
        if (this.serviceForm.invalid) {
            this.serviceForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        const formData = this.serviceForm.value;

        if (this.isEditMode && this.serviceId) {
            this.packageService.updateService(this.serviceId, formData).subscribe({
                next: () => this.router.navigate(['/services']),
                error: (err) => {
                    console.error('Failed to update service', err);
                    this.submitting = false;
                }
            });
        } else {
            this.packageService.createService(formData).subscribe({
                next: () => this.router.navigate(['/services']),
                error: (err) => {
                    console.error('Failed to create service', err);
                    this.submitting = false;
                }
            });
        }
    }
}
