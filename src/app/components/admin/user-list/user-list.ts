import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { User } from '../../../models/user.model';
import { DebtCase, GlobalApiResponse } from '../../../models/case.model';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserList implements OnInit {

  // Données utilisateurs
  users: any; // réponse brute
  debiteurs: User[] = [];
  huissiers: User[] = [];
  partenaires: User[] = [];
  creanciers: User[] = [];
  avocats: User[] = [];

  // Tableau combiné pour l'affichage
  allUser: User[] = [];
  filteredAllUser: User[] = [];

  // Gestion des filtres
  filters = {
    searchTerm: ''
  };
  selectedStatus = '';

  // Vue courante : 'grid' ou 'table'
  currentView: 'grid' | 'table' = 'grid';

  // Cases (non utilisées ici, mais conservées pour référence)
  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  statistics: any = null;

  // Drawer state
  showDrawer = false;
  selectedUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private authService: AuthService,
    private adminService: AdminService,
  ) {}

  ngOnInit() {
    
    this.loadAllUsers();
  }

  // 🔑 Récupération des utilisateurs
  loadAllUsers() {
    this.adminService.getAllUsers('portail-recouvrement').subscribe({
      next: (res: any) => {
        this.users = res; // pour debug
        console.log('Réponse brute:', res);

        // Mapping des rôles
        this.debiteurs = res.debiteurs.map((item: any) => item.map);
        this.huissiers = res.huissiers.map((item: any) => item.map);
        this.avocats = res.avocats.map((item: any) => item.map);
        this.creanciers = res.creanciers.map((item: any) => item.map);
        this.partenaires = res.partenaires.map((item: any) => item.map);
        console.log('Debiteurs brut:', res.debiteurs);
        console.log('Debiteurs map:', this.debiteurs);


        // Combiner tous les utilisateurs dans un tableau unique pour l'affichage
        this.allUser = [
          ...this.debiteurs,
          ...this.huissiers,
          ...this.avocats,
          ...this.creanciers,
          ...this.partenaires
        ];

        // Initialisation du tableau filtré
        this.filteredAllUser = [...this.allUser];

        console.log('Tous les utilisateurs:', this.allUser);
      },
      error: (err) => console.error('❌ Erreur lors de la récupération:', err)
    });
  }

  // 🔎 Filtrage par recherche
  applyFilters() {
    const term = this.filters.searchTerm?.toLowerCase() || '';
    this.filteredAllUser = this.allUser.filter(user => {
      const fullName = `${user.firstname || ''} ${user.lastname || ''}`.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      return fullName.includes(term) || email.includes(term) || (user.username?.toLowerCase().includes(term));
    });

    // Filtrage par rôle si sélectionné
    if (this.selectedStatus) {
      this.filteredAllUser = this.filteredAllUser.filter(u => {
        const roleName = u.role?.name || u.role;
        return roleName === this.selectedStatus;
      });
    }
  }

  // 🔄 Réinitialiser les filtres
  resetFilters() {
    this.filters.searchTerm = '';
    this.selectedStatus = '';
    this.filteredAllUser = [...this.allUser];
  }

  // ✅ Ouvre le drawer avec mapping vers User
  openDrawer(item: User) {
    this.selectedUser = item;
    this.showDrawer = true;
  }

  closeDrawer() {
    this.showDrawer = false;
    this.selectedUser = null;
  }

}
