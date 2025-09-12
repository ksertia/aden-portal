import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewToggleComponent } from '../shared/view-toggle.component';
import { CaseService } from '../../services/case.service';
import { AuthService } from '../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter } from '../../models/case.model';

@Component({
  selector: 'app-creditor-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent],
  template: `
    <div class="cases-container">
      <div class="cases-header fade-in-up">
        <div class="header-content">
          <div>
            <h1>Mes Créances</h1>
            <p>Gérez et suivez vos créances en cours de recouvrement</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" (click)="generateCustomReport()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 2v6l3-3 3 3-3 3v6"/>
                <path d="M15 8h6"/>
                <path d="M15 16h6"/>
              </svg>
              Rapport personnalisé
            </button>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-section fade-in-up">
        <div class="filters-card">
          <div class="filters-header">
            <h3>Filtres et recherche</h3>
            <button class="btn btn-secondary small" (click)="resetFilters()">Réinitialiser</button>
          </div>
          
          <div class="filters-grid">
            <div class="filter-group">
              <label>Recherche</label>
              <input
                type="text"
                [(ngModel)]="filters.searchTerm"
                placeholder="Numéro, nom du débiteur..."
                (input)="applyFilters()"
              >
            </div>
            
            <div class="filter-group">
              <label>Statut</label>
              <select [(ngModel)]="selectedStatus" (change)="updateStatusFilter()">
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="active">Actif</option>
                <option value="negotiation">Négociation</option>
                <option value="legal_action">Action légale</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Priorité</label>
              <select [(ngModel)]="selectedPriority" (change)="updatePriorityFilter()">
                <option value="">Toutes les priorités</option>
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
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
              <div class="stat-value">{{ filteredCases.length }}</div>
              <div class="stat-label">Créances actives</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ getSuccessRate() }}%</div>
              <div class="stat-label">Taux de recouvrement</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(getTotalAmount()) }}</div>
              <div class="stat-label">Montant total</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(getTotalRecovered()) }}</div>
              <div class="stat-label">Montant recouvré</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des créances -->
      <div class="cases-content fade-in-up">
        <div class="cases-list" *ngIf="filteredCases.length > 0; else noCases">
          <div class="list-header">
            <h3>Créances ({{ filteredCases.length }})</h3>
            <app-view-toggle 
              [currentView]="currentView" 
              (viewChange)="currentView = $event">
            </app-view-toggle>
          </div>
          
          <!-- Vue grille -->
          <div class="cases-grid" *ngIf="currentView === 'grid'">
            <div class="case-card" *ngFor="let case of filteredCases">
              <div class="case-header">
                <div class="case-info">
                  <h3>{{ case.caseNumber }}</h3>
                  <p class="debtor-name">{{ case.debtor.firstName }} {{ case.debtor.lastName }}</p>
                </div>
                <div class="case-badges">
                  <span class="status-badge" [ngClass]="'status-' + case.status">
                    {{ getStatusLabel(case.status) }}
                  </span>
                  <span class="priority-badge" [ngClass]="'priority-' + case.priority">
                    {{ getPriorityLabel(case.priority) }}
                  </span>
                </div>
              </div>
              
              <div class="case-body">
                <div class="case-amounts">
                  <div class="amount-item">
                    <span class="amount-label">Montant total</span>
                    <span class="amount-value">{{ formatCurrency(case.amount) }}</span>
                  </div>
                  <div class="amount-item">
                    <span class="amount-label">Recouvré</span>
                    <span class="amount-value recovered">{{ formatCurrency(case.amountPaid) }}</span>
                  </div>
                  <div class="amount-item">
                    <span class="amount-label">Restant</span>
                    <span class="amount-value remaining">{{ formatCurrency(case.amount - case.amountPaid) }}</span>
                  </div>
                </div>
                
                <div class="case-progress">
                  <div class="progress-info">
                    <span class="progress-label">Progression</span>
                    <span class="progress-percentage">{{ getPaymentPercentage(case) }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="getPaymentPercentage(case)"></div>
                  </div>
                </div>
                
                <div class="case-meta">
                  <div class="meta-item">
                    <span class="meta-label">Échéance :</span>
                    <span class="meta-value">{{ formatDate(case.dueDate) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Créé le :</span>
                    <span class="meta-value">{{ formatDate(case.createdAt) }}</span>
                  </div>
                </div>
                
                <div class="case-actions">
                  <button class="btn btn-primary small" (click)="viewCaseDetails(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Détails
                  </button>
                  <button class="btn btn-secondary small" (click)="downloadCaseReport(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Rapport
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Vue table -->
          <div class="cases-table-container" *ngIf="currentView === 'table'">
            <table class="cases-table">
              <thead>
                <tr>
                  <th>Dossier</th>
                  <th>Débiteur</th>
                  <th>Montant total</th>
                  <th>Recouvré</th>
                  <th>Restant</th>
                  <th>Statut</th>
                  <th>Progression</th>
                  <th>Échéance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let case of filteredCases" class="case-row">
                  <td>
                    <div class="case-cell">
                      <div class="case-number">{{ case.caseNumber }}</div>
                      <div class="case-date">{{ formatDate(case.createdAt) }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="debtor-cell">
                      <div class="debtor-name">{{ case.debtor.firstName }} {{ case.debtor.lastName }}</div>
                      <div class="debtor-type">{{ case.debtor.type === 'company' ? 'Entreprise' : 'Particulier' }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="amount-cell">
                      <div class="amount-value">{{ formatCurrency(case.amount) }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="amount-cell recovered">
                      <div class="amount-value">{{ formatCurrency(case.amountPaid) }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="amount-cell remaining">
                      <div class="amount-value">{{ formatCurrency(case.amount - case.amountPaid) }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="'status-' + case.status">
                      {{ getStatusLabel(case.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="progress-cell">
                      <div class="progress-bar-small">
                        <div class="progress-fill" [style.width.%]="getPaymentPercentage(case)"></div>
                      </div>
                      <span class="progress-text">{{ getPaymentPercentage(case) }}%</span>
                    </div>
                  </td>
                  <td>
                    <div class="date-cell">{{ formatDate(case.dueDate) }}</div>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="btn btn-primary small" (click)="viewCaseDetails(case)" title="Voir détails">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button class="btn btn-secondary small" (click)="downloadCaseReport(case)" title="Télécharger rapport">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ng-template #noCases>
          <div class="no-cases">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <h3>Aucune créance trouvée</h3>
            <p>Aucune créance ne correspond aux critères sélectionnés.</p>
          </div>
        </ng-template>
      </div>

      <!-- Modal de détails du dossier -->
      <div class="modal-overlay" *ngIf="showCaseDetailsModal" (click)="closeCaseDetailsModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Détails du dossier {{ selectedCase?.caseNumber }}</h3>
            <button class="modal-close" (click)="closeCaseDetailsModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedCase">
            <div class="case-details">
              <!-- Informations générales -->
              <div class="details-section">
                <h4>Informations générales</h4>
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-label">Numéro de dossier</span>
                    <span class="detail-value">{{ selectedCase.caseNumber }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Date de création</span>
                    <span class="detail-value">{{ formatDate(selectedCase.createdAt) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Échéance</span>
                    <span class="detail-value">{{ formatDate(selectedCase.dueDate) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Statut</span>
                    <span class="status-badge" [ngClass]="'status-' + selectedCase.status">
                      {{ getStatusLabel(selectedCase.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Informations débiteur -->
              <div class="details-section">
                <h4>Débiteur</h4>
                <div class="debtor-profile">
                  <div class="debtor-avatar">
                    {{ selectedCase.debtor.firstName.charAt(0) }}{{ selectedCase.debtor.lastName.charAt(0) }}
                  </div>
                  <div class="debtor-info">
                    <div class="debtor-name">{{ selectedCase.debtor.firstName }} {{ selectedCase.debtor.lastName }}</div>
                    <div class="debtor-details">
                      <div class="detail-row">
                        <span class="label">Email :</span>
                        <span class="value">{{ selectedCase.debtor.email }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="label">Téléphone :</span>
                        <span class="value">{{ selectedCase.debtor.phone }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="label">Type :</span>
                        <span class="value">{{ selectedCase.debtor.type === 'company' ? 'Entreprise' : 'Particulier' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Analyse financière -->
              <div class="details-section">
                <h4>Analyse financière</h4>
                <div class="financial-cards">
                  <div class="financial-card total">
                    <div class="card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <div class="card-content">
                      <div class="card-value">{{ formatCurrency(selectedCase.amount) }}</div>
                      <div class="card-label">Montant total</div>
                    </div>
                  </div>
                  <div class="financial-card recovered">
                    <div class="card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="9"/>
                      </svg>
                    </div>
                    <div class="card-content">
                      <div class="card-value">{{ formatCurrency(selectedCase.amountPaid) }}</div>
                      <div class="card-label">Montant recouvré</div>
                    </div>
                  </div>
                  <div class="financial-card remaining">
                    <div class="card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <div class="card-content">
                      <div class="card-value">{{ formatCurrency(selectedCase.amount - selectedCase.amountPaid) }}</div>
                      <div class="card-label">Reste à recouvrer</div>
                    </div>
                  </div>
                </div>
                
                <div class="progress-section">
                  <div class="progress-header">
                    <span class="progress-title">Progression du recouvrement</span>
                    <span class="progress-percentage">{{ getPaymentPercentage(selectedCase) }}%</span>
                  </div>
                  <div class="progress-bar-large">
                    <div class="progress-fill" [style.width.%]="getPaymentPercentage(selectedCase)"></div>
                  </div>
                </div>
              </div>

              <!-- Historique des activités -->
              <div class="details-section">
                <h4>Historique des activités</h4>
                <div class="activity-timeline">
                  <div class="timeline-item" *ngFor="let activity of getRecentActivities(selectedCase)">
                    <div class="timeline-dot" [ngClass]="getActivityClass(activity.type)"></div>
                    <div class="timeline-content">
                      <div class="timeline-description">{{ activity.description }}</div>
                      <div class="timeline-meta">
                        <span class="timeline-date">{{ formatDate(activity.date) }}</span>
                        <span class="timeline-user">par {{ activity.userName }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Documents -->
              <div class="details-section" *ngIf="selectedCase.documents.length > 0">
                <h4>Documents joints ({{ selectedCase.documents.length }})</h4>
                <div class="documents-list">
                  <div class="document-item" *ngFor="let doc of selectedCase.documents">
                    <div class="document-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <div class="document-info">
                      <div class="document-name">{{ doc.name }}</div>
                      <div class="document-meta">{{ formatDate(doc.uploadedAt) }} • {{ doc.uploadedBy }}</div>
                    </div>
                    <button class="btn btn-secondary small" (click)="downloadDocument(doc)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeCaseDetailsModal()">Fermer</button>
            <button class="btn btn-primary" (click)="downloadCaseReport(selectedCase!)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger le rapport
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cases-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cases-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .cases-header p {
      font-size: 16px;
      color: var(--text-secondary);
    }

    .header-actions {
      display: flex;
      gap: 12px;
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

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .filters-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
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

    .filter-group input,
    .filter-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 14px;
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

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .list-header h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
    }

    .cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
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
      color: var(--text-secondary);
    }

    .case-badges {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }

    .priority-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .priority-low { background: #f0f9ff; color: #0369a1; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-high { background: #fee2e2; color: #991b1b; }
    .priority-urgent { background: #fdf2f8; color: #be185d; }

    .case-amounts {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }

    .amount-item {
      text-align: center;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .amount-label {
      display: block;
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .amount-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
    }

    .amount-value.recovered {
      color: var(--success);
    }

    .amount-value.remaining {
      color: var(--warning);
    }

    .case-progress {
      margin-bottom: 16px;
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

    .case-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-label {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .meta-value {
      font-size: 14px;
      color: var(--text);
    }

    .case-actions {
      display: flex;
      gap: 8px;
    }

    .btn.small {
      padding: 6px 12px;
      font-size: 12px;
    }

    .cases-table-container {
      background: var(--surface);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .cases-table {
      width: 100%;
      border-collapse: collapse;
    }

    .cases-table th {
      background: #f8fafc;
      padding: 16px 12px;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    .cases-table td {
      padding: 16px 12px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .case-row:hover {
      background: #f8fafc;
    }

    .case-cell, .debtor-cell, .amount-cell {
      display: flex;
      flex-direction: column;
    }

    .case-number, .debtor-name {
      font-weight: 600;
      color: var(--text);
      font-size: 14px;
      margin-bottom: 2px;
    }

    .case-date, .debtor-type {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .amount-cell .amount-value {
      font-weight: 600;
      font-size: 14px;
    }

    .amount-cell.recovered .amount-value {
      color: var(--success);
    }

    .amount-cell.remaining .amount-value {
      color: var(--warning);
    }

    .progress-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-bar-small {
      width: 60px;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-text {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
      min-width: 35px;
    }

    .date-cell {
      font-size: 14px;
      color: var(--text);
    }

    .table-actions {
      display: flex;
      gap: 4px;
    }

    .no-cases {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-secondary);
    }

    .no-cases svg {
      margin-bottom: 24px;
      color: var(--text-secondary);
    }

    .no-cases h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
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
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
      animation: slideInUp 0.3s ease;
    }

    .modal-content.large {
      max-width: 1000px;
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

    .details-section {
      margin-bottom: 32px;
    }

    .details-section h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-label {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
    }

    .debtor-profile {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .debtor-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 18px;
      flex-shrink: 0;
    }

    .debtor-info {
      flex: 1;
    }

    .debtor-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 12px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .value {
      font-size: 14px;
      color: var(--text);
    }

    .financial-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .financial-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .financial-card.total {
      background: #eff6ff;
      border-color: var(--primary);
    }

    .financial-card.recovered {
      background: #f0fdf4;
      border-color: var(--success);
    }

    .financial-card.remaining {
      background: #fefce8;
      border-color: var(--warning);
    }

    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .financial-card.total .card-icon { background: var(--primary); }
    .financial-card.recovered .card-icon { background: var(--success); }
    .financial-card.remaining .card-icon { background: var(--warning); }

    .card-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
    }

    .card-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .progress-section {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .progress-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text);
    }

    .progress-bar-large {
      height: 12px;
      background: #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .timeline-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    .timeline-dot.payment { background: var(--success); }
    .timeline-dot.reminder { background: var(--warning); }
    .timeline-dot.legal { background: var(--error); }
    .timeline-dot.status { background: var(--primary); }

    .timeline-description {
      font-size: 14px;
      color: var(--text);
      margin-bottom: 4px;
    }

    .timeline-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .document-icon {
      color: var(--primary);
    }

    .document-info {
      flex: 1;
    }

    .document-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text);
    }

    .document-meta {
      font-size: 12px;
      color: var(--text-secondary);
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

    @media (max-width: 1024px) {
      .cases-grid {
        grid-template-columns: 1fr;
      }

      .financial-cards {
        grid-template-columns: 1fr;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .cases-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .case-amounts {
        grid-template-columns: 1fr;
      }

      .case-meta {
        grid-template-columns: 1fr;
      }

      .debtor-profile {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }
  `]
})
export class CreditorCasesComponent implements OnInit {
  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  statistics: any = null;
  currentView: 'grid' | 'table' = 'grid';
  
