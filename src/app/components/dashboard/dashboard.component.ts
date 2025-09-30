import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CaseService } from '../../services/case.service';
import { User, StrapiRole } from '../../models/user.model';
import { DebtCase, CreditorDetail } from '../../models/case.model';
import { I18nService } from '../../services/i18n.service';
import { AdminService } from '../../services/admin.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  creditors: CreditorDetail[] = [];
  filteredCreditors: CreditorDetail[] = [];
  


  currentUser: User | null = null;
  userCases: DebtCase[] = [];
  statistics: any = null;

  translations: any = {};



  constructor(
    private authService: AuthService,
    private caseService: CaseService,
    private i18nService: I18nService,
    private adminService: AdminService
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
    return this.authService.hasRole(StrapiRole.ADMINISTRATEUR);
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

      const sitename = 'portail-recouvrement';
  
    this.adminService.getCreanciers(sitename).subscribe({
      next: (data: CreditorDetail[]) => {
        this.creditors = data;
        this.filteredCreditors = [...this.creditors];
      },
      error: (err) => console.error(err)
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
