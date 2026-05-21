import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule],
    template: `
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-primary text-white p-4 text-center border-0">
                    <div class="avatar-large bg-white text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                        style="width: 80px; height: 80px; font-size: 32px; font-weight: bold;">
                        {{ getInitials() }}
                    </div>
                    <h3 class="fw-light mb-0">{{ user()?.username }}</h3>
                    <div class="opacity-75">{{ user()?.email }}</div>
                </div>
                <div class="card-body p-4">
                    <h5 class="text-muted text-uppercase small fw-bold mb-3">Account Details</h5>
                    
                    <div class="mb-3 border-bottom pb-2">
                        <label class="text-secondary small">User ID</label>
                        <div class="fw-medium">{{ user()?.id }}</div>
                    </div>

                    <div class="mb-3 border-bottom pb-2">
                        <label class="text-secondary small">Roles</label>
                        <div>
                            <span *ngFor="let role of user()?.roles" class="badge bg-secondary me-1">
                                {{ role }}
                            </span>
                            <span *ngIf="!user()?.roles?.length" class="text-muted small">No roles assigned</span>
                        </div>
                    </div>

                    <div class="mb-3 border-bottom pb-2">
                        <label class="text-secondary small">Permissions</label>
                        <div class="d-flex flex-wrap gap-1">
                            <span *ngFor="let perm of user()?.permissions" class="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                                {{ perm }}
                            </span>
                            <span *ngIf="!user()?.permissions?.length" class="text-muted small">No specific permissions</span>
                        </div>
                    </div>
                    
                    <div class="d-grid mt-4">
                        <button class="btn btn-outline-danger" (click)="logout()">
                            <i class="bi bi-box-arrow-right me-2"></i> Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `
})
export class UserProfileComponent {
    authService = inject(AuthService);
    user = this.authService.currentUser;

    getInitials(): string {
        const username = this.user()?.username || 'Guest';
        return username.substring(0, 2).toUpperCase();
    }

    logout() {
        this.authService.logout();
    }
}
