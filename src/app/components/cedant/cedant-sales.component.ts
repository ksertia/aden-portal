import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CedantService } from '../../services/cedant.service';
import { AuthService } from '../../services/auth.service';
import { CedantPortfolio, PortfolioStatus } from '../../models/case.model';

@Component({
  selector: 'app-cedant-sales',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sales-container">
      <div class="sales-header fade-in-up">
        <h1>Processus de Vente</h1>
        <p>Suivez le processus de vente de vos portefeuilles de créances</p>
      </div>

      <div class="sales-content fade-in-up">
        <!-- Vue d'ensemble du processus -->
        <div class="process-overview">
          <div class="process-card">
            <h3>Processus de vente de créances</h3>
            <div class="process-steps">
              <div class="process-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Préparation du portefeuille</h4>
                  <p>Rassemblez vos créances et documents justificatifs</p>
                </div>
              </div>
              
              <div class="step-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </div>
              
              <div class="process-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Soumission pour évaluation</h4>
                  <p>Envoyez votre portefeuille pour analyse par nos experts</p>
                </div>
              </div>
              
              <div class="step-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </div>
              
              <div class="process-step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Évaluation et négociation</h4>
                  <p>Nos experts évaluent votre portefeuille et proposent un prix</p>
                </div>
              </div>
              
              <div class="step-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </div>
              
              <div class="process-step">
                <div class="step-number">4</div>
                <div class="step-content">
                  <h4>Finalisation de la vente</h4>
                  <p>Signature des contrats et transfert des créances</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Portefeuilles en cours de vente -->
        <div class="active-sales">
          <div class="section-header">
            <h2>Ventes en cours</h2>
            <button class="btn btn-secondary" (click)="refreshData()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,4 23,10 17,10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Actualiser
            </button>
          </div>

          <div class="sales-grid" *ngIf="activeSales.length > 0; else noActiveSales">
            <div class="sale-card" *ngFor="let portfolio of activeSales">
              <div class="sale-header">
                <div class="sale-info">
                  <h3>{{ portfolio.name }}</h3>
                  <p>{{ portfolio.invoicesCount }} factures • {{ formatCurrency(portfolio.totalAmount) }}</p>
                </div>
                <span class="status-badge" [ngClass]="'status-' + portfolio.status">
                  {{ getStatusLabel(portfolio.status) }}
                </span>
              </div>
              
              <div class="sale-progress">
                <div class="progress-timeline">
                  <div class="timeline-item" [ngClass]="{'completed': portfolio.createdAt, 'current': portfolio.status === 'draft'}">
                    <div class="timeline-dot"></div>
                    <div class="timeline-label">Création</div>
                  </div>
                  
                  <div class="timeline-item" [ngClass]="{'completed': portfolio.submittedAt, 'current': portfolio.status === 'submitted'}">
                    <div class="timeline-dot"></div>
                    <div class="timeline-label">Soumission</div>
                  </div>
                  
                  <div class="timeline-item" [ngClass]="{'completed': portfolio.evaluatedAt, 'current': portfolio.status === 'under_evaluation'}">
                    <div class="timeline-dot"></div>
                    <div class="timeline-label">Évaluation</div>
                  </div>
                  
                  <div class="timeline-item" [ngClass]="{'completed': portfolio.soldAt, 'current': portfolio.status === 'approved'}">
                    <div class="timeline-dot"></div>
                    <div class="timeline-label">Vente</div>
                  </div>
                </div>
              </div>
              
              <div class="sale-details">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">Soumis le</span>
                    <span class="value">{{ portfolio.submittedAt ? formatDate(portfolio.submittedAt) : 'Non soumis' }}</span>
                  </div>
                  <div class="detail-item" *ngIf="portfolio.evaluatedAt">
                    <span class="label">Évalué le</span>
                    <span class="value">{{ formatDate(portfolio.evaluatedAt) }}</span>
                  </div>
                  <div class="detail-item" *ngIf="portfolio.salePrice">
                    <span class="label">Prix proposé</span>
                    <span class="value success">{{ formatCurrency(portfolio.salePrice) }}</span>
                  </div>
                  <div class="detail-item" *ngIf="portfolio.salePrice">
                    <span class="label">Taux de rachat</span>
                    <span class="value">{{ getBuybackRate(portfolio) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="sale-actions">
                <button class="btn btn-primary small" (click)="viewSaleDetails(portfolio)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Voir détails
                </button>
                <button class="btn btn-success small" (click)="acceptOffer(portfolio)" *ngIf="portfolio.status === 'approved'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                  Accepter l'offre
                </button>
                <button class="btn btn-warning small" (click)="rejectOffer(portfolio)" *ngIf="portfolio.status === 'approved'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Refuser
                </button>
              </div>
            </div>
          </div>

          <ng-template #noActiveSales>
            <div class="no-sales">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <h3>Aucune vente en cours</h3>
              <p>Vous n'avez actuellement aucun portefeuille en cours de vente.</p>
            </div>
          </ng-template>
        </div>

        <!-- Historique des ventes -->
        <div class="sales-history">
          <div class="section-header">
            <h2>Historique des ventes</h2>
          </div>

          <div class="history-grid" *ngIf="soldPortfolios.length > 0; else noHistory">
            <div class="history-card" *ngFor="let portfolio of soldPortfolios">
              <div class="history-header">
                <div class="history-info">
                  <h3>{{ portfolio.name }}</h3>
                  <p>Vendu le {{ formatDate(portfolio.soldAt!) }}</p>
                </div>
                <div class="sale-result success">
                  <div class="result-amount">{{ formatCurrency(portfolio.salePrice!) }}</div>
                  <div class="result-rate">{{ getBuybackRate(portfolio) }}% du nominal</div>
                </div>
              </div>
              
              <div class="history-details">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">Montant nominal</span>
                    <span class="value">{{ formatCurrency(portfolio.totalAmount) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Prix de vente</span>
                    <span class="value success">{{ formatCurrency(portfolio.salePrice!) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Factures</span>
                    <span class="value">{{ portfolio.invoicesCount }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Durée du processus</span>
                    <span class="value">{{ getSaleDuration(portfolio) }} jours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noHistory>
            <div class="no-history">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
              <p>Aucune vente finalisée pour le moment</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sales-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .sales-header {
      margin-bottom: 32px;
    }

    .sales-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .sales-header p {
      font-size: 16px;
      color: var(--text-secondary);
    }

    .process-overview {
      margin-bottom: 48px;
    }

    .process-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .process-card h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 24px;
      text-align: center;
    }

    .process-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .process-step {
      flex: 1;
      text-align: center;
    }

    .step-number {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 18px;
      margin: 0 auto 16px;
    }

    .step-content h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .step-content p {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .step-arrow {
      color: var(--text-secondary);
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

    .active-sales, .sales-history {
      margin-bottom: 48px;
    }

    .sales-grid, .history-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .sale-card, .history-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      transition: all 0.2s ease;
    }

    .sale-card:hover, .history-card:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .sale-header, .history-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .sale-info h3, .history-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .sale-info p, .history-info p {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .sale-result {
      text-align: right;
    }

    .result-amount {
      font-size: 20px;
      font-weight: 700;
      color: var(--success);
      margin-bottom: 4px;
    }

    .result-rate {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .sale-progress {
      margin-bottom: 24px;
    }

    .progress-timeline {
      display: flex;
      justify-content: space-between;
      position: relative;
      padding: 0 16px;
    }

    .progress-timeline::before {
      content: '';
      position: absolute;
      top: 12px;
      left: 24px;
      right: 24px;
      height: 2px;
      background: #e2e8f0;
    }

    .timeline-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .timeline-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #e2e8f0;
      margin-bottom: 8px;
    }

    .timeline-item.completed .timeline-dot {
      background: var(--success);
    }

    .timeline-item.current .timeline-dot {
      background: var(--primary);
      animation: pulse 2s infinite;
    }

    .timeline-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
    }

    .sale-details, .history-details {
      margin-bottom: 20px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 6px;
    }

    .label {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .value {
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
    }

    .value.success {
      color: var(--success);
      font-weight: 600;
    }

    .sale-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn.small {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn.btn-success {
      background: var(--success);
      color: white;
    }

    .btn.btn-success:hover {
      background: #047857;
    }

    .btn.btn-warning {
      background: var(--warning);
      color: white;
    }

    .btn.btn-warning:hover {
      background: #ea580c;
    }

    .no-sales, .no-history {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-secondary);
    }

    .no-sales svg, .no-history svg {
      margin-bottom: 24px;
      color: var(--text-secondary);
    }

    .no-sales h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .status-draft { background: #f3f4f6; color: #374151; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .status-under_evaluation { background: #fef3c7; color: #92400e; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-sold { background: #ecfdf5; color: #047857; }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    @media (max-width: 1024px) {
      .process-steps {
        flex-direction: column;
        gap: 24px;
      }

      .step-arrow {
        transform: rotate(90deg);
      }

      .sales-grid, .history-grid {
        grid-template-columns: 1fr;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .sales-container {
        padding: 16px;
      }

      .process-card {
        padding: 24px;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class CedantSalesComponent implements OnInit {
  portfolios: CedantPortfolio[] = [];
  activeSales: CedantPortfolio[] = [];
  soldPortfolios: CedantPortfolio[] = [];

  constructor(
    private cedantService: CedantService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.cedantService.getPortfolios(currentUser.id).subscribe(portfolios => {
      this.portfolios = portfolios;
      this.activeSales = portfolios.filter(p => 
        p.status === PortfolioStatus.SUBMITTED || 
        p.status === PortfolioStatus.UNDER_EVALUATION || 
        p.status === PortfolioStatus.APPROVED
      );
      this.soldPortfolios = portfolios.filter(p => p.status === PortfolioStatus.SOLD);
    });
  }

  refreshData() {
    this.loadData();
  }

  viewSaleDetails(portfolio: CedantPortfolio) {
    console.log('Voir détails de la vente:', portfolio.name);
    // TODO: Implémenter la vue détaillée
  }

  acceptOffer(portfolio: CedantPortfolio) {
    if (confirm('Êtes-vous sûr de vouloir accepter cette offre ?')) {
      this.cedantService.updatePortfolio(portfolio.id, {
        status: PortfolioStatus.SOLD,
        soldAt: new Date()
      }).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Erreur lors de l\'acceptation:', error);
        }
      });
    }
  }

  rejectOffer(portfolio: CedantPortfolio) {
    if (confirm('Êtes-vous sûr de vouloir refuser cette offre ?')) {
      this.cedantService.updatePortfolio(portfolio.id, {
        status: PortfolioStatus.REJECTED
      }).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Erreur lors du refus:', error);
        }
      });
    }
  }

  getBuybackRate(portfolio: CedantPortfolio): number {
    if (!portfolio.salePrice) return 0;
    return Math.round((portfolio.salePrice / portfolio.totalAmount) * 100);
  }

  getSaleDuration(portfolio: CedantPortfolio): number {
    if (!portfolio.soldAt || !portfolio.submittedAt) return 0;
    const diffTime = new Date(portfolio.soldAt).getTime() - new Date(portfolio.submittedAt).getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Brouillon',
      'submitted': 'Soumis',
      'under_evaluation': 'En évaluation',
      'approved': 'Approuvé',
      'rejected': 'Rejeté',
      'sold': 'Vendu'
    };
    return labels[status] || status;
  }
}