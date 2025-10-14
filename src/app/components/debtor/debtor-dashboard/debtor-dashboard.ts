import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';
import { User, StrapiRole } from '../../../models/user.model';
import { AdminService } from '../../../services/admin.service';
import { CreditorDetail } from '../../../models/case.model';

@Component({
  selector: 'app-debtor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './debtor-dashboard.html',
  styleUrls: ['./debtor-dashboard.css']
})
export class DebtorDashboard implements OnInit {

  currentUser: User | null = null;
 
  dossiers: any[] = [];
  isLoading = true;
  errorMessage = '';

  filteredDossiers: any[] = [];

  ActiveCasesCount: number = 0;
  PendingCasesCount: number = 0;

  // Liste brute et filtrée pour pouvoir extraire le lastname, le firstname, l'email, le telephone et le type du débiteur (importer depuis AdminService)
  creditors: CreditorDetail[] = [];
  filteredCreditors: CreditorDetail[] = [];

  selectedcreditor: CreditorDetail | undefined;

  selectedIndex: number | null = null;
  showCaseDetailsModal = false;

  constructor(
    private authService: AuthService,
    private casesService: CaseService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    this.loadDossiers();
  }
  
  // Chargement des dossiers
  loadDossiers() {
    const siteName = 'portail-recouvrement';
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.isLoading = false;
      return;
    }

    const debiteurNodeId = currentUser.nodeId;
    console.log('Débiteur connecté :', currentUser);
    console.log('debiteurNodeId envoyé :', debiteurNodeId);

    if (!debiteurNodeId) {
      this.errorMessage = 'Identifiant du débiteur introuvable.';
      this.isLoading = false;
      return;
    }

    this.casesService.getDossiersDebiteur(siteName, debiteurNodeId).subscribe({
      next: (response) => {
        console.log('Réponse API dossiers :', response);
        this.dossiers = response.data?.map((item: any) => item.map) || [];

        //  mise à jour des statistiques
        this.updateCaseStatistics(); 

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des dossiers :', error);
        this.errorMessage = 'Impossible de récupérer les dossiers.';
        this.isLoading = false;
      }
    });

     // Appel du web service pour la recuperation des données(extraction du lastname,firstname,email,telephone et type) du creancier 
    this.adminService.getCreanciers(siteName).subscribe({
      next: (data: CreditorDetail[]) => {
        this.creditors = data;
        this.filteredCreditors = [...this.creditors];
      },
      error: (err) => console.error(err)
    });
  }

   // Ici on compare le debiteurNodeId avec nodeId du dossier qui correspond au debiteur 
    getCreancierForDossier(dossier: any): CreditorDetail | undefined {
        return this.creditors.find(d => d.nodeId === dossier.creancierNodeId);
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

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'active': 'Actif',
      'negotiation': 'Négociation',
      'legal_action': 'Action légale',
      'payment_plan': 'Plan de paiement',
      'completed': 'Terminé',
      'closed': 'Fermé',
      'new': 'Nouveau'
    };
    return labels[status] || status;
  }

  // Calcule le montant total dû par le débiteur
  getTotalDebt(): number {
    if (!this.dossiers || this.dossiers.length === 0) return 0;

    // On additionne tous les montants totaux des dossiers
    return this.dossiers.reduce((sum, dossier) => {
      const montant = dossier.montantTotal || 0;
      return sum + montant;
    }, 0);
  }

  updateCaseStatistics(): void {
    if (!this.dossiers || this.dossiers.length === 0) {
      this.ActiveCasesCount = 0;
      this.PendingCasesCount = 0;
      return;
    }

    this.ActiveCasesCount = this.dossiers.filter((d) => {
      const statut = d.statutGlobal?.toLowerCase().trim();
      return statut === 'nouveau' || statut === 'new' || statut === 'active';
    }).length;

    this.PendingCasesCount = this.dossiers.filter((d) => {
      const statut = d.statutGlobal?.toLowerCase().trim();
      return (
        statut === 'en_attente' ||
        statut === 'pending' ||
        statut === 'attente' ||
        statut === 'waiting'
      );
    }).length;
  }

  formatCurrency(amount: number): string {
    if (!amount) return '0FCFA';
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    });
  }

  getPaymentPercentage(dossier: any): number {
    const total = dossier.montantTotal || 0;
    const paid = dossier.montantPaye || 0;
    return total ? Math.round((paid / total) * 100) : 0;
  }


}
