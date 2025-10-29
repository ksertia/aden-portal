import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CreditorDetail } from '../../../models/case.model';
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

  // Map pour stocker le statut d'inscription de chaque créancier
  userStatusMap: Map<string, boolean> = new Map();
  
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
        // Charger le statut d'inscription pour chaque créancier
        this.loadUserStatuses();
      },
      error: (err) => console.error(err)
    });
  }

  // Charge le statut d'inscription pour tous les créanciers
  loadUserStatuses() {
    this.creditors.forEach(creditor => {
      this.adminService.getUserByEmail(creditor.emailProfessionnel).subscribe({
        next: (user) => {
          // Si un user existe, marquer comme inscrit
          this.userStatusMap.set(creditor.emailProfessionnel, !!user);
        },
        error: () => {
          // Si erreur ou pas de user, marquer comme non inscrit
          this.userStatusMap.set(creditor.emailProfessionnel, false);
        }
      });
    });
  }

  // Vérifie si un créancier est inscrit sur Strapi
  isUserRegistered(email: string): boolean {
    return this.userStatusMap.get(email) || false;
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
  
  // Gestion du tiroir 
  openDrawer(creditor: CreditorDetail) {
    this.selectedCreditor = creditor;
    this.showDrawer = true;

    //On appelle Strapi pour récupérer le user associé au créancier
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

  // Mise à jour après création d'utilisateur
  onUserCreated(user: any) {
    console.log('Utilisateur Strapi créé:', user);
    this.selectedUser = user;
    // Mettre à jour le statut dans la map
    if (this.selectedCreditor) {
      this.userStatusMap.set(this.selectedCreditor.emailProfessionnel, true);
    }
  }


// Méthode pour obtenir le nombre de créanciers inscrits
getRegisteredCount(): number {
  return this.creditors.filter(creditor => 
    this.isUserRegistered(creditor.emailProfessionnel)
  ).length;
}

// Méthode pour obtenir le nombre de créanciers non-inscrits
getNonRegisteredCount(): number {
  return this.creditors.filter(creditor => 
    !this.isUserRegistered(creditor.emailProfessionnel)
  ).length;
}

}