import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';
import { User, StrapiRole } from '../../../models/user.model';
import { DebtCase } from '../../../models/case.model';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-debtor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './debtor-dashboard.html',
  styleUrls: ['./debtor-dashboard.css']
})
export class DebtorDashboard implements OnInit {

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

  // get isDebtorUser(): boolean {
  //   return this.authService.hasRole(StrapiRole.DEBTOR);
  // }

  // get isBailiffUser(): boolean {
  //   return this.authService.hasRole(StrapiRole.BAILIFF);
  // }

  // get isLawyerUser(): boolean {
  //   return this.authService.hasRole(StrapiRole.LAWYER);
  // }

  // get isCreditorUser(): boolean {
  //   return this.authService.hasRole(StrapiRole.CREDITOR);
  // }

  // get isCedantUser(): boolean {
  //   return this.authService.hasRole(StrapiRole.CEDANT);
  // }

  loadDashboardData() {
    if (!this.currentUser) return;

    // Charger les dossiers de l'utilisateur
    this.caseService.getCasesByUserId(this.currentUser.id, this.currentUser!.role.name)
      .subscribe(cases => {
        this.userCases = cases.length? cases : [
          // Simulation de données pour tester l'affichage
          { caseNumber: 'DOS-001', status: 'active', amount: 1000, amountPaid: 200 } as DebtCase,
          { caseNumber: 'DOS-002', status: 'pending', amount: 500, amountPaid: 0 } as DebtCase,
          { caseNumber: 'DOS-003', status: 'closed', amount: 800, amountPaid: 800 } as DebtCase,
        ]
      });

    // Charger les statistiques
    this.caseService.getStatistics()
      .subscribe(stats => {
        this.statistics = stats;
      });
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

  getNextDueDate(): string {
    if (this.userCases.length === 0) return 'Aucune';
    
    const activeCases = this.userCases.filter(c => c.status === 'active' || c.status === 'payment_plan');
    if (activeCases.length === 0) return 'Aucune';
    
    const nextDue = activeCases
      .map(c => c.dueDate)
      .filter(date => new Date(date) > new Date())
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
    
    return nextDue ? new Date(nextDue).toLocaleDateString('fr-FR') : 'Aucune';
  }




   // données statique
  filteredCase = [
    {
      creditorName: 'SAWADOGO Ahmad Abdoul-Latif',
      username: 'Computer Science',
      email: 'Débiteur@gmail.com',
      phone: '+91 123 456 7890',
      status: 'Actif',
      role: 'Débiteur'
    },
    {
      creditorName: 'Kagambega Aboubacar ',
      username: 'Computer Science',
      email: 'Créancierr@gmail.com',
      phone: '+91 123 456 7891',
      status: 'Inactif',
      role: 'Créancier'
    },
    
    {
      creditorName: 'Bikiega Faril ',
      username: 'Computer Science',
      email: 'Huissier@gmail.com',
      phone: '+91 123 456 7891',
      status: 'Actif',
      role: 'Huissier'
    },
    {
      creditorName: 'Mr Konate Constant',
      username: 'Computer Science',
      email: 'Avocat@gmail.com',
      phone: '+91 123 456 7891',
      status: 'Inactif',
      role: 'Avocat'
    },
    {
      creditorName: 'Mr Wise',
      username: 'Computer Science',
      email: 'Cédant@gmail.com',
      phone: '+91 123 456 7891',
      status: 'Actif',
      role: 'Cédant'
    },
    {
      creditorName: 'KABORE FAICAL',
      username: 'Computer Science',
      email: 'Partenaire@gmail.com',
      phone: '+91 123 456 7891',
      status: 'Inactif',
      role: 'Partenaire'
    }
  ];
   // retourne une classe CSS (string) à appliquer selon le status
  statusClass(status: string): string {
    if (!status) return 'badge badge-secondary';
    return status.toLowerCase() === 'actif'
      ? 'badge badge-success light border-0'
      : 'badge badge-danger light border-0';
  }


}
