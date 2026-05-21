import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { CandidateService, Candidate, CandidateAttachment } from '../../../core/services/candidate.service';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-candidate-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './candidate-form.component.html'
})
export class CandidateFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private companyService = inject(CompanyService);
    private candidateService = inject(CandidateService);
    private route = inject(ActivatedRoute);

    private router = inject(Router);

    candidateForm: FormGroup;
    companyId: string | null = null;
    candidateId: string | null = null;
    submitted = false;
    loading = false;
    saving = false;
    error = '';
    selectedFiles: File[] = [];
    existingAttachments: CandidateAttachment[] = [];


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
        this.route.paramMap.subscribe(params => {
            this.companyId = params.get('companyId');
            this.candidateId = params.get('candidateId');

            if (this.candidateId) {
                this.loadCandidate(this.candidateId);
            }
        });
    }

    loadCandidate(id: string) {
        this.loading = true;
        this.candidateService.getCandidate(id).subscribe({
            next: (data) => {
                this.candidateForm.patchValue(data);
                this.existingAttachments = data.attachments || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading candidate', err);
                this.error = 'Failed to load candidate details.';
                this.loading = false;
            }
        });
    }

    onFileSelect(event: any) {
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFiles = Array.from(event.target.files);
        }
    }

    onSubmit() {
        this.submitted = true;
        if (this.candidateForm.invalid) return;
        if (!this.companyId) {
            this.error = 'Company ID is missing.';
            return;
        }

        this.saving = true;
        this.error = '';

        const candidateData = this.candidateForm.value;

        if (this.candidateId) {
            this.candidateService.updateCandidate(this.candidateId, candidateData, this.selectedFiles).subscribe({
                next: () => {
                    this.saving = false;
                    this.router.navigate(['/company', this.companyId, 'candidates']);
                },
                error: (err) => {
                    console.error('Update failed', err);
                    this.error = 'Failed to update candidate.';
                    this.saving = false;
                }
            });
        } else {
            this.candidateService.createCandidate(this.companyId, candidateData, this.selectedFiles).subscribe({
                next: () => {
                    this.saving = false;
                    this.router.navigate(['/company', this.companyId, 'candidates']);
                },
                error: (err) => {
                    console.error('Creation failed', err);
                    this.error = 'Failed to create candidate.';
                    this.saving = false;
                }
            });
        }
    }
}
