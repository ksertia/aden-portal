import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';
import { User, StrapiRole } from '../../../models/user.model';
import { DebtCase } from '../../../models/case.model';

@Component({
  selector: 'app-creditor-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './creditor-dashboard.html',
  styleUrl: './creditor-dashboard.css'
})
export class CreditorDashboard implements OnInit{

   currentUser: User | null = null;
  userCases: DebtCase[] = [];
  statistics: any = null;

  constructor(
    private authService: AuthService,
    private caseService: CaseService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData() {
    if (!this.currentUser) return;

    // Charger les dossiers de l'utilisateur
    this.caseService.getCasesByUserId(this.currentUser.id, this.currentUser!.role.name)
      .subscribe(cases => {
        this.userCases = cases.length? cases : [
          // Simulation de données pour tester l'affichage
          { caseNumber: 'DOS-200', status: 'active', amount: 1000, amountPaid: 200 } as DebtCase,
          { caseNumber: 'DOS-202', status: 'pending', amount: 500, amountPaid: 0 } as DebtCase,
          { caseNumber: 'DOS-203', status: 'closed', amount: 800, amountPaid: 800 } as DebtCase,
        ]
      });

    // Charger les statistiques
    this.caseService.getStatistics()
      .subscribe(stats => {
        this.statistics = stats;
      });
  }

    getUserRoleLabel(): string {
    if (!this.currentUser) return '';
    switch (this.currentUser.role.name) {
      case StrapiRole.DEBTOR: return 'Débiteur';
      case StrapiRole.BAILIFF: return 'Huissier de Justice';
      case StrapiRole.LAWYER: return 'Avocat';
      case StrapiRole.CREDITOR: return 'Créancier';
      case StrapiRole.CEDANT: return 'Cédant';
      case StrapiRole.PARTNER: return 'Partenaire';
      case StrapiRole.RECOVERY_PARTNER: return 'Partenaire de recouvrement';
      case StrapiRole.ADMINISTRATEUR: return 'Administrateur';
      default: return 'Rôle inconnu';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'active': 'Actif',
      'negotiation': 'Négociation',
      'legal_action': 'Action légale',
      'payment_plan': 'Plan de paiement',
      'completed': 'Terminé',
      'closed': 'Fermé'
    };
    return labels[status] || status;
  }

}
