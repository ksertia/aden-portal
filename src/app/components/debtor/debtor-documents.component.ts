import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { AuthService } from '../../services/auth.service';
import { DebtCase, CaseDocument, DocumentType } from '../../models/case.model';

@Component({
  selector: 'app-debtor-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="documents-container">
      <div class="documents-header fade-in-up">
        <h1>Mes Documents</h1>
        <p>Consultez tous les documents liés à vos dossiers de recouvrement</p>
      </div>

      <div class="documents-content fade-in-up">
        <!-- Filtres -->
        <div class="filters-section">
          <div class="filters-card">
            <div class="filters-grid">
              <div class="filter-group">
                <label>Rechercher un document</label>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  placeholder="Nom du document, type..."
                  (input)="filterDocuments()"
                >
              </div>
              
              <div class="filter-group">
                <label>Type de document</label>
                <select [(ngModel)]="selectedDocumentType" (change)="filterDocuments()">
                  <option value="">Tous les types</option>
                  <option value="invoice">Factures</option>
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
                    {{ case.caseNumber }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des documents -->
        <div class="documents-list" *ngIf="filteredDocuments.length > 0; else noDocuments">
          <div class="documents-grid">
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
                    Télécharger
                  </button>
                  <button class="btn btn-secondary small" (click)="viewDocument(doc)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Voir
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

      <!-- Modal de visualisation -->
      <div class="modal-overlay" *ngIf="showViewModal" (click)="closeViewModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ selectedDocument?.name }}</h3>
            <button class="modal-close" (click)="closeViewModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedDocument">
            <div class="document-preview">
              <div class="preview-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <p>Aperçu du document</p>
                <p class="preview-note">{{ getDocumentTypeLabel(selectedDocument.type) }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeViewModal()">Fermer</button>
            <button class="btn btn-primary" (click)="downloadDocument(selectedDocument!)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .documents-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .documents-header {
      margin-bottom: 32px;
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
    .document-icon-small.icon-correspondence { background: #3b82f6; }
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
    .document-type-badge.type-correspondence { background: #e0e7ff; color: #3730a3; }
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
    .document-icon.icon-correspondence { background: #3b82f6; }
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
      gap: 8px;
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
      padding: 6px 10px;
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

    .document-preview {
      text-align: center;
    }

    .preview-placeholder {
      padding: 48px;
      background: #f8fafc;
      border-radius: 8px;
      border: 2px dashed var(--border);
    }

    .preview-placeholder svg {
      margin-bottom: 16px;
      color: var(--text-secondary);
    }

    .preview-placeholder p {
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .preview-note {
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

    @media (max-width: 768px) {
      .documents-container {
        padding: 16px;
      }

      .filters-grid {
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
    }
  `]
})
export class DebtorDocumentsComponent implements OnInit {
  cases: DebtCase[] = [];
  allDocuments: (CaseDocument & { caseId: string })[] = [];
  filteredDocuments: (CaseDocument & { caseId: string })[] = [];
  
  searchTerm = '';
  selectedDocumentType = '';
  selectedCaseId = '';
  
  showViewModal = false;
  selectedDocument: CaseDocument | null = null;

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
        this.getDocumentTypeLabel(doc.type).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedDocumentType || doc.type === this.selectedDocumentType;
      const matchesCase = !this.selectedCaseId || doc.caseId === this.selectedCaseId;
      
      return matchesSearch && matchesType && matchesCase;
    });
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

  viewDocument(doc: CaseDocument) {
    this.selectedDocument = doc;
    this.showViewModal = true;
  }

  downloadDocument(doc: CaseDocument) {
    // Simulation du téléchargement
    console.log('Téléchargement du document:', doc.name);
    // TODO: Implémenter le téléchargement réel
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedDocument = null;
  }
}