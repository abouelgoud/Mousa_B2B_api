import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { CandidateService, Candidate } from '../../core/services/candidate.service';
import { AuthService } from '../../core/services/auth.service';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
    selector: 'app-candidate-list',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterLink, HasPermissionDirective],
    template: `
<div class="h-100 d-flex flex-column overflow-hidden">
    <!-- Toolbar -->
    <header class="toolbar d-flex justify-content-between align-items-center">
        <div>
            <h5 class="mb-0"><i class="bi bi-person-badge me-2 text-primary"></i>Candidates</h5>
        </div>
        <div class="d-flex gap-2">
            <a *hasPermission="'Candidates.Manage'" routerLink="/candidates/add" class="btn btn-primary btn-sm px-3">
                <i class="bi bi-plus-lg me-1"></i>New Candidate
            </a>
        </div>
    </header>

    <!-- List Content -->
    <div class="content-area flex-grow-1 overflow-auto p-4">
        <div class="table-container shadow-sm bg-white">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th class="ps-4" style="width: 300px;">Full Name</th>
                        <th>Identification</th>
                        <th>Contact No.</th>
                        <th>Position / Role</th>
                        <th>Location</th>
                        <th class="text-end pe-4">Actions</th>
                    </tr>
                </thead>
                <tbody *ngIf="!loading()">
                    <tr *ngFor="let c of candidates()" class="cursor-pointer" [routerLink]="['/candidates/edit', c.id]">
                        <td class="ps-4">
                            <div class="d-flex align-items-center gap-3">
                                <div class="avatar d-flex align-items-center justify-content-center fw-semibold">
                                    {{ c.fullName.charAt(0).toUpperCase() }}
                                </div>
                                <div class="fw-semibold">{{ c.fullName }}</div>
                            </div>
                        </td>
                        <td>
                            <code class="text-primary small">{{ c.nationalID }}</code>
                        </td>
                        <td>
                            <div class="small text-secondary">{{ c.mobileNumber }}</div>
                        </td>
                        <td>
                            <span class="badge-fluent">{{ c.position }}</span>
                        </td>
                        <td>
                            <span class="small text-secondary"><i class="bi bi-geo-alt me-1"></i>{{ c.branchLocation }}</span>
                        </td>
                        <td class="text-end pe-4">
                            <div class="d-flex justify-content-end gap-1">
                                <button *hasPermission="'Candidates.Manage'" 
                                        class="btn btn-action z-10" 
                                        (click)="deleteCandidate(c.id, $event)"
                                        title="Delete Candidate">
                                    <i class="bi bi-trash"></i>
                                </button>
                                <div class="btn btn-action z-10" title="Edit details">
                                    <i class="bi bi-chevron-right small"></i>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <!-- Empty State -->
            <div *ngIf="candidates().length === 0 && !loading()" class="text-center py-5">
                <div class="text-muted py-5">
                    <i class="bi bi-person-badge display-1 opacity-10 mb-3"></i>
                    <h6 class="fw-semibold">No candidates found</h6>
                    <p class="small">Add your first candidate to start tracking screenings.</p>
                </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading()" class="text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="small text-muted mt-2">Retrieving records...</div>
            </div>
        </div>
    </div>
</div>
    `,
    styleUrls: ['./candidate-list.component.scss']
})
export class CandidateListComponent implements OnInit {
    private candidateService = inject(CandidateService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    candidates = signal<Candidate[]>([]);
    loading = signal<boolean>(true);

    ngOnInit() {
        this.loadCandidates();
    }

    loadCandidates() {
        const companyId = this.authService.currentUser()?.companyId;
        if (!companyId) {
            console.warn('No company ID found');
            this.loading.set(false);
            this.cdr.detectChanges();
            return;
        }

        this.loading.set(true);
        this.candidateService.getCandidatesByCompany(companyId).subscribe({
            next: (data: any) => {
                console.log('Candidates loaded:', data);
                // Robust check for wrapped data
                if (data && data.data && Array.isArray(data.data)) {
                    this.candidates.set(data.data);
                } else if (Array.isArray(data)) {
                    this.candidates.set(data);
                } else {
                    this.candidates.set([]);
                }
                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load candidates', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    deleteCandidate(id: string, event: Event) {
        event.stopPropagation(); // Prevent row click
        if (confirm('Are you sure you want to delete this candidate?')) {
            this.candidateService.deleteCandidate(id).subscribe({
                next: () => {
                    this.candidates.update(prev => prev.filter(c => c.id !== id));
                    this.cdr.detectChanges();
                },
                error: (err: any) => console.error('Failed to delete candidate', err)
            });
        }
    }
}
