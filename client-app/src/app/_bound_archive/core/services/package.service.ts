import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface PackageCreate {
    name: string;
    description?: string;
    price: number;
    serviceIds: string[];
}

@Injectable({
    providedIn: 'root'
})
export class PackageService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5284/api/package';

    getPackages(): Observable<Package[]> {
        return this.http.get<Package[]>(this.apiUrl);
    }

    getPackage(id: string): Observable<Package> {
        return this.http.get<Package>(`${this.apiUrl}/${id}`);
    }

    createPackage(pkg: PackageCreate): Observable<Package> {
        return this.http.post<Package>(this.apiUrl, pkg);
    }

    updatePackage(id: string, pkg: PackageCreate): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, pkg);
    }

    deletePackage(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getServices(): Observable<MedicalService[]> {
        return this.http.get<MedicalService[]>('http://localhost:5284/api/medical-services');
    }

    getService(id: string): Observable<MedicalService> {
        return this.http.get<MedicalService>(`http://localhost:5284/api/medical-services/${id}`);
    }

    createService(svc: Partial<MedicalService>): Observable<MedicalService> {
        return this.http.post<MedicalService>('http://localhost:5284/api/medical-services', svc);
    }

    updateService(id: string, svc: Partial<MedicalService>): Observable<void> {
        return this.http.put<void>(`http://localhost:5284/api/medical-services/${id}`, svc);
    }

    deleteService(id: string): Observable<void> {
        return this.http.delete<void>(`http://localhost:5284/api/medical-services/${id}`);
    }
}
