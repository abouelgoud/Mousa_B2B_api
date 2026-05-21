import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'cases',
                redirectTo: 'cases/worklist',
                pathMatch: 'full'
            },
            {
                path: 'cases/:filter',
                loadComponent: () => import('./features/cases/case-mailbox/case-mailbox.component').then(m => m.CaseMailboxComponent)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
                data: { name: 'Dashboard' }
            },
            {
                path: 'people',
                children: [
                    { path: '', loadComponent: () => import('./features/people/people.component').then(m => m.PeopleComponent) },
                    { path: 'onboarding', loadComponent: () => import('./features/people/provider-onboarding.component').then(m => m.ProviderOnboardingComponent) },
                    { path: 'details/:id', loadComponent: () => import('./features/people/provider-details.component').then(m => m.ProviderDetailsComponent) },
                    { path: 'edit/:id', loadComponent: () => import('./features/people/provider-onboarding.component').then(m => m.ProviderOnboardingComponent) },
                ],
                data: { name: 'CRM / People' }
            },
            {
                path: 'companies',
                children: [
                    { path: '', loadComponent: () => import('./features/companies/company-list.component').then(m => m.CompanyListComponent) },
                    { path: 'onboarding', loadComponent: () => import('./features/companies/company-onboarding.component').then(m => m.CompanyOnboardingComponent) },
                    { path: 'details/:id', loadComponent: () => import('./features/companies/company-details.component').then(m => m.CompanyDetailsComponent) },
                    { path: 'edit/:id', loadComponent: () => import('./features/companies/company-onboarding.component').then(m => m.CompanyOnboardingComponent) },
                ],
                data: { name: 'Clients / Companies' }
            },
            {
                path: 'reports',
                loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
                data: { name: 'Reports' }
            },
            {
                path: 'admin',
                loadComponent: () => import('./features/placeholder/feature-placeholder.component').then(m => m.FeaturePlaceholderComponent),
                data: { name: 'Admin Area' }
            },
            {
                path: 'requests/wizard',
                loadComponent: () => import('./features/requests/request-wizard/request-wizard.component').then(m => m.RequestWizardComponent),
                data: { name: 'New Screening Wizard' }
            },
            {
                path: 'packages',
                loadComponent: () => import('./features/packages/package-list.component').then(m => m.PackageListComponent),
                data: { name: 'Packages' }
            },
            {
                path: 'packages/add',
                loadComponent: () => import('./features/packages/package-form.component').then(m => m.PackageFormComponent),
                data: { name: 'Create Package' }
            },
            {
                path: 'packages/edit/:id',
                loadComponent: () => import('./features/packages/package-form.component').then(m => m.PackageFormComponent),
                data: { name: 'Edit Package' }
            },

            // Services ROUTES
            {
                path: 'services',
                loadComponent: () => import('./features/services/service-list.component').then(m => m.ServiceListComponent),
                data: { name: 'Medical Services' }
            },
            {
                path: 'services/add',
                loadComponent: () => import('./features/services/service-form.component').then(m => m.ServiceFormComponent),
                data: { name: 'New Service' }
            },
            {
                path: 'services/edit/:id',
                loadComponent: () => import('./features/services/service-form.component').then(m => m.ServiceFormComponent),
                data: { name: 'Edit Service' }
            },

            // Candidates ROUTES
            {
                path: 'candidates',
                loadComponent: () => import('./features/candidates/candidate-list.component').then(m => m.CandidateListComponent),
                data: { name: 'Candidates' }
            },
            {
                path: 'candidates/add',
                loadComponent: () => import('./features/candidates/candidate-form.component').then(m => m.CandidateFormComponent),
                data: { name: 'New Candidate' }
            },
            {
                path: 'candidates/edit/:id',
                loadComponent: () => import('./features/candidates/candidate-form.component').then(m => m.CandidateFormComponent),
                data: { name: 'Edit Candidate' }
            },

            // Admin ROUTES
            {
                path: 'admin/security/roles',
                loadComponent: () => import('./features/admin/role-manager/role-manager.component').then(m => m.RoleManagerComponent),
                data: { name: 'Role Management' }
            },
            {
                path: 'admin/security/users',
                loadComponent: () => import('./features/admin/user-manager/user-manager.component').then(m => m.UserManagerComponent),
                data: { name: 'User Management' }
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/user-profile/user-profile.component').then(m => m.UserProfileComponent),
                data: { name: 'My Profile' }
            },
        ]
    }
];
