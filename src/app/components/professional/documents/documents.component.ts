import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseDocument, DocumentType } from '../../../models/case.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent],
  template: `
    <div class="documents-container">
      <div class="documents-header fade-in-up">
        <div class="header-content">
          <div>
            <h1>Gestion des Documents</h1>
            <p>Gérez tous les documents liés aux dossiers de recouvrement</p>
          </div>
          <button class="btn btn-primary" (click)="showUploadModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Ajouter un document
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-section fade-in-up">
        <div class="filters-card">
          <div class="filters-grid">
            <div class="filter-group">
              <label>Rechercher</label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Nom du document, dossier..."
                (input)="filterDocuments()"
              >
            </div>
            
            <div class="filter-group">
              <label>Type de document</label>
              <select [(ngModel)]="selectedDocumentType" (change)="filterDocuments()">
                <option value="">Tous les types</option>
                <option value="invoice">Factures</option>
                <option value="contract">Contrats</option>
                <option value="correspondence">Correspondances</option>
                <option value="legal_notice">Mises en demeure</option>
                <option value="payment_proof">Preuves de paiement</option>
                <option value="court_document">Documents judiciaires</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Dossier</label>
              <select [(ngModel)]="selectedCaseId" (change)="filterDocuments()">
                <option value="">Tous les dossiers</option>
                <option *ngFor="let case of cases" [value]="case.id">
                  {{ case.caseNumber }} - {{ case.debtor.firstName }} {{ case.debtor.lastName }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques des documents -->
      <div class="stats-section fade-in-up">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ allDocuments.length }}</div>
              <div class="stat-label">Documents totaux</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ getLegalDocumentsCount() }}</div>
              <div class="stat-label">Documents légaux</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ getPaymentProofsCount() }}</div>
              <div class="stat-label">Preuves de paiement</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des documents -->
      <div class="documents-list fade-in-up">
        <div class="documents-content" *ngIf="filteredDocuments.length > 0; else noDocuments">
          <div class="list-header">
            <h3>Documents ({{ filteredDocuments.length }})</h3>
            <app-view-toggle 
              [currentView]="currentView" 
              (viewChange)="currentView = $event">
            </app-view-toggle>
          </div>
          
          <!-- Vue grille -->
          <div class="documents-grid" *ngIf="currentView === 'grid'">
            <div class="document-card" *ngFor="let doc of filteredDocuments">
              <div class="document-header">
                <div class="document-icon" [ngClass]="'icon-' + doc.type">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                </div>
                <div class="document-info">
                  <h3>{{ doc.name }}</h3>
                  <p class="document-type">{{ getDocumentTypeLabel(doc.type) }}</p>
                </div>
                <div class="document-actions">
                  <button class="btn btn-primary small" (click)="downloadDocument(doc)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                  <button class="btn btn-secondary small" (click)="viewDocument(doc)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button class="btn btn-secondary small" (click)="deleteDocument(doc)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="document-details">
                <div class="detail-row">
                  <span class="label">Dossier :</span>
                  <span class="value">{{ getCaseNumber(doc.caseId) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Ajouté le :</span>
                  <span class="value">{{ formatDate(doc.uploadedAt) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Par :</span>
                  <span class="value">{{ doc.uploadedBy }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Vue tableau -->
          <div class="documents-table-container" *ngIf="currentView === 'table'">
            <table class="documents-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Dossier</th>
                  <th>Ajouté le</th>
                  <th>Ajouté par</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let doc of filteredDocuments" class="document-row">
                  <td>
                    <div class="document-cell">
                      <div class="document-icon-small" [ngClass]="'icon-' + doc.type">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                        </svg>
                      </div>
                      <div class="document-name">{{ doc.name }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="document-type-badge" [ngClass]="'type-' + doc.type">
                      {{ getDocumentTypeLabel(doc.type) }}
                    </span>
                  </td>
                  <td>
                    <div class="case-link">{{ getCaseNumber(doc.caseId) }}</div>
                  </td>
                  <td>
                    <div class="date-cell">{{ formatDate(doc.uploadedAt) }}</div>
                  </td>
                  <td>
                    <div class="user-cell">{{ doc.uploadedBy }}</div>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="btn btn-primary small" (click)="downloadDocument(doc)" title="Télécharger">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                      <button class="btn btn-secondary small" (click)="viewDocument(doc)" title="Voir">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button class="btn btn-secondary small" (click)="deleteDocument(doc)" title="Supprimer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ng-template #noDocuments>
          <div class="no-documents">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <h3>Aucun document trouvé</h3>
            <p>Aucun document ne correspond aux critères sélectionnés.</p>
          </div>
        </ng-template>
      </div>

      <!-- Modal d'upload -->
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
                <label>Dossier associé</label>
                <select [(ngModel)]="newDocument.caseId" required>
                  <option value="">Sélectionner un dossier</option>
                  <option *ngFor="let case of cases" [value]="case.id">
                    {{ case.caseNumber }} - {{ case.debtor.firstName }} {{ case.debtor.lastName }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Type de document</label>
                <select [(ngModel)]="newDocument.type" required>
                  <option value="">Sélectionner un type</option>
                  <option value="invoice">Facture</option>
                  <option value="contract">Contrat</option>
                  <option value="correspondence">Correspondance</option>
                  <option value="legal_notice">Mise en demeure</option>
                  <option value="payment_proof">Preuve de paiement</option>
                  <option value="court_document">Document judiciaire</option>
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
                  <input type="file" id="fileInput" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,.jpg,.png">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Ajouter le document
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .documents-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .documents-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .documents-header p {
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
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

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

    .documents-table-container {
      background: var(--surface);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .documents-table {
      width: 100%;
      border-collapse: collapse;
    }

    .documents-table th {
      background: #f8fafc;
      padding: 16px 12px;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    .documents-table td {
      padding: 16px 12px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .document-row:hover {
      background: #f8fafc;
    }

    .document-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .document-icon-small {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .document-icon-small.icon-invoice { background: var(--primary); }
    .document-icon-small.icon-contract { background: #3b82f6; }
    .document-icon-small.icon-correspondence { background: #6366f1; }
    .document-icon-small.icon-legal_notice { background: var(--warning); }
    .document-icon-small.icon-payment_proof { background: var(--success); }
    .document-icon-small.icon-court_document { background: #7c3aed; }

    .document-name {
      font-weight: 500;
      color: var(--text);
      font-size: 14px;
    }

    .document-type-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .document-type-badge.type-invoice { background: #dbeafe; color: #1e40af; }
    .document-type-badge.type-contract { background: #e0e7ff; color: #3730a3; }
    .document-type-badge.type-correspondence { background: #f3e8ff; color: #6b21a8; }
    .document-type-badge.type-legal_notice { background: #fef3c7; color: #92400e; }
    .document-type-badge.type-payment_proof { background: #d1fae5; color: #065f46; }
    .document-type-badge.type-court_document { background: #fdf2f8; color: #be185d; }

    .case-link {
      font-weight: 500;
      color: var(--primary);
      font-size: 14px;
    }

    .date-cell, .user-cell {
      font-size: 14px;
      color: var(--text);
    }

    .table-actions {
      display: flex;
      gap: 4px;
    }

    .document-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .document-card:hover {
      border-color: var(--primary);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .document-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-bottom: 1px solid var(--border);
    }

    .document-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
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

    .document-info h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .document-type {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .document-actions {
      display: flex;
      gap: 4px;
    }

    .document-details {
      padding: 20px;
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

    .btn.small {
      padding: 6px 8px;
      font-size: 12px;
    }

    .no-documents {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-secondary);
    }

    .no-documents svg {
      margin-bottom: 24px;
      color: var(--text-secondary);
    }

    .no-documents h3 {
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
    .form-group select {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 16px;
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
      .documents-container {
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

      .documents-grid {
        grid-template-columns: 1fr;
      }

      .document-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .document-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .documents-table-container {
        overflow-x: auto;
      }

      .documents-table {
        min-width: 700px;
      }
    }
  `]
})
export class DocumentsComponent implements OnInit {
  cases: DebtCase[] = [];
  allDocuments: (CaseDocument & { caseId: string })[] = [];
  filteredDocuments: (CaseDocument & { caseId: string })[] = [];
  currentView: 'grid' | 'table' = 'grid';
  
