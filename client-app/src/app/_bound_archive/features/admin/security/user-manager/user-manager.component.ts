import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecurityService, UserManagement, Role } from '../../../../core/services/security.service';
import { CompanyService, Company } from '../../../../core/services/company.service';
import { ProviderService, Provider } from '../../../../core/services/provider.service';

@Component({
    selector: 'app-user-manager',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    template: `
<div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">User & Access Management</h2>
            <p class="text-muted">Manage system users, role assignments, and entity connections.</p>
        </div>
        <button class="btn btn-primary shadow-sm rounded-pill px-4" (click)="showCreateModal = true">
            <i class="bi bi-person-plus-fill me-2"></i>Create New User
        </button>
    </div>

    <!-- User Creation Modal -->
    <div *ngIf="showCreateModal" class="modal-backdrop fade show"></div>
    <div *ngIf="showCreateModal" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-primary text-white p-4 rounded-top-4">
                    <h5 class="modal-title fw-bold">Create System User</h5>
                    <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
                </div>
                <div class="modal-body p-4">
                    <form [formGroup]="userForm" (ngSubmit)="onCreateUser()">
                        <div class="mb-3">
                            <label class="form-label fw-bold small text-muted text-uppercase">Email Address</label>
                            <input type="email" class="form-control rounded-3" formControlName="email" placeholder="user@example.com">
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col">
                                <label class="form-label fw-bold small text-muted text-uppercase">Password</label>
                                <input type="password" class="form-control rounded-3" formControlName="password" placeholder="********">
                            </div>
                            <div class="col">
                                <label class="form-label fw-bold small text-muted text-uppercase">Confirm</label>
                                <input type="password" class="form-control rounded-3" formControlName="confirmPassword" placeholder="********">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold small text-muted text-uppercase">System Role</label>
                            <select class="form-select rounded-3" formControlName="role">
                                <option value="">Select Role...</option>
                                <option *ngFor="let role of roles" [value]="role.name">{{role.name}}</option>
                            </select>
                        </div>

                        <!-- Entity Mapping -->
                        <div class="mb-4" *ngIf="userForm.get('role')?.value === 'Company'">
                            <label class="form-label fw-bold small text-muted text-uppercase">Mapping Company</label>
                            <select class="form-select rounded-3 border-primary" formControlName="companyId">
                                <option [value]="null">Select Company...</option>
                                <option *ngFor="let c of companies" [value]="c.id">{{c.legalName}}</option>
                            </select>
                        </div>

                        <div class="mb-4" *ngIf="userForm.get('role')?.value === 'HealthCareProvider'">
                            <label class="form-label fw-bold small text-muted text-uppercase">Mapping Provider</label>
                            <select class="form-select rounded-3 border-success" formControlName="providerId">
                                <option [value]="null">Select Provider...</option>
                                <option *ngFor="let p of providers" [value]="p.id">{{p.legalName}}</option>
                            </select>
                        </div>

                        <div class="d-grid gap-2 pt-2">
                            <button type="submit" class="btn btn-primary py-2 rounded-3 fw-bold shadow-sm" [disabled]="loading || userForm.invalid">
                                <span *ngIf="!loading">Create User Account<i class="bi bi-shield-check ms-2"></i></span>
                                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                            </button>
                            <button type="button" class="btn btn-light py-2 rounded-3 text-muted" (click)="closeModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="card shadow rounded-4 border-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                    <tr>
                        <th class="ps-4">User</th>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>Associated Entity</th>
                        <th class="text-end pe-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let user of users">
                        <td class="ps-4">
                            <div class="d-flex align-items-center gap-3">
                                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 0.8rem;">
                                    {{user.username[0].toUpperCase()}}
                                </div>
                                <div>
                                    <div class="fw-bold">{{user.username}}</div>
                                    <div class="small text-muted" *ngIf="user.roles.includes('SuperAdministrator')">System Admin</div>
                                </div>
                            </div>
                        </td>
                        <td>{{user.email}}</td>
                        <td>
                            <select class="form-select form-select-sm w-auto rounded-pill px-3 shadow-none border-0 bg-light" 
                                    (change)="changeRole(user.id, $event)">
                                <option *ngFor="let role of roles" 
                                        [value]="role.name" 
                                        [selected]="user.roles.includes(role.name)">
                                    {{role.name}}
                                </option>
                            </select>
                        </td>
                        <td>
                            <div *ngIf="user.companyName" class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2">
                                <i class="bi bi-building"></i>
                                <span>{{user.companyName}}</span>
                            </div>
                            <div *ngIf="user.providerName" class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2">
                                <i class="bi bi-hospital"></i>
                                <span>{{user.providerName}}</span>
                            </div>
                            <div *ngIf="!user.companyName && !user.providerName && !user.roles.includes('SuperAdministrator')" class="text-muted small">
                                <i class="bi bi-exclamation-triangle me-1"></i>No entity mapped
                            </div>
                        </td>
                        <td class="text-end pe-4">
                            <button class="btn btn-light btn-sm rounded-circle shadow-none me-2" title="Reset Password">
                                <i class="bi bi-key text-muted"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-none border-0">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
    `,
    styles: [`
    .modal-backdrop { z-index: 1050; background-color: rgba(0,0,0,0.5); backdrop-filter: blur(2px); }
    .modal { z-index: 1051; }
    .form-control:focus, .form-select:focus {
        border-color: var(--bs-primary);
        box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.1);
    }
  `]
})
export class UserManagerComponent implements OnInit {
    private securityService = inject(SecurityService);
    private companyService = inject(CompanyService);
    private providerService = inject(ProviderService);
    private fb = inject(FormBuilder);

    users: UserManagement[] = [];
    roles: Role[] = [];
    companies: Company[] = [];
    providers: Provider[] = [];

    showCreateModal = false;
    loading = false;
    userForm: FormGroup;

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
        this.loadEntities();
    }

    loadData() {
        this.securityService.getUsers().subscribe(u => this.users = u);
        this.securityService.getRoles().subscribe(r => this.roles = r);
    }

    loadEntities() {
        this.companyService.getCompanies().subscribe(c => this.companies = c);
        this.providerService.getProviders().subscribe(p => this.providers = p);
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    closeModal() {
        this.showCreateModal = false;
        this.userForm.reset({ role: '', companyId: null, providerId: null });
    }

    onCreateUser() {
        if (this.userForm.invalid) return;

        this.loading = true;
        this.securityService.createUser(this.userForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.closeModal();
                this.loadData();
            },
            error: (err) => {
                console.error('Failed to create user', err);
                this.loading = false;
                alert('Failed to create user. Ensure email is unique and password meets requirements.');
            }
        });
    }

    changeRole(userId: string, event: any) {
        const newRole = event.target.value;
        this.securityService.assignRole(userId, newRole).subscribe({
            next: () => {
                this.loadData();
            },
            error: (err) => {
                console.error('Failed to update user role', err);
            }
        });
    }
}
