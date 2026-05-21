import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FinancialRecord {
    id: string;
    requestId: string;
    totalAmount: number;
    providerPayout: number;
    platformFee: number;
    isPaidByCompany: boolean;
    isProviderPaid: boolean;
    invoiceNumber?: string;
    createdAt: string;
}

export interface FinancialSummary {
    totalRevenue: number;
    totalPayouts: number;
    totalFees: number;
    completedCases: number;
}

@Injectable({
    providedIn: 'root'
})
export class FinancialService {
    private apiUrl = 'http://localhost:5284/api/financial';
    private http = inject(HttpClient);

    getInvoices(companyId: string): Observable<FinancialRecord[]> {
        return this.http.get<FinancialRecord[]>(`${this.apiUrl}/invoices/${companyId}`);
    }

    getPayouts(providerId: string): Observable<FinancialRecord[]> {
        return this.http.get<FinancialRecord[]>(`${this.apiUrl}/payouts/${providerId}`);
    }

    getSummary(): Observable<FinancialSummary> {
        return this.http.get<FinancialSummary>(`${this.apiUrl}/summary`);
    }

    markCompanyPaid(recordId: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${recordId}/mark-company-paid`, {});
    }

    markProviderPaid(recordId: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${recordId}/mark-provider-paid`, {});
    }
}
