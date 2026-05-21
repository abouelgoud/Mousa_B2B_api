import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityService, Role, Permission } from '../../../core/services/security.service';

@Component({
    selector: 'app-role-manager',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
<div class="role-matrix-container h-100 d-flex flex-column overflow-hidden">
    <!-- Toolbar -->
    <header class="toolbar d-flex justify-content-between align-items-center">
        <div>
            <h4 class="mb-0"><i class="bi bi-shield-lock me-2 text-primary"></i>Identity & Governance</h4>
            <p class="text-muted small mb-0">Orchestrate granular access permissions across system actors.</p>
        </div>
        <button class="btn btn-primary px-4 d-flex align-items-center gap-2" 
                (click)="savePermissions()" [disabled]="!selectedRole() || saving">
            <span *ngIf="saving" class="spinner-border spinner-border-sm"></span>
            <i class="bi bi-check-all fs-5" *ngIf="!saving"></i>
            <span>Commit Permissions</span>
        </button>
    </header>

    <div class="flex-grow-1 d-flex overflow-hidden">
        <!-- Sidebar: Roles -->
        <aside class="role-sidebar d-flex flex-column">
            <div class="p-4 pb-2">
                <h6 class="text-uppercase text-muted small fw-bold mb-3 ls-wider">System Archetypes</h6>
                <div class="input-group search-bar mb-3">
                    <span class="input-group-text"><i class="bi bi-funnel"></i></span>
                    <input type="text" class="form-control" placeholder="Filter roles...">
                </div>
            </div>
            
            <div class="flex-grow-1 overflow-auto custom-scrollbar">
                <div *ngFor="let role of roles()" 
                     class="role-item cursor-pointer mb-1"
                     [class.active]="selectedRole()?.id === role.id"
                     (click)="selectRole(role)">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="role-name">{{role.name}}</span>
                        <span class="badge rounded-pill bg-light text-muted fw-normal" style="font-size: 10px;">{{ role.permissions.length }}</span>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content Matrix -->
        <main class="flex-grow-1 overflow-auto p-4 bg-white custom-scrollbar">
            <div *ngIf="!selectedRole()" class="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                <i class="bi bi-shield-shaded display-1 opacity-10 mb-3"></i>
                <h5 class="fw-light">Select an archetype to configure policy</h5>
                <p class="small">Choose a system role from the left pane to manage its capability matrix.</p>
            </div>

            <div *ngIf="selectedRole()" class="animate-fade-in">
                <div class="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <div class="badge-fluent small mb-1">Configuration View</div>
                        <h4 class="fw-bold text-dark">Capabilities for {{selectedRole()?.name}}</h4>
                    </div>
                    <div class="input-group search-bar" style="max-width: 300px;">
                        <span class="input-group-text"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control" placeholder="Search capability..." [(ngModel)]="searchTerm">
                    </div>
                </div>

                <div class="permission-grid">
                    <table class="table permission-table table-hover align-middle">
                        <thead>
                            <tr>
                                <th class="text-center" style="width: 80px;">Enable</th>
                                <th>Permission Directive</th>
                                <th>Functional Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let perm of filteredPermissions()">
                                <td class="text-center">
                                    <div class="form-check form-switch d-inline-block">
                                        <input class="form-check-input" type="checkbox" 
                                               [checked]="hasPermission(perm.name)"
                                               (change)="togglePermission(perm.id)">
                                    </div>
                                </td>
                                <td>
                                    <div class="permission-name">{{perm.name}}</div>
                                    <div class="permission-desc">{{perm.description}}</div>
                                </td>
                                <td><span class="feature-tag">{{perm.featureGroup || 'Global'}}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</div>
    `,
    styleUrls: ['./role-manager.component.scss']
})
export class RoleManagerComponent implements OnInit {
    private securityService = inject(SecurityService);
    private cdr = inject(ChangeDetectorRef);

    roles = signal<Role[]>([]);
    permissions = signal<Permission[]>([]);
    selectedRole = signal<Role | null>(null);
    selectedPermissionIds = signal<string[]>([]);
    saving = false;
    searchTerm = '';

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.securityService.getRoles().subscribe({
            next: (data: any) => {
                if (data && data.data && Array.isArray(data.data)) this.roles.set(data.data);
                else if (Array.isArray(data)) this.roles.set(data);
                this.cdr.detectChanges();
            }
        });

        this.securityService.getPermissions().subscribe({
            next: (data: any) => {
                if (data && data.data && Array.isArray(data.data)) this.permissions.set(data.data);
                else if (Array.isArray(data)) this.permissions.set(data);
                this.cdr.detectChanges();
            }
        });
    }

    selectRole(role: Role) {
        this.selectedRole.set(role);
        // Map existing permissions by name to IDs
        const ids = this.permissions()
            .filter(p => role.permissions.includes(p.name))
            .map(p => p.id);
        this.selectedPermissionIds.set(ids);
        this.cdr.detectChanges();
    }

    filteredPermissions(): Permission[] {
        const perms = this.permissions();
        if (!this.searchTerm) return perms;
        return perms.filter(p =>
            p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            p.featureGroup?.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    hasPermission(name: string): boolean {
        const perm = this.permissions().find(p => p.name === name);
        return perm ? this.selectedPermissionIds().includes(perm.id) : false;
    }

    togglePermission(id: string) {
        this.selectedPermissionIds.update(prev => {
            const index = prev.indexOf(id);
            if (index > -1) {
                return prev.filter(p => p !== id);
            } else {
                return [...prev, id];
            }
        });
        this.cdr.detectChanges();
    }

    savePermissions() {
        const role = this.selectedRole();
        if (!role) return;
        this.saving = true;
        this.securityService.assignPermissions(role.id, this.selectedPermissionIds()).subscribe({
            next: () => {
                this.saving = false;
                this.loadData();
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to save permissions', err);
                this.saving = false;
                this.cdr.detectChanges();
            }
        });
    }
}
