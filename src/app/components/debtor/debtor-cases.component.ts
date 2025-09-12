import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { AuthService } from '../../services/auth.service';
import { DebtCase, CaseStatus, Priority, ActivityType, PaymentProposal } from '../../models/case.model';

@Component({
  selector: 'app-debtor-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cases-container">
      <div class="cases-header fade-in-up">
        <h1>Mes Dossiers</h1>
        <p>Consultez et gérez vos dossiers de recouvrement</p>
      </div>

      <div class="cases-content fade-in-up">
        <!-- Statistiques -->
        <div class="stats-section" *ngIf="statistics">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ userCases.length }}</div>
                <div class="stat-label">Dossiers actifs</div>
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
                <div class="stat-value">{{ formatCurrency(getTotalDebt()) }}</div>
                <div class="stat-label">Montant total dû</div>
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
                <div class="stat-value">{{ formatCurrency(getTotalPaid()) }}</div>
                <div class="stat-label">Montant payé</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des dossiers -->
        <div class="cases-list" *ngIf="userCases.length > 0; else noCases">
          <div class="cases-grid">
            <div class="case-card" *ngFor="let case of userCases">
              <div class="case-header">
                <div class="case-info">
                  <h3>{{ case.caseNumber }}</h3>
                  <p class="creditor-name">{{ case.creditor.name }}</p>
                </div>
                <span class="status-badge" [ngClass]="'status-' + case.status">
                  {{ getStatusLabel(case.status) }}
                </span>
              </div>
              
              <div class="case-body">
                <!-- Détail de la dette -->
                <div class="debt-breakdown">
                  <h4>Détail de la créance</h4>
                  <div class="breakdown-grid">
                    <div class="breakdown-item">
                      <span class="label">Montant principal</span>
                      <span class="value">{{ formatCurrency(case.debtBreakdown.principalAmount) }}</span>
                    </div>
                    <div class="breakdown-item">
                      <span class="label">Intérêts</span>
                      <span class="value">{{ formatCurrency(case.debtBreakdown.totalInterests) }}</span>
                    </div>
                    <div class="breakdown-item">
                      <span class="label">Pénalités</span>
                      <span class="value">{{ formatCurrency(case.debtBreakdown.totalPenalties) }}</span>
                    </div>
                    <div class="breakdown-item">
                      <span class="label">Frais</span>
                      <span class="value">{{ formatCurrency(case.debtBreakdown.totalFees) }}</span>
                    </div>
                    <div class="breakdown-item total">
                      <span class="label">Total dû</span>
                      <span class="value">{{ formatCurrency(case.amount) }}</span>
                    </div>
                    <div class="breakdown-item paid">
                      <span class="label">Déjà payé</span>
                      <span class="value">{{ formatCurrency(case.amountPaid) }}</span>
                    </div>
                    <div class="breakdown-item remaining">
                      <span class="label">Reste à payer</span>
                      <span class="value">{{ formatCurrency(case.amount - case.amountPaid) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Détail des intérêts -->
                <div class="interests-detail" *ngIf="case.debtBreakdown.interests.length > 0">
                  <h5>Détail des intérêts</h5>
                  <div class="interests-list">
                    <div class="interest-item" *ngFor="let interest of case.debtBreakdown.interests">
                      <div class="interest-info">
                        <span class="interest-type">{{ getInterestTypeLabel(interest.type) }}</span>
                        <span class="interest-rate">{{ interest.rate }}% par an</span>
                      </div>
                      <div class="interest-amount">{{ formatCurrency(interest.amount) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Détail des pénalités -->
                <div class="penalties-detail" *ngIf="case.debtBreakdown.penalties.length > 0">
                  <h5>Détail des pénalités</h5>
                  <div class="penalties-list">
                    <div class="penalty-item" *ngFor="let penalty of case.debtBreakdown.penalties">
                      <div class="penalty-info">
                        <span class="penalty-type">{{ getPenaltyTypeLabel(penalty.type) }}</span>
                        <span class="penalty-date">{{ formatDate(penalty.appliedDate) }}</span>
                      </div>
                      <div class="penalty-amount">{{ formatCurrency(penalty.amount) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Barre de progression -->
                <div class="payment-progress">
                  <div class="progress-info">
                    <span class="progress-label">Progression du paiement</span>
                    <span class="progress-percentage">{{ getPaymentPercentage(case) }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="getPaymentPercentage(case)"></div>
                  </div>
                </div>

                <!-- Historique des relances -->
                <div class="reminder-history" *ngIf="getReminderHistory(case).length > 0">
                  <h5>Historique des relances</h5>
                  <div class="reminder-list">
                    <div class="reminder-item" *ngFor="let reminder of getReminderHistory(case)">
                      <div class="reminder-icon" [ngClass]="getReminderIconClass(reminder.type)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <div class="reminder-content">
                        <div class="reminder-type">{{ getReminderTypeLabel(reminder.type) }}</div>
                        <div class="reminder-description">{{ reminder.description }}</div>
                        <div class="reminder-date">{{ formatDate(reminder.date) }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="case-actions">
                  <button class="btn btn-primary" (click)="makePayment(case)" *ngIf="case.amount > case.amountPaid">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Effectuer un paiement
                  </button>
                  <button class="btn btn-secondary" (click)="proposePaymentPlan(case)" *ngIf="case.amount > case.amountPaid">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                    </svg>
                    Proposer échéancier
                  </button>
                  <button class="btn btn-warning" (click)="fileDispute(case)" *ngIf="case.status !== 'completed'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Contester
                  </button>
                  <button class="btn btn-secondary" (click)="viewCaseDetails(case)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <h3>Aucun dossier trouvé</h3>
            <p>Vous n'avez actuellement aucun dossier de recouvrement.</p>
          </div>
        </ng-template>
      </div>

      <!-- Modal de paiement -->
      <div class="modal-overlay" *ngIf="showPaymentModal" (click)="closePaymentModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Effectuer un paiement</h3>
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
                  <span class="label">Montant total dû</span>
                  <span class="value">{{ formatCurrency(selectedCase.amount) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Déjà payé</span>
                  <span class="value">{{ formatCurrency(selectedCase.amountPaid) }}</span>
                </div>
                <div class="summary-item highlight">
                  <span class="label">Reste à payer</span>
                  <span class="value">{{ formatCurrency(selectedCase.amount - selectedCase.amountPaid) }}</span>
                </div>
              </div>
            </div>
            
            <div class="payment-form">
              <div class="form-group">
                <label>Montant du paiement</label>
                <input
                  type="number"
                  [(ngModel)]="paymentAmount"
                  [max]="selectedCase.amount - selectedCase.amountPaid"
                  min="1"
                  step="0.01"
                  placeholder="Montant en euros"
                >
              </div>
              
              <div class="quick-amounts">
                <button
                  type="button"
                  class="quick-amount-btn"
                  (click)="setPaymentAmount(selectedCase.amount - selectedCase.amountPaid)"
                >
                  Solde complet
                </button>
                <button
                  type="button"
                  class="quick-amount-btn"
                  (click)="setPaymentAmount((selectedCase.amount - selectedCase.amountPaid) / 2)"
                >
                  50% du solde
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closePaymentModal()">Annuler</button>
            <button class="btn btn-primary" (click)="processPayment()" [disabled]="!paymentAmount || paymentAmount <= 0 || isProcessingPayment">
              <span *ngIf="!isProcessingPayment">Confirmer le paiement</span>
              <span *ngIf="isProcessingPayment">Traitement...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal proposition d'échéancier -->
      <div class="modal-overlay" *ngIf="showPaymentPlanModal" (click)="closePaymentPlanModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Proposer un échéancier de paiement</h3>
            <button class="modal-close" (click)="closePaymentPlanModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedCase">
            <div class="payment-plan-form">
              <div class="form-section">
                <h4>Informations du dossier</h4>
                <div class="case-summary">
                  <div class="summary-item">
                    <span class="label">Dossier</span>
                    <span class="value">{{ selectedCase.caseNumber }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Montant restant</span>
                    <span class="value">{{ formatCurrency(selectedCase.amount - selectedCase.amountPaid) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="form-section">
                <h4>Proposition d'échéancier</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>Montant mensuel proposé</label>
                    <input
                      type="number"
                      [(ngModel)]="paymentPlanProposal.monthlyAmount"
                      min="1"
                      step="0.01"
                      (input)="calculatePaymentPlan()"
                    >
                  </div>
                  <div class="form-group">
                    <label>Durée (mois)</label>
                    <input
                      type="number"
                      [(ngModel)]="paymentPlanProposal.duration"
                      min="1"
                      max="60"
                      (input)="calculatePaymentPlan()"
                    >
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Date de début</label>
                  <input
                    type="date"
                    [(ngModel)]="paymentPlanProposal.startDate"
                    [min]="getTomorrowDate()"
                  >
                </div>
                
                <div class="form-group">
                  <label>Justification de la demande</label>
                  <textarea
                    [(ngModel)]="paymentPlanProposal.notes"
                    rows="3"
                    placeholder="Expliquez votre situation et les raisons de cette demande d'échéancier..."
                  ></textarea>
                </div>
              </div>
              
              <div class="payment-plan-preview" *ngIf="paymentPlanProposal.monthlyAmount && paymentPlanProposal.duration">
                <h4>Aperçu de l'échéancier</h4>
                <div class="preview-summary">
                  <div class="preview-item">
                    <span class="label">Montant mensuel</span>
                    <span class="value">{{ formatCurrency(paymentPlanProposal.monthlyAmount) }}</span>
                  </div>
                  <div class="preview-item">
                    <span class="label">Durée</span>
                    <span class="value">{{ paymentPlanProposal.duration }} mois</span>
                  </div>
                  <div class="preview-item">
                    <span class="label">Total à payer</span>
                    <span class="value">{{ formatCurrency(paymentPlanProposal.monthlyAmount * paymentPlanProposal.duration) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closePaymentPlanModal()">Annuler</button>
            <button class="btn btn-primary" (click)="submitPaymentPlan()" [disabled]="!isPaymentPlanValid()">
              Soumettre la proposition
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de contestation -->
      <div class="modal-overlay" *ngIf="showDisputeModal" (click)="closeDisputeModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Contester le dossier</h3>
            <button class="modal-close" (click)="closeDisputeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedCase">
            <div class="dispute-form">
              <div class="form-section">
                <h4>Informations du dossier</h4>
                <div class="case-summary">
                  <div class="summary-item">
                    <span class="label">Dossier</span>
                    <span class="value">{{ selectedCase.caseNumber }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Créancier</span>
                    <span class="value">{{ selectedCase.creditor.name }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Montant contesté</span>
                    <span class="value">{{ formatCurrency(selectedCase.amount) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="form-section">
                <h4>Motif de la contestation</h4>
                <div class="form-group">
                  <label>Sélectionnez le motif principal</label>
                  <select [(ngModel)]="disputeForm.reason" required>
                    <option value="">Choisir un motif</option>
                    <option value="amount_error">Erreur sur le montant</option>
                    <option value="already_paid">Déjà payé</option>
                    <option value="prescription">Prescription</option>
                    <option value="no_contract">Absence de contrat</option>
                    <option value="service_not_received">Service non reçu ou défaillant</option>
                    <option value="interest_calculation_error">Erreur de calcul des intérêts</option>
                    <option value="other">Autre motif</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Description détaillée de la contestation</label>
                  <textarea
                    [(ngModel)]="disputeForm.description"
                    rows="5"
                    placeholder="Expliquez en détail les raisons de votre contestation..."
                    required
                  ></textarea>
                  <small class="form-help">Soyez précis et détaillé dans votre explication</small>
                </div>
              </div>
              
              <div class="form-section">
                <h4>Pièces justificatives</h4>
                <div class="file-upload-area">
                  <input
                    type="file"
                    #fileInput
                    (change)="onFileSelected($event)"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style="display: none"
                  >
                  <div class="file-upload-button" (click)="fileInput.click()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17,8 12,3 7,8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Ajouter des documents
                  </div>
                  <small class="form-help">Formats acceptés : PDF, JPG, PNG, DOC, DOCX (max 10MB par fichier)</small>
                </div>
                
                <div class="uploaded-files" *ngIf="disputeForm.attachments.length > 0">
                  <h5>Documents joints</h5>
                  <div class="file-list">
                    <div class="file-item" *ngFor="let file of disputeForm.attachments; let i = index">
                      <div class="file-info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                        </svg>
                        <div>
                          <div class="file-name">{{ file.name }}</div>
                          <div class="file-size">{{ formatFileSize(file.size) }}</div>
                        </div>
                      </div>
                      <button class="remove-file-btn" (click)="removeFile(i)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="dispute-warning">
                <div class="warning-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div class="warning-content">
                  <h5>Information importante</h5>
                  <p>
                    La contestation suspendra temporairement les procédures de recouvrement. 
                    Assurez-vous de fournir tous les éléments justificatifs nécessaires. 
                    Une contestation abusive peut entraîner des frais supplémentaires.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeDisputeModal()">Annuler</button>
            <button class="btn btn-warning" (click)="submitDispute()" [disabled]="!isDisputeValid() || isSubmittingDispute">
              <span *ngIf="!isSubmittingDispute">Soumettre la contestation</span>
              <span *ngIf="isSubmittingDispute">Envoi en cours...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cases-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .cases-header {
      margin-bottom: 32px;
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
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
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
      gap: 24px;
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

    .case-cell, .creditor-cell, .amount-cell {
      display: flex;
      flex-direction: column;
    }

    .case-number, .creditor-name {
      font-weight: 600;
      color: var(--text);
      font-size: 14px;
      margin-bottom: 2px;
    }

    .case-date, .creditor-contact {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .amount-cell .amount-value {
      font-weight: 600;
      font-size: 14px;
    }

    .amount-cell.paid .amount-value {
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
      margin-bottom: 24px;
    }

    .case-info h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .creditor-name {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .debt-breakdown {
      margin-bottom: 24px;
    }

    .debt-breakdown h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
    }

    .breakdown-grid {
      display: grid;
      gap: 8px;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .breakdown-item:last-child {
      border-bottom: none;
    }

    .breakdown-item.total {
      font-weight: 600;
      border-top: 2px solid var(--border);
      padding-top: 12px;
      margin-top: 8px;
    }

    .breakdown-item.paid .value {
      color: var(--success);
    }

    .breakdown-item.remaining .value {
      color: var(--warning);
      font-weight: 600;
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

    .interests-detail, .penalties-detail {
      margin-bottom: 20px;
    }

    .interests-detail h5, .penalties-detail h5 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 12px;
    }

    .interest-item, .penalty-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .interest-info, .penalty-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .interest-type, .penalty-type {
      font-size: 12px;
      font-weight: 500;
      color: var(--text);
    }

    .interest-rate, .penalty-date {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .interest-amount, .penalty-amount {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
    }

    .payment-progress {
      margin-bottom: 24px;
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

    .reminder-history {
      margin-bottom: 24px;
    }

    .reminder-history h5 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 12px;
    }

    .reminder-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .reminder-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .reminder-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .reminder-icon.email { background: var(--primary); }
    .reminder-icon.phone { background: var(--success); }
    .reminder-icon.mail { background: var(--warning); }
    .reminder-icon.legal { background: var(--error); }

    .reminder-content {
      flex: 1;
    }

    .reminder-type {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 2px;
    }

    .reminder-description {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .reminder-date {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .case-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
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

    .quick-amounts {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .quick-amount-btn {
      padding: 8px 16px;
      background: #f1f5f9;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .quick-amount-btn:hover {
      background: #e2e8f0;
    }

    .form-section {
      margin-bottom: 32px;
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

    .case-summary {
      display: grid;
      gap: 12px;
    }

    .payment-plan-preview {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .payment-plan-preview h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
    }

    .preview-summary {
      display: grid;
      gap: 8px;
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid var(--border);
    }

    .form-help {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
      display: block;
    }

    .file-upload-area {
      margin-bottom: 16px;
    }

    .file-upload-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: #f1f5f9;
      border: 2px dashed var(--border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      color: var(--text);
    }

    .file-upload-button:hover {
      background: #e2e8f0;
      border-color: var(--primary);
    }

    .uploaded-files {
      margin-top: 16px;
    }

    .uploaded-files h5 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 12px;
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px solid var(--border);
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .file-name {
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
    }

    .file-size {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .remove-file-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--error);
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    .remove-file-btn:hover {
      background: #fee2e2;
    }

    .dispute-warning {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      margin-top: 24px;
    }

    .warning-icon {
      color: #f59e0b;
      flex-shrink: 0;
    }

    .warning-content h5 {
      font-size: 14px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
    }

    .warning-content p {
      font-size: 13px;
      color: #92400e;
      line-height: 1.5;
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

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .case-actions {
        flex-direction: column;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DebtorCasesComponent implements OnInit {
  userCases: DebtCase[] = [];
  statistics: any = null;
  
  showPaymentModal = false;
  showPaymentPlanModal = false;
  showDisputeModal = false;
  selectedCase: DebtCase | null = null;
  
  paymentAmount = 0;
  isProcessingPayment = false;
  
  paymentPlanProposal = {
    monthlyAmount: 0,
    duration: 0,
    startDate: '',
    notes: ''
  };

  disputeForm = {
    reason: '',
    description: '',
    attachments: [] as File[]
  };

  isSubmittingDispute = false;

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserCases();
    this.loadStatistics();
  }

  loadUserCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCasesByUserId(currentUser.id, currentUser.role)
      .subscribe(cases => {
        this.userCases = cases;
      });
  }

  loadStatistics() {
    this.caseService.getStatistics()
      .subscribe(stats => {
        this.statistics = stats;
      });
  }

  getTotalDebt(): number {
    return this.userCases.reduce((sum, case_) => sum + (case_.amount - case_.amountPaid), 0);
  }

  getTotalPaid(): number {
    return this.userCases.reduce((sum, case_) => sum + case_.amountPaid, 0);
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
      month: 'long',
      day: 'numeric'
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  getInterestTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'legal': 'Intérêts légaux',
      'contractual': 'Intérêts contractuels',
      'delay': 'Intérêts de retard'
    };
    return labels[type] || type;
  }

  getPenaltyTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'late_payment': 'Pénalité de retard',
      'breach': 'Pénalité de rupture',
      'administrative': 'Pénalité administrative'
    };
    return labels[type] || type;
  }

  getReminderHistory(case_: DebtCase) {
    return case_.history.filter(activity => 
      activity.type === ActivityType.REMINDER_SENT || 
      activity.type === ActivityType.FORMAL_NOTICE_SENT ||
      activity.type === ActivityType.CORRESPONDENCE_SENT
    );
  }

  getReminderTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      [ActivityType.REMINDER_SENT]: 'Relance',
      [ActivityType.FORMAL_NOTICE_SENT]: 'Mise en demeure',
      [ActivityType.CORRESPONDENCE_SENT]: 'Correspondance'
    };
    return labels[type] || 'Communication';
  }

  getReminderIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      [ActivityType.REMINDER_SENT]: 'email',
      [ActivityType.FORMAL_NOTICE_SENT]: 'legal',
      [ActivityType.CORRESPONDENCE_SENT]: 'mail'
    };
    return classes[type] || 'email';
  }

  makePayment(case_: DebtCase) {
    this.selectedCase = case_;
    this.paymentAmount = 0;
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedCase = null;
    this.paymentAmount = 0;
    this.isProcessingPayment = false;
  }

  setPaymentAmount(amount: number) {
    this.paymentAmount = Math.round(amount * 100) / 100;
  }

  processPayment() {
    if (!this.selectedCase || this.paymentAmount <= 0) return;

    this.isProcessingPayment = true;

    this.caseService.createPayment(this.selectedCase.id, this.paymentAmount)
      .subscribe({
        next: (updatedCase) => {
          const caseIndex = this.userCases.findIndex(c => c.id === updatedCase.id);
          if (caseIndex >= 0) {
            this.userCases[caseIndex] = updatedCase;
          }
          this.closePaymentModal();
        },
        error: (error) => {
          console.error('Erreur lors du paiement:', error);
          this.isProcessingPayment = false;
        }
      });
  }

  proposePaymentPlan(case_: DebtCase) {
    this.selectedCase = case_;
    this.paymentPlanProposal = {
      monthlyAmount: 0,
      duration: 0,
      startDate: this.getTomorrowDate(),
      notes: ''
    };
    this.showPaymentPlanModal = true;
  }

  closePaymentPlanModal() {
    this.showPaymentPlanModal = false;
    this.selectedCase = null;
  }

  calculatePaymentPlan() {
    if (this.paymentPlanProposal.monthlyAmount > 0 && this.selectedCase) {
      const remainingAmount = this.selectedCase.amount - this.selectedCase.amountPaid;
      this.paymentPlanProposal.duration = Math.ceil(remainingAmount / this.paymentPlanProposal.monthlyAmount);
    }
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  isPaymentPlanValid(): boolean {
    return this.paymentPlanProposal.monthlyAmount > 0 &&
           this.paymentPlanProposal.duration > 0 &&
           this.paymentPlanProposal.startDate !== '' &&
           this.paymentPlanProposal.notes.trim() !== '';
  }

  submitPaymentPlan() {
    if (!this.selectedCase || !this.isPaymentPlanValid()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const proposal: Omit<PaymentProposal, 'id' | 'createdAt'> = {
      caseId: this.selectedCase.id,
      proposedBy: currentUser.id,
      totalAmount: this.selectedCase.amount - this.selectedCase.amountPaid,
      monthlyAmount: this.paymentPlanProposal.monthlyAmount,
      duration: this.paymentPlanProposal.duration,
      startDate: new Date(this.paymentPlanProposal.startDate),
      status: 'pending',
      notes: this.paymentPlanProposal.notes
    };

    this.caseService.createPaymentProposal(proposal)
      .subscribe({
        next: () => {
          this.closePaymentPlanModal();
        },
        error: (error) => {
          console.error('Erreur lors de la soumission:', error);
        }
      });
  }

  fileDispute(case_: DebtCase) {
    this.selectedCase = case_;
    this.disputeForm = {
      reason: '',
      description: '',
      attachments: []
    };
    this.showDisputeModal = true;
  }

  closeDisputeModal() {
    this.showDisputeModal = false;
    this.selectedCase = null;
    this.disputeForm = {
      reason: '',
      description: '',
      attachments: []
    };
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      if (file.size <= 10 * 1024 * 1024) { // 10MB max
        this.disputeForm.attachments.push(file);
      }
    });
  }

  removeFile(index: number) {
    this.disputeForm.attachments.splice(index, 1);
  }

  isDisputeValid(): boolean {
    return this.disputeForm.reason !== '' && 
           this.disputeForm.description.trim() !== '';
  }

  submitDispute() {
    if (!this.selectedCase || !this.isDisputeValid()) return;

    this.isSubmittingDispute = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Simulation de l'envoi de contestation
    const disputeNote = {
      caseId: this.selectedCase.id,
      content: `Contestation déposée - Motif: ${this.disputeForm.reason} - Description: ${this.disputeForm.description}`,
      type: 'legal' as const,
      createdBy: currentUser.id,
      createdByName: `${currentUser.firstName} ${currentUser.lastName}`,
      isPrivate: false
    };

    this.caseService.addCaseNote(disputeNote).subscribe({
      next: () => {
        this.isSubmittingDispute = false;
        this.closeDisputeModal();
      },
      error: (error) => {
        console.error('Erreur lors de la contestation:', error);
        this.isSubmittingDispute = false;
      }
    });
  }

  viewCaseDetails(case_: DebtCase) {
    console.log('Voir détails du dossier:', case_.caseNumber);
  }
}