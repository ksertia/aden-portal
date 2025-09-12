import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CedantService } from '../../services/cedant.service';
import { AuthService } from '../../services/auth.service';
import { CedantPortfolio, PortfolioStatus, PortfolioDocumentType } from '../../models/case.model';

@Component({
  selector: 'app-cedant-portfolios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="portfolios-container">
      <div class="portfolios-header fade-in-up">
        <div class="header-content">
          <div>
            <h1>Mes Portefeuilles</h1>
            <p>Gérez vos portefeuilles de créances et suivez leur processus de vente</p>
          </div>
          <button class="btn btn-primary" (click)="showCreateModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouveau portefeuille
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
              <div class="stat-value">{{ statistics.totalPortfolios }}</div>
              <div class="stat-label">Portefeuilles totaux</div>
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
              <div class="stat-value">{{ statistics.activePortfolios }}</div>
              <div class="stat-label">En cours d'évaluation</div>
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
              <div class="stat-value">{{ statistics.soldPortfolios }}</div>
              <div class="stat-label">Portefeuilles vendus</div>
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
              <div class="stat-value">{{ formatCurrency(statistics.totalSold) }}</div>
              <div class="stat-label">Montant vendu</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des portefeuilles -->
      <div class="portfolios-content fade-in-up">
        <div class="portfolios-list" *ngIf="portfolios.length > 0; else noPortfolios">
          <div class="portfolios-grid">
            <div class="portfolio-card" *ngFor="let portfolio of portfolios">
              <div class="portfolio-header">
                <div class="portfolio-info">
                  <h3>{{ portfolio.name }}</h3>
                  <p class="portfolio-description">{{ portfolio.description }}</p>
                </div>
                <span class="status-badge" [ngClass]="'status-' + portfolio.status">
                  {{ getStatusLabel(portfolio.status) }}
                </span>
              </div>
              
              <div class="portfolio-body">
                <div class="portfolio-stats">
                  <div class="stat-item">
                    <span class="stat-label">Factures</span>
                    <span class="stat-value">{{ portfolio.invoicesCount }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Montant total</span>
                    <span class="stat-value">{{ formatCurrency(portfolio.totalAmount) }}</span>
                  </div>
                  <div class="stat-item" *ngIf="portfolio.salePrice">
                    <span class="stat-label">Prix de vente</span>
                    <span class="stat-value success">{{ formatCurrency(portfolio.salePrice) }}</span>
                  </div>
                </div>
                
                <div class="portfolio-timeline">
                  <div class="timeline-step" [ngClass]="{'completed': portfolio.createdAt}">
                    <div class="step-icon">1</div>
                    <div class="step-content">
                      <div class="step-title">Création</div>
                      <div class="step-date">{{ formatDate(portfolio.createdAt) }}</div>
                    </div>
                  </div>
                  
                  <div class="timeline-step" [ngClass]="{'completed': portfolio.submittedAt}">
                    <div class="step-icon">2</div>
                    <div class="step-content">
                      <div class="step-title">Soumission</div>
                      <div class="step-date" *ngIf="portfolio.submittedAt">{{ formatDate(portfolio.submittedAt) }}</div>
                    </div>
                  </div>
                  
                  <div class="timeline-step" [ngClass]="{'completed': portfolio.evaluatedAt}">
                    <div class="step-icon">3</div>
                    <div class="step-content">
                      <div class="step-title">Évaluation</div>
                      <div class="step-date" *ngIf="portfolio.evaluatedAt">{{ formatDate(portfolio.evaluatedAt) }}</div>
                    </div>
                  </div>
                  
                  <div class="timeline-step" [ngClass]="{'completed': portfolio.soldAt}">
                    <div class="step-icon">4</div>
                    <div class="step-content">
                      <div class="step-title">Vente</div>
                      <div class="step-date" *ngIf="portfolio.soldAt">{{ formatDate(portfolio.soldAt) }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="portfolio-actions">
                  <button class="btn btn-primary small" (click)="viewPortfolio(portfolio)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Détails
                  </button>
                  <button class="btn btn-secondary small" (click)="editPortfolio(portfolio)" *ngIf="portfolio.status === 'draft'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifier
                  </button>
                  <button class="btn btn-success small" (click)="submitPortfolio(portfolio)" *ngIf="portfolio.status === 'draft'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                    Soumettre
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noPortfolios>
          <div class="no-portfolios">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <h3>Aucun portefeuille créé</h3>
            <p>Créez votre premier portefeuille de créances pour commencer le processus de vente.</p>
            <button class="btn btn-primary" (click)="showCreateModal = true">
              Créer un portefeuille
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Modal création de portefeuille -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="closeCreateModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Créer un nouveau portefeuille</h3>
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
                <h4>Informations générales</h4>
                <div class="form-group">
                  <label>Nom du portefeuille</label>
                  <input type="text" [(ngModel)]="newPortfolio.name" placeholder="Ex: Portefeuille Q1 2024">
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea
                    [(ngModel)]="newPortfolio.description"
                    rows="3"
                    placeholder="Décrivez le contenu de ce portefeuille..."
                  ></textarea>
                </div>
              </div>
              
              <div class="form-section">
                <h4>Informations financières</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>Montant total des créances</label>
                    <input type="number" [(ngModel)]="newPortfolio.totalAmount" min="1" step="0.01">
                  </div>
                  <div class="form-group">
                    <label>Nombre de factures</label>
                    <input type="number" [(ngModel)]="newPortfolio.invoicesCount" min="1">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeCreateModal()">Annuler</button>
            <button class="btn btn-primary" (click)="createPortfolio()" [disabled]="!isCreateFormValid()">
              Créer le portefeuille
            </button>
          </div>
        </div>
      </div>

      <!-- Modal détails du portefeuille -->
      <div class="modal-overlay" *ngIf="showDetailsModal" (click)="closeDetailsModal()">
        <div class="modal-content extra-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ selectedPortfolio?.name }}</h3>
            <button class="modal-close" (click)="closeDetailsModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedPortfolio">
            <div class="portfolio-details">
              <!-- Informations générales -->
              <div class="details-section">
                <h4>Informations générales</h4>
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-label">Statut</span>
                    <span class="status-badge" [ngClass]="'status-' + selectedPortfolio.status">
                      {{ getStatusLabel(selectedPortfolio.status) }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Créé le</span>
                    <span class="detail-value">{{ formatDate(selectedPortfolio.createdAt) }}</span>
                  </div>
                  <div class="detail-item" *ngIf="selectedPortfolio.submittedAt">
                    <span class="detail-label">Soumis le</span>
                    <span class="detail-value">{{ formatDate(selectedPortfolio.submittedAt) }}</span>
                  </div>
                  <div class="detail-item" *ngIf="selectedPortfolio.soldAt">
                    <span class="detail-label">Vendu le</span>
                    <span class="detail-value">{{ formatDate(selectedPortfolio.soldAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Analyse financière -->
              <div class="details-section">
                <h4>Analyse financière</h4>
                <div class="financial-summary">
                  <div class="financial-card">
                    <div class="card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <div class="card-content">
                      <div class="card-value">{{ formatCurrency(selectedPortfolio.totalAmount) }}</div>
                      <div class="card-label">Montant total</div>
                    </div>
                  </div>
                  <div class="financial-card" *ngIf="selectedPortfolio.salePrice">
                    <div class="card-icon success">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="9"/>
                      </svg>
                    </div>
                    <div class="card-content">
                      <div class="card-value">{{ formatCurrency(selectedPortfolio.salePrice) }}</div>
                      <div class="card-label">Prix de vente</div>
                    </div>
                  </div>
                  <div class="financial-card">
                    <div class="card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <div class="card-content">
                      <div class="card-value">{{ selectedPortfolio.invoicesCount }}</div>
                      <div class="card-label">Factures</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Documents -->
              <div class="details-section">
                <div class="section-header">
                  <h4>Documents du portefeuille ({{ selectedPortfolio.documents.length }})</h4>
                  <button class="btn btn-secondary small" (click)="showUploadModal = true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17,8 12,3 7,8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Ajouter
                  </button>
                </div>
                <div class="documents-list" *ngIf="selectedPortfolio.documents.length > 0; else noDocuments">
                  <div class="document-item" *ngFor="let doc of selectedPortfolio.documents">
                    <div class="document-icon" [ngClass]="'icon-' + doc.type">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <div class="document-info">
                      <div class="document-name">{{ doc.name }}</div>
                      <div class="document-meta">{{ getDocumentTypeLabel(doc.type) }} • {{ formatDate(doc.uploadedAt) }}</div>
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
                <ng-template #noDocuments>
                  <div class="no-documents">
                    <p>Aucun document ajouté</p>
                    <button class="btn btn-primary small" (click)="showUploadModal = true">
                      Ajouter le premier document
                    </button>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeDetailsModal()">Fermer</button>
            <button class="btn btn-primary" (click)="downloadPortfolioReport(selectedPortfolio!)">
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

      <!-- Modal upload de document -->
      <div class="modal-overlay" *ngIf="showUploadModal" (click)="closeUploadModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Ajouter un document</h3>
            <button class="modal-close" (click)="closeUploadModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="upload-form">
              <div class="form-group">
                <label>Type de document</label>
                <select [(ngModel)]="newDocument.type" required>
                  <option value="">Sélectionner un type</option>
                  <option value="portfolio_summary">Synthèse du portefeuille</option>
                  <option value="aging_report">Rapport d'ancienneté</option>
                  <option value="debtor_analysis">Analyse des débiteurs</option>
                  <option value="legal_documents">Documents légaux</option>
                  <option value="contracts">Contrats</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Nom du document</label>
                <input
                  type="text"
                  [(ngModel)]="newDocument.name"
                  placeholder="Nom du fichier"
                  required
                >
              </div>
              
              <div class="form-group">
                <label>Fichier</label>
                <div class="file-upload">
                  <input type="file" id="fileInput" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,.xls,.xlsx">
                  <label for="fileInput" class="file-upload-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17,8 12,3 7,8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>{{ selectedFile ? selectedFile.name : 'Choisir un fichier' }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeUploadModal()">Annuler</button>
            <button class="btn btn-primary" (click)="uploadDocument()" [disabled]="!isUploadValid()">
              Ajouter le document
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .portfolios-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .portfolios-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .portfolios-header p {
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

    .portfolios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .portfolio-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      transition: all 0.2s ease;
    }

    .portfolio-card:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .portfolio-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .portfolio-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .portfolio-description {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .portfolio-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-item {
      text-align: center;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .stat-label {
      display: block;
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
    }

    .stat-value.success {
      color: var(--success);
    }

    .portfolio-timeline {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      position: relative;
    }

    .portfolio-timeline::before {
      content: '';
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      height: 2px;
      background: #e2e8f0;
      z-index: 1;
    }

    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .step-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e2e8f0;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 8px;
    }

    .timeline-step.completed .step-icon {
      background: var(--success);
      color: white;
    }

    .step-content {
      text-align: center;
    }

    .step-title {
      font-size: 12px;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 2px;
    }

    .step-date {
      font-size: 10px;
      color: var(--text-secondary);
    }

    .portfolio-actions {
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

    .no-portfolios {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-secondary);
    }

    .no-portfolios svg {
      margin-bottom: 24px;
      color: var(--text-secondary);
    }

    .no-portfolios h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .no-portfolios p {
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

    .modal-content.extra-large {
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

    .details-section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
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

    .financial-summary {
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
      background: #f8fafc;
    }

    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      background: var(--primary);
    }

    .card-icon.success {
      background: var(--success);
    }

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

    .no-documents {
      text-align: center;
      padding: 32px;
      color: var(--text-secondary);
    }

    .file-upload {
      position: relative;
    }

    .file-upload input[type="file"] {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    .file-upload-label {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 2px dashed var(--border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #f8fafc;
    }

    .file-upload-label:hover {
      border-color: var(--primary);
      background: #eff6ff;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid var(--border);
    }

    .status-draft { background: #f3f4f6; color: #374151; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .status-under_evaluation { background: #fef3c7; color: #92400e; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-sold { background: #ecfdf5; color: #047857; }

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
      .portfolios-grid {
        grid-template-columns: 1fr;
      }

      .financial-summary {
        grid-template-columns: 1fr;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .portfolios-container {
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

      .portfolio-stats {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CedantPortfoliosComponent implements OnInit {
  portfolios: CedantPortfolio[] = [];
  statistics: any = null;
  
  showCreateModal = false;
  showDetailsModal = false;
  showUploadModal = false;
  selectedPortfolio: CedantPortfolio | null = null;
  selectedFile: File | null = null;
  
  newPortfolio = {
    name: '',
    description: '',
    totalAmount: 0,
    invoicesCount: 0
  };
  
  newDocument = {
    name: '',
    type: ''
  };

  constructor(
    private cedantService: CedantService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPortfolios();
    this.loadStatistics();
  }

  loadPortfolios() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.cedantService.getPortfolios(currentUser.id).subscribe(portfolios => {
      this.portfolios = portfolios;
    });
  }

  loadStatistics() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.cedantService.getStatistics(currentUser.id).subscribe(stats => {
      this.statistics = stats;
    });
  }

  isCreateFormValid(): boolean {
    return !!(this.newPortfolio.name && this.newPortfolio.description && 
              this.newPortfolio.totalAmount > 0 && this.newPortfolio.invoicesCount > 0);
  }

  createPortfolio() {
    if (!this.isCreateFormValid()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const portfolioData = {
      ...this.newPortfolio,
      cedantId: currentUser.id,
      status: PortfolioStatus.DRAFT
    };

    this.cedantService.createPortfolio(portfolioData).subscribe({
      next: (portfolio) => {
        this.portfolios.unshift(portfolio);
        this.closeCreateModal();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
      }
    });
  }

  viewPortfolio(portfolio: CedantPortfolio) {
    this.selectedPortfolio = portfolio;
    this.showDetailsModal = true;
  }

  editPortfolio(portfolio: CedantPortfolio) {
    console.log('Modifier le portefeuille:', portfolio.name);
    // TODO: Implémenter l'édition
  }

  submitPortfolio(portfolio: CedantPortfolio) {
    this.cedantService.submitPortfolio(portfolio.id).subscribe({
      next: (updatedPortfolio) => {
        const index = this.portfolios.findIndex(p => p.id === portfolio.id);
        if (index >= 0) {
          this.portfolios[index] = updatedPortfolio;
        }
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Erreur lors de la soumission:', error);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      if (!this.newDocument.name) {
        this.newDocument.name = file.name;
      }
    }
  }

  isUploadValid(): boolean {
    return !!(this.newDocument.name && this.newDocument.type && this.selectedFile);
  }

  uploadDocument() {
    if (!this.isUploadValid() || !this.selectedPortfolio) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const documentData = {
      name: this.newDocument.name,
      type: this.newDocument.type as PortfolioDocumentType,
      url: '#',
      uploadedBy: `${currentUser.firstName} ${currentUser.lastName}`
    };

    this.cedantService.uploadPortfolioDocument(this.selectedPortfolio.id, documentData).subscribe({
      next: (document) => {
        if (this.selectedPortfolio) {
          this.selectedPortfolio.documents.push(document);
        }
        this.closeUploadModal();
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload:', error);
      }
    });
  }

  downloadDocument(doc: any) {
    console.log('Télécharger document:', doc.name);
    // TODO: Implémenter le téléchargement
  }

  downloadPortfolioReport(portfolio: CedantPortfolio) {
    console.log('Télécharger rapport du portefeuille:', portfolio.name);
    // TODO: Implémenter le téléchargement de rapport
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
      'draft': 'Brouillon',
      'submitted': 'Soumis',
      'under_evaluation': 'En évaluation',
      'approved': 'Approuvé',
      'rejected': 'Rejeté',
      'sold': 'Vendu'
    };
    return labels[status] || status;
  }

  getDocumentTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'portfolio_summary': 'Synthèse du portefeuille',
      'aging_report': 'Rapport d\'ancienneté',
      'debtor_analysis': 'Analyse des débiteurs',
      'legal_documents': 'Documents légaux',
      'contracts': 'Contrats',
      'other': 'Autre'
    };
    return labels[type] || type;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newPortfolio = {
      name: '',
      description: '',
      totalAmount: 0,
      invoicesCount: 0
    };
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedPortfolio = null;
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.newDocument = {
      name: '',
      type: ''
    };
  }
}