import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter, CaseNote } from '../../../models/case.model';
import { RouterModule } from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { AdminService } from '../../../services/admin.service';
import { CreditorDetail } from '../../../models/case.model';
import { DebtorInfo } from '../../../models/case.model';

@Component({
  selector: 'app-lawyer-cases',
  standalone: true,
  imports: [CommonModule,  ViewToggleComponent, FormsModule, RouterModule],
  templateUrl: './lawyer-cases.component.html',
  styleUrls: ['./lawyer-cases.component.css']
})
export class LawyerCasesComponent implements OnInit {
  
  filters: CaseFilter = {};
  
  showReviewModal = false;
  showNoteModal = false;
  selectedCase: DebtCase | null = null;
  
  legalReview = {
    recommendation: '',
    analysis: '',
    nextSteps: ''
  };
  
  newNote: Partial<CaseNote> = {
    content: '',
    type: 'legal',
    isPrivate: true
  };



  dossiers: any[] = [];
  isLoading = true;
  errorMessage = '';

  currentView: 'grid' | 'table' = 'table';

    // --- Filtres ---
  // filters = {
  //   searchTerm: '',
  //   status: '',
  //   priority: ''
  // };

  selectedStatus = '';
  selectedPriority = '';
  filteredDossiers: any[] = [];

  dateFrom = '';
  dateTo = '';

   // Liste brute et filtrée pour pouvoir extraire le lastname, le firstname, l'email, le telephone et le type du créancier (importer depuis AdminService)
  creditors: CreditorDetail[] = [];
  filteredCreditors: CreditorDetail[] = [];

  selectedcreditor: CreditorDetail | undefined;

  // Liste brute et filtrée pour pouvoir extraire le lastname, le firstname, l'email, le telephone et le type du débiteur (importer depuis AdminService)
  debiteurs: DebtorInfo[] = [];
  filteredDebiteurs: DebtorInfo[] = [];

  selectedDebtor: DebtorInfo | undefined;

  selectedIndex: number | null = null;

