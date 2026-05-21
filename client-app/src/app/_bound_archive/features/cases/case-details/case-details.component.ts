import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../../core/services/case.service';

@Component({
    selector: 'app-case-details',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './case-details.component.html',
    styleUrls: ['./case-details.component.scss']
})
export class CaseDetailsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private caseService = inject(CaseService);

    requestId?: string;
    caseData: any;
    loading = true;

    medicalForm = this.fb.group({
        vitalSigns: ['', Validators.required],
        labFindings: ['', Validators.required],
        physicianNotes: ['', Validators.required],
        isFitForWork: [true, Validators.required],
        resultDocumentPath: ['']
    });

    ngOnInit(): void {
        this.requestId = this.route.snapshot.params['id'];
        if (this.requestId) {
            this.caseService.getCaseDetails(this.requestId).subscribe({
                next: (data) => {
                    this.caseData = data;
                    this.loading = false;
                },
                error: () => this.loading = false
            });
        }
    }

    submit() {
        if (this.medicalForm.valid && this.requestId) {
            const results = { ...this.medicalForm.value, requestId: this.requestId } as any;
            this.caseService.submitResults(results).subscribe(() => {
                this.router.navigate(['/cases/queue']);
            });
        }
    }
}
