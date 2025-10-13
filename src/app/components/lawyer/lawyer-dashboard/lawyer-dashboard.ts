import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';
import { User, StrapiRole } from '../../../models/user.model';
import { AdminService } from '../../../services/admin.service';
import { CreditorDetail } from '../../../models/case.model';

@Component({
  selector: 'app-lawyer-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './lawyer-dashboard.html',
  styleUrl: './lawyer-dashboard.css'
})
export class LawyerDashboard implements OnInit{

  currentUser: User | null = null;
 
  dossiers: any[] = [];
  isLoading = true;
  errorMessage = '';

  filteredDossiers: any[] = [];

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

    const avocatNodeId = currentUser.nodeId;
    console.log('Avocat connecté :', currentUser);
    console.log('avocatNodeId envoyé :', avocatNodeId);

    if (!avocatNodeId) {
      this.errorMessage = 'Identifiant de lavocat introuvable.';
      this.isLoading = false;
      return;
    }

    this.casesService.getDossiersAvocat(siteName, avocatNodeId).subscribe({
      next: (response) => {

      // Récupère tous les dossiers
      const allDossiers = response.data?.map((item: any) => item.map) || [];
      // Filtre uniquement les dossiers de l'avocat connecté
      this.dossiers = allDossiers.filter((d: any) => d.avocatNodeId === avocatNodeId);
      console.log('Réponse API dossiers :', this.dossiers);

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

  getTotalDebt(): number {
    return this.filteredDossiers.reduce((acc, d) => acc + (d.montantTotal || 0), 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getPaymentPercentage(dossier: any): number {
    const total = dossier.montantTotal || 0;
    const paid = dossier.montantPaye || 0;
    return total ? Math.round((paid / total) * 100) : 0;
  }


}
