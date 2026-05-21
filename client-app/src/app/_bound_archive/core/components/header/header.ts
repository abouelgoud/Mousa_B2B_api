import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { GlobalSearchComponent } from '../global-search/global-search.component';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, NotificationBellComponent, GlobalSearchComponent],
    templateUrl: './header.html',
    styleUrl: './header.scss'
})
export class HeaderComponent {
    constructor(
        public themeService: ThemeService,
        public authService: AuthService
    ) { }

    onThemeChange(themeId: string) {
        this.themeService.setTheme(themeId);
    }

    logout() {
        this.authService.logout();
    }
}
