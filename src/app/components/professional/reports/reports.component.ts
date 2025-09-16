import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { CaseFilter, CaseStatus, Priority } from '../../../models/case.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <div class="reports-header fade-in-up">
        <h1>Rapports d'Activité</h1>
        <p>Générez et exportez des rapports détaillés sur vos dossiers</p>
      </div>

      <div class="reports-content fade-in-up">
        <!-- Configuration du rapport -->
        <div class="report-config">
          <div class="config-card">
            <h3>Configuration du rapport</h3>
            
            <div class="config-form">
              <div class="form-section">
                <h4>Période</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>Date de début</label>
                    <input type="date" [(ngModel)]="reportConfig.dateFrom">
                  </div>
                  <div class="form-group">
                    <label>Date de fin</label>
                    <input type="date" [(ngModel)]="reportConfig.dateTo">
                  </div>
                </div>
              </div>
              
              <div class="form-section">
                <h4>Filtres</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>Statut des dossiers</label>
                    <select [(ngModel)]="reportConfig.status" multiple>
                      <option value="pending">En attente</option>
                      <option value="active">Actif</option>
                      <option value="negotiation">Négociation</option>
                      <option value="legal_action">Action légale</option>
                      <option value="completed">Terminé</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Priorité</label>
                    <select [(ngModel)]="reportConfig.priority" multiple>
                      <option value="low">Faible</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Élevée</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="form-section">
                <h4>Type de rapport</h4>
                <div class="report-types">
                  <label class="report-type-option">
                    <input type="radio" name="reportType" value="summary" [(ngModel)]="reportConfig.type">
                    <span class="option-content">
                      <div class="option-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="3" width="7" height="7"/>
                          <rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/>
                          <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                      </div>
                      <div class="option-text">
                        <div class="option-title">Rapport de synthèse</div>
                        <div class="option-description">Vue d'ensemble avec statistiques clés</div>
                      </div>
                    </span>
                  </label>
                  
                  <label class="report-type-option">
                    <input type="radio" name="reportType" value="detailed" [(ngModel)]="reportConfig.type">
                    <span class="option-content">
                      <div class="option-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                        </svg>
                      </div>
                      <div class="option-text">
                        <div class="option-title">Rapport détaillé</div>
                        <div class="option-description">Liste complète des dossiers avec détails</div>
                      </div>
                    </span>
                  </label>
                  
                  <label class="report-type-option">
                    <input type="radio" name="reportType" value="financial" [(ngModel)]="reportConfig.type">
                    <span class="option-content">
                      <div class="option-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      </div>
                      <div class="option-text">
                        <div class="option-title">Rapport financier</div>
                        <div class="option-description">Analyse des montants et recouvrements</div>
                      </div>
                    </span>
                  </label>
                </div>
              </div>
              
              <div class="form-actions">
                <button class="btn btn-primary" (click)="generateReport()" [disabled]="isGenerating">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span *ngIf="!isGenerating">Générer le rapport</span>
                  <span *ngIf="isGenerating">Génération en cours...</span>
                </button>
                <button class="btn btn-secondary" (click)="previewReport()" [disabled]="isGenerating">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Aperçu
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Historique des rapports -->
        <div class="reports-history">
          <div class="history-card">
            <div class="history-header">
              <h3>Rapports récents</h3>
              <button class="btn btn-secondary small" (click)="refreshHistory()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23,4 23,10 17,10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Actualiser
              </button>
            </div>
            
            <div class="history-list" *ngIf="reportHistory.length > 0; else noHistory">
              <div class="history-item" *ngFor="let report of reportHistory">
                <div class="report-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                </div>
                <div class="report-info">
                  <div class="report-name">{{ report.name }}</div>
                  <div class="report-meta">
                    {{ getReportTypeLabel(report.type) }} • 
                    Généré le {{ formatDate(report.generatedAt) }}
                  </div>
                </div>
                <div class="report-actions">
                  <button class="btn btn-primary small" (click)="downloadReport(report)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
            
            <ng-template #noHistory>
              <div class="no-history">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <p>Aucun rapport généré récemment</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Modal d'aperçu -->
      <div class="modal-overlay" *ngIf="showPreviewModal" (click)="closePreviewModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Aperçu du rapport</h3>
            <button class="modal-close" (click)="closePreviewModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="report-preview" *ngIf="previewData">
              <div class="preview-header">
                <h4>{{ getReportTypeLabel(reportConfig.type) }}</h4>
                <p>Période : {{ formatDate(reportConfig.dateFrom) }} - {{ formatDate(reportConfig.dateTo) }}</p>
              </div>
              
              <div class="preview-stats">
                <div class="stat-item">
                  <span class="stat-label">Dossiers traités</span>
                  <span class="stat-value">{{ previewData.totalCases }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Montant total</span>
                  <span class="stat-value">{{ formatCurrency(previewData.totalAmount) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Montant recouvré</span>
                  <span class="stat-value success">{{ formatCurrency(previewData.recoveredAmount) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Taux de succès</span>
                  <span class="stat-value">{{ previewData.successRate }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closePreviewModal()">Fermer</button>
            <button class="btn btn-primary" (click)="generateFromPreview()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Générer et télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .reports-header {
      margin-bottom: 32px;
    }

    .reports-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .reports-header p {
      font-size: 16px;
      color: var(--text-secondary);
    }

    .reports-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
    }

    .config-card, .history-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      height: fit-content;
    }

    .config-card h3, .history-header h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 24px;
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
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 14px;
    }

    .form-group select[multiple] {
      height: 120px;
    }

    .report-types {
      display: grid;
      gap: 12px;
    }

    .report-type-option {
      display: flex;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .report-type-option:hover {
      border-color: var(--primary);
      background: #eff6ff;
    }

    .report-type-option input {
      margin-right: 12px;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .option-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .option-text {
      flex: 1;
    }

    .option-title {
      font-weight: 500;
      color: var(--text);
      margin-bottom: 4px;
    }

    .option-description {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .btn.small {
      padding: 6px 10px;
      font-size: 12px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .history-item:hover {
      border-color: var(--primary);
      background: #f8fafc;
    }

    .report-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .report-info {
      flex: 1;
    }

    .report-name {
      font-weight: 500;
      color: var(--text);
      margin-bottom: 4px;
    }

    .report-meta {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .no-history {
      text-align: center;
      padding: 32px;
      color: var(--text-secondary);
    }

    .no-history svg {
      margin-bottom: 16px;
      color: var(--text-secondary);
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
      max-width: 700px;
      max-height: 90vh;
      overflow: hidden;
      animation: slideInUp 0.3s ease;
    }

    .modal-content.large {
      max-width: 900px;
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

    .preview-header {
      margin-bottom: 24px;
      text-align: center;
    }

    .preview-header h4 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .preview-header p {
      color: var(--text-secondary);
    }

    .preview-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
    }

    .stat-value.success {
      color: var(--success);
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
      .reports-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .preview-stats {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .reports-container {
        padding: 16px;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  reportConfig = {
    dateFrom: '',
    dateTo: '',
    status: [] as string[],
    priority: [] as string[],
    type: 'summary'
  };
  
  reportHistory: any[] = [
    {
      id: '1',
      name: 'Rapport mensuel - Janvier 2024',
      type: 'summary',
      generatedAt: new Date('2024-01-31'),
      url: '#'
    },
    {
      id: '2',
      name: 'Analyse financière - Q4 2023',
      type: 'financial',
      generatedAt: new Date('2023-12-31'),
      url: '#'
    }
  ];
  
  isGenerating = false;
  showPreviewModal = false;
  previewData: any = null;

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeDates();
  }

  initializeDates() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.reportConfig.dateFrom = firstDayOfMonth.toISOString().split('T')[0];
    this.reportConfig.dateTo = today.toISOString().split('T')[0];
  }

  generateReport() {
    this.isGenerating = true;
    
    const filters: CaseFilter = {
      dateFrom: this.reportConfig.dateFrom ? new Date(this.reportConfig.dateFrom) : undefined,
      dateTo: this.reportConfig.dateTo ? new Date(this.reportConfig.dateTo) : undefined,
      status: this.reportConfig.status.length > 0 ? this.reportConfig.status as CaseStatus[] : undefined,
      priority: this.reportConfig.priority.length > 0 ? this.reportConfig.priority as Priority[] : undefined
    };

    this.caseService.generateReport(filters).subscribe({
      next: (report) => {
        this.isGenerating = false;
        console.log('Rapport généré:', report);
        
        // Ajouter à l'historique
        const newReport = {
          id: Date.now().toString(),
          name: `${this.getReportTypeLabel(this.reportConfig.type)} - ${this.formatDate(new Date())}`,
          type: this.reportConfig.type,
          generatedAt: new Date(),
          url: '#'
        };
        this.reportHistory.unshift(newReport);
        
        // Simuler le téléchargement
        this.downloadReportData(report);
      },
      error: (error) => {
        this.isGenerating = false;
        console.error('Erreur lors de la génération:', error);
      }
    });
  }

  previewReport() {
    const filters: CaseFilter = {
      dateFrom: this.reportConfig.dateFrom ? new Date(this.reportConfig.dateFrom) : undefined,
      dateTo: this.reportConfig.dateTo ? new Date(this.reportConfig.dateTo) : undefined,
      status: this.reportConfig.status.length > 0 ? this.reportConfig.status as CaseStatus[] : undefined,
      priority: this.reportConfig.priority.length > 0 ? this.reportConfig.priority as Priority[] : undefined
    };

    this.caseService.generateReport(filters).subscribe({
      next: (report) => {
        this.previewData = report.summary;
        this.showPreviewModal = true;
      },
      error: (error) => {
        console.error('Erreur lors de l\'aperçu:', error);
      }
    });
  }

  generateFromPreview() {
    this.closePreviewModal();
    this.generateReport();
  }

  downloadReport(report: any) {
    console.log('Téléchargement du rapport:', report.name);
    // TODO: Implémenter le téléchargement réel
  }

  downloadReportData(reportData: any) {
    // Simulation du téléchargement
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${this.reportConfig.type}-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  refreshHistory() {
    // Simulation du rafraîchissement
    console.log('Actualisation de l\'historique des rapports');
  }

  closePreviewModal() {
    this.showPreviewModal = false;
    this.previewData = null;
  }

  getReportTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'summary': 'Rapport de synthèse',
      'detailed': 'Rapport détaillé',
      'financial': 'Rapport financier'
    };
    return labels[type] || type;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}