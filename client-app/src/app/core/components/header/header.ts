import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './header.html',
    styles: []
})
export class HeaderComponent {
    authService = inject(AuthService);
    themeService = inject(ThemeService);

    onThemeChange(themeId: string) {
        // theme toggle logic stub
    }

    logout() {
        this.authService.logout();
    }
}
