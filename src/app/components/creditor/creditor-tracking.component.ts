import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../services/case.service';
import { AuthService } from '../../services/auth.service';
import { DebtCase, CaseStatus } from '../../models/case.model';

@Component({
  selector: 'app-creditor-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tracking-container">
      <div class="tracking-header fade-in-up">
        <h1>Suivi Temps Réel</h1>
        <p>Suivez l'état d'avancement de vos dossiers en temps réel</p>
      </div>

      <div class="tracking-content fade-in-up">
        <!-- Tableau de bord en temps réel -->
        <div class="realtime-dashboard">
          <div class="dashboard-grid">
            <div class="dashboard-card">
              <div class="card-header">
                <h3>Activité récente</h3>
                <div class="live-indicator">
                  <div class="pulse"></div>
                  <span>En direct</span>
                </div>
              </div>
              <div class="activity-list">
                <div class="activity-item" *ngFor="let activity of recentActivities">
                  <div class="activity-icon" [ngClass]="getActivityIconClass(activity.type)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 12l2 2 4-4"/>
                      <circle cx="12" cy="12" r="9"/>
                    </svg>
                  </div>
                  <div class="activity-content">
                    <div class="activity-description">{{ activity.description }}</div>
                    <div class="activity-time">{{ getTimeAgo(activity.date) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="card-header">
                <h3>Statuts des dossiers</h3>
              </div>
              <div class="status-chart">
                <div class="status-item" *ngFor="let status of statusDistribution">
                  <div class="status-bar">
                    <div class="status-fill" [style.width.%]="status.percentage" [ngClass]="'status-' + status.key"></div>
                  </div>
                  <div class="status-info">
                    <span class="status-label">{{ status.label }}</span>
                    <span class="status-count">{{ status.count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="card-header">
                <h3>Performances</h3>
              </div>
              <div class="performance-metrics">
                <div class="metric-item">
                  <div class="metric-value">{{ formatCurrency(monthlyRecovered) }}</div>
                  <div class="metric-label">Recouvré ce mois</div>
                  <div class="metric-trend positive">+12%</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ averageRecoveryTime }} jours</div>
                  <div class="metric-label">Délai moyen</div>
                  <div class="metric-trend negative">-3 jours</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des dossiers avec suivi détaillé -->
        <div class="detailed-tracking">
          <div class="tracking-header-section">
            <h2>Suivi détaillé des dossiers</h2>
            <button class="btn btn-secondary" (click)="refreshData()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,4 23,10 17,10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Actualiser
            </button>
          </div>

          <div class="tracking-grid">
            <div class="tracking-card" *ngFor="let case of trackedCases">
              <div class="tracking-card-header">
                <div class="case-info">
                  <h3>{{ case.caseNumber }}</h3>
                  <p>{{ case.debtor.firstName }} {{ case.debtor.lastName }}</p>
                </div>
                <span class="status-badge" [ngClass]="'status-' + case.status">
                  {{ getStatusLabel(case.status) }}
                </span>
              </div>

              <div class="tracking-card-body">
                <div class="progress-section">
                  <div class="progress-info">
                    <span>Progression du recouvrement</span>
                    <span class="progress-percentage">{{ getPaymentPercentage(case) }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="getPaymentPercentage(case)"></div>
                  </div>
                  <div class="amount-info">
                    <span>{{ formatCurrency(case.amountPaid) }} / {{ formatCurrency(case.amount) }}</span>
                  </div>
                </div>

                <div class="timeline-section">
                  <h4>Chronologie</h4>
                  <div class="timeline">
                    <div class="timeline-item" *ngFor="let event of getRecentEvents(case)">
                      <div class="timeline-dot" [ngClass]="getEventClass(event.type)"></div>
                      <div class="timeline-content">
                        <div class="timeline-description">{{ event.description }}</div>
                        <div class="timeline-date">{{ formatDate(event.date) }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="next-actions">
                  <h4>Prochaines actions</h4>
                  <div class="action-list">
                    <div class="action-item" *ngFor="let action of getNextActions(case)">
                      <div class="action-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <span>{{ action }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .tracking-header {
      margin-bottom: 32px;
    }

    .tracking-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .tracking-header p {
      font-size: 16px;
      color: var(--text-secondary);
    }

    .realtime-dashboard {
      margin-bottom: 48px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .dashboard-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--success);
    }

    .pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .activity-icon.payment { background: var(--success); }
    .activity-icon.reminder { background: var(--warning); }
    .activity-icon.legal { background: var(--error); }
    .activity-icon.status { background: var(--primary); }

    .activity-description {
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
    }

    .activity-time {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .status-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-bar {
      flex: 1;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .status-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .status-fill.status-pending { background: #fbbf24; }
    .status-fill.status-active { background: var(--primary); }
    .status-fill.status-completed { background: var(--success); }
    .status-fill.status-legal_action { background: var(--error); }

    .status-info {
      display: flex;
      justify-content: space-between;
      min-width: 120px;
    }

    .status-label {
      font-size: 12px;
      color: var(--text);
    }

    .status-count {
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
    }

    .performance-metrics {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .metric-item {
      text-align: center;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .metric-trend {
      font-size: 12px;
      font-weight: 600;
    }

    .metric-trend.positive { color: var(--success); }
    .metric-trend.negative { color: var(--error); }

    .tracking-header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .tracking-header-section h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text);
    }

    .tracking-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .tracking-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .tracking-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .case-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .case-info p {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .progress-section {
      margin-bottom: 24px;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .progress-percentage {
      font-weight: 600;
      color: var(--primary);
    }

    .progress-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: var(--success);
      transition: width 0.3s ease;
    }

    .amount-info {
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
    }

    .timeline-section, .next-actions {
      margin-bottom: 20px;
    }

    .timeline-section h4, .next-actions h4 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 12px;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .timeline-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .timeline-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .timeline-dot.payment { background: var(--success); }
    .timeline-dot.reminder { background: var(--warning); }
    .timeline-dot.legal { background: var(--error); }
    .timeline-dot.status { background: var(--primary); }

    .timeline-description {
      font-size: 13px;
      color: var(--text);
    }

    .timeline-date {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .action-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text);
    }

    .action-icon {
      color: var(--primary);
    }

    @media (max-width: 768px) {
      .tracking-container {
        padding: 16px;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .tracking-grid {
        grid-template-columns: 1fr;
      }

      .tracking-header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class CreditorTrackingComponent implements OnInit {
  trackedCases: DebtCase[] = [];
  recentActivities: any[] = [];
  statusDistribution: any[] = [];
  monthlyRecovered = 0;
  averageRecoveryTime = 45;

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTrackingData();
    this.loadRecentActivities();
    this.calculateStatusDistribution();
  }

  loadTrackingData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCases().subscribe(cases => {
      this.trackedCases = cases.filter(c => 
        c.creditor.name === currentUser.companyName || 
        c.creditor.contactPerson === `${currentUser.firstName} ${currentUser.lastName}`
      );
      
      this.monthlyRecovered = this.trackedCases.reduce((sum, c) => sum + c.amountPaid, 0);
    });
  }

  loadRecentActivities() {
    // Simulation d'activités récentes
    this.recentActivities = [
      {
        type: 'payment',
        description: 'Paiement reçu de 500€ - Dossier REC2024-001',
        date: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
      },
      {
        type: 'reminder',
        description: 'Relance envoyée - Dossier REC2024-002',
        date: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        type: 'status',
        description: 'Statut modifié vers "Négociation" - Dossier REC2024-003',
        date: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      },
      {
        type: 'legal',
        description: 'Mise en demeure envoyée - Dossier REC2024-004',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      }
    ];
  }

  calculateStatusDistribution() {
    const statusCounts = this.trackedCases.reduce((acc, case_) => {
      acc[case_.status] = (acc[case_.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const total = this.trackedCases.length;
    
    this.statusDistribution = Object.entries(statusCounts).map(([key, count]) => ({
      key,
      label: this.getStatusLabel(key),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  getPaymentPercentage(case_: DebtCase): number {
    return Math.round((case_.amountPaid / case_.amount) * 100);
  }

  getRecentEvents(case_: DebtCase) {
    return case_.history.slice(-3).reverse();
  }

  getNextActions(case_: DebtCase): string[] {
    const actions = [];
    
    switch (case_.status) {
      case CaseStatus.PENDING:
        actions.push('Assignation à un huissier');
        break;
      case CaseStatus.ACTIVE:
        actions.push('Prochaine relance prévue');
        actions.push('Suivi téléphonique');
        break;
      case CaseStatus.NEGOTIATION:
        actions.push('Validation de l\'accord');
        break;
      case CaseStatus.LEGAL_ACTION:
        actions.push('Suivi procédure judiciaire');
        break;
    }
    
    return actions;
  }

  getActivityIconClass(type: string): string {
    return type;
  }

  getEventClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'payment_received': 'payment',
      'reminder_sent': 'reminder',
      'status_changed': 'status',
      'formal_notice_sent': 'legal'
    };
    return typeMap[type] || 'status';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else {
      return this.formatDate(date);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'active': 'Actif',
      'negotiation': 'Négociation',
      'legal_action': 'Action légale',
      'payment_plan': 'Plan de paiement',
      'completed': 'Terminé',
      'closed': 'Fermé'
    };
    return labels[status] || status;
  }

  refreshData() {
    this.loadTrackingData();
    this.loadRecentActivities();
    this.calculateStatusDistribution();
  }
}