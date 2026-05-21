import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderService, Provider } from '../../../core/services/provider.service';
import { RouterModule, Router } from '@angular/router';

@Component({
    selector: 'app-provider-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './provider-list.component.html',
    styleUrls: ['./provider-list.component.scss']
})
export class ProviderListComponent implements OnInit {
    private providerService = inject(ProviderService);
    private router = inject(Router);
    providers: Provider[] = [];

    viewDetails(id: string) {
        this.router.navigate(['/provider/details', id]);
    }

    editProvider(id: string) {
        this.router.navigate(['/provider/edit', id]);
    }
    loading = true;

    ngOnInit(): void {
        this.providerService.getProviders().subscribe({
            next: (data) => {
                this.providers = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load providers', err);
                this.loading = false;
            }
        });
    }

    getLabSetupLabel(setup: number): string {
        switch (setup) {
            case 0: return 'High Complexity';
            case 1: return 'Basic In-house';
            default: return 'Outsourced';
        }
    }
}
