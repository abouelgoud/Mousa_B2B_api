import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
    id: string;
    name: string;
    permissions: string[];
}

export interface Permission {
    id: string;
    name: string;
    description: string;
    featureGroup: string;
}

export interface UserManagement {
    id: string;
    username: string;
    email: string;
    roles: string[];
    companyId?: string;
    companyName?: string;
    providerId?: string;
    providerName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SecurityService {
    private apiUrl = 'http://localhost:5284/api/security';
    private http = inject(HttpClient);

    getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(`${this.apiUrl}/roles`);
    }

    getPermissions(): Observable<Permission[]> {
        return this.http.get<Permission[]>(`${this.apiUrl}/permissions`);
    }

    assignPermissions(roleId: string, permissionIds: string[]): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/roles/${roleId}/permissions`, { permissionIds });
    }

    createUser(user: any): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/users`, user);
    }

    getUsers(): Observable<UserManagement[]> {
        return this.http.get<UserManagement[]>(`${this.apiUrl}/users`);
    }

    assignRole(userId: string, roleName: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/users/${userId}/role`, { roleName });
    }
}
