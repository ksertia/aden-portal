import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { AdminService } from '../../../services/admin.service';
import { DebtorInfo } from '../../../models/case.model';
import { UserCreateComponent } from '../user-create/user-create.component';

@Component({
  selector: 'app-debiteur',
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule, UserCreateComponent],
  templateUrl: './debiteur.html',
  styleUrls: ['./debiteur.css']
})
export class Debiteur implements OnInit {
  // État du tiroir
  showDrawer = false;
  selectedDebtor: DebtorInfo | null = null;
  selectedUser: any | null = null; // données Strapi User


  // Liste brute et filtrée
  debiteurs: DebtorInfo[] = [];
  filteredDebiteurs: DebtorInfo[] = [];

  // Gestion des filtres
  filters = {
    searchTerm: ''
  };

  // Vue courante : 'grid' ou 'table'
  currentView: 'grid' | 'table' = 'grid';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDebiteurs();
  }

  loadDebiteurs() {
    const sitename = 'portail-recouvrement';
    this.adminService.getDebiteurs(sitename).subscribe({
      next: (data: DebtorInfo[]) => {
        this.debiteurs = data;
        this.filteredDebiteurs = [...this.debiteurs];
      },
      error: (err) => console.error(err)
    });
  }

  applyFilters() {
    const term = this.filters.searchTerm.toLowerCase();
    this.filteredDebiteurs = this.debiteurs.filter(d =>
      (d.firstName && d.firstName.toLowerCase().includes(term)) ||
      (d.lastName && d.lastName.toLowerCase().includes(term)) ||
      (d.email && d.email.toLowerCase().includes(term)) ||
      (d.phone && d.phone.toLowerCase().includes(term))
    );
  }

  resetFilters() {
    this.filters.searchTerm = '';
    this.filteredDebiteurs = [...this.debiteurs];
  }

  statusClass(status: string) {
    switch (status) {
      case 'actif': return 'status-active';
      case 'inactif': return 'status-inactive';
      default: return 'status-default';
    }
  }

 // --- Gestion du tiroir ---
openDrawer(debtor: DebtorInfo) {
  this.selectedDebtor = debtor;
  this.showDrawer = true;

  // ⚡ On appelle Strapi pour récupérer le user associé au débiteur
  this.adminService.getUserByEmail(debtor.email).subscribe({
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
    this.selectedDebtor = null;
  }

  onUserCreated(user: any) {
  console.log('Utilisateur Strapi créé:', user);
  this.selectedUser = user;
}

}
