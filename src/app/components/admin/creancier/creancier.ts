import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { DebtCase, CaseStatus, Priority, CaseFilter, CreditorDetail } from '../../../models/case.model';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-creancier',
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule],
  templateUrl: './creancier.html',
  styleUrl: './creancier.css'
})
export class Creancier  implements OnInit {
 
  // drawer
  showDrawer = false;
  selectedCreditor: CreditorDetail | null = null;

  creditors: CreditorDetail[] = [];
  filteredCreditors: CreditorDetail[] = [];
  
  // Gestion des filtres
  filters = {
    searchTerm: ''
  };

  // Vue courante : 'grid' ou 'table'
  currentView: 'grid' | 'table' = 'grid';
  
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
 
   // gestion tiroir
  openDrawer(creditor: CreditorDetail) {
    this.selectedCreditor = creditor;
    this.showDrawer = true;
  }

  closeDrawer() {
    this.showDrawer = false;
    this.selectedCreditor = null;
  }

}
