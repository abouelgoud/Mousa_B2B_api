import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    currentUser = signal<any>({
        id: '7e677e7f-862f-4b85-047f-08de5da88692',
        email: 'provider@b2bhealthcare.com',
        providerId: '54ed873e-cc48-4caa-8021-0559133642b2',
        companyId: null,
        role: 'HealthCareProvider'
    });

    isAuthenticated = signal<boolean>(true);

    constructor(private router: Router) { }

    hasPermission(permission: string): boolean {
        return true; // Allow all for testing
    }

    logout() {
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }
}
