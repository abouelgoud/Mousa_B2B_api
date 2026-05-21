import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { PackageService, Package } from '../../../core/services/package.service';

@Component({
    selector: 'app-package-list',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterLink],
    templateUrl: './package-list.component.html'
})
export class PackageListComponent implements OnInit {
    private packageService = inject(PackageService);

    packages: Package[] = [];
    loading = true;

    ngOnInit() {
        this.loadPackages();
    }

    loadPackages() {
        this.loading = true;
        this.packageService.getPackages().subscribe({
            next: (data) => {
                this.packages = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load packages', err);
                this.loading = false;
            }
        });
    }

    deletePackage(id: string) {
        if (confirm('Are you sure you want to delete this package?')) {
            this.packageService.deletePackage(id).subscribe({
                next: () => {
                    this.packages = this.packages.filter(p => p.id !== id);
                },
                error: (err) => console.error('Failed to delete package', err)
            });
        }
    }
}
