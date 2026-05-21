import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProviderService, Provider } from '../../../core/services/provider.service';

@Component({
    selector: 'app-provider-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './provider-edit.component.html'
})
export class ProviderEditComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private providerService = inject(ProviderService);

    providerId: string | null = null;
    loading = true;
    saving = false;
    error?: string;

    editForm = this.fb.group({
        legalName: ['', [Validators.required]],
        estimatedDailyOperationalCapacity: [0, [Validators.required, Validators.min(1)]],
        labSetup: [0, [Validators.required]],
        tierId: [1, [Validators.required]],
        latitude: [0],
        longitude: [0]
        // Note: File uploads are not editable in this MVP version, only text fields
        // branchLocations and others can be added as needed
    });

    ngOnInit() {
        this.providerId = this.route.snapshot.paramMap.get('id');
        if (this.providerId) {
            this.providerService.getProvider(this.providerId).subscribe({
                next: (data) => {
                    this.editForm.patchValue({
                        legalName: data.legalName,
                        estimatedDailyOperationalCapacity: data.estimatedDailyOperationalCapacity,
                        labSetup: data.labSetup,
                        tierId: data.tierId,
                        latitude: data.latitude ?? 0,
                        longitude: data.longitude ?? 0
                    });
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading provider', err);
                    this.error = 'Failed to load provider data.';
                    this.loading = false;
                }
            });
        } else {
            this.error = 'No provider ID provided.';
            this.loading = false;
        }
    }

    onSubmit() {
        if (this.editForm.valid && this.providerId) {
            this.saving = true;
            const updates = this.editForm.value as Partial<Provider>;

            this.providerService.updateProvider(this.providerId, updates).subscribe({
                next: () => {
                    this.saving = false;
                    this.router.navigate(['/provider/details', this.providerId]);
                },
                error: (err) => {
                    console.error('Update failed', err);
                    this.error = 'Failed to update provider. Please try again.';
                    this.saving = false;
                }
            });
        }
    }
}
