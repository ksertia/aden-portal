import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import {  HuissierInfo } from '../../../models/case.model';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-huissier',
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule],
  templateUrl: './huissier.html',
  styleUrl: './huissier.css'
})
export class Huissier  implements OnInit {

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

}

