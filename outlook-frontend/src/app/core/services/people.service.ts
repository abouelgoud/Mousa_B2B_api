import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PeopleService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getProviders(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/provider`);
    }

    getCompanies(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/company`);
    }
}
