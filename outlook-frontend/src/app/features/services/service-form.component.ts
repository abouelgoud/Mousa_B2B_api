import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PackageService } from '../../core/services/package.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-service-form',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
<div class="service-form-container h-100 overflow-auto p-4">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="form-card">
                <div class="card-header">
                    <h2>{{isEditMode ? 'Edit' : 'New'}} Medical Service</h2>
                </div>
                
                <div class="form-body">
                    <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()">
                        <div class="row">
                            <div class="col-12">
                                <div class="fluent-group">
                                    <div class="label-row">
                                        <label for="name">Service Name</label>
                                        <span class="hint">Required</span>
                                    </div>
                                    <input type="text" 
                                           id="name" 
                                           formControlName="name" 
                                           placeholder="e.g. CBC Blood Test"
                                           [class.is-invalid]="serviceForm.get('name')?.touched && serviceForm.get('name')?.invalid">
                                    <div class="validation-msg" *ngIf="serviceForm.get('name')?.touched && serviceForm.get('name')?.invalid">
                                        <i class="bi bi-exclamation-circle"></i> Name is required (min 2 chars).
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="fluent-group">
                                    <div class="label-row">
                                        <label for="code">Service Code</label>
                                    </div>
                                    <input type="text" id="code" formControlName="code" placeholder="e.g. L-101">
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="fluent-group">
                                    <div class="label-row">
                                        <label for="price">Price (SAR)</label>
                                    </div>
                                    <div class="input-group">
                                        <span class="input-group-text">SAR</span>
                                        <input type="number" id="price" formControlName="price">
                                    </div>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="fluent-group">
                                    <div class="label-row">
                                        <label for="description">Description</label>
                                    </div>
                                    <textarea id="description" formControlName="description" rows="4" placeholder="Briefly describe the medical service..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="actions-footer">
                            <a routerLink="/services" class="btn-fluent btn-secondary decoration-none text-center">Cancel</a>
                            <button type="submit" class="btn-fluent btn-primary" [disabled]="submitting() || serviceForm.invalid">
                                <span *ngIf="!submitting()">{{isEditMode ? 'Update' : 'Create'}} Service</span>
                                <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-2"></span>
                                <span *ngIf="submitting()">Processing...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
    styleUrls: ['./service-form.component.scss']
})
export class ServiceFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private packageService = inject(PackageService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    serviceForm: FormGroup;
    isEditMode = false;
    serviceId: string | null = null;
    submitting = signal<boolean>(false);
    loading = signal<boolean>(false);

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
            this.cdr.detectChanges();
        });
    }

    loadService() {
        if (!this.serviceId) return;
        this.loading.set(true);
        this.packageService.getService(this.serviceId).subscribe({
            next: (data: any) => {
                const svc = (data && data.data) ? data.data : data;
                this.serviceForm.patchValue(svc);
                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load service', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    onSubmit() {
        if (this.serviceForm.invalid) {
            this.serviceForm.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const formData = this.serviceForm.value;

        const request$: Observable<any> = (this.isEditMode && this.serviceId)
            ? this.packageService.updateService(this.serviceId, formData)
            : this.packageService.createService(formData);

        request$.subscribe({
            next: () => this.router.navigate(['/services']),
            error: (err: any) => {
                console.error('Failed to save service', err);
                this.submitting.set(false);
                this.cdr.detectChanges();
            }
        });
    }
}
