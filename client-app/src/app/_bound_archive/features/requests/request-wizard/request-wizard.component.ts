import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PackageService, Package } from '../../../core/services/package.service';
import { ProviderService, Provider } from '../../../core/services/provider.service';
import { CandidateService, Candidate } from '../../../core/services/candidate.service';
import { RequestService } from '../../../core/services/request.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-request-wizard',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    template: `
<div class="container py-5">
    <div class="card shadow rounded-4 border-0 glass-panel">
        <div class="card-header bg-dark text-white p-4 rounded-top-4 d-flex justify-content-between align-items-center">
            <div>
                <h3 class="mb-0">Create Screening Request</h3>
                <p class="mb-0 text-white-50">Streamlined process for your employees.</p>
            </div>
            <div class="text-end">
                <span class="badge bg-primary px-3 py-2">Step {{currentStep}}/4</span>
            </div>
        </div>

        <div class="progress rounded-0" style="height: 6px;">
            <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated" role="progressbar"
                [style.width.%]="(currentStep/4)*100"></div>
        </div>

        <div class="card-body p-5">
            <!-- Step 1: Package Selection -->
            <div *ngIf="currentStep === 1">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold mb-0"><i class="bi bi-box-seam me-2"></i>Select Screening Package</h5>
                </div>
                <div class="row g-4">
                    <div class="col-md-4" *ngFor="let pkg of packages">
                        <div class="card h-100 border-2" 
                             [class.border-primary]="selectedPackage?.id === pkg.id"
                             (click)="selectPackage(pkg)" style="cursor: pointer;">
                            <div class="card-body">
                                <h6 class="fw-bold">{{pkg.name}}</h6>
                                <p class="small text-muted mb-3">{{pkg.description}}</p>
                                <div class="fs-4 fw-bold text-primary mb-3">{{pkg.price | currency}}</div>
                                <ul class="list-unstyled small mb-0">
                                    <li *ngFor="let ps of pkg.services" class="mb-1">
                                        <i class="bi bi-check2 text-success me-2"></i>{{ps.name}}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-end mt-4">
                    <button class="btn btn-dark px-5" [disabled]="!selectedPackage" (click)="nextStep()">
                        Continue<i class="bi bi-chevron-right ms-2"></i>
                    </button>
                </div>
            </div>

            <!-- Step 2: Provider Selection -->
            <div *ngIf="currentStep === 2">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold mb-0"><i class="bi bi-hospital me-2"></i>Choose Medical Provider</h5>
                    <select class="form-select form-select-sm w-auto" (change)="sortProviders($event)">
                        <option value="distance">Sort by Distance</option>
                        <option value="tier">Sort by Tier</option>
                        <option value="rating">Sort by Rating</option>
                    </select>
                </div>
                
                <div class="list-group list-group-flush border rounded-3 overflow-hidden">
                    <div *ngFor="let p of providers" 
                         class="list-group-item list-group-item-action p-4 border-bottom"
                         [class.bg-light]="selectedProvider?.id === p.id"
                         (click)="selectProvider(p)" style="cursor: pointer;">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="d-flex gap-3">
                                <i class="bi bi-geo-alt-fill text-primary mt-1"></i>
                                <div>
                                    <h6 class="mb-1 fw-bold">{{p.legalName}}</h6>
                                    <div class="d-flex gap-3 small text-muted">
                                        <span>Tier {{p.tierId}}</span>
                                        <span><i class="bi bi-star-fill text-warning me-1"></i>{{p.rating || 4.5}}</span>
                                        <span class="text-primary fw-bold" *ngIf="p.distance">{{p.distance | number:'1.1-1'}} KM away</span>
                                    </div>
                                </div>
                            </div>
                            <input class="form-check-input" type="radio" [checked]="selectedProvider?.id === p.id">
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-between mt-5">
                    <button class="btn btn-light border px-4" (click)="prevStep()">Back</button>
                    <button class="btn btn-dark px-5" [disabled]="!selectedProvider" (click)="nextStep()">
                        Continue<i class="bi bi-chevron-right ms-2"></i>
                    </button>
                </div>
            </div>

            <!-- Step 3: Candidate Selection -->
            <div *ngIf="currentStep === 3">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold mb-0"><i class="bi bi-people me-2"></i>Select Candidates</h5>
                </div>

                <div class="list-group list-group-flush border rounded-3 overflow-hidden shadow-sm" style="max-height: 400px; overflow-y: auto;">
                    <div *ngFor="let c of allCandidates" 
                         class="list-group-item list-group-item-action p-3"
                         (click)="toggleCandidate(c)" style="cursor: pointer;">
                        <div class="d-flex align-items-center gap-3">
                            <input class="form-check-input" type="checkbox" [checked]="isCandidateSelected(c)">
                            <div class="flex-grow-1">
                                <h6 class="mb-0 fw-bold">{{c.fullName}}</h6>
                                <p class="small text-muted mb-0">ID: {{c.nationalID}} | {{c.position}}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-between mt-5">
                    <button class="btn btn-light border px-4" (click)="prevStep()">Back</button>
                    <button class="btn btn-dark px-5" [disabled]="selectedCandidates.length === 0" (click)="nextStep()">
                        Continue<i class="bi bi-chevron-right ms-2"></i>
                    </button>
                </div>
            </div>

            <!-- Step 4: Final Review -->
            <div *ngIf="currentStep === 4">
                <h5 class="fw-bold"><i class="bi bi-check2-all me-2"></i>Final Review</h5>
                
                <div class="row g-4 mt-2">
                    <div class="col-md-6">
                        <div class="p-4 bg-light rounded-4 border h-100">
                            <label class="small text-muted text-uppercase fw-bold mb-2 d-block">Screening Package</label>
                            <h6>{{selectedPackage?.name}}</h6>
                            <div class="fw-bold text-primary">{{selectedPackage?.price | currency}} / person</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-4 bg-light rounded-4 border h-100">
                            <label class="small text-muted text-uppercase fw-bold mb-2 d-block">Medical Provider</label>
                            <h6>{{selectedProvider?.legalName}}</h6>
                            <div class="small text-warning">
                                <i class="bi bi-star-fill me-1"></i>4.5 Rating
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="p-4 bg-light rounded-4 border">
                            <label class="small text-muted text-uppercase fw-bold mb-3 d-block">Selected Candidates ({{selectedCandidates.length}})</label>
                            <div class="d-flex flex-wrap gap-2">
                                <span class="badge bg-white text-dark border p-2 fw-normal" *ngFor="let c of selectedCandidates">
                                    {{c.fullName}}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-between mt-5">
                    <button class="btn btn-light border px-4" (click)="prevStep()">Back</button>
                    <button class="btn btn-success px-5 shadow" [disabled]="loading" (click)="submit()">
                        <span *ngIf="!loading">Create Screening Request<i class="bi bi-send-fill ms-2"></i></span>
                        <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
    styles: [`
        .glass-panel { background: rgba(255, 255, 255, 0.95); }
        .transition-card { transition: all 0.3s ease; }
        .transition-card:hover { transform: translateY(-3px); }
    `]
})
export class RequestWizardComponent implements OnInit {
    private packageService = inject(PackageService);
    private providerService = inject(ProviderService);
    private candidateService = inject(CandidateService);
    private requestService = inject(RequestService);
    private authService = inject(AuthService);
    private router = inject(Router);

    currentStep = 1;
    loading = false;

    packages: Package[] = [];
    providers: Provider[] = [];
    allCandidates: Candidate[] = [];

    selectedPackage?: Package;
    selectedProvider?: Provider;
    selectedCandidates: Candidate[] = [];
    userLocation?: { lat: number, lng: number };

    // Dynamic Company ID from AuthService
    private get companyId(): string | undefined {
        return this.authService.currentUser()?.companyId;
    }

    ngOnInit() {
        if (!this.companyId) {
            console.warn('No company ID found for current user. Wizard may not function correctly.');
        }
        this.loadInitialData();
        this.getUserLocation();
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.recalculateDistances();
                },
                (error) => {
                    console.warn('Geolocation failed or denied', error);
                }
            );
        }
    }

    loadInitialData() {
        this.packageService.getPackages().subscribe(pkgs => this.packages = pkgs);
        if (this.companyId) {
            this.providerService.getProvidersByLocation(this.companyId).subscribe(provs => {
                this.providers = provs;
                this.recalculateDistances();
            });
            this.candidateService.getCandidatesByCompany(this.companyId).subscribe(cand => {
                this.allCandidates = cand;
            });
        }
    }

    recalculateDistances() {
        if (!this.userLocation || this.providers.length === 0) return;

        this.providers.forEach(p => {
            if (p.latitude && p.longitude) {
                p.distance = this.calculateHaversine(
                    this.userLocation!.lat, this.userLocation!.lng,
                    p.latitude, p.longitude
                );
            }
        });
        this.sortProvidersByField('distance');
    }

    calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth radius in KM
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    nextStep() { if (this.currentStep < 4) this.currentStep++; }
    prevStep() { if (this.currentStep > 1) this.currentStep--; }

    selectPackage(pkg: Package) { this.selectedPackage = pkg; }
    selectProvider(p: Provider) { this.selectedProvider = p; }

    toggleCandidate(c: Candidate) {
        const index = this.selectedCandidates.findIndex(cand => cand.id === c.id);
        if (index > -1) this.selectedCandidates.splice(index, 1);
        else this.selectedCandidates.push(c);
    }

    isCandidateSelected(c: Candidate): boolean {
        return this.selectedCandidates.some(cand => cand.id === c.id);
    }

    sortProviders(event: any) {
        this.sortProvidersByField(event.target.value);
    }

    private sortProvidersByField(field: string) {
        if (field === 'distance') {
            this.providers.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        } else if (field === 'tier') {
            this.providers.sort((a, b) => (a.tierId || 0) - (b.tierId || 0));
        } else if (field === 'rating') {
            this.providers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
    }

    submit() {
        if (!this.selectedPackage || !this.selectedProvider || this.selectedCandidates.length === 0) return;

        this.loading = true;
        const batchData = {
            candidateIds: this.selectedCandidates.map(c => c.id),
            packageId: this.selectedPackage.id,
            requestedProviderId: this.selectedProvider.id,
            expectedVisitDate: new Date(new Date().getTime() + 72 * 60 * 60 * 1000).toISOString()
        };

        this.requestService.createRequestBatch(batchData).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/request/list']);
            },
            error: (err) => {
                console.error('Failed to create screening requests', err);
                this.loading = false;
            }
        });
    }
}
