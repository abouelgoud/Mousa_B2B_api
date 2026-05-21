import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss'
})
export class SidebarComponent {
    private authService = inject(AuthService);

    navItems = [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard', permission: 'Dashboard.View' },
        { label: 'AI Dash', icon: 'bi-magic', route: '/dashboard/ai', permission: 'AIDashboard.View' },
        { label: 'New Screening', icon: 'bi-plus-circle', route: '/requests/wizard', permission: 'Requests.Create' },
        { label: 'Companies', icon: 'bi-building', route: '/company/list', permission: 'Companies.View' },
        { label: 'Providers', icon: 'bi-hospital', route: '/provider/list', permission: 'Providers.View' },
        { label: 'Packages', icon: 'bi-box-seam', route: '/packages', permission: 'Packages.Manage' },
        { label: 'Medical Services', icon: 'bi-activity', route: '/services', permission: 'Services.Manage' },
        { label: 'Screening Queue', icon: 'bi-file-earmark-medical', route: '/cases/queue', permission: 'Cases.Queue' },
        { label: 'Waiting Queue', icon: 'bi-people', route: '/cases/waiting-queue', permission: 'Requests.Manage' },
        { label: 'Financials', icon: 'bi-cash-stack', route: '/reports/financial', permission: 'Reports.Financial' },
        { label: 'Admin Review', icon: 'bi-check-all', route: '/admin/review', permission: 'Admin.Review' },
        { label: 'Security Roles', icon: 'bi-shield-shaded', route: '/admin/security/roles', permission: 'User.Manage' },
        { label: 'Security Users', icon: 'bi-people-fill', route: '/admin/security/users', permission: 'User.Manage' },
    ];

    accountItems = [
        { label: 'My Profile', icon: 'bi-person-circle', route: '/settings/profile' },
        { label: 'Logout', icon: 'bi-box-arrow-right', action: () => this.logout() }
    ];

    filteredNavItems = computed(() => {
        return this.navItems.filter(item => !item.permission || this.authService.hasPermission(item.permission));
    });

    constructor() {
        // Dynamic addition for Candidates if company user
        const user = this.authService.currentUser();
        if (user?.companyId) {
            this.navItems.splice(3, 0, {
                label: 'Candidates',
                icon: 'bi-people',
                route: `/company/${user.companyId}/candidates`,
                permission: 'Candidates.Manage'
            });
        }
    }

    logout() {
        this.authService.logout();
    }
}
