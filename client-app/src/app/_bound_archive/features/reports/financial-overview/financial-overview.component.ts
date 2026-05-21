import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialService, FinancialSummary, FinancialRecord } from '../../../core/services/financial.service';

@Component({
    selector: 'app-financial-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './financial-overview.component.html',
    styleUrls: ['./financial-overview.component.scss']
})
export class FinancialOverviewComponent implements OnInit {
    private financialService = inject(FinancialService);

    summary?: FinancialSummary;
    recentInvoices: FinancialRecord[] = [];
    loading = true;

    ngOnInit(): void {
        this.financialService.getSummary().subscribe(data => this.summary = data);
        this.financialService.getInvoices('all').subscribe(data => {
            this.recentInvoices = data;
            this.loading = false;
        });
    }
}
