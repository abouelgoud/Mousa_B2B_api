import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
    id: string;
    legalName: string;
    crNumber: string;
    crCertificatePath: string;
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
    private apiUrl = 'http://localhost:5284/api/company'; // Replace with actual port
    private http = inject(HttpClient);

    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(this.apiUrl);
    }

    getCompany(id: string): Observable<Company> {
        return this.http.get<Company>(`${this.apiUrl}/${id}`);
    }

    createCompany(company: Partial<Company>): Observable<Company> {
        return this.http.post<Company>(this.apiUrl, company);
    }

    updateCompany(id: string, company: Partial<Company>): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, company);
    }

    deleteCompany(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Candidate Management
    getCandidates(companyId: string): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(`http://localhost:5284/api/candidate/company/${companyId}`);
    }

    getCandidate(id: string): Observable<Candidate> {
        return this.http.get<Candidate>(`http://localhost:5284/api/candidate/${id}`);
    }

    createCandidate(companyId: string, candidate: Partial<Candidate>): Observable<Candidate> {
        return this.http.post<Candidate>(`http://localhost:5284/api/candidate?companyId=${companyId}`, candidate);
    }

    updateCandidate(id: string, candidate: Partial<Candidate>): Observable<void> {
        return this.http.put<void>(`http://localhost:5284/api/candidate/${id}`, candidate);
    }

    deleteCandidate(id: string): Observable<void> {
        return this.http.delete<void>(`http://localhost:5284/api/candidate/${id}`);
    }
}

export interface Candidate {
    id: string;
    fullName: string;
    nationalID: string;
    mobileNumber: string;
    gender: string;
    position: string;
    branchLocation: string;
    department?: string;
    companyId: string;
}
