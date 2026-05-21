import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
    authService = inject(AuthService);

    navItems = [
        // Group 1: General
        { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/dashboard', permission: 'Dashboard.View' },
        { label: 'Reports', icon: 'bi-bar-chart-line', route: '/reports', permission: 'Reports.Financial' },
        { divider: true },

        // Group 2: Operations
        { label: 'Worklist', icon: 'bi-inbox', route: '/cases/worklist', permission: 'Cases.Queue' },
        { label: 'Waiting Queue', icon: 'bi-hourglass-split', route: '/cases/waiting-queue', permission: 'Requests.Manage' },
        { label: 'New Screening', icon: 'bi-plus-circle', route: '/requests/wizard', permission: 'Requests.Create' },
        { divider: true },

        // Group 3: Directory
        { label: 'Candidates', icon: 'bi-person-badge', route: '/candidates', permission: 'Candidates.Manage' },
        { label: 'CRM / People', icon: 'bi-people', route: '/people', permission: 'Providers.View' },
        { label: 'Companies', icon: 'bi-building', route: '/companies', permission: 'Companies.View' },
        { divider: true },

        // Group 4: Management
        { label: 'Catalog', icon: 'bi-journal-medical', route: '/packages', permission: 'Packages.Manage' },
        { label: 'Services', icon: 'bi-briefcase', route: '/services', permission: 'Services.Manage' },
        { divider: true },

        // Group 5: Security
        { label: 'Users', icon: 'bi-person-gear', route: '/admin/security/users', permission: 'Admin.Security' },
        { label: 'Roles', icon: 'bi-shield-lock', route: '/admin/security/roles', permission: 'Admin.Security' }
    ];

    filteredNavItems = computed(() => {
        return this.navItems.filter(item => !item.permission || this.authService.hasPermission(item.permission));
    });

    getInitials(): string {
        const user = this.authService.currentUser();
        if (user && user.username) {
            return user.username.substring(0, 2).toUpperCase();
        }
        return 'GU';
    }

    logout(event: Event) {
        event.preventDefault();
        this.authService.logout();
    }
}
