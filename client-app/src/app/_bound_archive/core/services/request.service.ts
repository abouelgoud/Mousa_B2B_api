import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScreeningRequest {
    id: string;
    caseID: string;
    companyId: string;
    candidateId?: string;
    candidateFullName: string;
    nationalID: string;
    packageName: string;
    packageId: string;
    assignedProviderId?: string;
    assignedProviderName?: string;
    requestedProviderId?: string;
    requestedProviderName?: string;
    supportingDocumentPath?: string;
    status: number;
    expectedVisitDate?: string;
    screeningBatchId?: string;
}

@Injectable({
    providedIn: 'root'
})
export class RequestService {
    private apiUrl = 'http://localhost:5284/api/request';
    private http = inject(HttpClient);

    createRequestBatch(batchData: any): Observable<ScreeningRequest[]> {
        return this.http.post<ScreeningRequest[]>(this.apiUrl, batchData);
    }

    getCompanyRequests(companyId: string): Observable<ScreeningRequest[]> {
        return this.http.get<ScreeningRequest[]>(`${this.apiUrl}/company/${companyId}`);
    }

    getRequest(id: string): Observable<ScreeningRequest> {
        return this.http.get<ScreeningRequest>(`${this.apiUrl}/${id}`);
    }
}
