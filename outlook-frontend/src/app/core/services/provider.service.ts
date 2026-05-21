import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Provider {
    id: string;
    legalName: string;
    tierId: number;
    rating?: number;
    estimatedDailyOperationalCapacity?: number;
    labSetup?: number;
    latitude?: number;
    longitude?: number;
    distance?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProviderService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/provider`;

    getProviders(): Observable<Provider[]> {
        return this.http.get<Provider[]>(this.apiUrl);
    }

    getProvider(id: string): Observable<Provider> {
        return this.http.get<Provider>(`${this.apiUrl}/${id}`);
    }

    getProvidersByLocation(companyId: string): Observable<Provider[]> {
        return this.http.get<Provider[]>(`${this.apiUrl}/by-location/${companyId}`);
    }

    registerProvider(formData: FormData): Observable<Provider> {
        return this.http.post<Provider>(this.apiUrl, formData);
    }

    updateProvider(id: string, provider: Provider): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, provider);
    }
}
