import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CaseService } from '../../services/case.service';
import { User, StrapiRole } from '../../models/user.model';
import { DebtCase } from '../../models/case.model';
import { I18nService } from '../../services/i18n.service';


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

  translations: any = {};

  constructor(
    private authService: AuthService,
    private caseService: CaseService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();

    this.loadTranslations();

    this.i18nService.currentLocale$.subscribe(() => {
      this.loadTranslations();
    });

  }

   private loadTranslations() {
    const locale = this.i18nService.getCurrentLocale();
    this.i18nService.loadTranslations(locale).subscribe(translations => {
      this.translations = translations;
    });
  }
  t(key: string): string {
    return this.i18nService.translate(key, this.translations);
  }

  // Getters pour vérifier les rôles de l'utilisateur
  get isDebtorUser(): boolean {
    return this.authService.hasRole(StrapiRole.DEBTOR);
  }

  get isBailiffUser(): boolean {
    return this.authService.hasRole(StrapiRole.BAILIFF);
  }

  get isLawyerUser(): boolean {
    return this.authService.hasRole(StrapiRole.LAWYER);
  }

  get isCreditorUser(): boolean {
    return this.authService.hasRole(StrapiRole.CREDITOR);
  }

  get isCedantUser(): boolean {
    return this.authService.hasRole(StrapiRole.CEDANT);
  }

  get isAdminUser(): boolean {
    return this.authService.hasRole(StrapiRole.ADMIN);
  }

  // Charger les données du tableau de bord
  loadDashboardData() {
    if (!this.currentUser) return;

    // Charger les dossiers de l'utilisateur en fonction de son rôle
    this.caseService.getCasesByUserId(this.currentUser.id, this.currentUser.role.name) // Utiliser le nom du rôle pour filtrer
      .subscribe(cases => {
        this.userCases = cases;
      });

    // Charger les statistiques
    this.caseService.getStatistics()
      .subscribe(stats => {
        this.statistics = stats;
      });
  }

  // Formatage du montant en devise
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  // Récupérer l'étiquette pour un statut
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

  // Récupérer la prochaine date d'échéance
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
