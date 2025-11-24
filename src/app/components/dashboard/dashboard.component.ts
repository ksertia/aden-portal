import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
    private i18nService: I18nService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

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

  // Formatage du montant en devise
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

}










































// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';

// interface Echeance {
//   id: string;
//   dossierId: string;
//   dossierNumero: string;
//   debiteurName: string;
//   montant: number;
//   dateEcheance: Date;
//   datePaiement?: Date;
//   statut: 'paid' | 'current' | 'future';
//   modePaiement?: string;
//   progress?: number;
//   createdBy: string;
// }

// @Component({
//   selector: 'app-partner-payment-tracking',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule],
//   templateUrl: './partner-payment-tracking.html',
//   // styleUrls: ['./partner-payment-tracking.css']
// })
// export class PartnerPaymentTracking implements OnInit {

//   dossiers: any[] = [];
//   isLoading = true;
//   errorMessage = '';
//   // --- Filtres ---
//   filters = {
//     searchTerm: '',
//     status: '',
//     priority: ''
//   };

//   selectedStatus = '';
//   selectedPriority = '';
//   filteredDossiers: any[] = [];


//   // Données statiques
//   activePaymentTab: 'paid' | 'current' | 'future' = 'current';
//   echeances: Echeance[] = [];

//   ngOnInit() {
//     this.loadEcheances();
//   }

//   loadEcheances() {
    
//     // Données mockées pour test
//     this.echeances = [
//       {
//         id: '1',
//         dossierId: 'doss1',
//         dossierNumero: 'DOS-2024-001',
//         debiteurName: 'Jean Dupont',
//         montant: 150000,
//         dateEcheance: new Date('2024-01-15'),
//         datePaiement: new Date('2024-01-15'),
//         statut: 'paid',
//         modePaiement: 'Virement bancaire',
//         progress: 100,
//         createdBy: 'system'
//       },
//       {
//         id: '2',
//         dossierId: 'doss2',
//         dossierNumero: 'DOS-2024-002',
//         debiteurName: 'Marie Martin',
//         montant: 75000,
//         dateEcheance: new Date(),
//         statut: 'current',
//         progress: 50,
//         createdBy: 'system'
//       },
//       {
//         id: '3',
//         dossierId: 'doss3',
//         dossierNumero: 'DOS-2024-003',
//         debiteurName: 'Pierre Durand',
//         montant: 200000,
//         dateEcheance: new Date(new Date().setDate(new Date().getDate() + 10)),
//         statut: 'future',
//         createdBy: 'system'
//       }
//     ];

//     console.log('Échéances chargées:', this.echeances);
//   }

//   setActivePaymentTab(tab: 'paid' | 'current' | 'future') {
//     this.activePaymentTab = tab;
//     console.log('Onglet changé:', tab);
//   }

//   formatCurrency(amount: number): string {
//     if (!amount) return '0 FCFA';
//     return amount.toLocaleString('fr-FR', {
//       style: 'currency',
//       currency: 'XOF',
//       minimumFractionDigits: 0
//     });
//   }

//   formatDate(date: Date | string | null | undefined): string {
//     if (!date) return 'Non définie';
    
//     try {
//       const dateObj = new Date(date);
//       if (isNaN(dateObj.getTime())) {
//         return 'Date invalide';
//       }
      
//       return dateObj.toLocaleDateString('fr-FR', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric'
//       });
//     } catch (error) {
//       return 'Date invalide';
//     }
//   }

//   getDaysRemaining(dateEcheance: Date): number {
//     const today = new Date();
//     const echeance = new Date(dateEcheance);
//     const diffTime = echeance.getTime() - today.getTime();
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   }

//   getDaysUntil(dateEcheance: Date): number {
//     return this.getDaysRemaining(dateEcheance);
//   }

//   // Méthodes pour les actions (à implémenter)
//   viewPaymentDetails(echeance: Echeance) {
//     console.log('Voir détails paiement:', echeance);
//   }

//   recordPayment(echeance: Echeance) {
//     console.log('Enregistrer paiement:', echeance);
//   }

//   sendReminder(echeance: Echeance) {
//     console.log('Envoyer rappel:', echeance);
//   }

//   scheduleReminder(echeance: Echeance) {
//     console.log('Planifier rappel:', echeance);
//   }

//   viewEcheanceDetails(echeance: Echeance) {
//     console.log('Voir détails échéance:', echeance);
//   }

//   getStatusLabel(status: string): string {
//     const labels: { [key: string]: string } = {
//       'pending': 'En attente',
//       'active': 'Actif',
//       'negotiation': 'Négociation',
//       'legal_action': 'Action légale',
//       'payment_plan': 'Plan de paiement',
//       'completed': 'Terminé',
//       'closed': 'Fermé',
//       'new': 'Nouveau'
//     };
//     return labels[status] || status;
//   }

