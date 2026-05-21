import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
    attachments?: CandidateAttachment[];
}

export interface CandidateAttachment {
    id: string;
    fileName: string;
    filePath: string;
    contentType?: string;
    fileSize?: number;
    uploadedAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class CandidateService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/candidate`;

    getCandidatesByCompany(companyId: string): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(`${this.apiUrl}/company/${companyId}`);
    }

    getCandidate(id: string): Observable<Candidate> {
        return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
    }

    createCandidate(companyId: string, data: any, files: File[] = []): Observable<Candidate> {
        const formData = new FormData();
        formData.append('CompanyId', companyId);

        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        files.forEach((file, index) => {
            formData.append('attachments', file, file.name);
        });

        return this.http.post<Candidate>(this.apiUrl, formData);
    }

    updateCandidate(id: string, data: any, files: File[] = []): Observable<void> {
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        files.forEach((file) => {
            formData.append('attachments', file, file.name);
        });

        return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
    }

    deleteCandidate(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
