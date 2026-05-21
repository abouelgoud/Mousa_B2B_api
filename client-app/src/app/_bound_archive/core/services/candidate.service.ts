import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    contentType: string;
    fileSize: number;
}

@Injectable({
    providedIn: 'root'
})
export class CandidateService {
    private apiUrl = 'http://localhost:5284/api/candidate';
    private http = inject(HttpClient);

    getCandidatesByCompany(companyId: string): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(`${this.apiUrl}/company/${companyId}`);
    }

    getCandidate(id: string): Observable<Candidate> {
        return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
    }

    createCandidate(companyId: string, candidateData: any, files: File[] = []): Observable<Candidate> {
        const formData = new FormData();

        // Append all fields from candidateData to formData
        Object.keys(candidateData).forEach(key => {
            if (candidateData[key] !== null && candidateData[key] !== undefined) {
                formData.append(key, candidateData[key]);
            }
        });

        // Append files
        files.forEach(file => {
            formData.append('attachments', file, file.name);
        });

        // Note: We don't need to specify Content-Type: multipart/form-data, 
        // Angular/Browser does it automatically with the correct boundary when passing FormData
        return this.http.post<Candidate>(this.apiUrl, formData);
    }

    updateCandidate(id: string, candidateData: any, files: File[] = []): Observable<void> {
        const formData = new FormData();

        Object.keys(candidateData).forEach(key => {
            if (candidateData[key] !== null && candidateData[key] !== undefined) {
                formData.append(key, candidateData[key]);
            }
        });

        files.forEach(file => {
            formData.append('attachments', file, file.name);
        });

        return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
    }
}
