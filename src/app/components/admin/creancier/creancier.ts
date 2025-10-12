import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { DebtCase, CaseStatus, Priority, CaseFilter, CreditorDetail } from '../../../models/case.model';
import { AdminService } from '../../../services/admin.service';
import { UserCreateComponent } from '../user-create/user-create.component';

@Component({
  selector: 'app-creancier',
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule, UserCreateComponent],
  templateUrl: './creancier.html',
  styleUrl: './creancier.css'
})
export class Creancier implements OnInit {
  
  // État du tiroir
  showDrawer = false;
  selectedCreditor: CreditorDetail | null = null;
  selectedUser: any | null = null; // données Strapi User

  creditors: CreditorDetail[] = [];
  filteredCreditors: CreditorDetail[] = [];
  
  // Gestion des filtres
  filters = {
    searchTerm: ''
  };

  // Vue courante : 'grid' ou 'table'
  currentView: 'grid' | 'table' = 'table';
  
  constructor(
    private adminService: AdminService,
  ) {}

  ngOnInit() {
    this.loadCreditors();
  }

  loadCreditors() {
    const sitename = 'portail-recouvrement';
    
    this.adminService.getCreanciers(sitename).subscribe({
      next: (data: CreditorDetail[]) => {
        this.creditors = data;
        this.filteredCreditors = [...this.creditors];
      },
      error: (err) => console.error(err)
    });
  }

  // filtrage par recherche
  applyFilters() {
    if (!this.filters.searchTerm) {
      this.filteredCreditors = [...this.creditors];
      return;
    }
    const term = this.filters.searchTerm.toLowerCase();
    this.filteredCreditors = this.creditors.filter(c =>
      c.raisonSociale.toLowerCase().includes(term) ||
      c.contactPrincipal.toLowerCase().includes(term) ||
      c.emailProfessionnel.toLowerCase().includes(term)
    );
  }

  resetFilters() {
    this.filters.searchTerm = '';
    this.filteredCreditors = [...this.creditors];
  }
  
  // --- Gestion du tiroir ---
  openDrawer(creditor: CreditorDetail) {
    this.selectedCreditor = creditor;
    this.showDrawer = true;

    // ⚡ On appelle Strapi pour récupérer le user associé au créancier
    this.adminService.getUserByEmail(creditor.emailProfessionnel).subscribe({
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
    this.selectedCreditor = null;
    this.selectedUser = null;
  }

  onUserCreated(user: any) {
    console.log('Utilisateur Strapi créé:', user);
    this.selectedUser = user;
  }
}