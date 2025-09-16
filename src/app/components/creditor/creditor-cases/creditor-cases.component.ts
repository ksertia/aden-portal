import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter } from '../../../models/case.model';

@Component({
  selector: 'app-creditor-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent],
  templateUrl: './creditor-cases.component.html',
  styleUrls: ['./creditor-cases.component.css']
})
export class CreditorCasesComponent implements OnInit {
  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  statistics: any = null;
  currentView: 'grid' | 'table' = 'grid';
  
  filters: CaseFilter = {};
  selectedStatus = '';
  selectedPriority = '';
  
  showCaseDetailsModal = false;
  selectedCase: DebtCase | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCases();
    this.loadStatistics();
    
    // Vérifier si on doit ouvrir un dossier spécifique depuis les notifications
    this.route.queryParams.subscribe(params => {
      if (params['caseId']) {
        this.openCaseFromNotification(params['caseId']);
      }
    });
  }

  loadCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCases().subscribe(cases => {
      // Filtrer les dossiers pour ce créancier
      this.cases = cases.filter(c => 
        c.creditor.name === currentUser.companyName || 
        c.creditor.contactPerson === `${currentUser.firstName} ${currentUser.lastName}`
      );
      this.applyFilters();
    });
  }

  loadStatistics() {
    this.caseService.getStatistics().subscribe(stats => {
      this.statistics = stats;
    });
  }

  openCaseFromNotification(caseId: string) {
    // Attendre que les données soient chargées
    setTimeout(() => {
      const case_ = this.cases.find(c => c.id === caseId);
      if (case_) {
        this.viewCaseDetails(case_);
      }
    }, 500);
  }

  applyFilters() {
    this.caseService.getCasesWithFilter(this.filters).subscribe(cases => {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return;
      
      this.filteredCases = cases.filter(c => 
        c.creditor.name === currentUser.companyName || 
        c.creditor.contactPerson === `${currentUser.firstName} ${currentUser.lastName}`
      );
    });
  }

  updateStatusFilter() {
    this.filters.status = this.selectedStatus ? [this.selectedStatus as CaseStatus] : undefined;
    this.applyFilters();
  }

  updatePriorityFilter() {
    this.filters.priority = this.selectedPriority ? [this.selectedPriority as Priority] : undefined;
    this.applyFilters();
  }

  resetFilters() {
    this.filters = {};
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.filteredCases = [...this.cases];
  }

  getSuccessRate(): number {
    const completedCases = this.filteredCases.filter(c => c.status === CaseStatus.COMPLETED).length;
    return this.filteredCases.length > 0 ? Math.round((completedCases / this.filteredCases.length) * 100) : 0;
  }

  getTotalAmount(): number {
    return this.filteredCases.reduce((sum, c) => sum + c.amount, 0);
  }

  getTotalRecovered(): number {
    return this.filteredCases.reduce((sum, c) => sum + c.amountPaid, 0);
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

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Élevée',
      'urgent': 'Urgente'
    };
    return labels[priority] || priority;
  }

  viewCaseDetails(case_: DebtCase) {
    this.selectedCase = case_;
    this.showCaseDetailsModal = true;
  }

  closeCaseDetailsModal() {
    this.showCaseDetailsModal = false;
    this.selectedCase = null;
    
    // Nettoyer l'URL si on vient des notifications
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  downloadCaseReport(case_: DebtCase) {
    console.log('Télécharger rapport pour:', case_.caseNumber);
    // TODO: Implémenter le téléchargement de rapport spécifique au dossier
  }

  downloadDocument(doc: any) {
    console.log('Télécharger document:', doc.name);
    // TODO: Implémenter le téléchargement de document
  }

  generateCustomReport() {
    this.router.navigate(['/professional/reports']);
  }

  getRecentActivities(case_: DebtCase) {
    return case_.history.slice(-5).reverse();
  }

  getActivityClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'payment_received': 'payment',
      'reminder_sent': 'reminder',
      'status_changed': 'status',
      'formal_notice_sent': 'legal',
      'legal_action_initiated': 'legal'
    };
    return typeMap[type] || 'status';
  }
}