import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { PackageService, MedicalService } from '../../../core/services/package.service';

@Component({
    selector: 'app-service-list',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterLink],
    templateUrl: './service-list.component.html'
})
export class ServiceListComponent implements OnInit {
    private packageService = inject(PackageService);

    services: MedicalService[] = [];
    loading = true;

    ngOnInit() {
        this.loadServices();
    }

    loadServices() {
        this.loading = true;
        this.packageService.getServices().subscribe({
            next: (data) => {
                this.services = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load services', err);
                this.loading = false;
            }
        });
    }

    deleteService(id: string) {
        if (confirm('Are you sure you want to delete this service? This might affect existing packages.')) {
            this.packageService.deleteService(id).subscribe({
                next: () => {
                    this.services = this.services.filter(s => s.id !== id);
                },
                error: (err) => console.error('Failed to delete service', err)
            });
        }
    }
}
