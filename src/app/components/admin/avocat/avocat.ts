import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { DebtCase, AvocatInfo } from '../../../models/case.model';
import { AdminService } from '../../../services/admin.service';
import { UserCreateComponent } from '../user-create/user-create.component';

@Component({
  selector: 'app-avocat',
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule, UserCreateComponent],
  templateUrl: './avocat.html',
  styleUrl: './avocat.css'
})
export class Avocat implements OnInit {

  avocat: AvocatInfo[] = [];
  filteredAvocat: AvocatInfo[] = [];

  // État du tiroir
  showDrawer = false;
  selectedAvocat: AvocatInfo | null = null;
  selectedUser: any | null = null; // données Strapi User

  // 🆕 Map pour stocker le statut d'inscription de chaque avocat
  userStatusMap: Map<string, boolean> = new Map();

  // Gestion des filtres
  filters = {
    searchTerm: ''
  };

  // Vue courante : 'grid' ou 'table'
  currentView: 'grid' | 'table' = 'table';
  
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
        // 🆕 Charger le statut d'inscription pour chaque avocat
        this.loadUserStatuses();
      },
      error: (err) => console.error(err)
    });
  }

  // 🆕 Charge le statut d'inscription pour tous les avocats
  loadUserStatuses() {
    this.avocat.forEach(avocat => {
      this.adminService.getUserByEmail(avocat.emailProfessionnel).subscribe({
        next: (user) => {
          // Si un user existe, marquer comme inscrit
          this.userStatusMap.set(avocat.emailProfessionnel, !!user);
        },
        error: () => {
          // Si erreur ou pas de user, marquer comme non inscrit
          this.userStatusMap.set(avocat.emailProfessionnel, false);
        }
      });
    });
  }

  // 🆕 Vérifie si un avocat est inscrit sur Strapi
  isUserRegistered(email: string): boolean {
    return this.userStatusMap.get(email) || false;
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

  // --- Gestion du tiroir ---
  openDrawer(avocat: AvocatInfo) {
    this.selectedAvocat = avocat;
    this.showDrawer = true;

    // ⚡ On appelle Strapi pour récupérer le user associé à l'avocat
    this.adminService.getUserByEmail(avocat.emailProfessionnel).subscribe({
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
    this.selectedAvocat = null;
    this.selectedUser = null;
  }

  // Mise à jour après création d'utilisateur
  onUserCreated(user: any) {
    console.log('Utilisateur Strapi créé:', user);
    this.selectedUser = user;
    // Mettre à jour le statut dans la map
    if (this.selectedAvocat) {
      this.userStatusMap.set(this.selectedAvocat.emailProfessionnel, true);
    }
  }
}