import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CedantService } from '../../../services/cedant.service';
import { AuthService } from '../../../services/auth.service';
import { CedantPortfolio, PortfolioStatus, PortfolioDocumentType } from '../../../models/case.model';

@Component({
  selector: 'app-cedant-portfolios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cedant-portfolios.component.html',
  styleUrls: ['./cedant-portfolios.component.css']
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