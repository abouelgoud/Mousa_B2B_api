import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CaseService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/case`;

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

    submitResults(results: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/submit-results`, results);
    }
}
