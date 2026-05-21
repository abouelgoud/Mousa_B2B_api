import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CandidateService } from '../../core/services/candidate.service';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-candidate-form',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
<div class="candidate-form-container h-100 overflow-auto p-4">
    <div class="row justify-content-center">
        <div class="col-md-10 col-lg-8">
            <div class="form-card">
                <div class="card-header">
                    <h2>{{isEditMode ? 'Edit' : 'New'}} Candidate Profile</h2>
                </div>
                <div class="form-body">
                    <form [formGroup]="candidateForm" (ngSubmit)="onSubmit()">
                        <div class="alert alert-danger border-0 shadow-sm" *ngIf="error">
                            <i class="bi bi-exclamation-triangle me-2"></i>{{error}}
                        </div>
                        
                        <div class="section-title">Personal Information</div>
                        <div class="row gx-4">
                            <div class="col-md-6">
                                <div class="fluent-group">
                                    <div class="label-row"><label for="fullName">Full Name</label></div>
                                    <input type="text" id="fullName" formControlName="fullName" placeholder="Legal full name">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="fluent-group">
                                    <div class="label-row"><label for="nationalID">National ID / Iqama</label></div>
                                    <input type="text" id="nationalID" formControlName="nationalID" placeholder="10-digit ID number">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="fluent-group">
                                    <div class="label-row"><label for="mobileNumber">Mobile Number</label></div>
                                    <input type="tel" id="mobileNumber" formControlName="mobileNumber" placeholder="05xxxxxxxx">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="fluent-group">
                                    <div class="label-row"><label for="gender">Gender</label></div>
                                    <select id="gender" formControlName="gender">
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="section-title mt-2">Employment Details</div>
                        <div class="row gx-4">
                            <div class="col-md-6">
                                <div class="fluent-group">
                                    <div class="label-row"><label for="position">Job Title / Position</label></div>
                                    <input type="text" id="position" formControlName="position" placeholder="e.g. Software Engineer">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="fluent-group">
                                    <div class="label-row"><label for="branchLocation">Branch / Location</label></div>
                                    <input type="text" id="branchLocation" formControlName="branchLocation" placeholder="e.g. Riyadh Main Office">
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="fluent-group">
                                    <div class="label-row"><label for="department">Department</label></div>
                                    <input type="text" id="department" formControlName="department" placeholder="Optional department name">
                                </div>
                            </div>
                        </div>

                        <div class="section-title mt-2">Documents & Attachments</div>
                        
                        <!-- Existing Attachments -->
                        <div class="mb-4" *ngIf="attachments().length > 0">
                            <div class="row">
                                <div *ngFor="let file of attachments()" class="col-md-6">
                                    <div class="attachment-item d-flex justify-content-between align-items-center">
                                        <div class="d-flex align-items-center overflow-hidden">
                                            <i class="bi bi-file-earmark-pdf fs-4 text-danger me-2"></i>
                                            <div class="text-truncate">
                                                <div class="fw-semibold small text-truncate">{{file.fileName}}</div>
                                                <div class="text-muted" style="font-size: 11px;">{{file.uploadedAt | date:'medium'}}</div>
                                            </div>
                                        </div>
                                        <a [href]="getFileUrl(file.filePath)" target="_blank" class="btn btn-sm btn-link text-primary text-decoration-none p-0 ps-2">
                                            Open
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="fluent-group">
                            <div class="label-row"><label>Upload Files</label></div>
                            <div class="file-input-wrapper" (click)="fileInput.click()">
                                <i class="bi bi-cloud-arrow-up fs-2 text-primary d-block mb-1"></i>
                                <span class="small text-secondary">Click to upload or drag and drop</span>
                                <div class="small text-muted mt-1" style="font-size: 11px;">PDF, JPG, PNG (Max 5MB)</div>
                                <input #fileInput type="file" class="d-none" multiple (change)="onFileSelect($event)">
                            </div>
                            <div *ngIf="selectedFiles.length > 0" class="mt-2 small text-primary fw-semibold">
                                <i class="bi bi-check2-circle me-1"></i>{{selectedFiles.length}} files ready for upload
                            </div>
                        </div>

                        <div class="actions-footer">
                            <a routerLink="/candidates" class="btn-fluent btn-secondary d-flex align-items-center">Cancel</a>
                            <button type="submit" class="btn-fluent btn-primary d-flex align-items-center gap-2" [disabled]="submitting() || candidateForm.invalid">
                                <span *ngIf="submitting()" class="spinner-border spinner-border-sm"></span>
                                <span>{{submitting() ? 'Saving...' : (isEditMode ? 'Update Candidate' : 'Save Candidate')}}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
    styleUrls: ['./candidate-form.component.scss']
})
export class CandidateFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private candidateService = inject(CandidateService);
    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    candidateForm: FormGroup;
    isEditMode = false;
    candidateId: string | null = null;
    companyId: string | null = null;
    submitting = signal<boolean>(false);
    loading = signal<boolean>(false);
    attachments = signal<any[]>([]);
    error = '';
    selectedFiles: File[] = [];

    constructor() {
        this.candidateForm = this.fb.group({
            fullName: ['', Validators.required],
            nationalID: ['', Validators.required],
            mobileNumber: ['', Validators.required],
            gender: ['', Validators.required],
            position: ['', Validators.required],
            branchLocation: ['', Validators.required],
            department: ['']
        });
    }

    ngOnInit() {
        this.companyId = this.authService.currentUser()?.companyId ?? null;

        this.route.paramMap.subscribe(params => {
            this.candidateId = params.get('id');
            if (this.candidateId) {
                this.isEditMode = true;
                this.loadCandidate();
            }
        });
    }

    loadCandidate() {
        if (!this.candidateId) return;
        this.loading.set(true);
        this.candidateService.getCandidate(this.candidateId).subscribe({
            next: (data: any) => {
                const candidate = (data && data.data) ? data.data : data;
                this.candidateForm.patchValue(candidate);
                this.attachments.set(candidate.attachments || []);
                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load candidate', err);
                this.error = 'Failed to load candidate details.';
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    onFileSelect(event: any) {
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFiles = Array.from(event.target.files);
        }
    }

    onSubmit() {
        if (this.candidateForm.invalid) {
            this.candidateForm.markAllAsTouched();
            return;
        }

        if (!this.companyId) {
            this.error = 'No company context found. Cannot save candidate.';
            return;
        }

        this.submitting.set(true);
        this.error = '';
        const data = this.candidateForm.value;

        const request$: Observable<any> = (this.isEditMode && this.candidateId)
            ? this.candidateService.updateCandidate(this.candidateId, data, this.selectedFiles)
            : this.candidateService.createCandidate(this.companyId, data, this.selectedFiles);

        request$.subscribe({
            next: () => this.router.navigate(['/candidates']),
            error: (err: any) => {
                console.error('Failed to save candidate', err);
                this.error = 'Failed to save candidate. Please try again.';
                this.submitting.set(false);
                this.cdr.detectChanges();
            }
        });
    }
    getFileUrl(path: string): string {
        if (!path) return '#';
        // Base API URL is http://localhost:5284/api
        // Files are at http://localhost:5284/uploads/...
        const baseUrl = environment.apiUrl.replace('/api', '');
        return `${baseUrl}${path}`;
    }
}
