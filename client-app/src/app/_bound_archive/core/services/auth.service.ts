import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  companyId?: string;
  providerId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5284/api/auth'; // Replace with actual port

  public currentUser = signal<AuthResponse | null>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('user', JSON.stringify(res));
        this.currentUser.set(res);
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  private getStoredUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  get token(): string | null {
    return this.currentUser()?.token || null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.roles.includes(role) || false;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.roles.includes('SuperAdministrator')) return true;
    return user.permissions.includes(permission) || false;
  }
}
