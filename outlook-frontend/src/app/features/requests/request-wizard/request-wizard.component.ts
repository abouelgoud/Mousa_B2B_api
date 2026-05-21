import { Component, OnInit, inject, ChangeDetectorRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PackageService, Package } from '../../../core/services/package.service';
import { ProviderService, Provider } from '../../../core/services/provider.service';
import { CandidateService, Candidate } from '../../../core/services/candidate.service';
import { RequestService } from '../../../core/services/request.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-request-wizard',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    template: `
<div class="h-100 bg-light p-4 overflow-auto custom-scrollbar">
    <div class="max-width-container mx-auto">
        <!-- Wizard Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb mb-1">
                        <li class="breadcrumb-item small text-muted">Operations</li>
                        <li class="breadcrumb-item small active" aria-current="page">New Screening Wizard</li>
                    </ol>
                </nav>
                <h4 class="fw-bold text-dark mb-0">Create Screening Request</h4>
            </div>
            <div class="d-flex align-items-center gap-3">
                <div class="text-end d-none d-md-block">
                    <div class="small text-muted fw-bold text-uppercase">Progress</div>
                    <div class="small fw-bold text-primary">{{progress()}}% Complete</div>
                </div>
                <div class="step-indicator">
                    <span class="badge rounded-pill bg-primary px-3 py-2 shadow-sm">Step {{currentStep()}}/4</span>
                </div>
            </div>
        </div>

        <!-- Glass Panel Wizard -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <!-- Progress Bar -->
            <div class="progress rounded-0" style="height: 4px;">
                <div class="progress-bar bg-primary transition-width" role="progressbar"
                    [style.width.%]="progress()"></div>
            </div>

            <div class="card-body p-0">
                <div class="row g-0">
                    <!-- Left Sidebar (Step Overview) - Hidden on mobile -->
                    <div class="col-md-3 bg-light border-end d-none d-md-block p-4">
                        <div class="d-flex flex-column gap-4">
                            <div class="step-item" [class.active]="currentStep() === 1" [class.completed]="currentStep() > 1">
                                <div class="step-number">1</div>
                                <div class="step-label">Package</div>
                            </div>
                            <div class="step-item" [class.active]="currentStep() === 2" [class.completed]="currentStep() > 2">
                                <div class="step-number">2</div>
                                <div class="step-label">Provider</div>
                            </div>
                            <div class="step-item" [class.active]="currentStep() === 3" [class.completed]="currentStep() > 3">
                                <div class="step-number">3</div>
                                <div class="step-label">Candidates</div>
                            </div>
                            <div class="step-item" [class.active]="currentStep() === 4" [class.completed]="currentStep() > 4">
                                <div class="step-number">4</div>
                                <div class="step-label">Review</div>
                            </div>
                        </div>
                        
                        <div class="mt-5 pt-5 opacity-50">
                            <i class="bi bi-shield-check d-block mb-2 fs-2 text-primary"></i>
                            <p class="small text-secondary fw-medium">All screening requests are processed securely and compliant with local regulations.</p>
                        </div>
                    </div>

                    <!-- Right Side (Content) -->
                    <div class="col-md-9 p-4 p-lg-5 bg-white">
                        
                        <!-- Step 1: Package Selection -->
                        <div *ngIf="currentStep() === 1" class="animate-in">
                            <div class="mb-4">
                                <h5 class="fw-bold mb-1">Select Screening Package</h5>
                                <p class="text-muted small">Choose the scope of medical screening for this batch.</p>
                            </div>
                            
                            <div class="row g-3">
                                <div class="col-lg-6" *ngFor="let pkg of packages()">
                                    <div class="package-card" 
                                         [class.active]="selectedPackage()?.id === pkg.id"
                                         (click)="selectPackage(pkg)">
                                        <div class="d-flex justify-content-between mb-3">
                                            <div class="icon-box bg-primary-subtle text-primary rounded-3">
                                                <i class="bi bi-box-seam fs-5"></i>
                                            </div>
                                            <!-- <div class="text-primary fw-bold fs-5">{{pkg.price | currency}}</div> -->
                                        </div>
                                        <h6 class="fw-bold text-dark mb-2">{{pkg.name}}</h6>
                                        <p class="small text-muted mb-3 line-clamp-2">{{pkg.description}}</p>
                                        
                                        <div class="small fw-bold text-uppercase text-secondary mb-2" style="font-size: 10px;">Included Services</div>
                                        <div class="d-flex flex-wrap gap-1 mb-2">
                                            <span *ngFor="let ps of pkg.services" class="badge bg-light text-dark border-0 rounded-pill px-2 py-1" style="font-size: 10px;">
                                                {{ps.name}}
                                            </span>
                                        </div>
                                        
                                        <div class="selection-indicator bi bi-check-circle-fill" *ngIf="selectedPackage()?.id === pkg.id"></div>
                                    </div>
                                </div>
                            </div>

                            <div *ngIf="packages().length === 0" class="text-center py-5">
                                <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                <p class="text-muted small mt-2">Fetching available packages...</p>
                            </div>

                            <div class="d-flex justify-content-end mt-5 pt-3 border-top">
                                <button class="btn btn-primary rounded-pill px-5 shadow-sm py-2 fw-bold" 
                                    [disabled]="!selectedPackage()" (click)="nextStep()">
                                    Continue <i class="bi bi-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Step 2: Provider Selection -->
                        <div *ngIf="currentStep() === 2" class="animate-in">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h5 class="fw-bold mb-1">Choose Medical Provider</h5>
                                    <p class="text-muted small">Select a licensed facility for clinical examinations.</p>
                                </div>
                                <div class="d-none d-sm-block">
                                    <select class="form-select form-select-sm rounded-pill px-3" (change)="sortProviders($event)">
                                        <option value="distance">Nearest First</option>
                                        <option value="tier">By Tier</option>
                                        <option value="rating">Top Rated</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="provider-list border rounded-4 overflow-hidden mb-4">
                                <div *ngFor="let p of providers()" 
                                     class="provider-item p-3 border-bottom d-flex align-items-center gap-3 transition-all"
                                     [class.active]="selectedProvider()?.id === p.id"
                                     (click)="selectProvider(p)">
                                    <div class="provider-logo bg-light rounded-circle d-flex align-items-center justify-content-center text-primary" style="width: 48px; height: 48px;">
                                        <i class="bi bi-hospital fs-5"></i>
                                    </div>
                                    <div class="flex-grow-1">
                                        <div class="d-flex justify-content-between">
                                            <h6 class="mb-0 fw-bold text-dark">{{p.legalName}}</h6>
                                            <div class="small fw-bold text-primary" *ngIf="p.distance">
                                                <i class="bi bi-geo-alt me-1"></i>{{p.distance | number:'1.1-1'}} KM
                                            </div>
                                        </div>
                                        <div class="d-flex gap-3 align-items-center mt-1">
                                            <span class="badge bg-light text-muted border-0 fw-normal">Tier {{p.tierId}}</span>
                                            <div class="small text-warning">
                                                <i class="bi bi-star-fill me-1"></i>{{p.rating || 4.5}}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" [checked]="selectedProvider()?.id === p.id">
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between mt-5 pt-3 border-top">
                                <button class="btn btn-light rounded-pill px-4 py-2" (click)="prevStep()">Back</button>
                                <button class="btn btn-primary rounded-pill px-5 shadow-sm py-2 fw-bold" 
                                    [disabled]="!selectedProvider()" (click)="nextStep()">
                                    Continue <i class="bi bi-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Step 3: Candidate Selection -->
                        <div *ngIf="currentStep() === 3" class="animate-in">
                            <div class="mb-4">
                                <h5 class="fw-bold mb-1">Select Candidates</h5>
                                <p class="text-muted small">Identify employees who need this medical screening batch.</p>
                            </div>

                            <div class="candidate-grid mb-4 custom-scrollbar" style="max-height: 400px; overflow-y: auto;">
                                <div class="row g-2">
                                    <div class="col-md-6" *ngFor="let c of allCandidates()">
                                        <div class="candidate-item p-3 border rounded-4 d-flex align-items-center gap-3 transition-all"
                                             [class.active]="isCandidateSelected(c)"
                                             (click)="toggleCandidate(c)">
                                            <div class="form-check mb-0">
                                                <input class="form-check-input" type="checkbox" [checked]="isCandidateSelected(c)">
                                            </div>
                                            <div class="avatar bg-light text-secondary rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 36px; height: 36px;">
                                                {{c.fullName.charAt(0)}}
                                            </div>
                                            <div class="flex-grow-1 min-width-0">
                                                <div class="fw-bold text-dark text-truncate small">{{c.fullName}}</div>
                                                <div class="text-muted text-truncate" style="font-size: 11px;">{{c.nationalID}} | {{c.position}}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div *ngIf="allCandidates().length === 0" class="text-center py-5">
                                <i class="bi bi-people display-4 opacity-10"></i>
                                <p class="text-muted small mt-2">No candidates found in your roster.</p>
                                <a routerLink="/candidates/add" class="btn btn-sm btn-outline-primary rounded-pill mt-2">Register New Candidate</a>
                            </div>

                            <div class="d-flex justify-content-between mt-5 pt-3 border-top">
                                <button class="btn btn-light rounded-pill px-4 py-2" (click)="prevStep()">Back</button>
                                <button class="btn btn-primary rounded-pill px-5 shadow-sm py-2 fw-bold" 
                                    [disabled]="selectedCandidates().length === 0" (click)="nextStep()">
                                    Review Order <i class="bi bi-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Step 4: Final Review -->
                        <div *ngIf="currentStep() === 4" class="animate-in">
                            <div class="mb-4">
                                <h5 class="fw-bold mb-1">Confirm Screening Batch</h5>
                                <p class="text-muted small">Review the details before sending requests to the provider.</p>
                            </div>
                            
                            <div class="row g-3 mb-4">
                                <div class="col-sm-6">
                                    <div class="review-box p-3 bg-light rounded-4 h-100 border">
                                        <div class="small fw-bold text-uppercase text-secondary mb-2" style="font-size: 10px;">Screening Package</div>
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="bi bi-box-seam text-primary"></i>
                                            <h6 class="mb-0 fw-bold">{{selectedPackage()?.name}}</h6>
                                        </div>
                                        <div class="text-primary fw-bold mt-1">{{selectedPackage()?.price | currency}} / person</div>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="review-box p-3 bg-light rounded-4 h-100 border">
                                        <div class="small fw-bold text-uppercase text-secondary mb-2" style="font-size: 10px;">Selected Provider</div>
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="bi bi-hospital text-primary"></i>
                                            <h6 class="mb-0 fw-bold">{{selectedProvider()?.legalName}}</h6>
                                        </div>
                                        <div class="text-warning small mt-1">
                                            <i class="bi bi-star-fill me-1"></i>{{selectedProvider()?.rating || 4.5}} Rating
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="review-box p-3 bg-light rounded-4 border">
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <div class="small fw-bold text-uppercase text-secondary" style="font-size: 10px;">Candidates ({{selectedCandidates().length}})</div>
                                            <div class="small fw-bold text-dark">Total: {{ (selectedPackage()?.price || 0) * selectedCandidates().length | currency }}</div>
                                        </div>
                                        <div class="d-flex flex-wrap gap-2">
                                            <span class="badge bg-white text-dark border p-2 fw-normal rounded-pill shadow-xs" *ngFor="let c of selectedCandidates()">
                                                <i class="bi bi-person me-1 opacity-50"></i>{{c.fullName}}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between mt-5 pt-3 border-top">
                                <button class="btn btn-light rounded-pill px-4 py-2" (click)="prevStep()">Back</button>
                                <button class="btn btn-success rounded-pill px-5 shadow-sm py-2 fw-bold" 
                                    [disabled]="loading()" (click)="submit()">
                                    <span *ngIf="!loading()">Create Batch Order <i class="bi bi-send-fill ms-2"></i></span>
                                    <span *ngIf="loading()" class="spinner-border spinner-border-sm"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .max-width-container { max-width: 1000px; }
    .transition-width { transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    
    .step-item {
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
    }
    .step-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #dee2e6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        color: #adb5bd;
        transition: all 0.3s ease;
        z-index: 2;
    }
    .step-label {
        font-weight: 600;
        font-size: 14px;
        color: #adb5bd;
        transition: all 0.3s ease;
    }
    
    .step-item.active .step-number {
        border-color: var(--bs-primary);
        color: var(--bs-primary);
        box-shadow: 0 0 0 4px rgba(var(--bs-primary-rgb), 0.1);
    }
    .step-item.active .step-label { color: #212529; }
    
    .step-item.completed .step-number {
        background: var(--bs-primary);
        border-color: var(--bs-primary);
        color: white;
    }
    .step-item.completed .step-number::after {
        content: '\\f26e';
        font-family: 'bootstrap-icons';
        font-size: 14px;
    }
    .step-item.completed .step-number { font-size: 0; }
    
    .package-card {
        border: 2px solid #f8f9fa;
        border-radius: 20px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        background: #fff;
        height: 100%;
    }
    .package-card:hover {
        border-color: #dee2e6;
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    }
    .package-card.active {
        border-color: var(--bs-primary);
        background: rgba(var(--bs-primary-rgb), 0.02);
    }
    
    .icon-box {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .selection-indicator {
        position: absolute;
        top: 15px;
        right: 15px;
        color: var(--bs-primary);
        font-size: 20px;
    }
    
    .provider-item {
        cursor: pointer;
        background: #fff;
    }
    .provider-item:hover { background: #f8f9fa; }
    .provider-item.active { background: rgba(var(--bs-primary-rgb), 0.04); }
    
    .candidate-item {
        cursor: pointer;
        background: #fff;
    }
    .candidate-item:hover { border-color: #dee2e6 !important; }
    .candidate-item.active {
        border-color: var(--bs-primary) !important;
        background: rgba(var(--bs-primary-rgb), 0.02);
    }
    
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .animate-in {
        animation: fadeIn 0.4s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Custom scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #dee2e6;
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ced4da; }
</style>
    `
})
export class RequestWizardComponent implements OnInit {
    private packageService = inject(PackageService);
    private providerService = inject(ProviderService);
    private candidateService = inject(CandidateService);
    private requestService = inject(RequestService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    currentStep = signal(1);
    loading = signal(false);

    packages = signal<Package[]>([]);
    providers = signal<Provider[]>([]);
    allCandidates = signal<Candidate[]>([]);

    selectedPackage = signal<Package | undefined>(undefined);
    selectedProvider = signal<Provider | undefined>(undefined);
    selectedCandidates = signal<Candidate[]>([]);

    userLocation?: { lat: number, lng: number };

    progress = computed(() => {
        return (this.currentStep() / 4) * 100;
    });

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
        this.packageService.getPackages().subscribe({
            next: (data: any) => {
                let list: Package[] = [];
                if ((data as any).data && Array.isArray((data as any).data)) {
                    list = (data as any).data;
                } else if (Array.isArray(data)) {
                    list = data;
                }
                this.packages.set(list);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading packages', err);
                this.cdr.detectChanges();
            }
        });

        if (this.companyId) {
            this.providerService.getProvidersByLocation(this.companyId).subscribe({
                next: (provs: any) => {
                    this.providers.set(provs);
                    this.recalculateDistances();
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error('Error loading providers', err);
                    this.cdr.detectChanges();
                }
            });
            this.candidateService.getCandidatesByCompany(this.companyId).subscribe({
                next: (data: any) => {
                    const candList = (data && data.data) ? data.data : (Array.isArray(data) ? data : []);
                    this.allCandidates.set(candList);
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error('Error loading candidates', err);
                    this.cdr.detectChanges();
                }
            });
        }
    }

