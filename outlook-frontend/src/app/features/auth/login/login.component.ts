import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    authService = inject(AuthService);
    email = '';
    password = '';
    loading = false;
    showPassword = false;

    login() {
        if (this.email && this.password) {
            this.loading = true;
            this.authService.login(this.email, this.password).subscribe((success: boolean) => {
                this.loading = false;
            });
        }
    }
}
