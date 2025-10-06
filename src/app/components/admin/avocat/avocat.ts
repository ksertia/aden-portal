import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { DebtCase, AvocatInfo } from '../../../models/case.model';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-avocat',
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule],
  templateUrl: './avocat.html',
  styleUrl: './avocat.css'
})
export class Avocat implements OnInit {

  avocat: AvocatInfo[] = [];
  filteredAvocat: AvocatInfo[] = [];


showDrawer = false;
selectedAvocat: (AvocatInfo & { strapiAccount?: any }) | null = null;


  // Gestion des filtres
  filters = {
    searchTerm: ''
  };

  // Vue courante : 'grid' ou 'table'
  currentView: 'grid' | 'table' = 'grid';

  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  
  selectedStatus = '';
  selectedPriority = '';
  
  showCaseDetailsModal = false;
  selectedCase: DebtCase | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit() {

    this.loadAvocat();
  }

  loadAvocat() {
    const sitename = 'portail-recouvrement';
        
    this.adminService.getAvocats(sitename).subscribe({
      next: (data: AvocatInfo[]) => {
        this.avocat = data;
        this.filteredAvocat = [...this.avocat];
      },
      error: (err) => console.error(err)
    });
  }

  // filtrage par recherche
  applyFilters() {
    if (!this.filters.searchTerm) {
      this.filteredAvocat = [...this.avocat];
      return;
    }
    const term = this.filters.searchTerm.toLowerCase();
    this.filteredAvocat = this.avocat.filter(c =>
      c.nomAvocat.toLowerCase().includes(term) ||
      c.prenomAvocat.toLowerCase().includes(term) ||
      c.emailProfessionnel.toLowerCase().includes(term) ||
      c.nodeId.toLowerCase().includes(term)
    );
  }

  resetFilters() {
    this.filters.searchTerm = '';
    this.filteredAvocat = [...this.avocat];
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

  // retourne une classe CSS (string) à appliquer selon le status
  statusClass(status: string): string {
    if (!status) return 'badge badge-secondary';
    return status.toLowerCase() === 'actif'
      ? 'badge badge-success light border-0'
      : 'badge badge-danger light border-0';
  }

  openDrawer(avocat: AvocatInfo) {
  this.selectedAvocat = avocat;
  this.showDrawer = true;
}

closeDrawer() {
  this.showDrawer = false;
  this.selectedAvocat = null;
}


}


