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
        <div class="main-layout d-flex">
          <app-sidebar></app-sidebar>
          <main class="content-area flex-grow-1 fade-in">
            <router-outlet></router-outlet>
          </main>
        </div>
      </ng-container>

      <ng-template #authTemplate>
        <div class="fade-in">
          <router-outlet></router-outlet>
        </div>
      </ng-template>
    </div>
  `,
    styles: [`
    .app-wrapper {
      position: relative;
      min-height: 100vh;
      overflow-x: hidden;
    }
    .main-layout {
      min-height: calc(100vh - 64px);
    }
    .content-area {
      overflow-y: auto;
      max-height: calc(100vh - 64px);
      background-color: var(--bg-color);
      transition: background-color 0.3s ease;
      position: relative;
    }
    
    /* Simple CSS Animation */
    .fade-in {
      animation: fadeIn 0.4s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AppComponent {
    authService = inject(AuthService);
    themeService = inject(ThemeService);
}
