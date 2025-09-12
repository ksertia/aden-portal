import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content fade-in-up">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        
        <h1>Accès non autorisé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        
        <div class="actions">
          <a routerLink="/dashboard" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Retour au tableau de bord
          </a>
          <button (click)="logout()" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background);
      padding: 32px;
    }

    .unauthorized-content {
      text-align: center;
      max-width: 500px;
      background: var(--surface);
      padding: 48px 32px;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .error-icon {
      margin-bottom: 24px;
      color: var(--error);
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 32px;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 640px) {
      .unauthorized-container {
        padding: 16px;
      }
      
      .unauthorized-content {
        padding: 32px 24px;
      }
      
      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}