//   getPriorityClass(priority: string): string {
//     switch(priority.toLowerCase()) {
//       case 'low':
//       case 'faible':
//         return 'priorite-faible';
//       case 'medium':
//       case 'moyenne':
//         return 'moyenne';
//       case 'high':
//       case 'elevee':
//         return 'elevee';
//       case 'urgent':
//       case 'urgente':
//         return 'urgente';
//       case 'normal':
//       case 'normale':
//         return 'normale';
//       default:
//         return '';
//     }
//   }
//   // Lorsqu’on change le filtre de statut
//   updateStatusFilter(): void {
//     this.filters.status = this.selectedStatus;
//     this.applyFilters();
//   }

//   // Lorsqu’on change le filtre de priorité
//   updatePriorityFilter(): void {
//     this.filters.priority = this.selectedPriority;
//     this.applyFilters();
//   }


//   // Réinitialiser tous les filtres
//   resetFilters(): void {
//     this.filters = {
//       searchTerm: '',
//       status: '',
//       priority: ''
//     };
//     this.selectedStatus = '';
//     this.selectedPriority = '';
//     this.filteredDossiers = [...this.dossiers];
    
//     // Réappliquer les filtres pour tout réinitialiser
//     this.applyFilters();
//     console.log(' Filtres réinitialisés');
//   }

//   // Appliquer les filtres (nom, prénom, nom d’entreprise, numéro ou objet de dossier)
//   applyFilters(): void {
//     if (!this.echeances || this.echeances.length === 0) {
//       this.filteredDossiers = [];
//       return;
//     }

//     // Commence avec toutes les échéances
//     let filtered = [...this.echeances];

//     // Filtre par terme de recherche
//     if (this.filters.searchTerm) {
//       const searchTerm = this.filters.searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(echeance => 
//         echeance.dossierNumero?.toLowerCase().includes(searchTerm) ||
//         echeance.debiteurName?.toLowerCase().includes(searchTerm) ||
//         echeance.modePaiement?.toLowerCase().includes(searchTerm) ||
//         this.formatCurrency(echeance.montant)?.toLowerCase().includes(searchTerm)
//       );
//     }

//     // Filtre par statut
//     if (this.filters.status) {
//       filtered = filtered.filter(echeance => {
//         switch (this.filters.status) {
//           case 'pending':
//             return echeance.statut === 'current' && this.getDaysRemaining(echeance.dateEcheance) > 0;
//           case 'active':
//             return echeance.statut === 'current';
//           case 'negotiation':
//             return echeance.statut === 'current' && echeance.progress && echeance.progress > 0;
//           case 'legal_action':
//             return echeance.statut === 'current' && this.getDaysRemaining(echeance.dateEcheance) < 0;
//           case 'completed':
//             return echeance.statut === 'paid';
//           case 'new':
//             return echeance.statut === 'future' && this.getDaysUntil(echeance.dateEcheance) > 30;
//           default:
//             return true;
//         }
//       });
//     }

//     // Filtre par priorité (basée sur les jours restants et le montant)
//     if (this.filters.priority) {
//       filtered = filtered.filter(echeance => {
//         const daysRemaining = this.getDaysRemaining(echeance.dateEcheance);
//         const isOverdue = daysRemaining < 0;
//         const isUrgent = daysRemaining <= 3 && daysRemaining >= 0;
//         const isHighPriority = echeance.montant > 100000;
        
//         switch (this.filters.priority.toLowerCase()) {
//           case 'faible':
//             return !isOverdue && !isUrgent && !isHighPriority;
//           case 'moyenne':
//             return isHighPriority && !isUrgent && !isOverdue;
//           case 'elevee':
//             return isUrgent || (isHighPriority && daysRemaining <= 7);
//           case 'urgent':
//             return isOverdue || (isUrgent && isHighPriority);
//           default:
//             return true;
//         }
//       });
//     }

//     this.filteredDossiers = filtered;
//     console.log(' Filtres appliqués:', {
//       searchTerm: this.filters.searchTerm,
//       status: this.filters.status,
//       priority: this.filters.priority,
//       résultats: filtered.length
//     });
//   }

//   // Obtenir les échéances filtrées pour l'affichage
//   getFilteredEcheances(): Echeance[] {
//     return this.filteredDossiers.length > 0 ? this.filteredDossiers : this.echeances;
//   }

//   // Mettre à jour les méthodes d'affichage pour utiliser les filtres
//   getPaidEcheances(): Echeance[] {
//     const source = this.getFilteredEcheances();
//     return source.filter(e => e.statut === 'paid');
//   }

//   getCurrentEcheances(): Echeance[] {
//     const source = this.getFilteredEcheances();
//     return source.filter(e => e.statut === 'current');
//   }

//   getFutureEcheances(): Echeance[] {
//     const source = this.getFilteredEcheances();
//     return source.filter(e => e.statut === 'future');
//   }

// }