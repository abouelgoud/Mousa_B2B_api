import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { PackageService, Package } from '../../core/services/package.service';

@Component({
    selector: 'app-package-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
<div class="h-100 d-flex flex-column overflow-hidden">
    <!-- Toolbar -->
    <header class="toolbar d-flex justify-content-between align-items-center">
        <div>
            <h4 class="mb-0"><i class="bi bi-box-seam me-2 text-primary"></i>Service Bundles</h4>
            <p class="text-muted small mb-0">Manage standardized clinical packages and diagnostic bundles.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center" [routerLink]="['/packages/add']">
            <i class="bi bi-plus-lg me-2"></i>Create Bundle
        </button>
    </header>

    <!-- Content -->
    <div class="content-area flex-grow-1 overflow-auto p-4">
        <div class="table-container shadow-sm bg-white">
            <table class="table table-hover align-middle">
                <thead>
                    <tr>
                        <th class="ps-4">Package Identity</th>
                        <th>Composition</th>
                        <th>Standard Price</th>
                        <th class="text-end pe-4">Actions</th>
                    </tr>
                </thead>
                <tbody *ngIf="!loading()">
                    <tr *ngFor="let pkg of packages()" class="cursor-pointer" [routerLink]="['/packages/edit', pkg.id]">
                        <td class="ps-4">
                            <div class="d-flex align-items-center gap-3">
                                <div class="package-icon">
                                    <i class="bi bi-stack"></i>
                                </div>
                                <div>
                                    <div class="fw-semibold">{{ pkg.name }}</div>
                                    <div class="small text-secondary text-truncate" style="max-width: 250px;">{{ pkg.description }}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex flex-wrap gap-1">
                                <span *ngFor="let svc of pkg.services" class="service-chip">
                                    {{ svc.name }}
                                </span>
                                <span *ngIf="pkg.services.length === 0" class="text-muted small italic">No services linked</span>
                            </div>
                        </td>
                        <td>
                            <div class="price-box">
                                {{ pkg.price | currency:'SAR ':'symbol':'1.2-2' }}
                            </div>
                        </td>
                        <td class="text-end pe-4">
                            <a class="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0" [routerLink]="['/packages/edit', pkg.id]">
                                Edit Details
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Empty State -->
            <div *ngIf="packages().length === 0 && !loading()" class="text-center py-5">
                <i class="bi bi-box-seam display-4 text-muted opacity-10 d-block mb-3"></i>
                <h6 class="fw-semibold">No bundles configured</h6>
                <p class="small text-secondary">Create your first medical package by combining services.</p>
                <button class="btn btn-primary btn-sm px-4 mt-2" [routerLink]="['/packages/add']">Configure Bundle</button>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading()" class="text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="small text-muted mt-2">Retrieving bundles...</div>
            </div>
        </div>
    </div>
</div>
    `,
    styleUrls: ['./package-list.component.scss']
})
export class PackageListComponent implements OnInit {
    private packageService = inject(PackageService);
    private cdr = inject(ChangeDetectorRef);

    packages = signal<Package[]>([]);
    loading = signal<boolean>(true);

    ngOnInit() {
        this.loadPackages();
    }

    loadPackages() {
        this.loading.set(true);
        console.log('Loading packages...');
        this.packageService.getPackages().subscribe({
            next: (data: any) => {
                console.log('Packages loaded raw:', data);
                // Robust check for wrapped data
                if (data && data.data && Array.isArray(data.data)) {
                    this.packages.set(data.data);
                } else if (Array.isArray(data)) {
                    this.packages.set(data);
                } else {
                    this.packages.set([]);
                }

                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load packages', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }
}
