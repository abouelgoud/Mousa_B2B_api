import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="card shadow-lg border-0 rounded-4">
                <div class="card-header bg-primary text-white p-4 rounded-top-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 64px; height: 64px; font-size: 2rem;">
                            {{authService.currentUser()?.username?.[0]?.toUpperCase()}}
                        </div>
                        <div>
                            <h4 class="mb-0 fw-bold">User Profile</h4>
                            <p class="mb-0 opacity-75">Manage your account settings</p>
                        </div>
                    </div>
                </div>
                <div class="card-body p-4">
                    <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                        <div class="mb-3">
                            <label class="form-label fw-bold small text-muted text-uppercase">Username</label>
                            <input type="text" class="form-control bg-light" formControlName="username" readonly>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold small text-muted text-uppercase">Email Address</label>
                            <input type="email" class="form-control bg-light" formControlName="email" readonly>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-bold small text-muted text-uppercase">Phone Number</label>
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0"><i class="bi bi-phone"></i></span>
                                <input type="text" class="form-control border-start-0 ps-0" formControlName="phoneNumber" placeholder="Enter your phone number">
                            </div>
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary py-2 rounded-3 fw-bold shadow-sm" [disabled]="loading || profileForm.pristine">
                                <span *ngIf="!loading">Save Changes<i class="bi bi-check2 ms-2"></i></span>
                                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                            </button>
                        </div>
                    </form>

                    <div *ngIf="success" class="alert alert-success mt-3 rounded-3 border-0 shadow-sm d-flex align-items-center">
                        <i class="bi bi-check-circle-fill me-2 fs-5"></i>
                        Profile updated successfully!
                    </div>
                </div>
            </div>

            <div class="card shadow rounded-4 border-0 mt-4 overflow-hidden">
                <div class="list-group list-group-flush">
                    <div class="list-group-item p-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="fw-bold mb-1">Assigned Roles</h6>
                                <div class="d-flex gap-2">
                                    <span class="badge bg-info-subtle text-info px-3 py-2 rounded-pill" *ngFor="let role of authService.currentUser()?.roles">
                                        {{role}}
                                    </span>
                                </div>
                            </div>
                            <i class="bi bi-shield-check text-success fs-3"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
  styles: [`
        .form-control:focus {
            border-color: var(--bs-primary);
            box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.1);
        }
        .btn-primary { transition: all 0.3s ease; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(var(--bs-primary-rgb), 0.3); }
    `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  authService = inject(AuthService);

  profileForm: FormGroup;
  loading = false;
  success = false;
  apiUrl = 'http://localhost:5284/api/profile';

  constructor() {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      phoneNumber: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.http.get<any>(this.apiUrl).subscribe(profile => {
      this.profileForm.patchValue(profile);
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.http.put(this.apiUrl, this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.success = false, 3000);
        this.profileForm.markAsPristine();
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        this.loading = false;
      }
    });
  }
}
