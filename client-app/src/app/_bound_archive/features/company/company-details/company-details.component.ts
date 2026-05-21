import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService, Company } from '../../../core/services/company.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
    selector: 'app-company-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './company-details.component.html'
})
export class CompanyDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private companyService = inject(CompanyService);

    company?: Company;
    loading = true;
    error?: string;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.companyService.getCompany(id).subscribe({
                next: (data) => {
                    this.company = data;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error fetching company details', err);
                    this.error = 'Failed to load company details.';
                    this.loading = false;
                }
            });
        } else {
            this.error = 'No company ID provided.';
            this.loading = false;
        }
    }
}
