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
  currentView: 'grid' | 'table' = 'table';

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
      this.users = res;

      this.debiteurs = (res.debiteurs || []).map((d: any) => ({
      id: d.map.objetId,
      prenom: d.map.prenomDebiteur,
      nom: d.map.nomDebiteur,
      email: d.map.emailDebiteur,
      telephone: d.map.telephone,
      role: "débiteur",
      adresse: d.map.adresse,
      raisonSociale: d.map.raisonSociale,
      dateNaissance: d.map.dateNaissance,
      ...d.map
    }));

    this.huissiers = (res.huissiers || []).map((h: any) => ({
      id: h.map.objetId,
      prenom: h.map.prenomHuissier,
      nom: h.map.nomHuissier,
      email: h.map.emailHuissier,
      telephone: h.map.telephone,
      role: "huissier",
      ...h.map
    }));

    this.avocats = (res.avocats || []).map((a: any) => ({
      id: a.map.objetId,
      prenom: a.map.prenomAvocat,
      nom: a.map.nomAvocat,
      email: a.map.emailAvocat,
      telephone: a.map.telephone,
      role: "avocat",
      ...a.map
    }));

    this.creanciers = (res.creanciers || []).map((c: any) => ({
      id: c.map.objetId,
      prenom: c.map.prenomCreancier,
      nom: c.map.nomCreancier,
      email: c.map.emailCreancier,
      telephone: c.map.telephone,
      role: "créancier",
      ...c.map
    }));

    this.partenaires = (res.partenaires || []).map((p: any) => ({
      id: p.map.objetId,
      prenom: p.map.prenomPartenaire,
      nom: p.map.nomPartenaire,
      email: p.map.emailPartenaire,
      telephone: p.map.telephone,
      role: "partenaire",
      ...p.map
    }));

    // Combinaisons tous les utilisateurs
    this.allUser = [
      ...this.debiteurs,
      ...this.huissiers,
      ...this.avocats,
      ...this.creanciers,
      ...this.partenaires
    ];

    this.filteredAllUser = [...this.allUser];

    console.log('Tous les utilisateurs:', this.allUser);
    },
    error: (err) => console.error('Erreur lors de la récupération:', err)
  });
  }

  // Filtrage par recherche
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
      const roleName = String(u.role).toLowerCase();
      return roleName === this.selectedStatus.toLowerCase();
      });
    }
  }

  //Réinitialiser les filtres
  resetFilters() {
    this.filters.searchTerm = '';
    this.selectedStatus = '';
    this.filteredAllUser = [...this.allUser];
  }

  // 🔄 Mise à jour du filtre par rôle (profil)
  updateStatusFilter() {
    this.applyFilters();
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
