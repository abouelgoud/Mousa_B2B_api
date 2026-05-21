import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedicalService {
    id: string;
    name: string;
    description: string;
    code: string;
    price: number;
}

export interface Package {
    id: string;
    name: string;
    description: string;
    price: number;
    services: MedicalService[];
}

@Injectable({
    providedIn: 'root'
})
export class PackageService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/package`;
    private serviceUrl = `${environment.apiUrl}/medical-services`;

    getPackages(): Observable<Package[]> {
        return this.http.get<Package[]>(this.apiUrl);
    }

    getPackage(id: string): Observable<Package> {
        return this.http.get<Package>(`${this.apiUrl}/${id}`);
    }

    getServices(): Observable<MedicalService[]> {
        return this.http.get<MedicalService[]>(this.serviceUrl);
    }

    createPackage(pkg: any): Observable<Package> {
        return this.http.post<Package>(this.apiUrl, pkg);
    }

    updatePackage(id: string, pkg: any): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, pkg);
    }

    deletePackage(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getService(id: string): Observable<MedicalService> {
        return this.http.get<MedicalService>(`${this.serviceUrl}/${id}`);
    }

    createService(service: any): Observable<MedicalService> {
        return this.http.post<MedicalService>(this.serviceUrl, service);
    }

    updateService(id: string, service: any): Observable<void> {
        return this.http.put<void>(`${this.serviceUrl}/${id}`, service);
    }

    deleteService(id: string): Observable<void> {
        return this.http.delete<void>(`${this.serviceUrl}/${id}`);
    }
}
