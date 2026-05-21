import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompanyService, Company } from '../../../core/services/company.service';

@Component({
    selector: 'app-company-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './company-edit.component.html'
})
export class CompanyEditComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private companyService = inject(CompanyService);

    companyId: string | null = null;
    loading = true;
    saving = false;
    error?: string;

    editForm = this.fb.group({
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

    ngOnInit() {
        this.companyId = this.route.snapshot.paramMap.get('id');
        if (this.companyId) {
            this.companyService.getCompany(this.companyId).subscribe({
                next: (data) => {
                    this.editForm.patchValue(data);
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading company', err);
                    this.error = 'Failed to load company data.';
                    this.loading = false;
                }
            });
        } else {
            this.error = 'No company ID provided.';
            this.loading = false;
        }
    }

    onSubmit() {
        if (this.editForm.valid && this.companyId) {
            this.saving = true;
            const updates = this.editForm.value as Partial<Company>;

            this.companyService.updateCompany(this.companyId, updates).subscribe({
                next: () => {
                    this.saving = false;
                    this.router.navigate(['/company/details', this.companyId]);
                },
                error: (err) => {
                    console.error('Update failed', err);
                    this.error = 'Failed to update company. Please try again.';
                    this.saving = false;
                }
            });
        }
    }
}
