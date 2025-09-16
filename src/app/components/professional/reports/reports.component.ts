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
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
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