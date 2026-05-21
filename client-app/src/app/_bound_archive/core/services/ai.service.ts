import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AIRiskResult {
    requestId: string;
    riskLevel: string;
    aiInsightSummary: string;
    confidenceScore: number;
}

@Injectable({
    providedIn: 'root'
})
export class AIService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5284/api/AI';

    analyzeRisk(requestId: string): Observable<AIRiskResult> {
        return this.http.get<AIRiskResult>(`${this.apiUrl}/analyze/${requestId}`);
    }
}
