import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';
import { User, StrapiRole } from '../../../models/user.model';
import { AdminService } from '../../../services/admin.service';
import { CreditorDetail, DebtorInfo } from '../../../models/case.model';

@Component({
  selector: 'app-partner-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './partner-dashboard.html',
  styleUrl: './partner-dashboard.css'
})
export class PartnerDashboard implements OnInit{

  currentUser: User | null = null;
 
  dossiers: any[] = [];
  isLoading = true;
  errorMessage = '';

  filteredDossiers: any[] = [];

  activeCount: number = 0;
  pendingCount: number = 0;

  // Liste brute et filtrée pour pouvoir extraire le lastname, le firstname, l'email, le telephone et le type du créancier (importer depuis AdminService)
  creditors: CreditorDetail[] = [];
  filteredCreditors: CreditorDetail[] = [];
  selectedcreditor: CreditorDetail | undefined;

  // Liste brute et filtrée pour pouvoir extraire le lastname, le firstname, l'email, le telephone et le type du débiteur (importer depuis AdminService)
  debiteurs: DebtorInfo[] = [];
  filteredDebiteurs: DebtorInfo[] = [];
  selectedDebtor: DebtorInfo | undefined;

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

    const partenaireNodeId = currentUser.nodeId;
    console.log('partenair connecté :', currentUser);
    console.log('partenaireNodeId envoyé :', partenaireNodeId);

    if (!partenaireNodeId) {
      this.errorMessage = 'Identifiant du partenaire introuvable.';
      this.isLoading = false;
      return;
    }

    this.casesService.getDossiersPartenaire(siteName, partenaireNodeId).subscribe({
      next: (response) => {

      // Récupère tous les dossiers
      const allDossiers = response.data?.map((item: any) => item.map) || [];
      // Filtre uniquement les dossiers de l'avocat connecté
      this.dossiers = allDossiers.filter((d: any) => d.partenaireNodeId === partenaireNodeId);
      console.log('Réponse API dossiers :', this.dossiers);

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

    // Appel du web service pour la recuperation des données(extraction du lastname,firstname,email,telephone et type) du débiteurs 
    this.adminService.getDebiteurs(siteName).subscribe({
        next: (data: DebtorInfo[]) => {
          this.debiteurs = data;
          this.filteredDebiteurs = [...this.debiteurs];
        },
        error: (err) => console.error(err)
    });
  }

  // Ici on compare le debiteurNodeId avec nodeId du dossier qui correspond au creancier 
  getCreancierForDossier(dossier: any): CreditorDetail | undefined {
    return this.creditors.find(d => d.nodeId === dossier.creancierNodeId);
  }

  // Ici on compare le debiteurNodeId avec nodeId du dossier qui correspond au debiteur 
  getDebiteurForDossier(dossier: any): DebtorInfo | undefined {
    const debiteurNodeId = dossier.debiteurNodeId?.trim(); // <-- on supprime les espaces
    return this.debiteurs.find(d => String(d.nodeId).trim() === String(debiteurNodeId));
  }


  getUserRoleLabel(): string {
    if (!this.currentUser) return '';
    switch (this.currentUser.role.name) {
      case StrapiRole.DEBTOR: return 'Débiteur';
      case StrapiRole.BAILIFF: return 'Huissier de Justice';
      case StrapiRole.LAWYER: return 'Avocat';
      case StrapiRole.CREDITOR: return 'Créancier';
      case StrapiRole.CEDANT: return 'Cédant';
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

  getTotalDebt(): number {
    return this.filteredDossiers.reduce((acc, d) => acc + (d.montantTotal || 0), 0);
  }

   formatCurrency(amount: number): string {
    if (!amount) return '0 FCFA';
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

   updateCaseStatistics(): void {
    if (!this.dossiers || this.dossiers.length === 0) {
      this.activeCount = 0;
      this.pendingCount = 0;
      return;
    }

    this.activeCount = this.dossiers.filter((d) => {
      const statut = d.stepGlobal?.toLowerCase().trim();
      return statut === 'actif' || statut === 'active';
    }).length;

    this.pendingCount = this.dossiers.filter((d) => {
      const statut = d.stepGlobal?.toLowerCase().trim();
      return statut === 'en_attente' || statut === 'pending' || statut === 'attente';
    }).length;
  }

}
