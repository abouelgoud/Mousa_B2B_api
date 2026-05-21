import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './core/components/header/header';
import { SidebarComponent } from './core/components/sidebar/sidebar';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div [class]="'app-wrapper theme-' + themeService.currentTheme().id">
      <ng-container *ngIf="authService.isAuthenticated(); else authTemplate">
        <app-header></app-header>
        <div class="main-layout">
          <app-sidebar class="d-none d-lg-block"></app-sidebar>
          <main class="content-area flex-grow-1">
            <div class="p-4 fade-in">
              <router-outlet></router-outlet>
            </div>
          </main>
        </div>
      </ng-container>

      <ng-template #authTemplate>
        <div class="auth-layout fade-in">
          <router-outlet></router-outlet>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .app-wrapper {
      position: relative;
      min-height: 100vh;
      background-color: var(--app-bg);
      transition: background-color var(--transition-base);
      display: flex;
      flex-direction: column;
    }
    .main-layout {
      display: flex;
      flex: 1;
      height: calc(100vh - 64px);
      overflow: hidden;
    }
    .content-area {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background-color: var(--app-bg);
      transition: background-color var(--transition-base);
    }
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--app-bg);
    }
    
    .fade-in {
      animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AppComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
}
