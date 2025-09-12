import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CaseService } from '../../services/case.service';
import { User, UserRole } from '../../models/user.model';
import { DebtCase } from '../../models/case.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header fade-in-up">
        <h1>Tableau de bord</h1>
        <p *ngIf="currentUser">
          Bienvenue, {{ currentUser.firstName }} {{ currentUser.lastName }}
        </p>
      </div>

      <!-- Statistiques générales -->
      <div class="stats-grid fade-in-up" *ngIf="statistics">
        <div class="stat-card">
          <div class="stat-icon primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalCases }}</div>
            <div class="stat-label">Dossiers totaux</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.activeCases }}</div>
            <div class="stat-label">Dossiers actifs</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.pendingCases }}</div>
            <div class="stat-label">En attente</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatCurrency(statistics.totalAmount) }}</div>
            <div class="stat-label">Montant total</div>
          </div>
        </div>
      </div>

      <!-- Vue spécifique par rôle -->
      <div class="role-content fade-in-up">
        <!-- Vue Débiteur -->
        <div *ngIf="isDebtorUser" class="debtor-dashboard">
          <div class="section-header">
            <h2>Mes Dossiers en Cours</h2>
            <a routerLink="/debtor/cases" class="btn btn-primary">Voir tous les dossiers</a>
          </div>
          
          <div class="cases-grid" *ngIf="userCases.length > 0">
            <div class="case-card" *ngFor="let case of userCases.slice(0, 3)">
              <div class="case-header">
                <h3>{{ case.caseNumber }}</h3>
                <span class="status-badge" [ngClass]="'status-' + case.status">
                  {{ getStatusLabel(case.status) }}
                </span>
              </div>
              <div class="case-details">
                <div class="case-amount">
                  <span class="label">Montant dû :</span>
                  <span class="amount">{{ formatCurrency(case.amount - case.amountPaid) }}</span>
                </div>
                <div class="case-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="(case.amountPaid / case.amount) * 100"></div>
                  </div>
                  <span class="progress-text">{{ ((case.amountPaid / case.amount) * 100).toFixed(0) }}% payé</span>
                </div>
              </div>
            </div>
          </div>

          <div class="quick-actions">
            <h3>Actions Rapides</h3>
            <div class="actions-grid">
              <a routerLink="/debtor/payments" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span>Effectuer un paiement</span>
              </a>
              <a routerLink="/debtor/payment-plan" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
                <span>Proposer échéancier</span>
              </a>
              <a routerLink="/debtor/documents" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <span>Mes documents</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Vue Huissier -->
        <div *ngIf="isBailiffUser" class="bailiff-dashboard">
          <div class="section-header">
            <h2>Dossiers Assignés</h2>
            <a routerLink="/bailiff/cases" class="btn btn-primary">Gérer les dossiers</a>
          </div>

          <div class="cases-grid" *ngIf="userCases.length > 0">
            <div class="case-card" *ngFor="let case of userCases.slice(0, 3)">
              <div class="case-header">
                <h3>{{ case.caseNumber }}</h3>
                <span class="status-badge" [ngClass]="'status-' + case.status">
                  {{ getStatusLabel(case.status) }}
                </span>
              </div>
              <div class="case-details">
                <div class="case-info">
                  <span class="label">Débiteur :</span>
                  <span>{{ case.debtor.firstName }} {{ case.debtor.lastName }}</span>
                </div>
                <div class="case-amount">
                  <span class="label">Montant :</span>
                  <span class="amount">{{ formatCurrency(case.amount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="quick-actions">
            <h3>Actions Rapides</h3>
            <div class="actions-grid">
              <a routerLink="/bailiff/actions" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <span>Nouvelle action légale</span>
              </a>
              <a routerLink="/bailiff/cases" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                <span>Générer un rapport</span>
              </a>
              <a routerLink="/professional/documents" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <span>Gestion documents</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Vue Créancier -->
        <div *ngIf="isCreditorUser" class="creditor-dashboard">
          <div class="section-header">
            <h2>Mes Créances</h2>
            <a routerLink="/creditor/cases" class="btn btn-primary">Voir toutes les créances</a>
          </div>

          <div class="cases-grid" *ngIf="userCases.length > 0">
            <div class="case-card" *ngFor="let case of userCases.slice(0, 3)">
              <div class="case-header">
                <h3>{{ case.caseNumber }}</h3>
                <span class="status-badge" [ngClass]="'status-' + case.status">
                  {{ getStatusLabel(case.status) }}
                </span>
              </div>
              <div class="case-details">
                <div class="case-info">
                  <span class="label">Débiteur :</span>
                  <span>{{ case.debtor.firstName }} {{ case.debtor.lastName }}</span>
                </div>
                <div class="case-amount">
                  <span class="label">Montant :</span>
                  <span class="amount">{{ formatCurrency(case.amount) }}</span>
                </div>
                <div class="case-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="(case.amountPaid / case.amount) * 100"></div>
                  </div>
                  <span class="progress-text">{{ ((case.amountPaid / case.amount) * 100).toFixed(0) }}% recouvré</span>
                </div>
              </div>
            </div>
          </div>

          <div class="quick-actions">
            <h3>Actions Rapides</h3>
            <div class="actions-grid">
              <a routerLink="/creditor/tracking" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span>Suivi temps réel</span>
              </a>
              <a routerLink="/professional/reports" class="action-card highlight">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 2v6l3-3 3 3-3 3v6"/>
                  <path d="M15 8h6"/>
                  <path d="M15 16h6"/>
                </svg>
                <span>Rapports d'activité</span>
              </a>
              <a routerLink="/creditor/notifications" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span>Notifications</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Vue Avocat -->
        <div *ngIf="isLawyerUser" class="lawyer-dashboard">
          <div class="section-header">
            <h2>Dossiers Juridiques</h2>
            <a routerLink="/lawyer/cases" class="btn btn-primary">Voir tous les dossiers</a>
          </div>

          <div class="cases-grid" *ngIf="userCases.length > 0">
            <div class="case-card" *ngFor="let case of userCases.slice(0, 3)">
              <div class="case-header">
                <h3>{{ case.caseNumber }}</h3>
                <span class="status-badge" [ngClass]="'status-' + case.status">
                  {{ getStatusLabel(case.status) }}
                </span>
              </div>
              <div class="case-details">
                <div class="case-info">
                  <span class="label">Créancier :</span>
                  <span>{{ case.creditor.name }}</span>
                </div>
                <div class="case-amount">
                  <span class="label">Montant :</span>
                  <span class="amount">{{ formatCurrency(case.amount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="quick-actions">
            <h3>Actions Rapides</h3>
            <div class="actions-grid">
              <a routerLink="/lawyer/consultations" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Nouvelle consultation</span>
              </a>
              <a routerLink="/lawyer/cases" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="9"/>
                </svg>
                <span>Réviser un dossier</span>
              </a>
              <a routerLink="/professional/reports" class="action-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 2v6l3-3 3 3-3 3v6"/>
                  <path d="M15 8h6"/>
                  <path d="M15 16h6"/>
                </svg>
                <span>Rapports d'activité</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 32px;
    }

    .dashboard-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .dashboard-header p {
      font-size: 18px;
      color: var(--text-secondary);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-icon.primary { background: var(--primary); }
    .stat-icon.success { background: var(--success); }
    .stat-icon.warning { background: var(--warning); }
    .stat-icon.info { background: #3b82f6; }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-header h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text);
    }

    .cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .case-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      transition: all 0.2s ease;
    }

    .case-card:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .case-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .case-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
    }

    .case-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .case-info, .case-amount {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .amount {
      font-weight: 600;
      color: var(--primary);
      font-size: 16px;
    }

    .case-progress {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--success);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .quick-actions h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      text-decoration: none;
      color: var(--text);
      transition: all 0.2s ease;
    }

    .action-card:hover {
      border-color: var(--primary);
      background: #eff6ff;
      transform: translateY(-1px);
    }

    .action-card svg {
      color: var(--primary);
    }

    .action-card span {
      font-weight: 500;
      font-size: 14px;
    }

    .action-card.highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }

    .action-card.highlight:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.2);
    }

    .action-card.highlight svg {
      color: white;
    }

    @media (max-width: 1024px) {
      .dashboard-container {
        padding: 24px;
      }
      
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      
      .cases-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .dashboard-container {
        padding: 16px;
      }
      
      .dashboard-header h1 {
        font-size: 24px;
      }
      
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userCases: DebtCase[] = [];
  statistics: any = null;

  constructor(
    private authService: AuthService,
    private caseService: CaseService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  get isDebtorUser(): boolean {
    return this.authService.hasRole(UserRole.DEBTOR);
  }

  get isBailiffUser(): boolean {
    return this.authService.hasRole(UserRole.BAILIFF);
  }

  get isLawyerUser(): boolean {
    return this.authService.hasRole(UserRole.LAWYER);
  }

  get isCreditorUser(): boolean {
    return this.authService.hasRole(UserRole.CREDITOR);
  }

  loadDashboardData() {
    if (!this.currentUser) return;

    // Charger les dossiers de l'utilisateur
    this.caseService.getCasesByUserId(this.currentUser.id, this.currentUser.role)
      .subscribe(cases => {
        this.userCases = cases;
      });

    // Charger les statistiques
    this.caseService.getStatistics()
      .subscribe(stats => {
        this.statistics = stats;
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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

  getNextDueDate(): string {
    if (this.userCases.length === 0) return 'Aucune';
    
    const activeCases = this.userCases.filter(c => c.status === 'active' || c.status === 'payment_plan');
    if (activeCases.length === 0) return 'Aucune';
    
    const nextDue = activeCases
      .map(c => c.dueDate)
      .filter(date => new Date(date) > new Date())
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
    
    return nextDue ? new Date(nextDue).toLocaleDateString('fr-FR') : 'Aucune';
  }
}