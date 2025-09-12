import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../services/partner.service';
import { AuthService } from '../../services/auth.service';
import { PartnerUpdate, DebtCase } from '../../models/case.model';

@Component({
  selector: 'app-partner-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tracking-container">
      <div class="tracking-header fade-in-up">
        <h1>Suivi des Mises à Jour</h1>
        <p>Consultez l'historique de vos actions et mises à jour envoyées aux cédants</p>
      </div>

      <div class="tracking-content fade-in-up">
        <!-- Filtres -->
        <div class="filters-section">
          <div class="filters-card">
            <div class="filters-grid">
              <div class="filter-group">
                <label>Type de mise à jour</label>
                <select [(ngModel)]="selectedUpdateType" (change)="filterUpdates()">
                  <option value="">Tous les types</option>
                  <option value="payment_received">Paiements reçus</option>
                  <option value="action_taken">Actions entreprises</option>
                  <option value="status_change">Changements de statut</option>
                  <option value="note_added">Notes ajoutées</option>
                </select>
              </div>
              
              <div class="filter-group">
                <label>Dossier</label>
                <select [(ngModel)]="selectedCaseId" (change)="filterUpdates()">
                  <option value="">Tous les dossiers</option>
                  <option *ngFor="let case of allCededCases" [value]="case.id">
                    {{ case.caseNumber }}
                  </option>
                </select>
              </div>
              
              <div class="filter-group">
                <label>Période</label>
                <select [(ngModel)]="selectedPeriod" (change)="filterUpdates()">
                  <option value="all">Toutes</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des mises à jour -->
        <div class="updates-list" *ngIf="filteredUpdates.length > 0; else noUpdates">
          <div class="updates-timeline">
            <div class="update-item" *ngFor="let update of filteredUpdates">
              <div class="update-icon" [ngClass]="'icon-' + update.updateType">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path *ngIf="update.updateType === 'payment_received'" d="M9 12l2 2 4-4"/>
                  <circle *ngIf="update.updateType === 'payment_received'" cx="12" cy="12" r="9"/>
                  <path *ngIf="update.updateType === 'status_change'" d="M12 2v6l3-3 3 3"/>
                  <path *ngIf="update.updateType === 'status_change'" d="M12 8v8"/>
                  <path *ngIf="update.updateType === 'status_change'" d="m8 14 4 4 4-4"/>
                  <path *ngIf="update.updateType === 'action_taken'" d="M9 12l2 2 4-4"/>
                  <circle *ngIf="update.updateType === 'action_taken'" cx="12" cy="12" r="9"/>
                  <path *ngIf="update.updateType === 'note_added'" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              
              <div class="update-content">
                <div class="update-header">
                  <h3>{{ getUpdateTypeLabel(update.updateType) }}</h3>
                  <div class="update-meta">
                    <span class="update-time">{{ getTimeAgo(update.createdAt) }}</span>
                    <span class="case-number">{{ getCaseNumber(update.caseId) }}</span>
                  </div>
                </div>
                <p class="update-description">{{ update.description }}</p>
                <div class="update-details" *ngIf="update.amount">
                  <div class="detail-item">
                    <span class="label">Montant :</span>
                    <span class="value amount">{{ formatCurrency(update.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noUpdates>
          <div class="no-updates">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M12 2v6l3-3 3 3"/>
              <path d="M12 8v8"/>
              <path d="m8 14 4 4 4-4"/>
            </svg>
            <h3>Aucune mise à jour</h3>
            <p>Aucune mise à jour ne correspond aux critères sélectionnés.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .tracking-container {
      padding: 32px;
      max-width: 1200px;
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

    .filters-section {
      margin-bottom: 32px;
    }

    .filters-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .filter-group label {
      display: block;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .filter-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 14px;
    }

    .updates-timeline {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .update-item {
      display: flex;
      gap: 16px;
      padding: 24px;
      background: var(--surface);
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      transition: all 0.2s ease;
    }

    .update-item:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .update-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .update-icon.icon-payment_received { background: var(--success); }
    .update-icon.icon-status_change { background: var(--primary); }
    .update-icon.icon-action_taken { background: var(--warning); }
    .update-icon.icon-note_added { background: #6366f1; }

    .update-content {
      flex: 1;
    }

    .update-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .update-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
    }

    .update-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .update-time {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .case-number {
      font-size: 11px;
      color: var(--primary);
      font-weight: 500;
    }

    .update-description {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .update-details {
      display: flex;
      gap: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
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

    .value.amount {
      color: var(--success);
      font-weight: 600;
    }

    .no-updates {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-secondary);
    }

    .no-updates svg {
      margin-bottom: 24px;
      color: var(--text-secondary);
    }

    .no-updates h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .tracking-container {
        padding: 16px;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .update-item {
        flex-direction: column;
        gap: 12px;
      }

      .update-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class PartnerTrackingComponent implements OnInit {
  allCededCases: DebtCase[] = [];
  allUpdates: PartnerUpdate[] = [];
  filteredUpdates: PartnerUpdate[] = [];
  
  selectedUpdateType = '';
  selectedCaseId = '';
  selectedPeriod = 'all';

  constructor(
    private partnerService: PartnerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.partnerService.getAssignedCases(currentUser.id).subscribe(cases => {
      this.allCededCases = cases;
    });

    this.partnerService.getPartnerUpdates().subscribe(updates => {
      this.allUpdates = updates;
      this.filteredUpdates = [...updates];
    });
  }

  filterUpdates() {
    this.filteredUpdates = this.allUpdates.filter(update => {
      const typeMatch = !this.selectedUpdateType || update.updateType === this.selectedUpdateType;
      const caseMatch = !this.selectedCaseId || update.caseId === this.selectedCaseId;
      
      let periodMatch = true;
      if (this.selectedPeriod !== 'all') {
        const now = new Date();
        const updateDate = new Date(update.createdAt);
        
        switch (this.selectedPeriod) {
          case 'today':
            periodMatch = updateDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            periodMatch = updateDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            periodMatch = updateDate >= monthAgo;
            break;
        }
      }
      
      return typeMatch && caseMatch && periodMatch;
    });
  }

  getCaseNumber(caseId: string): string {
    const case_ = this.allCededCases.find(c => c.id === caseId);
    return case_?.caseNumber || 'N/A';
  }

  getUpdateTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'payment_received': 'Paiement reçu',
      'status_change': 'Changement de statut',
      'action_taken': 'Action entreprise',
      'note_added': 'Note ajoutée'
    };
    return labels[type] || type;
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
}