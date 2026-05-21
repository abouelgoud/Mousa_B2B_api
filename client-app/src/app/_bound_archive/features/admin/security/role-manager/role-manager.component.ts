import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityService, Role, Permission } from '../../../../core/services/security.service';

@Component({
  selector: 'app-role-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">Role & Permission Matrix</h2>
            <p class="text-muted">Manage system-wide permissions and functional access control.</p>
        </div>
        <button class="btn btn-primary" (click)="savePermissions()" [disabled]="!selectedRole || saving">
            <span *ngIf="!saving">Save Assignments<i class="bi bi-shield-check ms-2"></i></span>
            <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
        </button>
    </div>

    <div class="row g-4">
        <!-- Roles List -->
        <div class="col-md-3">
            <div class="card shadow-sm border-0 rounded-4">
                <div class="card-header bg-dark text-white p-3 rounded-top-4">
                    <h6 class="mb-0 fw-bold">System Roles</h6>
                </div>
                <div class="list-group list-group-flush">
                    <button *ngFor="let role of roles" 
                            class="list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-center"
                            [class.active]="selectedRole?.id === role.id"
                            (click)="selectRole(role)">
                        <span>{{role.name}}</span>
                        <i class="bi bi-chevron-right" *ngIf="selectedRole?.id === role.id"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Permissions Matrix -->
        <div class="col-md-9">
            <div class="card shadow rounded-4 border-0">
                <div class="card-body p-0">
                    <div *ngIf="!selectedRole" class="p-5 text-center text-muted">
                        <i class="bi bi-shield-lock display-1 mb-3 d-block opacity-25"></i>
                        <h5>Select a role to manage its permissions.</h5>
                    </div>

                    <div *ngIf="selectedRole" class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="ps-4" style="width: 50px;">Enable</th>
                                    <th>Feature / Permission</th>
                                    <th>Description</th>
                                    <th>Group</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let perm of permissions">
                                    <td class="text-center">
                                        <div class="form-check form-switch d-inline-block">
                                            <input class="form-check-input" type="checkbox" 
                                                   [checked]="hasPermission(perm.name)"
                                                   (change)="togglePermission(perm.id)">
                                        </div>
                                    </td>
                                    <td>
                                        <div class="fw-bold">{{perm.name}}</div>
                                    </td>
                                    <td class="small text-muted">{{perm.description}}</td>
                                    <td>
                                        <span class="badge bg-secondary-subtle text-secondary rounded-pill px-3">{{perm.featureGroup}}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
  styles: [`
        .list-group-item.active {
            background-color: var(--bs-primary);
            border-color: var(--bs-primary);
        }
    `]
})
export class RoleManagerComponent implements OnInit {
  private securityService = inject(SecurityService);

  roles: Role[] = [];
  permissions: Permission[] = [];
  selectedRole: Role | null = null;
  selectedPermissionIds: string[] = [];
  saving = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.securityService.getRoles().subscribe(r => this.roles = r);
    this.securityService.getPermissions().subscribe(p => this.permissions = p);
  }

  selectRole(role: Role) {
    this.selectedRole = role;
    // In our backend, role.permissions might be name strings. 
    // We'll map them back to IDs from our local permissions list for toggling.
    this.selectedPermissionIds = this.permissions
      .filter(p => role.permissions.includes(p.name))
      .map(p => p.id);
  }

  hasPermission(name: string): boolean {
    // Find permission ID by name and check if it's in selectedPermissionIds
    const perm = this.permissions.find(p => p.name === name);
    return perm ? this.selectedPermissionIds.includes(perm.id) : false;
  }

  togglePermission(id: string) {
    const index = this.selectedPermissionIds.indexOf(id);
    if (index > -1) {
      this.selectedPermissionIds.splice(index, 1);
    } else {
      this.selectedPermissionIds.push(id);
    }
  }

  savePermissions() {
    if (!this.selectedRole) return;
    this.saving = true;
    this.securityService.assignPermissions(this.selectedRole.id, this.selectedPermissionIds).subscribe({
      next: () => {
        this.saving = false;
        // Refresh data
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to save permissions', err);
        this.saving = false;
      }
    });
  }
}
