import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PackageService, MedicalService, PackageCreate } from '../../../core/services/package.service';

@Component({
    selector: 'app-package-form',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './package-form.component.html'
})
export class PackageFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private packageService = inject(PackageService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    packageForm: FormGroup;
    isEditMode = false;
    packageId: string | null = null;
    availableServices: MedicalService[] = [];
    loading = false;
    submitting = false;

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
            next: (data) => this.availableServices = data,
            error: (err) => console.error('Failed to load services', err)
        });
    }

    loadPackage() {
        if (!this.packageId) return;
        this.loading = true;
        this.packageService.getPackage(this.packageId).subscribe({
            next: (pkg) => {
                this.packageForm.patchValue({
                    name: pkg.name,
                    description: pkg.description,
                    price: pkg.price,
                    serviceIds: pkg.services.map(s => s.id)
                });
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load package', err);
                this.loading = false;
            }
        });
    }

    onSubmit() {
        if (this.packageForm.invalid) {
            this.packageForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        const formData: PackageCreate = this.packageForm.value;

        if (this.isEditMode && this.packageId) {
            this.packageService.updatePackage(this.packageId, formData).subscribe({
                next: () => {
                    this.router.navigate(['/packages']);
                },
                error: (err: any) => {
                    console.error('Failed to update package', err);
                    this.submitting = false;
                }
            });
        } else {
            this.packageService.createPackage(formData).subscribe({
                next: () => {
                    this.router.navigate(['/packages']);
                },
                error: (err: any) => {
                    console.error('Failed to create package', err);
                    this.submitting = false;
                }
            });
        }
    }

    toggleService(serviceId: string) {
        const currentServices = this.packageForm.get('serviceIds')?.value as string[];
        const index = currentServices.indexOf(serviceId);
        if (index === -1) {
            currentServices.push(serviceId);
        } else {
            currentServices.splice(index, 1);
        }
        this.packageForm.get('serviceIds')?.setValue([...currentServices]);
        this.packageForm.get('serviceIds')?.markAsDirty();
    }

    isServiceSelected(serviceId: string): boolean {
        const currentServices = this.packageForm.get('serviceIds')?.value as string[];
        return currentServices.includes(serviceId);
    }
}
