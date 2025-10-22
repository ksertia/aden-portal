import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
import { DebtCase, CaseFilter, CedantInfo } from '../../../models/case.model';
import { UserCreateComponent } from '../user-create/user-create.component';


@Component({
  selector: 'app-cedant',
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule, UserCreateComponent],
  templateUrl: './cedant.html',
  styleUrl: './cedant.css'
})
export class Cedant implements OnInit {

  // Liste brute et filtrée
  cedants: CedantInfo[] = [];
  filteredCedants: CedantInfo[] = [];

  currentView: 'grid' | 'table' = 'table';

  // État du tiroir
  showDrawer = false;
  selectedCedant: CedantInfo | null = null;
  selectedUser: any | null = null; // données Strapi User
  
  filters: CaseFilter = {};
  selectedStatus = '';
  selectedPriority = '';
  
  showCaseDetailsModal = false;
  selectedCase: DebtCase | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit() {

    this.loadCedant();
  }

  loadCedant() {
    const sitename = 'portail-recouvrement';
          
    this.adminService.getCedants(sitename).subscribe({
      next: (data: CedantInfo[]) => {
        this.cedants = data;
        this.filteredCedants = [...this.cedants];
      },
      error: (err) => console.error(err)
    });
  }


  // filtrage par recherche
  applyFilters() {
    if (!this.filters.searchTerm) {
      this.filteredCedants = [...this.cedants];
      return;
    }
    const term = this.filters.searchTerm.toLowerCase();
    this.filteredCedants = this.cedants.filter(c =>
      c.contactPrincipal.toLowerCase().includes(term) ||
      c.raisonSociale.toLowerCase().includes(term) ||
      c.emailProfessionnel.toLowerCase().includes(term) ||
      c.nodeId.toLowerCase().includes(term)
    );
  }

  resetFilters() {
    this.filters.searchTerm = '';
    this.filteredCedants = [...this.cedants];
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

  // --- Gestion du tiroir ---
  openDrawer(cedant: any) {
    this.selectedCedant = cedant;
    this.showDrawer = true;

    // ⚡ On appelle Strapi pour récupérer le user associé au cédant
    this.adminService.getUserByEmail(cedant.email).subscribe({
      next: (user) => {
        this.selectedUser = user;
      },
      error: (err) => {
        console.error("Erreur récupération user:", err);
        this.selectedUser = null;
      }
    });
  }

  closeDrawer() {
    this.showDrawer = false;
    this.selectedCedant = null;
    this.selectedUser = null;
  }

  onUserCreated(user: any) {
    console.log('Utilisateur Strapi créé:', user);
    this.selectedUser = user;
  }
}