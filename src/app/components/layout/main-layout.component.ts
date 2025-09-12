import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="layout-container">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      min-height: 100vh;
      background: var(--background);
    }

    .main-content {
      flex: 1;
      margin-left: 280px;
      min-height: 100vh;
      background: var(--background);
    }

    .content-wrapper {
      min-height: 100vh;
    }

    @media (max-width: 1024px) {
      .main-content {
        margin-left: 260px;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class MainLayoutComponent {}