    recalculateDistances() {
        if (!this.userLocation || this.providers().length === 0) return;

        this.providers.update(prev => {
            prev.forEach(p => {
                if (p.latitude && p.longitude) {
                    p.distance = this.calculateHaversine(
                        this.userLocation!.lat, this.userLocation!.lng,
                        p.latitude, p.longitude
                    );
                }
            });
            return [...prev].sort((a, b) => (a.distance || 0) - (b.distance || 0));
        });
        this.cdr.detectChanges();
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

    nextStep() { if (this.currentStep() < 4) this.currentStep.update(s => s + 1); this.cdr.detectChanges(); }
    prevStep() { if (this.currentStep() > 1) this.currentStep.update(s => s - 1); this.cdr.detectChanges(); }

    selectPackage(pkg: Package) { this.selectedPackage.set(pkg); this.cdr.detectChanges(); }
    selectProvider(p: Provider) { this.selectedProvider.set(p); this.cdr.detectChanges(); }

    toggleCandidate(c: Candidate) {
        this.selectedCandidates.update(prev => {
            const index = prev.findIndex(cand => cand.id === c.id);
            if (index > -1) {
                return prev.filter((_, i) => i !== index);
            } else {
                return [...prev, c];
            }
        });
        this.cdr.detectChanges();
    }

    isCandidateSelected(c: Candidate): boolean {
        return this.selectedCandidates().some(cand => cand.id === c.id);
    }

    sortProviders(event: any) {
        const field = event.target.value;
        this.providers.update(prev => {
            const sorted = [...prev];
            if (field === 'distance') {
                sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
            } else if (field === 'tier') {
                sorted.sort((a, b) => (a.tierId || 0) - (b.tierId || 0));
            } else if (field === 'rating') {
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            }
            return sorted;
        });
        this.cdr.detectChanges();
    }

    submit() {
        const pkg = this.selectedPackage();
        const prov = this.selectedProvider();
        const candidates = this.selectedCandidates();

        if (!pkg || !prov || candidates.length === 0) return;

        this.loading.set(true);
        this.cdr.detectChanges();

        const batchData = {
            candidateIds: candidates.map(c => c.id),
            packageId: pkg.id,
            requestedProviderId: prov.id,
            expectedVisitDate: new Date(new Date().getTime() + 72 * 60 * 60 * 1000).toISOString()
        };

        this.requestService.createRequestBatch(batchData).subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/dashboard']);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to create screening requests', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }
}
