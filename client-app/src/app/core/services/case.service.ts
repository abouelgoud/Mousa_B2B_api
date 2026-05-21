import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class CaseService {
    private http = inject(HttpClient);
    // Assuming environment might be missing too, so hardcoding or using relative for now if fail
    private apiUrl = 'http://localhost:5284/api/case';

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
