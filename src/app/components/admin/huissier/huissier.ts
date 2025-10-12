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
      },
      error: (err) => console.error(err)
    });
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

  onUserCreated(user: any) {
    console.log('Utilisateur Strapi créé:', user);
    this.selectedUser = user;
  }
}