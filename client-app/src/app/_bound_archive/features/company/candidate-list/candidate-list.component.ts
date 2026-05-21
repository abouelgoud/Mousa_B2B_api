import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CompanyService, Candidate } from '../../../core/services/company.service';

@Component({
    selector: 'app-candidate-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './candidate-list.component.html'
})
export class CandidateListComponent implements OnInit {
    private companyService = inject(CompanyService);
    private route = inject(ActivatedRoute);

    candidates: Candidate[] = [];
    companyId: string | null = null;
    loading = true;

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.companyId = params.get('companyId');
            if (this.companyId) {
                this.loadCandidates();
            }
        });
    }

    loadCandidates() {
        if (!this.companyId) return;
        this.loading = true;
        this.companyService.getCandidates(this.companyId).subscribe({
            next: (data) => {
                this.candidates = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load candidates', err);
                this.loading = false;
            }
        });
    }

    deleteCandidate(id: string) {
        if (confirm('Are you sure you want to delete this candidate?')) {
            this.companyService.deleteCandidate(id).subscribe({
                next: () => {
                    this.candidates = this.candidates.filter(c => c.id !== id);
                },
                error: (err) => console.error('Failed to delete candidate', err)
            });
        }
    }
}
