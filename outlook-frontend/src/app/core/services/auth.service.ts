import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router); // Property injection instead of constructor
    private apiUrl = `${environment.apiUrl}/auth`;

    currentUser = signal<any>(null);
    isAuthenticated = signal<boolean>(false);

    constructor() {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage() {
        try {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            // Explicitly check for 'undefined' string which causes JSON.parse errors
            if (token && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
                const parsedUser = JSON.parse(storedUser);
                this.currentUser.set(parsedUser);
                this.isAuthenticated.set(true);
            } else {
                this.clearStorage();
            }
        } catch (e) {
            console.error('Error parsing user from storage', e);
            this.clearStorage();
        }
    }

    private clearStorage() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
    }

    hasPermission(permission: string): boolean {
        const user = this.currentUser();
        if (!user) return false;

        // SuperAdmin has all permissions
        if (user.roles?.includes('SuperAdministrator')) return true;

        // Check explicit permissions
        return user.permissions?.includes(permission) || false;
    }

    login(email: string, pass: string): Observable<boolean> {
        return this.http.post<any>(`${this.apiUrl}/login`, { email, password: pass }).pipe(
            map(response => {
                if (response && response.token) {
                    // Backend returns flattened object (AuthResponseDto), not nested user object
                    const user = {
                        id: response.userId,
                        username: response.username,
                        roles: response.roles || [],
                        permissions: response.permissions || [],
                        companyId: response.companyId,
                        providerId: response.providerId,
                        email: email
                    };

                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(user));
                    this.currentUser.set(user);
                    this.isAuthenticated.set(true);
                    this.router.navigate(['/']);
                    return true;
                }
                return false;
            }),
            catchError(error => {
                console.error('Login failed', error);
                return of(false);
            })
        );
    }

    logout() {
        this.clearStorage();
        this.router.navigate(['/login']);
    }
}
