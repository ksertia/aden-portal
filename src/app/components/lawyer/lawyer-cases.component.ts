import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { AuthService } from '../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter, CaseNote } from '../../models/case.model';

@Component({
  selector: 'app-lawyer-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cases-container">
      <div class="cases-header fade-in-up">
        <div class="header-content">
          <div>
            <h1>Dossiers Juridiques</h1>
            <p>Consultez et gérez vos dossiers juridiques</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" (click)="generateReport()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Rapport d'activité
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
                placeholder="Numéro, créancier, débiteur..."
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
              <label>Date de création</label>
              <div class="date-range">
                <input
                  type="date"
                  [(ngModel)]="dateFrom"
                  (change)="updateDateFilter()"
                  placeholder="Du"
                >
                <input
                  type="date"
                  [(ngModel)]="dateTo"
                  (change)="updateDateFilter()"
                  placeholder="Au"
                >
              </div>
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
              <div class="stat-label">Dossiers juridiques</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ getLegalActionCases() }}</div>
              <div class="stat-label">Actions légales</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ getSuccessRate() }}%</div>
              <div class="stat-label">Taux de résolution</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des dossiers -->
      <div class="cases-content fade-in-up">
        <div class="cases-table" *ngIf="filteredCases.length > 0; else noCases">
          <div class="table-container">
            <table class="cases-table-view">
              <thead>
                <tr>
                  <th>Dossier</th>
                  <th>Créancier</th>
                  <th>Débiteur</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Priorité</th>
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
                    <div class="creditor-cell">
                      <div class="creditor-name">{{ case.creditor.name }}</div>
                      <div class="creditor-contact">{{ case.creditor.contactPerson }}</div>
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
                      <div class="total-amount">{{ formatCurrency(case.amount) }}</div>
                      <div class="recovered-amount">{{ formatCurrency(case.amountPaid) }} recouvré</div>
                    </div>
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="'status-' + case.status">
                      {{ getStatusLabel(case.status) }}
                    </span>
                  </td>
                  <td>
                    <span class="priority-badge" [ngClass]="'priority-' + case.priority">
                      {{ getPriorityLabel(case.priority) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-primary small" (click)="reviewCase(case)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Réviser
                      </button>
                      <button class="btn btn-secondary small" (click)="addLegalNote(case)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Note
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
            <h3>Aucun dossier trouvé</h3>
            <p>Aucun dossier ne correspond aux critères sélectionnés.</p>
          </div>
        </ng-template>
      </div>

      <!-- Modal révision de dossier -->
      <div class="modal-overlay" *ngIf="showReviewModal" (click)="closeReviewModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Révision juridique - {{ selectedCase?.caseNumber }}</h3>
            <button class="modal-close" (click)="closeReviewModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedCase">
            <div class="review-form">
              <div class="form-section">
                <h4>Évaluation juridique</h4>
                <div class="form-group">
                  <label>Recommandation</label>
                  <select [(ngModel)]="legalReview.recommendation">
                    <option value="continue">Poursuivre le recouvrement amiable</option>
                    <option value="legal_action">Engager une action en justice</option>
                    <option value="negotiation">Négocier un arrangement</option>
                    <option value="close">Clôturer le dossier</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Analyse juridique</label>
                  <textarea
                    [(ngModel)]="legalReview.analysis"
                    rows="4"
                    placeholder="Analysez la situation juridique du dossier..."
                  ></textarea>
                </div>
                
                <div class="form-group">
                  <label>Prochaines étapes</label>
                  <textarea
                    [(ngModel)]="legalReview.nextSteps"
                    rows="3"
                    placeholder="Décrivez les prochaines actions à entreprendre..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeReviewModal()">Annuler</button>
            <button class="btn btn-primary" (click)="saveLegalReview()">Enregistrer la révision</button>
          </div>
        </div>
      </div>

      <!-- Modal ajout de note juridique -->
      <div class="modal-overlay" *ngIf="showNoteModal" (click)="closeNoteModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Ajouter une note juridique</h3>
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
                <label>Type d'intervention</label>
                <select [(ngModel)]="newNote.type">
                  <option value="legal">Analyse juridique</option>
                  <option value="call">Consultation téléphonique</option>
                  <option value="meeting">Rendez-vous client</option>
                  <option value="correspondence">Correspondance</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Contenu de la note</label>
                <textarea
                  [(ngModel)]="newNote.content"
                  rows="5"
                  placeholder="Décrivez votre intervention ou analyse..."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="newNote.isPrivate">
                  <span class="checkmark"></span>
                  Note confidentielle (visible uniquement par les avocats)
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
      grid-template-columns: 2fr 1fr 2fr;
      gap: 20px;
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .list-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }

    .cases-grid {
      display: grid;
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

    .creditor-name, .debtor-name {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 2px;
    }

    .case-badges {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }

    .case-body {
      margin-bottom: 20px;
    }

    .case-amounts {
      display: grid;
      grid-template-columns: 1fr 1fr;
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

      align-items: end;
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

    .date-range {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
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

    .table-container {
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
      padding: 16px;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      font-size: 14px;
      border-bottom: 1px solid var(--border);
    }

    .cases-table-view td {
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    .case-row:hover {
      background: #f8fafc;
    }

    .case-cell {
      display: flex;
      flex-direction: column;
    }

    .case-number {
      font-weight: 600;
      color: var(--text);
      font-size: 14px;
    }

    .case-date {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .creditor-cell, .debtor-cell {
      display: flex;
      flex-direction: column;
    }

    .creditor-name, .debtor-name {
      font-weight: 500;
      color: var(--text);
      font-size: 14px;
    }

    .creditor-contact, .debtor-type {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .amount-cell {
      display: flex;
      flex-direction: column;
    }

    .total-amount {
      font-weight: 600;
      color: var(--text);
      font-size: 14px;
    }

    .recovered-amount {
      font-size: 12px;
      color: var(--success);
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

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .btn.small {
      padding: 6px 10px;
      font-size: 12px;
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
      max-width: 700px;
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

    @media (max-width: 1024px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .table-container {
        overflow-x: auto;
      }

      .cases-table-view {
        min-width: 800px;
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

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class LawyerCasesComponent implements OnInit {
  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  statistics: any = null;
  
  filters: CaseFilter = {};
  selectedStatus = '';
  selectedPriority = '';
  dateFrom = '';
  dateTo = '';
  
  showReviewModal = false;
  showNoteModal = false;
  selectedCase: DebtCase | null = null;
  
  legalReview = {
    recommendation: '',
    analysis: '',
    nextSteps: ''
  };
  
  newNote: Partial<CaseNote> = {
    content: '',
    type: 'legal',
    isPrivate: true
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

    this.caseService.getCases().subscribe(cases => {
      this.cases = cases;
      this.applyFilters();
    });
  }

  loadStatistics() {
    this.caseService.getStatistics().subscribe(stats => {
      this.statistics = stats;
    });
  }

  applyFilters() {
    this.caseService.getCasesWithFilter(this.filters).subscribe(cases => {
      this.filteredCases = cases;
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

  updateDateFilter() {
    this.filters.dateFrom = this.dateFrom ? new Date(this.dateFrom) : undefined;
    this.filters.dateTo = this.dateTo ? new Date(this.dateTo) : undefined;
    this.applyFilters();
  }

  resetFilters() {
    this.filters = {};
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.filteredCases = [...this.cases];
  }

  getLegalActionCases(): number {
    return this.filteredCases.filter(c => c.status === CaseStatus.LEGAL_ACTION).length;
  }

  getSuccessRate(): number {
    const completedCases = this.filteredCases.filter(c => c.status === CaseStatus.COMPLETED).length;
    return this.filteredCases.length > 0 ? Math.round((completedCases / this.filteredCases.length) * 100) : 0;
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

  reviewCase(case_: DebtCase) {
    this.selectedCase = case_;
    this.legalReview = {
      recommendation: '',
      analysis: '',
      nextSteps: ''
    };
    this.showReviewModal = true;
  }

  addLegalNote(case_: DebtCase) {
    this.selectedCase = case_;
    this.newNote = {
      content: '',
      type: 'legal',
      isPrivate: true
    };
    this.showNoteModal = true;
  }

  saveLegalReview() {
    if (!this.selectedCase || !this.legalReview.analysis.trim()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const noteContent = `Révision juridique:\n\nRecommandation: ${this.legalReview.recommendation}\n\nAnalyse: ${this.legalReview.analysis}\n\nProchaines étapes: ${this.legalReview.nextSteps}`;

    const noteData = {
      caseId: this.selectedCase.id,
      content: noteContent,
      type: 'legal' as const,
      createdBy: currentUser.id,
      createdByName: `${currentUser.firstName} ${currentUser.lastName}`,
      isPrivate: true
    };

    this.caseService.addCaseNote(noteData).subscribe({
      next: () => {
        this.closeReviewModal();
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
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
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de la note:', error);
      }
    });
  }

  generateReport() {
    this.caseService.generateReport(this.filters).subscribe({
      next: (report) => {
        console.log('Rapport d\'activité généré:', report);
        // TODO: Télécharger le rapport
      },
      error: (error) => {
        console.error('Erreur lors de la génération du rapport:', error);
      }
    });
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.selectedCase = null;
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.selectedCase = null;
  }
}