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
            <p>Gérez les dossiers qui vous ont été confiés par vos partenaires</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" (click)="generatePartnerReport()">
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
              <div class="stat-value">{{ statistics.totalCases }}</div>
              <div class="stat-label">Dossiers assignés</div>
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
              <div class="stat-value">{{ statistics.activeCases }}</div>
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
              <div class="stat-value">{{ formatCurrency(statistics.totalRecovered) }}</div>
              <div class="stat-label">Montant recouvré</div>
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
              <div class="stat-value">{{ formatCurrency(statistics.totalCommission) }}</div>
              <div class="stat-label">Commissions gagnées</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des dossiers -->
      <div class="cases-content fade-in-up">
        <div class="cases-list" *ngIf="assignedCases.length > 0; else noCases">
          <div class="cases-grid">
            <div class="case-card partner" *ngFor="let case of assignedCases">
              <div class="case-header">
                <div class="case-info">
                  <h3>{{ case.caseNumber }}</h3>
                  <p class="debtor-name">{{ case.debtor.firstName }} {{ case.debtor.lastName }}</p>
                  <p class="cedant-name">Cédé par {{ case.creditor.name }} le {{ formatDate(case.cededAt!) }}</p>
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
                    <span class="meta-label">Cédé le :</span>
                    <span class="meta-value">{{ formatDate(case.cededAt!) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Échéance :</span>
                    <span class="meta-value">{{ formatDate(case.dueDate) }}</span>
                  </div>
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
                  <button class="btn btn-success small" (click)="recordPayment(case)">
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
                    Ajouter note
                  </button>
                  <button class="btn btn-secondary small" (click)="viewCaseDetails(case)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Voir détails
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
            <h3>Aucun dossier cédé</h3>
            <p>Aucun dossier n'a encore été cédé par les cédants partenaires.</p>
          </div>
        </ng-template>
      </div>

      <!-- Modal mise à jour de statut -->
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
                  rows="4"
                  placeholder="Décrivez les actions entreprises et la raison du changement de statut..."
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

      <!-- Modal enregistrement de paiement -->
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
            <div class="payment-summary">
              <h4>Dossier {{ selectedCase.caseNumber }}</h4>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Montant total</span>
                  <span class="value">{{ formatCurrency(selectedCase.amount) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Déjà recouvré</span>
                  <span class="value">{{ formatCurrency(selectedCase.amountPaid) }}</span>
                </div>
                <div class="summary-item highlight">
                  <span class="label">Reste à recouvrer</span>
                  <span class="value">{{ formatCurrency(selectedCase.amount - selectedCase.amountPaid) }}</span>
                </div>
              </div>
            </div>
            
            <div class="payment-form">
              <div class="form-group">
                <label>Montant du paiement reçu</label>
                <input
                  type="number"
                  [(ngModel)]="paymentUpdate.amount"
                  [max]="selectedCase.amount - selectedCase.amountPaid"
                  min="1"
                  step="0.01"
                  placeholder="Montant en euros"
                >
              </div>
              
              <div class="form-group">
                <label>Description du paiement</label>
                <textarea
                  [(ngModel)]="paymentUpdate.description"
                  rows="3"
                  placeholder="Décrivez les modalités du paiement reçu..."
                ></textarea>
              </div>
              
              <div class="commission-info">
                <div class="commission-item">
                  <span class="label">Votre commission ({{ selectedCase.partnerCommission }}%)</span>
                  <span class="value">{{ formatCurrency((paymentUpdate.amount || 0) * (selectedCase.partnerCommission || 0) / 100) }}</span>
                </div>
                <div class="commission-item">
                  <span class="label">Montant net pour le cédant</span>
                  <span class="value">{{ formatCurrency((paymentUpdate.amount || 0) * (100 - (selectedCase.partnerCommission || 0)) / 100) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closePaymentModal()">Annuler</button>
            <button class="btn btn-primary" (click)="savePayment()" [disabled]="!paymentUpdate.amount || paymentUpdate.amount <= 0">
              Enregistrer le paiement
            </button>
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
                  rows="5"
                  placeholder="Décrivez l'action entreprise ou l'information à communiquer..."
                ></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeNoteModal()">Annuler</button>
            <button class="btn btn-primary" (click)="saveNote()">Ajouter la note</button>
          </div>
        </div>
      </div>

      <!-- Modal détails du dossier -->
      <div class="modal-overlay" *ngIf="showDetailsModal" (click)="closeDetailsModal()">
        <div class="modal-content extra-large" (click)="$event.stopPropagation()">
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
                      <div class="detail-row">
                        <span class="label">Adresse :</span>
                        <span class="value">{{ selectedCase.debtor.address.street }}, {{ selectedCase.debtor.address.city }} {{ selectedCase.debtor.address.postalCode }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Informations créancier/cédant -->
              <div class="details-section">
                <h4>Créancier (Cédant)</h4>
                <div class="creditor-info">
                  <div class="detail-row">
                    <span class="label">Nom :</span>
                    <span class="value">{{ selectedCase.creditor.name }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Contact :</span>
                    <span class="value">{{ selectedCase.creditor.contactPerson }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Email :</span>
                    <span class="value">{{ selectedCase.creditor.email }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Téléphone :</span>
                    <span class="value">{{ selectedCase.creditor.phone }}</span>
                  </div>
                </div>
              </div>

              <!-- Analyse financière détaillée -->
              <div class="details-section">
                <h4>Analyse financière</h4>
                <div class="financial-breakdown">
                  <div class="breakdown-card">
                    <h5>Composition de la créance</h5>
                    <div class="breakdown-items">
                      <div class="breakdown-item">
                        <span class="item-label">Montant principal</span>
                        <span class="item-value">{{ formatCurrency(selectedCase.debtBreakdown.principalAmount) }}</span>
                      </div>
                      <div class="breakdown-item">
                        <span class="item-label">Intérêts totaux</span>
                        <span class="item-value">{{ formatCurrency(selectedCase.debtBreakdown.totalInterests) }}</span>
                      </div>
                      <div class="breakdown-item">
                        <span class="item-label">Pénalités totales</span>
                        <span class="item-value">{{ formatCurrency(selectedCase.debtBreakdown.totalPenalties) }}</span>
                      </div>
                      <div class="breakdown-item">
                        <span class="item-label">Frais totaux</span>
                        <span class="item-value">{{ formatCurrency(selectedCase.debtBreakdown.totalFees) }}</span>
                      </div>
                      <div class="breakdown-item total">
                        <span class="item-label">Total dû</span>
                        <span class="item-value">{{ formatCurrency(selectedCase.amount) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="commission-breakdown">
                    <h5>Répartition des recouvrements</h5>
                    <div class="commission-items">
                      <div class="commission-item">
                        <span class="item-label">Montant recouvré</span>
                        <span class="item-value recovered">{{ formatCurrency(selectedCase.amountPaid) }}</span>
                      </div>
                      <div class="commission-item">
                        <span class="item-label">Votre commission ({{ selectedCase.partnerCommission }}%)</span>
                        <span class="item-value commission">{{ formatCurrency(selectedCase.amountPaid * (selectedCase.partnerCommission || 0) / 100) }}</span>
                      </div>
                      <div class="commission-item">
                        <span class="item-label">Montant net cédant</span>
                        <span class="item-value net">{{ formatCurrency(selectedCase.amountPaid * (100 - (selectedCase.partnerCommission || 0)) / 100) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Documents joints -->
              <div class="details-section">
                <h4>Documents joints ({{ selectedCase.documents.length }})</h4>
                <div class="documents-grid" *ngIf="selectedCase.documents.length > 0; else noDocuments">
                  <div class="document-card" *ngFor="let doc of selectedCase.documents">
                    <div class="document-icon" [ngClass]="'icon-' + doc.type">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <div class="document-info">
                      <div class="document-name">{{ doc.name }}</div>
                      <div class="document-meta">{{ getDocumentTypeLabel(doc.type) }}</div>
                      <div class="document-date">{{ formatDate(doc.uploadedAt) }}</div>
                    </div>
                    <div class="document-actions">
                      <button class="btn btn-primary small" (click)="downloadDocument(doc)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                      <button class="btn btn-secondary small" (click)="viewDocument(doc)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <ng-template #noDocuments>
                  <div class="no-documents">
                    <p>Aucun document joint à ce dossier</p>
                  </div>
                </ng-template>
              </div>

              <!-- Historique complet -->
              <div class="details-section">
                <h4>Historique des activités</h4>
                <div class="activity-timeline">
                  <div class="timeline-item" *ngFor="let activity of selectedCase.history">
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
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeDetailsModal()">Fermer</button>
            <button class="btn btn-primary" (click)="updateCaseStatus(selectedCase!)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v6l3-3 3 3"/>
                <path d="M12 8v8"/>
                <path d="m8 14 4 4 4-4"/>
              </svg>
              Mettre à jour le statut
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

    .case-card.partner {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.2s ease;
      border-left: 4px solid var(--primary);
    }

    .case-card.partner:hover {
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

    .cedant-name {
      font-size: 12px;
      color: var(--text-secondary);
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
      background: #ecfdf5;
      color: #047857;
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
      color: var(--primary);
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

    .modal-content.extra-large {
      max-width: 1200px;
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

    .payment-summary {
      margin-bottom: 24px;
    }

    .payment-summary h4 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
    }

    .summary-grid {
      display: grid;
      gap: 12px;
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
      background: #eff6ff;
      border: 1px solid var(--primary);
    }

    .summary-item.highlight .value {
      color: var(--primary);
      font-weight: 600;
    }

    .commission-info {
      margin-top: 16px;
      padding: 16px;
      background: #f0fdf4;
      border-radius: 8px;
      border: 1px solid #bbf7d0;
    }

    .commission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .commission-item:last-child {
      margin-bottom: 0;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 16px;
      font-family: inherit;
    }

    .label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .value {
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid var(--border);
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

    .debtor-details, .creditor-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
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

    .financial-breakdown {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .breakdown-card {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .breakdown-card h5 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
    }

    .breakdown-items, .commission-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .breakdown-item, .commission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .breakdown-item.total {
      border-top: 2px solid var(--border);
      padding-top: 12px;
      margin-top: 8px;
      font-weight: 600;
    }

    .item-label {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .item-value {
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
    }

    .item-value.recovered {
      color: var(--success);
    }

    .item-value.commission {
      color: var(--primary);
    }

    .item-value.net {
      color: #059669;
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .document-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid var(--border);
      transition: all 0.2s ease;
    }

    .document-card:hover {
      border-color: var(--primary);
      background: #eff6ff;
    }

    .document-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .document-icon.icon-invoice { background: var(--primary); }
    .document-icon.icon-contract { background: #3b82f6; }
    .document-icon.icon-correspondence { background: #6366f1; }
    .document-icon.icon-legal_notice { background: var(--warning); }
    .document-icon.icon-payment_proof { background: var(--success); }
    .document-icon.icon-court_document { background: #7c3aed; }

    .document-info {
      flex: 1;
    }

    .document-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 2px;
    }

    .document-meta {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 2px;
    }

    .document-date {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .document-actions {
      display: flex;
      gap: 4px;
    }

    .no-documents {
      text-align: center;
      padding: 32px;
      color: var(--text-secondary);
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 400px;
      overflow-y: auto;
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

      .case-meta {
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