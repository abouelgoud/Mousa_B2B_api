import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
    status: number;
    expectedVisitDate?: string;
}

@Injectable({
    providedIn: 'root'
})
export class RequestService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/request`;

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
