import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CaseService } from '../../services/case.service';
import { User, UserRole } from '../../models/user.model';
import { DebtCase } from '../../models/case.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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

  get isDebtorUser(): boolean {
    return this.authService.hasRole(UserRole.DEBTOR);
  }

  get isBailiffUser(): boolean {
    return this.authService.hasRole(UserRole.BAILIFF);
  }

  get isLawyerUser(): boolean {
    return this.authService.hasRole(UserRole.LAWYER);
  }

  get isCreditorUser(): boolean {
    return this.authService.hasRole(UserRole.CREDITOR);
  }

  get isCedantUser(): boolean {
    return this.authService.hasRole(UserRole.CEDANT);
  }

  loadDashboardData() {
    if (!this.currentUser) return;

    // Charger les dossiers de l'utilisateur
    this.caseService.getCasesByUserId(this.currentUser.id, this.currentUser.role)
      .subscribe(cases => {
        this.userCases = cases;
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
}
