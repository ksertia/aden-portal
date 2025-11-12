import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';
import { User, StrapiRole } from '../../../models/user.model';
import { DebtCase } from '../../../models/case.model';
import { AdminService } from '../../../services/admin.service';
import { DebtorInfo } from '../../../models/case.model';

@Component({
  selector: 'app-bailiff-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './bailiff-dashboard.html',
  styleUrl: './bailiff-dashboard.css'
})
export class BailiffDashboard implements OnInit {

  currentUser: User | null = null;

  dossiers: any[] = [];
  isLoading = true;
  errorMessage = '';

  filteredDossiers: any[] = [];

  activeCount: number = 0;
  pendingCount: number = 0;

  // Liste brute et filtrée pour pouvoir extraire le lastname, le firstname, l'email, le telephone et le type du débiteur (importer depuis AdminService)
  debiteurs: DebtorInfo[] = [];
  filteredDebiteurs: DebtorInfo[] = [];

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

    // Verification si l'utilisateur est connecté
    if (!currentUser) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.isLoading = false;
      return;
    }

    const huissierNodeId = currentUser.nodeId;
    // Verification si l'utilisateur connecté à un NodeId
    if (!huissierNodeId) {
      this.errorMessage = 'Identifiant du créancier introuvable.';
      this.isLoading = false;
      return;
    }

    // Appel du web service pour la recuperation des dossiers du creanciers
    this.casesService.getDossiersHuissier(siteName, huissierNodeId).subscribe({
      next: (response) => {

        // Étape 1 : extraction correcte du tableau de dossiers
        const dossiers = response.data?.map((item: any) => item.map) || [];

        // Étape 2 : filtrage local
        this.dossiers = dossiers.filter(
          (d: any) => d.huissierNodeId === huissierNodeId
        );

        //  mise à jour des statistiques
        this.updateCaseStatistics(); 

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Impossible de récupérer les dossiers.';
        this.isLoading = false;
      }
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

  // Ici on compare le debiteurNodeId avec nodeId du dossier qui correspond au debiteur 
  getDebiteurForDossier(dossier: any): DebtorInfo | undefined {
    const debiteurNodeId = dossier.debiteurNodeId?.trim(); // <-- on supprime les espaces
    return this.debiteurs.find(d => String(d.nodeId).trim() === String(debiteurNodeId));
    // return this.debiteurs.find(d => d.nodeId === dossier.debiteurNodeId);
  }

  getTotalDebt(): number {
    return this.filteredDossiers.reduce((acc, d) => acc + (d.montantTotal || 0), 0);
  }

  getPaymentPercentage(dossier: any): number {
    const total = dossier.montantTotal || 0;
    const paid = dossier.montantPaye || 0;
    return total ? Math.round((paid / total) * 100) : 0;
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

   formatCurrency(amount: number): string {
    if (!amount) return '0 FCFA';
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    });
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
