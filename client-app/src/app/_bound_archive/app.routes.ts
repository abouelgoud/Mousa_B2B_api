import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
            }
        ]
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        children: [
            { path: '', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent) },
            { path: 'ai', loadComponent: () => import('./features/dashboard/ai-dashboard/ai-dashboard.component').then(m => m.AiDashboardComponent) }
        ]
    },
    {
        path: 'company',
        canActivate: [authGuard],
        children: [
            { path: 'list', loadComponent: () => import('./features/company/company-list/company-list.component').then(m => m.CompanyListComponent) },
            { path: 'onboarding', loadComponent: () => import('./features/company/onboarding-wizard/onboarding-wizard.component').then(m => m.OnboardingWizardComponent) },
            { path: 'details/:id', loadComponent: () => import('./features/company/company-details/company-details.component').then(m => m.CompanyDetailsComponent) },
            { path: 'edit/:id', loadComponent: () => import('./features/company/company-edit/company-edit.component').then(m => m.CompanyEditComponent) },
            { path: ':companyId/candidates', loadComponent: () => import('./features/company/candidate-list/candidate-list.component').then(m => m.CandidateListComponent) },
            { path: ':companyId/candidates/add', loadComponent: () => import('./features/company/candidate-form/candidate-form.component').then(m => m.CandidateFormComponent) },
            { path: ':companyId/candidates/edit/:candidateId', loadComponent: () => import('./features/company/candidate-form/candidate-form.component').then(m => m.CandidateFormComponent) }
        ]
    },
    {
        path: 'requests',
        canActivate: [authGuard],
        children: [
            { path: 'list', loadComponent: () => import('./features/requests/request-list/request-list.component').then(m => m.RequestListComponent) },
            { path: 'create', loadComponent: () => import('./features/requests/create-request/create-request.component').then(m => m.CreateRequestComponent) },
            { path: 'wizard', loadComponent: () => import('./features/requests/request-wizard/request-wizard.component').then(m => m.RequestWizardComponent) }
        ]
    },
    {
        path: 'provider',
        canActivate: [authGuard],
        children: [
            { path: 'list', loadComponent: () => import('./features/provider/provider-list/provider-list.component').then(m => m.ProviderListComponent) },
            { path: 'onboarding', loadComponent: () => import('./features/provider/provider-onboarding/provider-onboarding.component').then(m => m.ProviderOnboardingComponent) },
            { path: 'details/:id', loadComponent: () => import('./features/provider/provider-details/provider-details.component').then(m => m.ProviderDetailsComponent) },
            { path: 'edit/:id', loadComponent: () => import('./features/provider/provider-edit/provider-edit.component').then(m => m.ProviderEditComponent) }
        ]
    },
    {
        path: 'cases',
        canActivate: [authGuard],
        children: [
            { path: 'queue', loadComponent: () => import('./features/cases/case-queue/case-queue.component').then(m => m.CaseQueueComponent) },
            { path: 'waiting-queue', loadComponent: () => import('./features/cases/waiting-queue/waiting-queue.component').then(m => m.WaitingQueueComponent) },
            { path: 'details/:id', loadComponent: () => import('./features/cases/case-details/case-details.component').then(m => m.CaseDetailsComponent) }
        ]
    },
    {
        path: 'admin',
        canActivate: [authGuard],
        children: [
            { path: 'security/roles', loadComponent: () => import('./features/admin/security/role-manager/role-manager.component').then(m => m.RoleManagerComponent) },
            { path: 'security/users', loadComponent: () => import('./features/admin/security/user-manager/user-manager.component').then(m => m.UserManagerComponent) },
            { path: 'review', loadComponent: () => import('./features/admin/case-review/case-review.component').then(m => m.CaseReviewComponent) }
        ]
    },
    {
        path: 'reports',
        canActivate: [authGuard],
        children: [
            { path: 'financial', loadComponent: () => import('./features/reports/financial-overview/financial-overview.component').then(m => m.FinancialOverviewComponent) }
        ]
    },
    {
        path: 'packages',
        canActivate: [authGuard],
        children: [
            { path: '', loadComponent: () => import('./features/packages/package-list/package-list.component').then(m => m.PackageListComponent) },
            { path: 'add', loadComponent: () => import('./features/packages/package-form/package-form.component').then(m => m.PackageFormComponent) },
            { path: 'edit/:id', loadComponent: () => import('./features/packages/package-form/package-form.component').then(m => m.PackageFormComponent) }
        ]
    },
    {
        path: 'services',
        canActivate: [authGuard],
        children: [
            { path: '', loadComponent: () => import('./features/services/service-list/service-list.component').then(m => m.ServiceListComponent) },
            { path: 'add', loadComponent: () => import('./features/services/service-form/service-form.component').then(m => m.ServiceFormComponent) },
            { path: 'edit/:id', loadComponent: () => import('./features/services/service-form/service-form.component').then(m => m.ServiceFormComponent) }
        ]
    },
    {
        path: 'settings',
        canActivate: [authGuard],
        children: [
            { path: 'profile', loadComponent: () => import('./features/settings/profile/profile.component').then(m => m.ProfileComponent) }
        ]
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: 'dashboard' }
];
