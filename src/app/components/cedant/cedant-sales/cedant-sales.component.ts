import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CedantService } from '../../../services/cedant.service';
import { AuthService } from '../../../services/auth.service';
import { CedantPortfolio, PortfolioStatus } from '../../../models/case.model';

@Component({
  selector: 'app-cedant-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cedant-sales.component.html',
  styleUrls: ['./cedant-sales.component.css']
})
export class CedantSalesComponent implements OnInit {
  portfolios: CedantPortfolio[] = [];
  activeSales: CedantPortfolio[] = [];
  soldPortfolios: CedantPortfolio[] = [];

  constructor(
    private cedantService: CedantService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.cedantService.getPortfolios(currentUser.id).subscribe(portfolios => {
      this.portfolios = portfolios;
      this.activeSales = portfolios.filter(p => 
        p.status === PortfolioStatus.SUBMITTED || 
        p.status === PortfolioStatus.UNDER_EVALUATION || 
        p.status === PortfolioStatus.APPROVED
      );
      this.soldPortfolios = portfolios.filter(p => p.status === PortfolioStatus.SOLD);
    });
  }

  refreshData() {
    this.loadData();
  }

  viewSaleDetails(portfolio: CedantPortfolio) {
    console.log('Voir détails de la vente:', portfolio.name);
    // TODO: Implémenter la vue détaillée
  }

  acceptOffer(portfolio: CedantPortfolio) {
    if (confirm('Êtes-vous sûr de vouloir accepter cette offre ?')) {
      this.cedantService.updatePortfolio(portfolio.id, {
        status: PortfolioStatus.SOLD,
        soldAt: new Date()
      }).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Erreur lors de l\'acceptation:', error);
        }
      });
    }
  }

  rejectOffer(portfolio: CedantPortfolio) {
    if (confirm('Êtes-vous sûr de vouloir refuser cette offre ?')) {
      this.cedantService.updatePortfolio(portfolio.id, {
        status: PortfolioStatus.REJECTED
      }).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Erreur lors du refus:', error);
        }
      });
    }
  }

  getBuybackRate(portfolio: CedantPortfolio): number {
    if (!portfolio.salePrice) return 0;
    return Math.round((portfolio.salePrice / portfolio.totalAmount) * 100);
  }

  getSaleDuration(portfolio: CedantPortfolio): number {
    if (!portfolio.soldAt || !portfolio.submittedAt) return 0;
    const diffTime = new Date(portfolio.soldAt).getTime() - new Date(portfolio.submittedAt).getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
}