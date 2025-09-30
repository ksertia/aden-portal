import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { ProfileComponent } from '../../profile/profile.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { DebtCase, CaseStatus, Priority, CaseFilter } from '../../../models/case.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent, ProfileComponent, RouterModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserList implements OnInit {
  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  statistics: any = null;
  currentView: 'grid' | 'table' = 'grid';

  filters: CaseFilter = {};
  selectedStatus = '';
  selectedPriority = '';

  showCaseDetailsModal = false;
  selectedCase: DebtCase | null = null;

  // ✅ drawer state
  showDrawer = false;
  selectedUser: User | null = null;

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
      this.cases = cases.filter(
        c =>
          c.creditor.name === currentUser.companyName ||
          c.creditor.contactPerson === `${currentUser.firstname} ${currentUser.lastname}`
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

      this.filteredCases = cases.filter(
        c =>
          c.creditor.name === currentUser.companyName ||
          c.creditor.contactPerson === `${currentUser.firstname} ${currentUser.lastname}`
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
    return this.filteredCases.length > 0
      ? Math.round((completedCases / this.filteredCases.length) * 100)
      : 0;
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
      pending: 'En attente',
      active: 'Actif',
      negotiation: 'Négociation',
      legal_action: 'Action légale',
      payment_plan: 'Plan de paiement',
      completed: 'Terminé',
      closed: 'Fermé'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente'
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

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  // ✅ données statiques (simulent les users)
  filteredCase = [
    {
      creditorName: 'Débiteur Antony',
      username: 'antony',
      email: 'debiteur@gmail.com',
      phone: '+33 601020304',
      status: 'Actif',
      role: 'Débiteur'
    },
    {
      creditorName: 'Créancier Oliver',
      username: 'oliver',
      email: 'creancier@gmail.com',
      phone: '+33 601020305',
      status: 'Inactif',
      role: 'Créancier'
    }
  ];

  statusClass(status: string): string {
    if (!status) return 'badge badge-secondary';
    return status.toLowerCase() === 'actif'
      ? 'badge badge-success light border-0'
      : 'badge badge-danger light border-0';
  }

  // ✅ Ouvre le tiroir avec mapping vers User
  openDrawer(item: any) {
    const roleMap: { [key: string]: string } = {
      Débiteur: 'debtor',
      Créancier: 'creditor',
      Huissier: 'bailiff',
      Avocat: 'lawyer',
      Cédant: 'cedant',
      Partenaire: 'partner'
    };

    const englishRole = roleMap[item.role] || 'debtor';

    const nameParts = item.creditorName.split(' ');

    this.selectedUser = {
      id: 'static-id', // fake id
      email: item.email,
      firstname: nameParts[0] || '',
      lastname: nameParts.slice(1).join(' ') || '',
      username: item.username,
      role: {
        id: 1,
        name: englishRole,
        documentId: '',
        description: '',
        type: '',
        createdAt: '',
        updatedAt: '',
        publishedAt: ''
      },
      statut: item.status,
      phone: item.phone,
      companyName: '',
      address: undefined,
      firstLogin: false,
      businessId: ''
    } as User;

    this.showDrawer = true;
  }

  closeDrawer() {
    this.showDrawer = false;
    this.selectedUser = null;
  }

  // actions
  editItem(item: any) {
    console.log('Edit', item);
  }

  deleteItem(item: any) {
    console.log('Delete', item);
  }
}
