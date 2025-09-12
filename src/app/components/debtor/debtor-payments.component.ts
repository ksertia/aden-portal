import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debtor-payments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payments-container">
      <div class="payments-header fade-in-up">
        <h1>Historique des Paiements</h1>
        <p>Consultez l'historique de vos paiements et échéanciers</p>
      </div>

      <div class="payments-content fade-in-up">
        <div class="coming-soon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <h3>Fonctionnalité en cours de développement</h3>
          <p>La gestion des paiements et échéanciers sera bientôt disponible.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payments-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .payments-header {
      margin-bottom: 32px;
    }

    .payments-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .payments-header p {
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
      color: var(--primary);
    }

    .coming-soon h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .payments-container {
        padding: 16px;
      }
    }
  `]
})
export class DebtorPaymentsComponent {}