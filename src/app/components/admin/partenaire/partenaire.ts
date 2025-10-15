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
      },
      error: (err) => console.error(err)
    });
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

  loadStatistics() {
    // this.caseService.getStatistics().subscribe(stats => {
    //   this.statistics = stats;
    // });
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

  onUserCreated(user: any) {
    console.log('Utilisateur Strapi créé:', user);
    this.selectedUser = user;
  }
}