  filters: CaseFilter = {};
  selectedStatus = '';
  selectedPriority = '';
  
  showCaseDetailsModal = false;
  selectedCase: DebtCase | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCases();
    this.loadStatistics();
    
    // Vérifier si on doit ouvrir un dossier spécifique depuis les notifications
    this.route.queryParams.subscribe(params => {
      if (params['caseId']) {
        this.openCaseFromNotification(params['caseId']);
      }
    });
  }

  loadCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCases().subscribe(cases => {
      // Filtrer les dossiers pour ce créancier
      this.cases = cases.filter(c => 
        c.creditor.name === currentUser.companyName || 
        c.creditor.contactPerson === `${currentUser.firstName} ${currentUser.lastName}`
      );
      this.applyFilters();
    });
  }

  loadStatistics() {
    this.caseService.getStatistics().subscribe(stats => {
      this.statistics = stats;
    });
  }

  openCaseFromNotification(caseId: string) {
    // Attendre que les données soient chargées
    setTimeout(() => {
      const case_ = this.cases.find(c => c.id === caseId);
      if (case_) {
        this.viewCaseDetails(case_);
      }
    }, 500);
  }

  applyFilters() {
    this.caseService.getCasesWithFilter(this.filters).subscribe(cases => {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return;
      
      this.filteredCases = cases.filter(c => 
        c.creditor.name === currentUser.companyName || 
        c.creditor.contactPerson === `${currentUser.firstName} ${currentUser.lastName}`
      );
    });
  }

  updateStatusFilter() {
    this.filters.status = this.selectedStatus ? [this.selectedStatus as CaseStatus] : undefined;
    this.applyFilters();
  }

  updatePriorityFilter() {
    this.filters.priority = this.selectedPriority ? [this.selectedPriority as Priority] : undefined;
    this.applyFilters();
  }

  resetFilters() {
    this.filters = {};
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.filteredCases = [...this.cases];
  }

  getSuccessRate(): number {
    const completedCases = this.filteredCases.filter(c => c.status === CaseStatus.COMPLETED).length;
    return this.filteredCases.length > 0 ? Math.round((completedCases / this.filteredCases.length) * 100) : 0;
  }

  getTotalAmount(): number {
    return this.filteredCases.reduce((sum, c) => sum + c.amount, 0);
  }

  getTotalRecovered(): number {
    return this.filteredCases.reduce((sum, c) => sum + c.amountPaid, 0);
  }

  getPaymentPercentage(case_: DebtCase): number {
    return Math.round((case_.amountPaid / case_.amount) * 100);
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
      month: 'short',
      day: 'numeric'
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

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Élevée',
      'urgent': 'Urgente'
    };
    return labels[priority] || priority;
  }

  viewCaseDetails(case_: DebtCase) {
    this.selectedCase = case_;
    this.showCaseDetailsModal = true;
  }

  closeCaseDetailsModal() {
    this.showCaseDetailsModal = false;
    this.selectedCase = null;
    
    // Nettoyer l'URL si on vient des notifications
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  downloadCaseReport(case_: DebtCase) {
    console.log('Télécharger rapport pour:', case_.caseNumber);
    // TODO: Implémenter le téléchargement de rapport spécifique au dossier
  }

  downloadDocument(doc: any) {
    console.log('Télécharger document:', doc.name);
    // TODO: Implémenter le téléchargement de document
  }

  generateCustomReport() {
    this.router.navigate(['/professional/reports']);
  }

  getRecentActivities(case_: DebtCase) {
    return case_.history.slice(-5).reverse();
  }

  getActivityClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'payment_received': 'payment',
      'reminder_sent': 'reminder',
      'status_changed': 'status',
      'formal_notice_sent': 'legal',
      'legal_action_initiated': 'legal'
    };
    return typeMap[type] || 'status';
  }
}