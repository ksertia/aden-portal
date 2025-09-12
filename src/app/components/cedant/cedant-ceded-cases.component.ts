import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../services/partner.service';
import { AuthService } from '../../services/auth.service';
import { DebtCase, PartnerUpdate, CessionContract } from '../../models/case.model';

@Component({
  selector: 'app-cedant-ceded-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ceded-cases-container">
      <div class="ceded-header fade-in-up">
        <div class="header-content">
          <div>
            <h1>Dossiers Cédés</h1>
            <p>Suivez les dossiers confiés à vos partenaires de recouvrement</p>
          </div>
          <button class="btn btn-primary" (click)="showCedeModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
            Céder un dossier
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-section fade-in-up" *ngIf="statistics">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalCededCases }}</div>
              <div class="stat-label">Dossiers cédés</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.activeCededCases }}</div>
              <div class="stat-label">Dossiers actifs</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(statistics.netRecovered) }}</div>
              <div class="stat-label">Montant net recouvré</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.recoveryRate }}%</div>
              <div class="stat-label">Taux de recouvrement</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des dossiers cédés -->
      <div class="ceded-content fade-in-up">
        <div class="ceded-list" *ngIf="cededCases.length > 0; else noCededCases">
          <div class="ceded-grid">
            <div class="ceded-card" *ngFor="let case of cededCases">
              <div class="ceded-header">
                <div class="case-info">
                  <h3>{{ case.caseNumber }}</h3>
                  <p class="debtor-name">{{ case.debtor.firstName }} {{ case.debtor.lastName }}</p>
                  <p class="partner-name">Assigné à {{ getPartnerName(case.assignedPartner!) }}</p>
                </div>
                <div class="case-badges">
                  <span class="status-badge" [ngClass]="'status-' + case.status">
                    {{ getStatusLabel(case.status) }}
                  </span>
                  <span class="commission-badge">
                    {{ case.partnerCommission }}% commission
                  </span>
                </div>
              </div>
              
              <div class="ceded-body">
                <div class="financial-summary">
                  <div class="summary-item">
                    <span class="label">Montant cédé</span>
                    <span class="value">{{ formatCurrency(case.amount) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Recouvré</span>
                    <span class="value recovered">{{ formatCurrency(case.amountPaid) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Commission</span>
                    <span class="value commission">{{ formatCurrency(case.amountPaid * (case.partnerCommission || 0) / 100) }}</span>
                  </div>
                  <div class="summary-item highlight">
                    <span class="label">Net reçu</span>
                    <span class="value">{{ formatCurrency(case.amountPaid * (100 - (case.partnerCommission || 0)) / 100) }}</span>
                  </div>
                </div>
                
                <div class="progress-section">
                  <div class="progress-info">
                    <span class="progress-label">Progression du recouvrement</span>
                    <span class="progress-percentage">{{ getPaymentPercentage(case) }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="getPaymentPercentage(case)"></div>
                  </div>
                </div>
                
                <div class="recent-updates" *ngIf="getRecentUpdates(case.id).length > 0">
                  <h5>Dernières mises à jour</h5>
                  <div class="updates-list">
                    <div class="update-item" *ngFor="let update of getRecentUpdates(case.id)">
                      <div class="update-dot" [ngClass]="'dot-' + update.updateType"></div>
                      <div class="update-content">
                        <div class="update-description">{{ update.description }}</div>
                        <div class="update-time">{{ getTimeAgo(update.createdAt) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="ceded-actions">
                  <button class="btn btn-primary small" (click)="viewCaseDetails(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Voir détails
                  </button>
                  <button class="btn btn-secondary small" (click)="viewUpdatesHistory(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    Historique
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noCededCases>
          <div class="no-ceded-cases">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
            <h3>Aucun dossier cédé</h3>
            <p>Vous n'avez encore cédé aucun dossier à des partenaires de recouvrement.</p>
            <button class="btn btn-primary" (click)="showCedeModal = true">
              Céder un premier dossier
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Modal cession de dossier -->
      <div class="modal-overlay" *ngIf="showCedeModal" (click)="closeCedeModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Céder un dossier à un partenaire</h3>
            <button class="modal-close" (click)="closeCedeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="cede-form">
              <div class="form-section">
                <h4>Sélection du dossier</h4>
                <div class="form-group">
                  <label>Dossier à céder</label>
                  <select [(ngModel)]="cedeForm.caseId">
                    <option value="">Sélectionner un dossier</option>
                    <!-- TODO: Charger les dossiers disponibles -->
                    <option value="case-1">REC-2024-001 - Jean Dupont (5000€)</option>
                    <option value="case-2">REC-2024-002 - Marie Martin (3200€)</option>
                  </select>
                </div>
              </div>
              
              <div class="form-section">
                <h4>Partenaire de recouvrement</h4>
                <div class="form-group">
                  <label>Sélectionner un partenaire</label>
                  <select [(ngModel)]="cedeForm.partnerId">
                    <option value="">Choisir un partenaire</option>
                    <option value="6">Recouvrement Solutions - Laurent Rousseau</option>
                  </select>
                </div>
              </div>
              
              <div class="form-section">
                <h4>Conditions de la cession</h4>
                <div class="form-group">
                  <label>Commission du partenaire (%)</label>
                  <input
                    type="number"
                    [(ngModel)]="cedeForm.commission"
                    min="1"
                    max="50"
                    step="0.1"
                    placeholder="Ex: 25"
                  >
                </div>
                
                <div class="form-group">
                  <label>Conditions et termes</label>
                  <textarea
                    [(ngModel)]="cedeForm.terms"
                    rows="4"
                    placeholder="Décrivez les conditions de la cession, les modalités de paiement des commissions, etc."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeCedeModal()">Annuler</button>
            <button class="btn btn-primary" (click)="cedeCase()" [disabled]="!isCedeFormValid()">
              Céder le dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ceded-cases-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ceded-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .ceded-header p {
      font-size: 16px;
      color: var(--text-secondary);
    }

    .stats-section {
      margin-bottom: 32px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
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
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ceded-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .ceded-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.2s ease;
      border-left: 4px solid #059669;
    }

    .ceded-card:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .ceded-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .case-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .debtor-name {
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
      margin-bottom: 2px;
    }

    .partner-name {
      font-size: 12px;
      color: #059669;
      font-style: italic;
    }

    .case-badges {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }

    .commission-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      background: #fef3c7;
      color: #92400e;
    }

    .financial-summary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .summary-item.highlight {
      background: #ecfdf5;
      border: 1px solid #bbf7d0;
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

    .value.recovered {
      color: var(--success);
    }

    .value.commission {
      color: var(--warning);
    }

    .progress-section {
      margin-bottom: 20px;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .progress-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text);
    }

    .progress-percentage {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary);
    }

    .progress-bar {
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

    .recent-updates {
      margin-bottom: 20px;
    }

    .recent-updates h5 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 12px;
    }

    .updates-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .update-item {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .update-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .update-dot.dot-payment_received { background: var(--success); }
    .update-dot.dot-status_change { background: var(--primary); }
    .update-dot.dot-action_taken { background: var(--warning); }
    .update-dot.dot-note_added { background: #6366f1; }

    .update-description {
      font-size: 13px;
      color: var(--text);
    }

    .update-time {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .ceded-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn.small {
      padding: 6px 12px;
      font-size: 12px;
    }

    .no-ceded-cases {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-secondary);
    }

    .no-ceded-cases svg {
      margin-bottom: 24px;
      color: var(--text-secondary);
    }

    .no-ceded-cases h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .no-ceded-cases p {
      margin-bottom: 24px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    .modal-content {
      background: var(--surface);
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      animation: slideInUp 0.3s ease;
    }

    .modal-content.large {
      max-width: 800px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
    }

    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
    }

    .modal-body {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .form-section h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 6px;
      font-size: 14px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid var(--border);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .ceded-cases-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .ceded-grid {
        grid-template-columns: 1fr;
      }

      .financial-summary {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CedantCededCasesComponent implements OnInit {
  cededCases: DebtCase[] = [];
  partnerUpdates: PartnerUpdate[] = [];
  statistics: any = null;
  
  showCedeModal = false;
  
  cedeForm = {
    caseId: '',
    partnerId: '',
    commission: 25,
    terms: ''
  };

  constructor(
    private partnerService: PartnerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCededCases();
    this.loadPartnerUpdates();
    this.loadStatistics();
  }

  loadCededCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.partnerService.getCededCases(currentUser.id).subscribe(cases => {
      this.cededCases = cases;
    });
  }

  loadPartnerUpdates() {
    this.partnerService.getPartnerUpdates().subscribe(updates => {
      this.partnerUpdates = updates;
    });
  }

  loadStatistics() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.partnerService.getCedantStatistics(currentUser.id).subscribe(stats => {
      this.statistics = stats;
    });
  }

  getPaymentPercentage(case_: DebtCase): number {
    return Math.round((case_.amountPaid / case_.amount) * 100);
  }

  getPartnerName(): string {
    return 'Recouvrement Solutions';
  }

  getPartnerName(partnerId: string): string {
    return 'Recouvrement Solutions';
  }

  getRecentUpdates(caseId: string): PartnerUpdate[] {
    return this.partnerUpdates
      .filter(u => u.caseId === caseId)
      .slice(0, 3);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return new Date(date).toLocaleDateString('fr-FR');
    }
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

  viewCaseDetails(case_: DebtCase) {
    console.log('Voir détails du dossier cédé:', case_.caseNumber);
    // TODO: Implémenter la vue détaillée
  }

  viewUpdatesHistory(case_: DebtCase) {
    console.log('Voir historique des mises à jour:', case_.caseNumber);
    // TODO: Implémenter la vue historique
  }

  isCedeFormValid(): boolean {
    return !!(this.cedeForm.caseId && this.cedeForm.partnerId && 
              this.cedeForm.commission > 0 && this.cedeForm.terms.trim());
  }

  cedeCase() {
    if (!this.isCedeFormValid()) return;

    this.partnerService.cedeCase(
      this.cedeForm.caseId,
      this.cedeForm.partnerId,
      this.cedeForm.commission,
      this.cedeForm.terms
    ).subscribe({
      next: (contract) => {
        this.loadCededCases();
        this.loadStatistics();
        this.closeCedeModal();
      },
      error: (error) => {
        console.error('Erreur lors de la cession:', error);
      }
    });
  }

  closeCedeModal() {
    this.showCedeModal = false;
    this.cedeForm = {
      caseId: '',
      partnerId: '',
      commission: 25,
      terms: ''
    };
  }
}