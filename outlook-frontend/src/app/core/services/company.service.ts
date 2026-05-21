import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Company {
    id: string;
    legalName: string;
    crNumber: string;
    crCertificatePath?: string;
    headOfficeAddress: string;
    branchLocations?: string;
    companySize: number;
    totalEmployees: number;
    businessActivity: string;
    estimatedMonthlyScreeningVolume: number;
    vatRegistrationNumber?: string;
    designatedContactPersonId: string;
    defaultProviderAssignmentMode: number;
}

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/company`;

    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(this.apiUrl);
    }

    getCompany(id: string): Observable<Company> {
        return this.http.get<Company>(`${this.apiUrl}/${id}`);
    }

    registerCompany(formData: FormData): Observable<Company> {
        return this.http.post<Company>(this.apiUrl, formData);
    }

    updateCompany(id: string, company: Company): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, company);
    }
}
