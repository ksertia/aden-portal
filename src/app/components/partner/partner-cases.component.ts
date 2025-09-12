import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../services/partner.service';
import { AuthService } from '../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter, PartnerUpdate } from '../../models/case.model';

@Component({
  selector: 'app-partner-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cases-container">
      <div class="cases-header fade-in-up">
        <div class="header-content">
          <div>
            <h1>Dossiers Assignés</h1>
            <p>Gérez les dossiers de recouvrement qui vous sont confiés</p>
          </div>
          <button class="btn btn-primary" (click)="generatePartnerReport()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Rapport d'activité
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
              <div class="stat-value">{{ assignedCases.length }}</div>
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
              <div class="stat-value">{{ formatCurrency(statistics.totalRecovered) }}</div>
              <div class="stat-label">Montant recouvré</div>
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
              <div class="stat-value">{{ formatCurrency(statistics.totalCommission) }}</div>
              <div class="stat-label">Commission gagnée</div>
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
              <div class="stat-value">{{ statistics.averageRecoveryRate }}%</div>
              <div class="stat-label">Taux de recouvrement</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des dossiers -->
      <div class="cases-content fade-in-up">
        <div class="cases-list" *ngIf="assignedCases.length > 0; else noCases">
          <div class="cases-grid">
            <div class="case-card" *ngFor="let case of assignedCases">
              <div class="case-header">
                <div class="case-info">
                  <h3>{{ case.caseNumber }}</h3>
                  <p class="debtor-name">{{ case.debtor.firstName }} {{ case.debtor.lastName }}</p>
                  <p class="cedant-name">Cédé par {{ case.creditor.name }}</p>
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
                    <span class="amount-label">Commission</span>
                    <span class="amount-value commission">{{ formatCurrency(case.amountPaid * (case.partnerCommission || 0) / 100) }}</span>
                  </div>
                </div>
                
                <div class="case-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="getPaymentPercentage(case)"></div>
                  </div>
                  <span class="progress-text">{{ getPaymentPercentage(case) }}% recouvré</span>
                </div>
                
                <div class="case-actions">
                  <button class="btn btn-primary small" (click)="updateCaseStatus(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2v6l3-3 3 3"/>
                      <path d="M12 8v8"/>
                      <path d="m8 14 4 4 4-4"/>
                    </svg>
                    Mettre à jour
                  </button>
                  <button class="btn btn-secondary small" (click)="recordPayment(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Paiement
                  </button>
                  <button class="btn btn-secondary small" (click)="addNote(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Note
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
            <h3>Aucun dossier assigné</h3>
            <p>Vous n'avez actuellement aucun dossier assigné.</p>
          </div>
        </ng-template>
      </div>

      <!-- Modal mise à jour statut -->
      <div class="modal-overlay" *ngIf="showStatusModal" (click)="closeStatusModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Mettre à jour le statut</h3>
            <button class="modal-close" (click)="closeStatusModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedCase">
            <div class="status-form">
              <div class="form-group">
                <label>Nouveau statut</label>
                <select [(ngModel)]="statusUpdate.newStatus">
                  <option value="active">Actif</option>
                  <option value="negotiation">Négociation</option>
                  <option value="legal_action">Action légale</option>
                  <option value="payment_plan">Plan de paiement</option>
                  <option value="completed">Terminé</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Description de la mise à jour</label>
                <textarea
                  [(ngModel)]="statusUpdate.description"
                  rows="3"
                  placeholder="Décrivez les actions entreprises..."
                ></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeStatusModal()">Annuler</button>
            <button class="btn btn-primary" (click)="saveStatusUpdate()">Mettre à jour</button>
          </div>
        </div>
      </div>

      <!-- Modal enregistrement paiement -->
      <div class="modal-overlay" *ngIf="showPaymentModal" (click)="closePaymentModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Enregistrer un paiement</h3>
            <button class="modal-close" (click)="closePaymentModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedCase">
            <div class="payment-form">
              <div class="form-group">
                <label>Montant du paiement</label>
                <input
                  type="number"
                  [(ngModel)]="paymentUpdate.amount"
                  min="1"
                  step="0.01"
                  placeholder="Montant en euros"
                >
              </div>
              
              <div class="form-group">
                <label>Description</label>
                <textarea
                  [(ngModel)]="paymentUpdate.description"
                  rows="3"
                  placeholder="Détails du paiement reçu..."
                ></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closePaymentModal()">Annuler</button>
            <button class="btn btn-primary" (click)="savePayment()">Enregistrer</button>
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
                <label>Type d'action</label>
                <select [(ngModel)]="noteUpdate.type">
                  <option value="action_taken">Action entreprise</option>
                  <option value="note_added">Note d'information</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Contenu de la note</label>
                <textarea
                  [(ngModel)]="noteUpdate.content"
                  rows="4"
                  placeholder="Décrivez l'action ou l'information..."
                ></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeNoteModal()">Annuler</button>
            <button class="btn btn-primary" (click)="saveNote()">Ajouter</button>
          </div>
        </div>
      </div>

      <!-- Modal détails du dossier -->
      <div class="modal-overlay" *ngIf="showDetailsModal" (click)="closeDetailsModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Détails du dossier {{ selectedCase?.caseNumber }}</h3>
            <button class="modal-close" (click)="closeDetailsModal()">
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
                    <span class="detail-label">Cédé le</span>
                    <span class="detail-value">{{ formatDate(selectedCase.cededAt!) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Commission</span>
                    <span class="detail-value">{{ selectedCase.partnerCommission }}%</span>
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
                  <div class="financial-card commission">
                    <div class="card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                      </svg>
                    </div>
                    <div class="card-content">
                      <div class="card-value">{{ formatCurrency(selectedCase.amountPaid * (selectedCase.partnerCommission || 0) / 100) }}</div>
                      <div class="card-label">Commission gagnée</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Historique des activités -->
              <div class="details-section">
                <h4>Historique des activités</h4>
                <div class="activity-timeline">
                  <div class="timeline-item" *ngFor="let activity of selectedCase.history.slice(-5).reverse()">
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
                      <div class="document-meta">{{ getDocumentTypeLabel(doc.type) }} • {{ formatDate(doc.uploadedAt) }}</div>
                    </div>
                    <div class="document-actions">
                      <button class="btn btn-secondary small" (click)="viewDocument(doc)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
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
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeDetailsModal()">Fermer</button>
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

    .cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .case-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.2s ease;
      border-left: 4px solid #059669;
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
      color: var(--text);
      font-weight: 500;
      margin-bottom: 2px;
    }

    .cedant-name {
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

    .amount-value.commission {
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

    .financial-card.commission {
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
    .financial-card.commission .card-icon { background: var(--warning); }

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
    .timeline-dot.cession { background: #059669; }
    .timeline-dot.partner { background: #7c3aed; }

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

    .document-actions {
      display: flex;
      gap: 4px;
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
      .cases-container {
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

      .cases-grid {
        grid-template-columns: 1fr;
      }

      .case-amounts {
        grid-template-columns: 1fr;
      }

      .financial-cards {
        grid-template-columns: 1fr;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PartnerCasesComponent implements OnInit {
  assignedCases: DebtCase[] = [];
  statistics: any = null;
  
  showStatusModal = false;
  showPaymentModal = false;
  showNoteModal = false;
  showDetailsModal = false;
  selectedCase: DebtCase | null = null;
  
  statusUpdate = {
    newStatus: CaseStatus.ACTIVE,
    description: ''
  };
  
  paymentUpdate = {
    amount: 0,
    description: ''
  };
  
  noteUpdate = {
    type: 'action_taken' as 'action_taken' | 'note_added',
    content: ''
  };

  constructor(
    private partnerService: PartnerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAssignedCases();
    this.loadStatistics();
  }

  loadAssignedCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.partnerService.getAssignedCases(currentUser.id).subscribe(cases => {
      this.assignedCases = cases;
    });
  }

  loadStatistics() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.partnerService.getPartnerStatistics(currentUser.id).subscribe(stats => {
      this.statistics = stats;
    });
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

  updateCaseStatus(case_: DebtCase) {
    this.selectedCase = case_;
    this.statusUpdate = {
      newStatus: case_.status,
      description: ''
    };
    this.showStatusModal = true;
  }

  recordPayment(case_: DebtCase) {
    this.selectedCase = case_;
    this.paymentUpdate = {
      amount: 0,
      description: ''
    };
    this.showPaymentModal = true;
  }

  addNote(case_: DebtCase) {
    this.selectedCase = case_;
    this.noteUpdate = {
      type: 'action_taken',
      content: ''
    };
    this.showNoteModal = true;
  }

  viewCaseDetails(case_: DebtCase) {
    this.selectedCase = case_;
    this.showDetailsModal = true;
  }

  saveStatusUpdate() {
    if (!this.selectedCase || !this.statusUpdate.description.trim()) return;

    this.partnerService.updateCaseStatus(
      this.selectedCase.id,
      this.statusUpdate.newStatus,
      this.statusUpdate.description
    ).subscribe({
      next: (updatedCase) => {
        const caseIndex = this.assignedCases.findIndex(c => c.id === updatedCase.id);
        if (caseIndex >= 0) {
          this.assignedCases[caseIndex] = updatedCase;
        }
        this.closeStatusModal();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
      }
    });
  }

  savePayment() {
    if (!this.selectedCase || this.paymentUpdate.amount <= 0) return;

    this.partnerService.recordPayment(
      this.selectedCase.id,
      this.paymentUpdate.amount,
      this.paymentUpdate.description
    ).subscribe({
      next: (updatedCase) => {
        const caseIndex = this.assignedCases.findIndex(c => c.id === updatedCase.id);
        if (caseIndex >= 0) {
          this.assignedCases[caseIndex] = updatedCase;
        }
        this.loadStatistics(); // Recharger les stats pour les commissions
        this.closePaymentModal();
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement:', error);
      }
    });
  }

  saveNote() {
    if (!this.selectedCase || !this.noteUpdate.content.trim()) return;

    this.partnerService.addPartnerNote(
      this.selectedCase.id,
      this.noteUpdate.content,
      this.noteUpdate.type
    ).subscribe({
      next: () => {
        this.closeNoteModal();
        // Recharger les données pour voir la nouvelle note
        this.loadAssignedCases();
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de la note:', error);
      }
    });
  }

  generatePartnerReport() {
    console.log('Génération du rapport d\'activité partenaire');
    // TODO: Implémenter la génération de rapport
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedCase = null;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedCase = null;
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.selectedCase = null;
  }

  getActivityClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'payment_received': 'payment',
      'reminder_sent': 'reminder',
      'status_changed': 'status',
      'formal_notice_sent': 'legal',
      'legal_action_initiated': 'legal',
      'case_ceded': 'cession',
      'partner_update': 'partner'
    };
    return typeMap[type] || 'status';
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedCase = null;
  }

  downloadDocument(doc: any) {
    console.log('Télécharger document:', doc.name);
    // TODO: Implémenter le téléchargement
  }

  viewDocument(doc: any) {
    console.log('Visualiser document:', doc.name);
    // TODO: Implémenter la visualisation
  }

  getDocumentTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'invoice': 'Facture',
      'contract': 'Contrat',
      'correspondence': 'Correspondance',
      'legal_notice': 'Mise en demeure',
      'payment_proof': 'Preuve de paiement',
      'court_document': 'Document judiciaire'
    };
    return labels[type] || type;
  }
}