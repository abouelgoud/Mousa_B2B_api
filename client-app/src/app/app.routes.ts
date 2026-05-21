import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'cases/waiting-queue',
        pathMatch: 'full'
    },
    {
        path: 'cases',
        canActivate: [authGuard],
        children: [
            { path: 'queue', loadComponent: () => import('./features/cases/case-queue/case-queue.component').then(m => m.CaseQueueComponent) },
            { path: 'waiting-queue', loadComponent: () => import('./features/cases/waiting-queue/waiting-queue.component').then(m => m.WaitingQueueComponent) }
        ]
    },
    {
        path: '**',
        redirectTo: 'cases/waiting-queue'
    }
];
