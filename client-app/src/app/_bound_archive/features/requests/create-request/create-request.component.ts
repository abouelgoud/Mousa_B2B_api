import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RequestService } from '../../../core/services/request.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-request',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './create-request.component.html',
    styleUrls: ['./create-request.component.scss']
})
export class CreateRequestComponent {
    private fb = inject(FormBuilder);
    private requestService = inject(RequestService);
    private router = inject(Router);

    requestForm = this.fb.group({
        candidateFullName: ['', [Validators.required]],
        nationalID: ['', [Validators.required]],
        mobileNumber: ['', [Validators.required]],
        gender: ['Male', [Validators.required]],
        position: ['', [Validators.required]],
        branchLocation: ['', [Validators.required]],
        department: [''],
        packageId: ['00000000-0000-0000-0000-000000000001', [Validators.required]], // Placeholder
        expectedVisitDate: [null]
    });

    submit() {
        if (this.requestForm.valid) {
            // Note: This legacy component needs refactoring to match the new Batch API
            // For now, fixing build error by using the renamed service method
            this.requestService.createRequestBatch(this.requestForm.value as any).subscribe({
                next: () => {
                    this.router.navigate(['/requests/list']);
                },
                error: (err) => {
                    console.error('Request creation failed', err);
                }
            });
        }
    }
}
