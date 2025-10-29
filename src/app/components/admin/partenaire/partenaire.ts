import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, PartenaireInfo } from '../../../models/case.model';
import { AdminService } from '../../../services/admin.service';
import { UserCreateComponent } from '../user-create/user-create.component';

@Component({
  selector: 'app-partenaire',
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule, UserCreateComponent],
  templateUrl: './partenaire.html',
  styleUrl: './partenaire.css'
})
export class Partenaire implements OnInit {

  // État du tiroir
  showDrawer = false;
  selectedPartenaire: PartenaireInfo | null = null;
  selectedUser: any | null = null; // données Strapi User

  partenaire: PartenaireInfo[] = [];
  filteredPartenaire: PartenaireInfo[] = [];

  // Map pour stocker le statut d'inscription de chaque partenaire
  userStatusMap: Map<string, boolean> = new Map();

  // Gestion des filtres
  filters = {
    searchTerm: ''
  };

  // Vue courante : 'grid' ou 'table'
  currentView: 'grid' | 'table' = 'table';

  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  statistics: any = null;
  
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
    this.loadPartenaire();
  }

  loadPartenaire() {
    const sitename = 'portail-recouvrement';
      
    this.adminService.getPartenaires(sitename).subscribe({
      next: (data: PartenaireInfo[]) => {
        this.partenaire = data;
        this.filteredPartenaire = [...this.partenaire];
        // Charger le statut d'inscription pour chaque partenaire
        this.loadUserStatuses();
      },
      error: (err) => console.error(err)
    });
  }

  // Charge le statut d'inscription pour tous les partenaires
  loadUserStatuses() {
    this.partenaire.forEach(partenaire => {
      this.adminService.getUserByEmail(partenaire.emailProfessionnel).subscribe({
        next: (user) => {
          // Si un user existe, marquer comme inscrit
          this.userStatusMap.set(partenaire.emailProfessionnel, !!user);
        },
        error: () => {
          // Si erreur ou pas de user, marquer comme non inscrit
          this.userStatusMap.set(partenaire.emailProfessionnel, false);
        }
      });
    });
  }

  // Vérifie si un partenaire est inscrit sur Strapi
  isUserRegistered(email: string): boolean {
    return this.userStatusMap.get(email) || false;
  }

  // filtrage par recherche
  applyFilters() {
    if (!this.filters.searchTerm) {
      this.filteredPartenaire = [...this.partenaire];
      return;
    }
    const term = this.filters.searchTerm.toLowerCase();
    this.filteredPartenaire = this.partenaire.filter(c =>
      c.contactPrincipal.toLowerCase().includes(term) ||
      c.typePartenaire.toLowerCase().includes(term) ||
      c.emailProfessionnel.toLowerCase().includes(term)
    );
  }

  resetFilters() {
    this.filters.searchTerm = '';
    this.filteredPartenaire = [...this.partenaire];
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

  // retourne une classe CSS (string) à appliquer selon le status
  statusClass(status: string): string {
    if (!status) return 'badge badge-secondary';
    return status.toLowerCase() === 'actif'
      ? 'badge badge-success light border-0'
      : 'badge badge-danger light border-0';
  }

  // --- Gestion du tiroir ---
  openDrawer(partenaire: PartenaireInfo) {
    this.selectedPartenaire = partenaire;
    this.showDrawer = true;

    // ⚡ On appelle Strapi pour récupérer le user associé au partenaire
    this.adminService.getUserByEmail(partenaire.emailProfessionnel).subscribe({
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
    this.selectedPartenaire = null;
    this.selectedUser = null;
  }

  // Mise à jour après création d'utilisateur
  onUserCreated(user: any) {
    console.log('Utilisateur Strapi créé:', user);
    this.selectedUser = user;
    // Mettre à jour le statut dans la map
    if (this.selectedPartenaire) {
      this.userStatusMap.set(this.selectedPartenaire.emailProfessionnel, true);
    }
  }

  // Méthode pour obtenir le nombre de partenaires inscrits
  getRegisteredCount(): number {
    return this.partenaire.filter(partenaire => 
      this.isUserRegistered(partenaire.emailProfessionnel)
    ).length;
  }

  // Méthode pour obtenir le nombre de partenaires non-inscrits
  getNonRegisteredCount(): number {
    return this.partenaire.filter(creditor => 
      !this.isUserRegistered(creditor.emailProfessionnel)
    ).length;
  }

}