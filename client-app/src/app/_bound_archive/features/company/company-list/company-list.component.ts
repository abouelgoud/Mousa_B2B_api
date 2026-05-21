import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService, Company } from '../../../core/services/company.service';
import { RouterModule, Router } from '@angular/router';

@Component({
    selector: 'app-company-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './company-list.component.html',
    styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
    private companyService = inject(CompanyService);
    private router = inject(Router);
    companies: Company[] = [];
    loading = true;

    viewDetails(id: string) {
        this.router.navigate(['/company/details', id]);
    }

    editCompany(id: string) {
        this.router.navigate(['/company/edit', id]);
    }

    ngOnInit(): void {
        this.companyService.getCompanies().subscribe({
            next: (data) => {
                this.companies = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load companies', err);
                this.loading = false;
            }
        });
    }
}
