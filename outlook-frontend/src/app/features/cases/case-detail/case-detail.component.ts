import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CaseService } from '../../../core/services/case.service';

@Component({
    selector: 'app-case-detail',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './case-detail.component.html',
    styleUrls: ['./case-detail.component.scss']
})
export class CaseDetailComponent implements OnChanges {
    @Input() caseId: string | null = null;

    private fb = inject(FormBuilder);
    caseService = inject(CaseService);

    caseDetails = signal<any>(null);
    loading = signal<boolean>(false);
    isEditing = signal<boolean>(false);

    medicalForm = this.fb.group({
        vitalSigns: ['', Validators.required],
        labFindings: ['', Validators.required],
        physicianNotes: ['', Validators.required],
        isFitForWork: [true, Validators.required]
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['caseId'] && this.caseId) {
            this.loadCaseDetails(this.caseId);
            this.isEditing.set(false); // Reset edit mode on selection change
        }
    }

    loadCaseDetails(id: string) {
        this.loading.set(true);
        this.caseService.getCaseDetails(id).subscribe({
            next: (data) => {
                this.caseDetails.set(data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    toggleEdit() {
        this.isEditing.update(v => !v);
    }

    submit() {
        if (this.medicalForm.valid && this.caseId) {
            const results = { ...this.medicalForm.value, requestId: this.caseId };
            this.caseService.submitResults(results).subscribe(() => {
                this.isEditing.set(false);
                this.loadCaseDetails(this.caseId!); // Reload to see updates
            });
        }
    }

    getStatusColor(status: number): string {
        switch (status) {
            case 1: return 'primary';
            case 2: return 'info';
            case 3: return 'warning';
            case 4: return 'purple';
            case 8: return 'success';
            default: return 'secondary';
        }
    }
}
