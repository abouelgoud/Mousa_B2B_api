import { Component, inject, signal, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProviderService, Provider } from '../../core/services/provider.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-people',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './people.component.html',
    styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {
    private providerService = inject(ProviderService);
    private cdr = inject(ChangeDetectorRef);
    private router = inject(Router);
    public authService = inject(AuthService);

    providers = signal<Provider[]>([]);
    loading = signal<boolean>(true);

    ngOnInit() {
        this.loadProviders();
    }

    loadProviders() {
        this.loading.set(true);
        this.providerService.getProviders().subscribe({
            next: (data: any) => {
                let list: Provider[] = [];
                if (data && data.data && Array.isArray(data.data)) {
                    list = data.data;
                } else if (Array.isArray(data)) {
                    list = data;
                }
                this.providers.set(list);
                this.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load providers', err);
                this.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    getLabSetupLabel(setup?: number): string {
        switch (setup) {
            case 0: return 'High Complexity';
            case 1: return 'Basic In-house';
            default: return 'Outsourced';
        }
    }

    getLabSetupClass(setup?: number): string {
        switch (setup) {
            case 0: return 'bg-purple-subtle text-purple border-purple';
            case 1: return 'bg-blue-subtle text-blue border-blue';
            default: return 'bg-light text-secondary border-secondary';
        }
    }

    getCapacityPercentage(capacity?: number): number {
        if (!capacity) return 0;
        // Mocking usage percentage for visual effect
        return Math.min(Math.round((capacity / 500) * 100), 100);
    }

    getCapacityColor(percentage: number): string {
        if (percentage > 80) return 'bg-danger';
        if (percentage > 50) return 'bg-warning';
        return 'bg-success';
    }

    editProvider(providerId: string, event: Event) {
        event.stopPropagation();
        this.router.navigate(['/people/edit', providerId]);
    }

    viewDetails(providerId: string, event: Event) {
        event.stopPropagation();
        this.router.navigate(['/people/details', providerId]);
    }

    deleteProvider(providerId: string, event: Event) {
        event.stopPropagation();
        if (confirm('Are you sure you want to remove this provider organization?')) {
            this.providers.update(prev => prev.filter(p => p.id !== providerId));
            this.cdr.detectChanges();
        }
    }

    registerNewProvider() {
        this.router.navigate(['/people/onboarding']);
    }
}
