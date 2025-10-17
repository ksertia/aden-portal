import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { HuissierInfo } from '../../../models/case.model';
import { AdminService } from '../../../services/admin.service';
import { UserCreateComponent } from '../user-create/user-create.component';

@Component({
  selector: 'app-huissier',
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule, UserCreateComponent],
  templateUrl: './huissier.html',
  styleUrl: './huissier.css'
})
export class Huissier implements OnInit {

  // État du tiroir
  showDrawer = false;
  selectedHuissier: HuissierInfo | null = null;
  selectedUser: any | null = null; // données Strapi User

  huisier: HuissierInfo[] = [];
  filteredHuisier: HuissierInfo[] = [];

  // 🆕 Map pour stocker le statut d'inscription de chaque huissier
  userStatusMap: Map<string, boolean> = new Map();

  // Gestion des filtres
  filters = {
    searchTerm: ''
  };

  // Vue courante : 'grid' ou 'table'
  currentView: 'grid' | 'table' = 'table';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.loadHuissier();
  }

  loadHuissier() {
    const sitename = 'portail-recouvrement';
    
    this.adminService.getHuissiers(sitename).subscribe({
      next: (data: HuissierInfo[]) => {
        this.huisier = data;
        this.filteredHuisier = [...this.huisier];
        // 🆕 Charger le statut d'inscription pour chaque huissier
        this.loadUserStatuses();
      },
      error: (err) => console.error(err)
    });
  }

  // 🆕 Charge le statut d'inscription pour tous les huissiers
  loadUserStatuses() {
    this.huisier.forEach(huissier => {
      this.adminService.getUserByEmail(huissier.emailProfessionnel).subscribe({
        next: (user) => {
          // Si un user existe, marquer comme inscrit
          this.userStatusMap.set(huissier.emailProfessionnel, !!user);
        },
        error: () => {
          // Si erreur ou pas de user, marquer comme non inscrit
          this.userStatusMap.set(huissier.emailProfessionnel, false);
        }
      });
    });
  }

  // 🆕 Vérifie si un huissier est inscrit sur Strapi
  isUserRegistered(email: string): boolean {
    return this.userStatusMap.get(email) || false;
  }

  // filtrage par recherche
  applyFilters() {
    if (!this.filters.searchTerm) {
      this.filteredHuisier = [...this.huisier];
      return;
    }
    const term = this.filters.searchTerm.toLowerCase();
    this.filteredHuisier = this.huisier.filter(c =>
      c.nomHuissier.toLowerCase().includes(term) ||
      c.nomEtude.toLowerCase().includes(term) ||
      c.emailProfessionnel.toLowerCase().includes(term)
    );
  }

  resetFilters() {
    this.filters.searchTerm = '';
    this.filteredHuisier = [...this.huisier];
  }

  // --- Gestion du tiroir ---
  openDrawer(huissier: HuissierInfo) {
    this.selectedHuissier = huissier;
    this.showDrawer = true;

    // ⚡ On appelle Strapi pour récupérer le user associé à l'huissier
    this.adminService.getUserByEmail(huissier.emailProfessionnel).subscribe({
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
    this.selectedHuissier = null;
    this.selectedUser = null;
  }

  // 🆕 Mise à jour après création d'utilisateur
  onUserCreated(user: any) {
    console.log('Utilisateur Strapi créé:', user);
    this.selectedUser = user;
    // Mettre à jour le statut dans la map
    if (this.selectedHuissier) {
      this.userStatusMap.set(this.selectedHuissier.emailProfessionnel, true);
    }
  }
}