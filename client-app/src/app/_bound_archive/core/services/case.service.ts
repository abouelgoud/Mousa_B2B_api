import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicalResult {
    requestId: string;
    vitalSigns: string;
    labFindings: string;
    physicianNotes: string;
    isFitForWork: boolean;
    resultDocumentPath?: string;
}

export interface CaseReview {
    requestId: string;
    approved: boolean;
    comments?: string;
    adminName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CaseService {
    private apiUrl = 'http://localhost:5284/api/case';
    private http = inject(HttpClient);

    submitResults(results: MedicalResult): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/submit-results`, results);
    }

    reviewCase(review: CaseReview): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/review`, review);
    }

    getProviderWorklist(providerId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/provider-worklist/${providerId}`);
    }

    getAdminQueue(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/admin-queue`);
    }

    getWaitingQueue(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/waiting-queue`);
    }

    getCaseDetails(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }
}
