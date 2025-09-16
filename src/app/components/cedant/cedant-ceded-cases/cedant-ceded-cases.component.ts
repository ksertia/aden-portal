import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../services/partner.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, PartnerUpdate, CessionContract } from '../../../models/case.model';

@Component({
  selector: 'app-cedant-ceded-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cedant-ceded-cases.component.html',
  styleUrls: ['./cedant-ceded-cases.component.css']
})
export class CedantCededCasesComponent implements OnInit {
  cededCases: DebtCase[] = [];
  partnerUpdates: PartnerUpdate[] = [];
  statistics: any = null;
  
  showCedeModal = false;
  
  cedeForm = {
    caseId: '',
    partnerId: '',
    commission: 25,
    terms: ''
  };

  constructor(
    private partnerService: PartnerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCededCases();
    this.loadPartnerUpdates();
    this.loadStatistics();
  }

  loadCededCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.partnerService.getCededCases(currentUser.id).subscribe(cases => {
      this.cededCases = cases;
    });
  }

  loadPartnerUpdates() {
    this.partnerService.getPartnerUpdates().subscribe(updates => {
      this.partnerUpdates = updates;
    });
  }

  loadStatistics() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.partnerService.getCedantStatistics(currentUser.id).subscribe(stats => {
      this.statistics = stats;
    });
  }

  getPaymentPercentage(case_: DebtCase): number {
    return Math.round((case_.amountPaid / case_.amount) * 100);
  }

  getPartnerName(partnerId: string): string {
    return 'Recouvrement Solutions';
  }

  getRecentUpdates(caseId: string): PartnerUpdate[] {
    return this.partnerUpdates
      .filter(u => u.caseId === caseId)
      .slice(0, 3);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return new Date(date).toLocaleDateString('fr-FR');
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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

  viewCaseDetails(case_: DebtCase) {
    console.log('Voir détails du dossier cédé:', case_.caseNumber);
    // TODO: Implémenter la vue détaillée
  }

  viewUpdatesHistory(case_: DebtCase) {
    console.log('Voir historique des mises à jour:', case_.caseNumber);
    // TODO: Implémenter la vue historique
  }

  isCedeFormValid(): boolean {
    return !!(this.cedeForm.caseId && this.cedeForm.partnerId && 
              this.cedeForm.commission > 0 && this.cedeForm.terms.trim());
  }

  cedeCase() {
    if (!this.isCedeFormValid()) return;

    this.partnerService.cedeCase(
      this.cedeForm.caseId,
      this.cedeForm.partnerId,
      this.cedeForm.commission,
      this.cedeForm.terms
    ).subscribe({
      next: (contract) => {
        this.loadCededCases();
        this.loadStatistics();
        this.closeCedeModal();
      },
      error: (error) => {
        console.error('Erreur lors de la cession:', error);
      }
    });
  }

  closeCedeModal() {
    this.showCedeModal = false;
    this.cedeForm = {
      caseId: '',
      partnerId: '',
      commission: 25,
      terms: ''
    };
  }
}