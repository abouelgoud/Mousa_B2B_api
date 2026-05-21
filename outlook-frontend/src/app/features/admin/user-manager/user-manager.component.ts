import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecurityService, UserManagement, Role } from '../../../core/services/security.service';
import { CompanyService } from '../../../core/services/company.service';
import { ProviderService } from '../../../core/services/provider.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-user-manager',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    template: `
<div class="user-manager-container h-100 d-flex flex-column overflow-hidden">
    <!-- Toolbar -->
    <header class="toolbar d-flex justify-content-between align-items-center">
        <div>
            <h4 class="mb-0"><i class="bi bi-people me-2 text-primary"></i>Identity Provisioning</h4>
            <p class="text-muted small mb-0">Governance of system users, organizational linkages, and security role escalation.</p>
        </div>
        <button *ngIf="authService.hasPermission('User.Manage')" class="btn btn-primary d-flex align-items-center" (click)="openCreateModal()">
            <i class="bi bi-person-plus me-2"></i>Provision Account
        </button>
    </header>

    <!-- Content Area -->
    <div class="flex-grow-1 overflow-auto p-4 custom-scrollbar">
        <div class="table-container shadow-sm mb-4">
            <table class="table table-hover align-middle">
                <thead>
                    <tr>
                        <th>Identity Profile</th>
                        <th>Network Address</th>
                        <th>Role Escalation</th>
                        <th>Affiliated Entity</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody *ngIf="!loading">
                    <tr *ngFor="let user of users(); let i = index" [style.animation-delay]="(i * 0.05) + 's'">
                        <td>
                            <div class="user-identity">
                                <div class="avatar-box">{{user.username.charAt(0).toUpperCase()}}</div>
                                <div>
                                    <div class="name">{{user.username}}</div>
                                    <div class="id">UID: {{user.id.substring(0,8).toUpperCase()}}</div>
                                </div>
                            </div>
                        </td>
                        <td><span class="small text-muted">{{user.email}}</span></td>
                        <td>
                            <select *ngIf="authService.hasPermission('User.Manage')" class="form-select form-select-sm w-auto" 
                                    (change)="changeRole(user.id, $event)">
                                <option *ngFor="let role of roles()" 
                                        [value]="role.name" 
                                        [selected]="user.roles.includes(role.name)">
                                    {{role.name}}
                                </option>
                            </select>
                            <span *ngIf="!authService.hasPermission('User.Manage')" class="badge bg-light text-dark border">
                                {{ user.roles[0] || 'Standard' }}
                            </span>
                        </td>
                        <td>
                            <div *ngIf="user.companyName" class="link-tag company">
                                <i class="bi bi-building"></i>{{user.companyName}}
                            </div>
                            <div *ngIf="user.providerName" class="link-tag provider">
                                <i class="bi bi-hospital"></i>{{user.providerName}}
                            </div>
                            <div *ngIf="user.roles.includes('SuperAdministrator')" class="link-tag admin">
                                <i class="bi bi-shield-check"></i>System Admin
                            </div>
                        </td>
                        <td class="text-end">
                            <div class="d-flex justify-content-end gap-1" *ngIf="authService.hasPermission('User.Manage')">
                                <button class="btn btn-action" (click)="editUser(user)" title="Manage Identity">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-action" (click)="openResetPassword(user)" title="Reset Credentials">
                                    <i class="bi bi-key"></i>
                                </button>
                                <button class="btn btn-action text-danger" (click)="deleteUser(user)" title="Terminate Account">
                                    <i class="bi bi-person-x"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Empty State -->
            <div *ngIf="!loading && users().length === 0" class="text-center py-5">
                <i class="bi bi-person-badge-fill display-1 text-muted opacity-10 mb-3"></i>
                <h6 class="fw-bold">No provisioned users found</h6>
                <p class="small text-secondary mb-4">Start managing system access by provisioning your first administrative or operational user.</p>
                <button class="btn btn-primary btn-sm px-4" (click)="openCreateModal()">Provision Account</button>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                <div class="mt-2 text-muted small">Synchronizing directory data...</div>
            </div>
        </div>
    </div>

    <!-- Provisioning Modal -->
    <div *ngIf="showCreateModal" class="modal-backdrop fade show"></div>
    <div *ngIf="showCreateModal" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content dialog-premium">
                <div class="modal-header">
                    <div>
                        <h5 class="mb-0 fw-bold"><i class="bi bi-person-plus me-2"></i>Account Provisioning</h5>
                        <div class="small opacity-75">Define credentials and access policy.</div>
                    </div>
                    <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
                </div>
                <div class="modal-body">
                    <form [formGroup]="userForm" (ngSubmit)="onCreateUser()">
                        <div class="mb-4">
                            <label class="form-label small fw-bold text-secondary">Network Identity (Email)</label>
                            <input type="email" class="form-control" formControlName="email" placeholder="e.g. administrator@domain.com">
                        </div>
                        
                        <div class="row g-3 mb-4" *ngIf="!isEditMode">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Initial PIN</label>
                                <input type="password" class="form-control" formControlName="password">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Confirm PIN</label>
                                <input type="password" class="form-control" formControlName="confirmPassword">
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label small fw-bold text-secondary">Archetype Allocation</label>
                            <div class="list-group border-0">
                                <label *ngFor="let role of roles().slice(0, 5)" class="list-group-item d-flex align-items-center gap-3 border rounded mb-2 py-3 cursor-pointer" 
                                       [class.bg-light]="userForm.get('role')?.value === role.name">
                                    <input class="form-check-input mt-0" type="radio" formControlName="role" [value]="role.name">
                                    <div class="fw-semibold small">{{role.name}}</div>
                                </label>
                            </div>
                        </div>

                        <!-- Entity Mapping -->
                        <div class="animate-fade-in mb-4" *ngIf="userForm.get('role')?.value === 'Company'">
                            <label class="form-label small fw-bold text-secondary">Company Affiliation</label>
                            <select class="form-select" formControlName="companyId">
                                <option [value]="null">Select Organization...</option>
                                <option *ngFor="let c of companies()" [value]="c.id">{{c.legalName}}</option>
                            </select>
                        </div>

                        <div class="animate-fade-in mb-4" *ngIf="userForm.get('role')?.value === 'HealthCareProvider'">
                            <label class="form-label small fw-bold text-secondary">Provider Affiliation</label>
                            <select class="form-select" formControlName="providerId">
                                <option [value]="null">Select Provider...</option>
                                <option *ngFor="let p of providers()" [value]="p.id">{{p.legalName}}</option>
                            </select>
                        </div>

                        <div class="d-flex justify-content-end gap-3 pt-3 border-top mt-4">
                            <button type="button" class="btn btn-light border px-4" (click)="closeModal()">Discard</button>
                            <button type="submit" class="btn btn-primary px-5 shadow-sm" [disabled]="loading || (userForm.invalid && !isEditMode)">
                                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                                {{ isEditMode ? 'Authorize Changes' : 'Initialize Provisioning' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Password Reset Modal -->
    <div *ngIf="showResetModal" class="modal-backdrop fade show"></div>
    <div *ngIf="showResetModal" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div class="modal-header bg-warning text-white p-4 border-0">
                    <h6 class="modal-title fw-bold mb-0">Reset Credentials</h6>
                    <button type="button" class="btn-close btn-close-white" (click)="showResetModal = false"></button>
                </div>
                <div class="modal-body p-4 bg-white">
                    <p class="text-muted small mb-3">Provision a temporary password for <strong>{{selectedUser?.username}}</strong>.</p>
                    <input type="password" class="form-control mb-3" [(ngModel)]="tempPassword" placeholder="New Password">
                    <button class="btn btn-warning w-100 fw-bold" (click)="executePasswordReset()" [disabled]="!tempPassword || loading">
                        <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                        Authorize Reset
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
    styleUrls: ['./user-manager.component.scss']
})
export class UserManagerComponent implements OnInit {
    private securityService = inject(SecurityService);
    private companyService = inject(CompanyService);
    private providerService = inject(ProviderService);
    public authService = inject(AuthService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);

    users = signal<UserManagement[]>([]);
    roles = signal<Role[]>([]);
    companies = signal<any[]>([]);
    providers = signal<any[]>([]);

    showCreateModal = false;
    showResetModal = false;
    isEditMode = false;
    loading = false;
    userForm: FormGroup;
    selectedUser: UserManagement | null = null;
    tempPassword = '';

    constructor() {
        this.userForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]],
            role: ['', [Validators.required]],
            companyId: [null],
            providerId: [null]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.securityService.getUsers().subscribe({
            next: (res: any) => {
                const list = Array.isArray(res) ? res : res?.data;
                if (Array.isArray(list)) this.users.set(list);
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => this.loading = false
        });

        this.securityService.getRoles().subscribe({
            next: (res: any) => {
                const list = Array.isArray(res) ? res : res?.data;
                if (Array.isArray(list)) this.roles.set(list);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load roles', err);
                this.cdr.detectChanges();
            }
        });

        this.companyService.getCompanies().subscribe({
            next: (res: any) => {
                const list = Array.isArray(res) ? res : res?.data;
                if (Array.isArray(list)) this.companies.set(list);
                this.cdr.detectChanges();
            }
        });

        this.providerService.getProviders().subscribe({
            next: (res: any) => {
                const list = Array.isArray(res) ? res : res?.data;
                if (Array.isArray(list)) this.providers.set(list);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load providers', err);
                this.cdr.detectChanges();
            }
        });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    openCreateModal() {
        this.isEditMode = false;
        this.showCreateModal = true;
        this.userForm.reset({ role: '', companyId: null, providerId: null });
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
        this.userForm.updateValueAndValidity();
    }

    editUser(user: UserManagement) {
        this.isEditMode = true;
        this.selectedUser = user;
        this.showCreateModal = true;
        this.userForm.patchValue({
            email: user.email,
            role: user.roles[0] || '',
            companyId: user.companyId,
            providerId: user.providerId
        });
        // Remove password validation for edit
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('confirmPassword')?.clearValidators();
        this.userForm.updateValueAndValidity();
    }

    closeModal() {
        this.showCreateModal = false;
        this.selectedUser = null;
    }

    onCreateUser() {
        if (this.userForm.invalid && !this.isEditMode) return;

        const user = this.selectedUser;
        this.loading = true;
        const action$ = this.isEditMode && user
            ? this.securityService.assignRole(user.id, this.userForm.value.role)
            : this.securityService.createUser(this.userForm.value);

        action$.subscribe({
            next: () => {
                this.loading = false;
                this.closeModal();
                this.loadData();
            },
            error: (err: any) => {
                console.error('Action failed', err);
                this.loading = false;
                alert('Action failed. Ensure unique email and valid data.');
            }
        });
    }

    openResetPassword(user: UserManagement) {
        this.selectedUser = user;
        this.tempPassword = '';
        this.showResetModal = true;
    }

    executePasswordReset() {
        const user = this.selectedUser;
        if (!user || !this.tempPassword) return;
        this.loading = true;
        this.securityService.resetPassword(user.id, { newPassword: this.tempPassword }).subscribe({
            next: () => {
                this.loading = false;
                this.showResetModal = false;
                alert('Password reset successfully.');
            },
            error: () => {
                this.loading = false;
                alert('Failed to reset password.');
            }
        });
    }

    deleteUser(user: UserManagement) {
        if (confirm(`Are you absolutely sure you want to terminate system access for ${user.username}?`)) {
            this.securityService.deleteUser(user.id).subscribe({
                next: () => this.loadData(),
                error: () => alert('Failed to delete user.')
            });
        }
    }

    changeRole(userId: string, event: any) {
        const newRole = event.target.value;
        this.securityService.assignRole(userId, newRole).subscribe({
            next: () => this.loadData(),
            error: (err: any) => console.error('Role update failed', err)
        });
    }
}
