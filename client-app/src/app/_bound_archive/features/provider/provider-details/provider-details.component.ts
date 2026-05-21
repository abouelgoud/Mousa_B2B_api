import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderService, Provider } from '../../../core/services/provider.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
    selector: 'app-provider-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './provider-details.component.html'
})
export class ProviderDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private providerService = inject(ProviderService);

    provider?: Provider;
    loading = true;
    error?: string;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.providerService.getProvider(id).subscribe({
                next: (data) => {
                    this.provider = data;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error fetching provider details', err);
                    this.error = 'Failed to load provider details.';
                    this.loading = false;
                }
            });
        } else {
            this.error = 'No provider ID provided.';
            this.loading = false;
        }
    }

    readonly baseUrl = 'http://localhost:5284';

    getLabSetupLabel(setup: number): string {
        switch (setup) {
            case 0: return 'High Complexity';
            case 1: return 'Basic In-house';
            default: return 'Outsourced';
        }
    }

    getFileUrl(path: string): string {
        if (!path) return '';
        // If path is already absolute, return it
        if (path.startsWith('http')) return path;

        // Ensure path starts with slash if needed, but backend usually stores generic path.
        // If path comes as 'uploads/...' we just append.
        // Clean up double slashes just in case.
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.baseUrl}${cleanPath}`;
    }
}
