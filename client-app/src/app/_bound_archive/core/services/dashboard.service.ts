import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
    totalRequests: number;
    pendingArrived: number;
    underTesting: number;
    reportsReady: number;
}

export interface DashboardRequest {
    caseId: string;
    candidateName: string;
    companyName: string;
    status: string;
    submissionDate: string;
}

export interface DashboardInsight {
    header: string;
    value: string;
    description: string;
    icon: string;
    colorClass: string;
}

export interface DashboardData {
    stats: DashboardStats;
    recentRequests: DashboardRequest[];
    aiInsights: DashboardInsight[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5284/api/Dashboard';

    getDashboardData(): Observable<DashboardData> {
        return this.http.get<DashboardData>(this.apiUrl);
    }
}
