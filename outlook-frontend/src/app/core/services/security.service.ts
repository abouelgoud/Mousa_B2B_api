import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
    companyId?: string | null;
    companyName?: string;
    providerId?: string | null;
    providerName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SecurityService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/security`;
    private rolesUrl = `${environment.apiUrl}/Security/roles`;
    private permissionsUrl = `${environment.apiUrl}/Security/permissions`;
    private usersUrl = `${environment.apiUrl}/Security/users`;

    // Roles & Permissions
    getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(this.rolesUrl);
    }

    getPermissions(): Observable<Permission[]> {
        return this.http.get<Permission[]>(this.permissionsUrl);
    }

    assignPermissions(roleId: string, permissionIds: string[]): Observable<void> {
        return this.http.post<void>(`${this.rolesUrl}/${roleId}/permissions`, { permissionIds });
    }

    // User Management
    getUsers(): Observable<UserManagement[]> {
        return this.http.get<UserManagement[]>(this.usersUrl);
    }

    createUser(data: any): Observable<void> {
        return this.http.post<void>(`${this.usersUrl}`, data);
    }

    deleteUser(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.usersUrl}/${userId}`);
    }

    resetPassword(userId: string, data: { newPassword: string }): Observable<void> {
        return this.http.post<void>(`${this.usersUrl}/${userId}/reset-password`, data);
    }

    assignRole(userId: string, roleName: string): Observable<void> {
        return this.http.post<void>(`${this.usersUrl}/${userId}/role`, { roleName });
    }
}
