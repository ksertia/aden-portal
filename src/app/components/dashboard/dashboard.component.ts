import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CaseService } from '../../services/case.service';
import { User, StrapiRole } from '../../models/user.model';
import { DebtCase, CreditorDetail, DebtorInfo, HuissierInfo, AvocatInfo, PartenaireInfo } from '../../models/case.model';
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
  debiteurs: DebtorInfo[] = [];
  filteredDebiteurs: DebtorInfo[] = [];
  huisier: HuissierInfo[] = [];
  filteredHuisier: HuissierInfo[] = [];
  avocat: AvocatInfo[] = [];
  filteredAvocat: AvocatInfo[] = [];
  partenaire: PartenaireInfo[] = [];
  filteredPartenaire: PartenaireInfo[] = [];

  currentUser: User | null = null;
  userCases: DebtCase[] = [];
  statistics: any = null;

  translations: any = {};

  // tableau final regroupant un utilisateur de chaque rôle
  highlightedUsers: any[] = [];

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
    this.caseService.getCasesByUserId(this.currentUser.id, this.currentUser.role.name)
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
        this.buildHighlightedUsers(); // mise à jour
      },
      error: (err) => console.error(err)
    });

    this.adminService.getDebiteurs(sitename).subscribe({
      next: (data: DebtorInfo[]) => {
        this.debiteurs = data;
        this.filteredDebiteurs = [...this.debiteurs];
        this.buildHighlightedUsers(); // mise à jour
      },
      error: (err) => console.error(err)
    });

    this.adminService.getHuissiers(sitename).subscribe({
      next: (data: HuissierInfo[]) => {
        this.huisier = data;
        this.filteredHuisier = [...this.huisier];
        this.buildHighlightedUsers(); // mise à jour
      },
      error: (err) => console.error(err)
    });

    this.adminService.getAvocats(sitename).subscribe({
      next: (data: AvocatInfo[]) => {
        this.avocat = data;
        this.filteredAvocat = [...this.avocat];
        this.buildHighlightedUsers(); // mise à jour
      },
      error: (err) => console.error(err)
    });

    this.adminService.getPartenaires(sitename).subscribe({
      next: (data: PartenaireInfo[]) => {
        this.partenaire = data;
        this.filteredPartenaire = [...this.partenaire];
        this.buildHighlightedUsers(); // mise à jour
      },
      error: (err) => console.error(err)
    });
  }

  // Regroupe un utilisateur de chaque rôle
  buildHighlightedUsers() {
    this.highlightedUsers = [];

    if (this.filteredDebiteurs.length > 0) {
      const deb = this.filteredDebiteurs[0];
      this.highlightedUsers.push({
        creditorName: deb.firstName || deb.lastName || "Débiteur inconnu",
        Secteur: deb.companyName,
        email: deb.email,
        phone: deb.phone,
        status: deb.type ? "Actif" : "Inactif",
        role: "Débiteur"
      });
    }

    if (this.filteredCreditors.length > 0) {
      const cred = this.filteredCreditors[0];
      this.highlightedUsers.push({
        creditorName: cred.contactPrincipal || cred.raisonSociale || "Créancier inconnu",
        Secteur: cred.secteurActivite,
        email: cred.emailProfessionnel,
        phone: cred.telephone,
        status: cred.secteurActivite ? "Actif" : "Inactif",
        role: "Créancier"
      });
    }

    if (this.filteredHuisier.length > 0) {
      const huis = this.filteredHuisier[0];
      this.highlightedUsers.push({
        creditorName: huis.nomHuissier|| "Huissier inconnu",
        Secteur: huis.nomEtude,
        email: huis.emailProfessionnel,
        phone: huis.telephone,
        status: huis.commentaires ? "Actif" : "Inactif",
        role: "Huissier"
      });
    }

    if (this.filteredAvocat.length > 0) {
      const av = this.filteredAvocat[0];
      this.highlightedUsers.push({
        creditorName: av.prenomAvocat || av.nomAvocat || "Avocat inconnu",
        Secteur: av.nomCabinet,
        email: av.emailProfessionnel,
        phone: av.telephone,
        status: av.nomCabinet ? "Actif" : "Inactif",
        role: "Avocat"
      });
    }

    if (this.filteredPartenaire.length > 0) {
      const part = this.filteredPartenaire[0];
      this.highlightedUsers.push({
        creditorName: part.nomCommercial || "Partenaire inconnu",
        Secteur: part.typePartenaire,
        email: part.emailProfessionnel,
        phone: part.telephone,
        status: part.typePartenaire ? "Actif" : "Inactif",
        role: "Partenaire"
      });
    }
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

  // retourne une classe CSS (string) à appliquer selon le status
  statusClass(status: string): string {
    if (!status) return 'badge badge-secondary';
    return status.toLowerCase() === 'actif'
      ? 'badge badge-success light border-0'
      : 'badge badge-danger light border-0';
  }
}
