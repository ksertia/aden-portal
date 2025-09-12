import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lawyer-consultations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="consultations-container">
      <div class="consultations-header fade-in-up">
        <h1>Consultations</h1>
        <p>Gérez vos consultations juridiques</p>
      </div>

      <div class="consultations-content fade-in-up">
        <div class="coming-soon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>Module de consultations en développement</h3>
          <p>Les outils de gestion des consultations seront bientôt disponibles.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .consultations-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .consultations-header {
      margin-bottom: 32px;
    }

    .consultations-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .consultations-header p {
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
      color: #3b82f6;
    }

    .coming-soon h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .consultations-container {
        padding: 16px;
      }
    }
  `]
})
export class LawyerConsultationsComponent {}