import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Provider {
    id: string;
    legalName: string;
    crCertificatePath: string;
    mohLicensePath: string;
    cbahiAccreditationPath?: string;
    labAccreditationPath?: string;
    branchLocations?: string;
    primaryContactPersonId: string;
    estimatedDailyOperationalCapacity: number;
    labSetup: number;
    tierId: number;
    bankAccountId: string;
    latitude?: number;
    longitude?: number;
    distance?: number;
    rating?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProviderService {
    private apiUrl = 'http://localhost:5284/api/provider';
    private http = inject(HttpClient);

    getProviders(): Observable<Provider[]> {
        return this.http.get<Provider[]>(this.apiUrl);
    }

    getProvider(id: string): Observable<Provider> {
        return this.http.get<Provider>(`${this.apiUrl}/${id}`);
    }

    registerProvider(provider: FormData): Observable<Provider> {
        return this.http.post<Provider>(this.apiUrl, provider);
    }

    updateProvider(id: string, provider: Partial<Provider>): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, provider);
    }

    getProvidersByLocation(companyId: string): Observable<Provider[]> {
        return this.http.get<Provider[]>(`${this.apiUrl}/by-location/${companyId}`);
    }
}