  constructor(
    private caseService: CaseService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit() {

    this.loadDossiers();
  }

  loadDossiers() {
    const siteName = 'portail-recouvrement';
    const currentUser = this.authService.getCurrentUser();

    // Verification si l'utilisateur est connecté
    if (!currentUser) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.isLoading = false;
      return;
    }

    const avocatNodeId = currentUser.nodeId;
    console.log('Avocat connecté :', currentUser);
    console.log('avocatNodeId envoyé :', avocatNodeId);

    // Verification si l'utilisateur connecté à un NodeId
    if (!avocatNodeId) {
      this.errorMessage = 'Identifiant de avocat introuvable.';
      this.isLoading = false;
      return;
    }

    // Appel du web service pour la recuperation des dossiers du avocat
    this.caseService.getDossiersAvocat(siteName, avocatNodeId).subscribe({
      next: (response) => {
        console.log('Réponse API dossiers :', response);
      // Récupère tous les dossiers
      const allDossiers = response.data?.map((item: any) => item.map) || [];
      // Filtre uniquement les dossiers de l'avocat connecté
      this.dossiers = allDossiers.filter((d: any) => d.avocatNodeId === avocatNodeId);
      console.log('Réponse API dossiers :', this.dossiers);
        this.filteredDossiers = [...this.dossiers];
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

  // Ici on compare le debiteurNodeId avec le nodeId du dossier qui correspond au créancier
  getCreancierForDossier(dossier: any): CreditorDetail | undefined {
    return this.creditors.find(d => d.nodeId === dossier.creancierNodeId);
  }

  // Ici on compare le debiteurNodeId avec le nodeId du dossier qui correspond au debiteur 
  getDebiteurForDossier(dossier: any): DebtorInfo | undefined {
    const debiteurNodeId = dossier.debiteurNodeId?.trim(); // <-- on supprime les espaces
    return this.debiteurs.find(d => String(d.nodeId).trim() === String(debiteurNodeId));
    // return this.debiteurs.find(d => d.nodeId === dossier.debiteurNodeId);
  }

  getTotalPaid(): number {
    return this.filteredDossiers.reduce((acc, d) => acc + (d.montantPaye || 0), 0);
  }
  getFormattedRemainingAmount(dossier: any): string {
  const reste = (dossier.montantTotal || 0) - (dossier.montantPaye || 0);
  return reste.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  }

  // Filtres dynamiques sur les dossiers 
  applyFilters() {
    this.filteredDossiers = this.dossiers.filter((dossier) => {
       console.log('➡️ Statut dossier :', dossier.statutGlobal); // 👈 Ajoute ceci
      const searchTerm = this.filters.searchTerm?.toLowerCase() || '';
      const status = this.selectedStatus;
      const dateFrom = this.dateFrom ? new Date(this.dateFrom) : null;
      const dateTo = this.dateTo ? new Date(this.dateTo) : null;

      //  Filtre par mot-clé 
      const matchesSearch =
        !searchTerm ||
        dossier.numeroDossier?.toLowerCase().includes(searchTerm) ||
        this.getCreancierForDossier(dossier)?.contactPrincipal?.toLowerCase().includes(searchTerm) ||
        this.getDebiteurForDossier(dossier)?.firstName?.toLowerCase().includes(searchTerm) ||
        this.getDebiteurForDossier(dossier)?.lastName?.toLowerCase().includes(searchTerm);


      // Filtre par statut
      const matchesStatus = !status || dossier.statutGlobal === status;

      // Filtre par date de création 
      const dossierDate = dossier.dateCreation ? new Date(dossier.dateCreation) : null;
      const matchesDate =
        (!dateFrom || (dossierDate && dossierDate >= dateFrom)) &&
        (!dateTo || (dossierDate && dossierDate <= dateTo));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  //  Réinitialiser tous les filtres 
  resetFilters() {
    this.filters = { searchTerm: '' };
    this.selectedStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.filteredDossiers = [...this.dossiers];
  }

  // Mese à jour la liste filtrée selon le statut 
  updateStatusFilter() {
    this.applyFilters();
  }

  // Mese à jour la liste filtrée selon les dates 
  updateDateFilter() {
    this.applyFilters();
  }

  // Pour le Taux de résolution
  getSuccessRate(): number {
    if (!this.filteredDossiers || this.filteredDossiers.length === 0) {
      return 0; // Évite les divisions par zéro
    }

    const completedCount = this.filteredDossiers.filter(
      (dossier) => dossier.statutGlobal === 'completed'
    ).length;

    const rate = (completedCount / this.filteredDossiers.length) * 100;
    return Math.round(rate); // Retourne un entier (ex: 75 au lieu de 74.6)
  }

  // Pour l'action legal
  getLegalActionCases(): number {
    if (!this.filteredDossiers || this.filteredDossiers.length === 0) {
    return 0;
  }

  return this.filteredDossiers.filter(
    (dossier) => dossier.statutGlobal === 'legal_action'
    ).length;
  }

  getPaymentPercentage(dossier: any): number {
    if (!dossier || !dossier.montantTotal || dossier.montantTotal === 0) {
     return 0; // Évite les erreurs ou divisions par zéro
    }

    const montantPaye = dossier.montantPaye || 0;
    const pourcentage = (montantPaye / dossier.montantTotal) * 100;

    // Arrondir à l'entier le plus proche (ex : 72%)
    return Math.round(pourcentage);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      'closed': 'Fermé',
      'NOUVEAU': 'Nouveau'
    };
    return labels[status] || status;
  }

  getPriorityClass(priority: string): string {
    switch(priority.toLowerCase()) {
      case 'low':
      case 'faible':
        return 'priorite-faible';
      case 'medium':
      case 'moyenne':
        return 'moyenne';
      case 'high':
      case 'elevee':
        return 'elevee';
      case 'urgent':
      case 'urgente':
        return 'urgente';
      case 'urgent':
      case 'normal':
      case 'normale':
        return 'normale';
      default:
        return '';
    }
  }

  reviewCase(case_: DebtCase) {
    this.selectedCase = case_;
    this.legalReview = {
      recommendation: '',
      analysis: '',
      nextSteps: ''
    };
    this.showReviewModal = true;
  }

 
  closeReviewModal() {
    this.showReviewModal = false;
    this.selectedCase = null;
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.selectedCase = null;
  }

  //Enregistrer la révision juridique
saveLegalReview() {

}

// Ajouter une note juridique 
saveNote() {

}

// Générer un rapport 
generateReport() {

}


  
}
