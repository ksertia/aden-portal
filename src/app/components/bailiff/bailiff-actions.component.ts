import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bailiff-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="actions-container">
      <div class="actions-header fade-in-up">
        <h1>Actions Légales</h1>
        <p>Gérez les actions légales et procédures</p>
      </div>

      <div class="actions-content fade-in-up">
        <div class="coming-soon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
          <h3>Module d'actions légales en développement</h3>
          <p>Les outils de gestion des actions légales seront bientôt disponibles.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .actions-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .actions-header {
      margin-bottom: 32px;
    }

    .actions-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .actions-header p {
      font-size: 16px;
      color: var(--text-secondary);
    }

    .coming-soon {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-secondary);
    }

    .coming-soon svg {
      margin-bottom: 24px;
      color: var(--success);
    }

    .coming-soon h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .actions-container {
        padding: 16px;
      }
    }
  `]
})
export class BailiffActionsComponent {}