import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter } from '../../../models/case.model';


@Component({
  selector: 'app-cedant',
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule],
  templateUrl: './cedant.html',
  styleUrl: './cedant.css'
})
export class Cedant implements OnInit {

  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  statistics: any = null;
  currentView: 'grid' | 'table' = 'grid';

  
  // 👉 Drawer
  isDrawerOpen: boolean = false;
  selectedCedant: DebtCase | null = null;
  
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
  }

  loadCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCases().subscribe(cases => {
      // Filtrer les dossiers pour ce créancier
      this.cases = cases.filter(c => 
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

  applyFilters() {
    this.caseService.getCasesWithFilter(this.filters).subscribe(cases => {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return;
      
      this.filteredCases = cases.filter(c => 
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

  // données statique
  filteredCase = [
    {
      creditorName: 'Débiteur Antony',
      username: 'Computer Science',
      email: 'Débiteur@gmail.com',
      phone: '+91 123 456 7890',
      status: 'Actif',
    },
    {
      creditorName: 'Créancier Oliver',
      username: 'Computer Science',
      email: 'Créancierr@gmail.com',
      phone: '+91 123 456 7891',
      status: 'Inactif'
    },
    
    {
      creditorName: 'Huissier Oliver',
      username: 'Computer Science',
      email: 'Huissier@gmail.com',
      phone: '+91 123 456 7891',
      status: 'Actif'
    },
    {
      creditorName: 'Avocat Oliver',
      username: 'Computer Science',
      email: 'Avocat@gmail.com',
      phone: '+91 123 456 7891',
      status: 'Inactif'
    },
    {
      creditorName: 'Cédant Oliver',
      username: 'Computer Science',
      email: 'Cédant@gmail.com',
      phone: '+91 123 456 7891',
      status: 'Actif'
    },
    {
      creditorName: 'Partenaire Oliver',
      username: 'Computer Science',
      email: 'Partenaire@gmail.com',
      phone: '+91 123 456 7891',
      status: 'Inactif'
    }
  ];

  // retourne une classe CSS (string) à appliquer selon le status
  statusClass(status: string): string {
    if (!status) return 'badge badge-secondary';
    return status.toLowerCase() === 'actif'
      ? 'badge badge-success light border-0'
      : 'badge badge-danger light border-0';
  }

  // 👉 Gestion du drawer
  openDrawer(cedant: DebtCase): void {
    this.selectedCedant = cedant;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedCedant = null;
  }
}