  searchTerm = '';
  selectedDocumentType = '';
  selectedCaseId = '';
  
  showUploadModal = false;
  selectedFile: File | null = null;
  
  newDocument = {
    caseId: '',
    type: '',
    name: ''
  };

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCasesByUserId(currentUser.id, currentUser.role)
      .subscribe(cases => {
        this.cases = cases;
        this.extractDocuments();
      });
  }

  extractDocuments() {
    this.allDocuments = [];
    this.cases.forEach(case_ => {
      case_.documents.forEach(doc => {
        this.allDocuments.push({ ...doc, caseId: case_.id });
      });
    });
    this.filteredDocuments = [...this.allDocuments];
  }

  filterDocuments() {
    this.filteredDocuments = this.allDocuments.filter(doc => {
      const matchesSearch = !this.searchTerm || 
        doc.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getCaseNumber(doc.caseId).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedDocumentType || doc.type === this.selectedDocumentType;
      const matchesCase = !this.selectedCaseId || doc.caseId === this.selectedCaseId;
      
      return matchesSearch && matchesType && matchesCase;
    });
  }

  getLegalDocumentsCount(): number {
    return this.allDocuments.filter(doc => 
      doc.type === 'legal_notice' || doc.type === 'court_document'
    ).length;
  }

  getPaymentProofsCount(): number {
    return this.allDocuments.filter(doc => doc.type === 'payment_proof').length;
  }

  getCaseNumber(caseId: string): string {
    const case_ = this.cases.find(c => c.id === caseId);
    return case_?.caseNumber || 'N/A';
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    return !!(this.newDocument.caseId && this.newDocument.type && this.newDocument.name && this.selectedFile);
  }

  uploadDocument() {
    if (!this.isUploadValid()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Simulation de l'upload
    const newDoc: CaseDocument & { caseId: string } = {
      id: Date.now().toString(),
      name: this.newDocument.name,
      type: this.newDocument.type as DocumentType,
      url: '#',
      uploadedAt: new Date(),
      uploadedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      caseId: this.newDocument.caseId
    };

    this.allDocuments.unshift(newDoc);
    this.filterDocuments();
    this.closeUploadModal();

    console.log('Document ajouté:', newDoc);
  }

  viewDocument(doc: CaseDocument) {
    console.log('Visualisation du document:', doc.name);
    // TODO: Implémenter la visualisation
  }

  downloadDocument(doc: CaseDocument) {
    console.log('Téléchargement du document:', doc.name);
    // TODO: Implémenter le téléchargement
  }

  deleteDocument(doc: CaseDocument) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.allDocuments = this.allDocuments.filter(d => d.id !== doc.id);
      this.filterDocuments();
      console.log('Document supprimé:', doc.name);
    }
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.newDocument = {
      caseId: '',
      type: '',
      name: ''
    };
  }
}