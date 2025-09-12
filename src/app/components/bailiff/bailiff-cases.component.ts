import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { AuthService } from '../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter, CaseNote } from '../../models/case.model';

@Component({
  selector: 'app-bailiff-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cases-container">
      <div class="cases-header fade-in-up">
        <div class="header-content">
          <div>
            <h1>Gestion des Dossiers</h1>
            <p>Gérez vos dossiers de recouvrement assignés</p>
          </div>
          <button class="btn btn-primary" (click)="showCreateModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouveau dossier
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-section fade-in-up">
        <div class="filters-card">
          <div class="filters-header">
            <h3>Filtres</h3>
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
              <div class="stat-label">Dossiers assignés</div>
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
              <div class="stat-label">Taux de succès</div>
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
              <div class="stat-value">{{ formatCurrency(getTotalRecovered()) }}</div>
              <div class="stat-label">Montant recouvré</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des dossiers -->
      <div class="cases-content fade-in-up">
        <div class="cases-table" *ngIf="filteredCases.length > 0; else noCases">
          <div class="table-header">
            <div class="table-actions">
              <button class="btn btn-secondary" (click)="generateReport()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exporter rapport
              </button>
            </div>
          </div>
          
          <div class="cases-grid">
            <div class="case-card professional" *ngFor="let case of filteredCases">
              <div class="case-header">
                <div class="case-info">
                  <h3>{{ case.caseNumber }}</h3>
                  <p class="debtor-name">{{ case.debtor.firstName }} {{ case.debtor.lastName }}</p>
                  <p class="creditor-name">{{ case.creditor.name }}</p>
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
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="getPaymentPercentage(case)"></div>
                  </div>
                  <span class="progress-text">{{ getPaymentPercentage(case) }}% recouvré</span>
                </div>
                
                <div class="case-actions">
                  <button class="btn btn-primary small" (click)="editCase(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifier
                  </button>
                  <button class="btn btn-secondary small" (click)="addNote(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Ajouter note
                  </button>
                  <button class="btn btn-secondary small" (click)="viewCaseDetails(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Détails
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noCases>
          <div class="no-cases">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <h3>Aucun dossier trouvé</h3>
            <p>Aucun dossier ne correspond aux critères sélectionnés.</p>
          </div>
        </ng-template>
      </div>

      <!-- Modal création de dossier -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="closeCreateModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Créer un nouveau dossier</h3>
            <button class="modal-close" (click)="closeCreateModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="create-form">
              <div class="form-section">
                <h4>Informations du débiteur</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>Prénom</label>
                    <input type="text" [(ngModel)]="newCase.debtor.firstName">
                  </div>
                  <div class="form-group">
                    <label>Nom</label>
                    <input type="text" [(ngModel)]="newCase.debtor.lastName">
                  </div>
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="newCase.debtor.email">
                </div>
              </div>
              
              <div class="form-section">
                <h4>Informations du créancier</h4>
                <div class="form-group">
                  <label>Nom de l'entreprise</label>
                  <input type="text" [(ngModel)]="newCase.creditor.name">
                </div>
                <div class="form-group">
                  <label>Montant de la créance</label>
                  <input type="number" [(ngModel)]="newCase.amount" min="1" step="0.01">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeCreateModal()">Annuler</button>
            <button class="btn btn-primary" (click)="createCase()">Créer le dossier</button>
          </div>
        </div>
      </div>

      <!-- Modal ajout de note -->
      <div class="modal-overlay" *ngIf="showNoteModal" (click)="closeNoteModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Ajouter une note</h3>
            <button class="modal-close" (click)="closeNoteModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="note-form">
              <div class="form-group">
                <label>Type d'interaction</label>
                <select [(ngModel)]="newNote.type">
                  <option value="call">Appel téléphonique</option>
                  <option value="email">Email</option>
                  <option value="meeting">Rendez-vous</option>
                  <option value="legal">Action légale</option>
                  <option value="payment">Paiement</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Contenu de la note</label>
                <textarea
                  [(ngModel)]="newNote.content"
                  rows="4"
                  placeholder="Décrivez l'interaction ou l'action effectuée..."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="newNote.isPrivate">
                  <span class="checkmark"></span>
                  Note privée (visible uniquement par les professionnels)
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeNoteModal()">Annuler</button>
            <button class="btn btn-primary" (click)="saveNote()">Ajouter la note</button>
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

    .cases-grid {
      display: grid;
      gap: 20px;
    }

    .case-card.professional {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.2s ease;
    }

    .case-card.professional:hover {
      border-color: var(--primary);
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
      color: var(--text);
      font-weight: 500;
      margin-bottom: 2px;
    }

    .creditor-name {
      font-size: 12px;
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
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
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

    .case-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn.small {
      padding: 6px 12px;
      font-size: 12px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-title {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .table-title h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }

    .table-actions {
      display: flex;
      gap: 12px;
    }

    .cases-table-container {
      background: var(--surface);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .cases-table-view {
      width: 100%;
      border-collapse: collapse;
    }

    .cases-table-view th {
      background: #f8fafc;
      padding: 16px 12px;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    .cases-table-view td {
      padding: 16px 12px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .case-table-row:hover {
      background: #f8fafc;
    }

    .case-cell, .debtor-cell, .creditor-cell, .amount-cell {
      display: flex;
      flex-direction: column;
    }

    .case-number, .debtor-name, .creditor-name {
      font-weight: 600;
      color: var(--text);
      font-size: 14px;
      margin-bottom: 2px;
    }

    .case-date, .debtor-type, .creditor-contact {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .amount-cell .amount-value {
      font-weight: 600;
      font-size: 14px;
      color: var(--text);
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

    .table-actions {
      display: flex;
      gap: 4px;
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
      max-width: 500px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid var(--border);
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
        grid-template-columns: 1fr;
      }

      .case-amounts {
        grid-template-columns: 1fr;
      }

      .case-badges {
        align-items: flex-start;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BailiffCasesComponent implements OnInit {
  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  statistics: any = null;
  
  filters: CaseFilter = {};
  selectedStatus = '';
  selectedPriority = '';
  
  showCreateModal = false;
  showNoteModal = false;
  selectedCase: DebtCase | null = null;
  
  newCase: any = {
    debtor: { firstName: '', lastName: '', email: '', type: 'individual' },
    creditor: { name: '' },
    amount: 0,
    status: CaseStatus.PENDING,
    priority: Priority.MEDIUM
  };
  
  newNote: Partial<CaseNote> = {
    content: '',
    type: 'call',
    isPrivate: false
  };

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCases();
    this.loadStatistics();
  }

  loadCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCasesByUserId(currentUser.id, currentUser.role)
      .subscribe(cases => {
        this.cases = cases;
        this.applyFilters();
      });
  }

  loadStatistics() {
    this.caseService.getStatistics()
      .subscribe(stats => {
        this.statistics = stats;
      });
  }

  applyFilters() {
    this.caseService.getCasesWithFilter(this.filters)
      .subscribe(cases => {
        this.filteredCases = cases.filter(c => c.assignedBailiff === this.authService.getCurrentUser()?.id);
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

  editCase(case_: DebtCase) {
    console.log('Modifier le dossier:', case_.caseNumber);
    // TODO: Implémenter l'édition
  }

  addNote(case_: DebtCase) {
    this.selectedCase = case_;
    this.newNote = {
      content: '',
      type: 'call',
      isPrivate: false
    };
    this.showNoteModal = true;
  }

  viewCaseDetails(case_: DebtCase) {
    console.log('Voir détails du dossier:', case_.caseNumber);
    // TODO: Implémenter la vue détaillée
  }

  createCase() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const caseData = {
      ...this.newCase,
      assignedBailiff: currentUser.id,
      amountPaid: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    };

    this.caseService.createCase(caseData).subscribe({
      next: (newCase) => {
        this.cases.push(newCase);
        this.applyFilters();
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
      }
    });
  }

  saveNote() {
    if (!this.selectedCase || !this.newNote.content?.trim()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const noteData = {
      caseId: this.selectedCase.id,
      content: this.newNote.content!,
      type: this.newNote.type as CaseNote['type'],
      createdBy: currentUser.id,
      createdByName: `${currentUser.firstName} ${currentUser.lastName}`,
      isPrivate: this.newNote.isPrivate || false
    };

    this.caseService.addCaseNote(noteData).subscribe({
      next: () => {
        this.closeNoteModal();
        // TODO: Rafraîchir les données du dossier
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de la note:', error);
      }
    });
  }

  generateReport() {
    this.caseService.generateReport(this.filters).subscribe({
      next: (report) => {
        console.log('Rapport généré:', report);
        // TODO: Télécharger le rapport
      },
      error: (error) => {
        console.error('Erreur lors de la génération du rapport:', error);
      }
    });
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newCase = {
      debtor: { firstName: '', lastName: '', email: '', type: 'individual' },
      creditor: { name: '' },
      amount: 0,
      status: CaseStatus.PENDING,
      priority: Priority.MEDIUM
    };
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.selectedCase = null;
  }
}