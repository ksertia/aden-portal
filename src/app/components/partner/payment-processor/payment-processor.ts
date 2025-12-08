import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';

// Interface pour les paiements
interface Payment {
  id: string;
  reference: string;
  dossierId: string;
  dossierNumber: string;
  debiteurName: string;
  debiteurId: string;
  amount: number;
  dueDate: Date;
  paymentDate: Date;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  currency: string;
  receiptUrl?: string;
  transactionRef: string;
  notes?: string;
}

// Interface pour les statistiques
interface DashboardStats {
  totalAmount: number;          // Montant total des dossiers
  totalPayments: number;        // Nombre total de paiements
  totalCollected: number;       // Total collecté
  pendingCollection: number;    // En attente de collection
  commissionRate: number;       // Taux de commission
  commissionAmount: number;     // Montant des commissions
}

@Component({
  selector: 'app-payment-processor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payment-processor.html',
  styleUrls: ['./payment-processor.css']
})
export class PaymentProcessor implements OnInit {
  // Propriétés principales
  isLoading = true;
  errorMessage = '';
  
  // Statistiques du tableau de bord
  stats: DashboardStats = {
    totalAmount: 0,
    totalPayments: 0,
    totalCollected: 0,
    pendingCollection: 0,
    commissionRate: 10, // 10% par défaut
    commissionAmount: 0
  };
  
  // Liste des dossiers du partenaire
  availableDossiers: any[] = [];
  
  // Liste des paiements
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  
  // Filtres
  filters = {
    startDate: '',
    endDate: '',
    debtorId: '',
    dossierId: '',
    searchTerm: ''
  };
  
  // Pagination
  itemsPerPage = 10;
  currentPage = 1;
  totalItems = 0;
  pageSizes = [10, 25, 50, 100];
  
  // Drawers
  showHistoryDrawer = false;
  showPortfolioDrawer = false;
  showCommissionDrawer = false;
  
  // Détails du paiement
  showPaymentDetailModal = false;
  selectedPayment: Payment | null = null;
  
  // Données pour les drawers
  historyTransactions: any[] = [];
  portfolioData: any[] = [];
  commissionData: any[] = [];
  
  constructor(
    private authService: AuthService,
    private caseService: CaseService
  ) {}
  
  ngOnInit() {
    this.loadDashboardData();
    this.initializeDateFilters();
  }
  
  // Initialiser les filtres de date (mois en cours)
  initializeDateFilters() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.filters.startDate = this.formatDateForInput(firstDayOfMonth);
    this.filters.endDate = this.formatDateForInput(today);
  }
  
  // Charger toutes les données du tableau de bord
  loadDashboardData() {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.isLoading = false;
      return;
    }
    
    const partnerNodeId = currentUser.nodeId;
    
    if (!partnerNodeId) {
      this.errorMessage = 'Identifiant du partenaire introuvable.';
      this.isLoading = false;
      return;
    }
    
    // Charger les dossiers du partenaire
    this.loadPartnerDossiers(partnerNodeId);
  }
  
  // Charger les dossiers du partenaire
  loadPartnerDossiers(partnerNodeId: string) {
    const siteName = 'portail-recouvrement';
    
    this.caseService.getDossiersPartenaire(siteName, partnerNodeId).subscribe({
      next: (response) => {
        // Extraction des dossiers depuis la réponse
        this.availableDossiers = response.data?.map((item: any) => item.map) || [];
        
        // Filtrer pour ne garder que les dossiers assignés au partenaire
        this.availableDossiers = this.availableDossiers.filter(
          (dossier: any) => dossier.partenaireNodeId === partnerNodeId
        );
        
        // Calculer les statistiques
        this.calculateStats();
        
        // Charger les paiements (simulés pour l'exemple)
        this.loadPayments();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des dossiers partenaire:', error);
        this.errorMessage = 'Impossible de récupérer les dossiers.';
        this.isLoading = false;
      }
    });
  }
  
  // Calculer les statistiques
  calculateStats() {
    // Montant total des dossiers
    this.stats.totalAmount = this.availableDossiers.reduce((sum, dossier) => {
      const principal = dossier.montantTotal || 0;
      const interests = dossier.montantInterets || 0;
      const penalties = dossier.montantPenalites || 0;
      const fees = dossier.montantFrais || 0;
      return sum + principal + interests + penalties + fees;
    }, 0);
    
    // Total collecté (montant payé)
    this.stats.totalCollected = this.availableDossiers.reduce((sum, dossier) => {
      return sum + (dossier.montantPaye || 0);
    }, 0);
    
    // En attente de collection
    this.stats.pendingCollection = this.stats.totalAmount - this.stats.totalCollected;
    
    // Nombre de paiements (simulé)
    this.stats.totalPayments = this.availableDossiers.reduce((sum, dossier) => {
      // Si le dossier a un montant payé, on considère qu'il y a eu au moins un paiement
      return sum + (dossier.montantPaye > 0 ? 1 : 0);
    }, 0);
    
    // Commission (10% du total collecté)
    this.stats.commissionAmount = this.stats.totalCollected * (this.stats.commissionRate / 100);
  }
  
  // Charger les paiements (simulé pour l'exemple)
  loadPayments() {
    // Données simulées basées sur les dossiers
    this.payments = [];
    
    this.availableDossiers.forEach((dossier, index) => {
      if (dossier.montantPaye > 0) {
        // Simuler 1-3 paiements par dossier qui a été payé
        const numPayments = Math.min(Math.floor(dossier.montantPaye / 50000) + 1, 3);
        
        for (let i = 0; i < numPayments; i++) {
          const paymentAmount = Math.min(dossier.montantPaye / numPayments, 50000);
          const paymentDate = new Date();
          paymentDate.setDate(paymentDate.getDate() - (index * 10 + i * 3));
          
          const dueDate = new Date(paymentDate);
          dueDate.setDate(dueDate.getDate() + 30);
          
          const paymentMethods = ['Carte bancaire', 'Virement bancaire', 'Chèque', 'Mobile payment'];
          const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
          
          this.payments.push({
            id: `PAY-${Date.now()}-${index}-${i}`,
            reference: `PAY-${1000 + index * 10 + i}`,
            dossierId: dossier.nodeId,
            dossierNumber: dossier.numeroDossier || `DOS-${1000 + index}`,
            debiteurName: dossier.nomDebiteur || 'Débiteur inconnu',
            debiteurId: dossier.debiteurId || `DEB-${index}`,
            amount: paymentAmount,
            dueDate: dueDate,
            paymentDate: paymentDate,
            paymentMethod: method,
            status: 'completed',
            currency: 'XOF',
            transactionRef: `TRX-${Date.now()}-${index}-${i}`,
            notes: i === 0 ? 'Premier paiement' : 'Paiement partiel'
          });
        }
      }
    });
    
    // Ajouter quelques paiements en attente
    for (let i = 0; i < 3; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5 + i);
      
      this.payments.push({
        id: `PAY-PENDING-${i}`,
        reference: `PAY-P${100 + i}`,
        dossierId: `doss-${i}`,
        dossierNumber: `DOS-P${100 + i}`,
        debiteurName: ['Jean Dupont', 'Marie Martin', 'Pierre Durand'][i],
        debiteurId: `DEB-P${i}`,
        amount: 25000 + i * 10000,
        dueDate: futureDate,
        paymentDate: futureDate,
        paymentMethod: ['Virement bancaire', 'Carte bancaire', 'Mobile payment'][i],
        status: 'pending',
        currency: 'XOF',
        transactionRef: `TRX-PENDING-${i}`,
        notes: 'Paiement programmé'
      });
    }
    
    this.totalItems = this.payments.length;
    this.applyFilters();
  }

  // Méthode pour obtenir les numéros de page à afficher
getPageNumbers(): number[] {
  const pages: number[] = [];
  const maxVisiblePages = 5;
  
  if (this.totalPages <= maxVisiblePages) {
    // Afficher toutes les pages
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Afficher un sous-ensemble de pages
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
    
    // Ajuster le début si on est proche de la fin
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Ajouter des points de suspension si nécessaire
    if (start > 1) {
      pages.unshift(-1); // -1 représente "..."
    }
    if (end < this.totalPages) {
      pages.push(-2); // -2 représente "..."
    }
  }
  
  return pages;
}

// Méthode pour obtenir l'horodatage actuel
getCurrentTimestamp(): string {
  const now = new Date();
  return `${this.formatDate(now)} à ${this.formatTime(now)}`;
}

// Méthode pour formater l'heure
formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
  
  // Appliquer les filtres
  applyFilters() {
    let filtered = [...this.payments];
    
    // Filtre par date
    if (this.filters.startDate) {
      const startDate = new Date(this.filters.startDate);
      filtered = filtered.filter(p => new Date(p.paymentDate) >= startDate);
    }
    
    if (this.filters.endDate) {
      const endDate = new Date(this.filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => new Date(p.paymentDate) <= endDate);
    }
    
    // Filtre par débiteur
    if (this.filters.debtorId) {
      filtered = filtered.filter(p => p.debiteurId === this.filters.debtorId);
    }
    
    // Filtre par dossier
    if (this.filters.dossierId) {
      filtered = filtered.filter(p => p.dossierId === this.filters.dossierId);
    }
    
    // Filtre par recherche
    if (this.filters.searchTerm) {
      const term = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.reference.toLowerCase().includes(term) ||
        p.dossierNumber.toLowerCase().includes(term) ||
        p.debiteurName.toLowerCase().includes(term) ||
        p.paymentMethod.toLowerCase().includes(term) ||
        p.transactionRef.toLowerCase().includes(term)
      );
    }
    
    this.filteredPayments = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; // Réinitialiser à la première page
  }
  
  // Réinitialiser les filtres
  resetFilters() {
    this.filters = {
      startDate: '',
      endDate: '',
      debtorId: '',
      dossierId: '',
      searchTerm: ''
    };
    this.initializeDateFilters();
    this.applyFilters();
  }
  
  // Gestion de la pagination
  get paginatedPayments(): Payment[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPayments.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  // Ouvrir/fermer les drawers
  openHistoryDrawer() {
    // Charger les données d'historique
    this.historyTransactions = [...this.payments.slice(0, 10)];
    this.showHistoryDrawer = true;
  }
  
  closeHistoryDrawer() {
    this.showHistoryDrawer = false;
  }
  
  openPortfolioDrawer() {
    // Préparer les données du portefeuille client
    this.portfolioData = this.availableDossiers.map(dossier => ({
      dossierNumber: dossier.numeroDossier,
      debiteurName: dossier.nomDebiteur,
      totalAmount: this.calculateTotalDue(dossier),
      collectedAmount: dossier.montantPaye || 0,
      remainingAmount: this.calculateRemainingAmount(dossier),
      progress: this.getDossierPaymentPercentage(dossier)
    }));
    this.showPortfolioDrawer = true;
  }
  
  closePortfolioDrawer() {
    this.showPortfolioDrawer = false;
  }
  
  openCommissionDrawer() {
    // Préparer les données de commission
    this.commissionData = [
      {
        month: 'Octobre 2023',
        collected: 24850,
        commission: 2485,
        status: 'payé'
      },
      {
        month: 'Septembre 2023',
        collected: 32150,
        commission: 3215,
        status: 'payé'
      },
      {
        month: 'Août 2023',
        collected: 28700,
        commission: 2870,
        status: 'payé'
      },
      {
        month: 'Juillet 2023',
        collected: 25400,
        commission: 2540,
        status: 'payé'
      },
      {
        month: 'Juin 2023',
        collected: 21300,
        commission: 2130,
        status: 'payé'
      }
    ];
    this.showCommissionDrawer = true;
  }
  
  closeCommissionDrawer() {
    this.showCommissionDrawer = false;
  }
  
  // Gestion des détails de paiement
  openPaymentDetail(payment: Payment) {
    this.selectedPayment = payment;
    this.showPaymentDetailModal = true;
  }
  
  closePaymentDetail() {
    this.showPaymentDetailModal = false;
    this.selectedPayment = null;
  }
  
  downloadReceipt(payment: Payment) {
    // Simuler le téléchargement du reçu
    alert(`Téléchargement du reçu pour le paiement ${payment.reference}`);
    console.log('Téléchargement du reçu:', payment);
  }
  
  // Méthodes utilitaires
  formatCurrency(amount: number): string {
    return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
  }
  
  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'Non définie';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Date invalide';
      
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  }
  
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'completed': 'status-completed',
      'pending': 'status-pending',
      'failed': 'status-failed'
    };
    return classes[status] || '';
  }
  
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'completed': 'Complété',
      'pending': 'En attente',
      'failed': 'Échoué'
    };
    return labels[status] || status;
  }
  
  getPaymentMethodIcon(method: string): string {
    const icons: { [key: string]: string } = {
      'Carte bancaire': 'credit-card',
      'Virement bancaire': 'university',
      'Chèque': 'money-check-alt',
      'Mobile payment': 'mobile-alt'
    };
    return icons[method] || 'credit-card';
  }
  
  // Méthodes de calcul (reprises de votre code existant)
  calculateTotalDue(dossier: any): number {
    const principal = dossier.montantTotal || 0;
    const interests = dossier.montantInterets || 0;
    const penalties = dossier.montantPenalites || 0;
    const fees = dossier.montantFrais || 0;
    return principal + interests + penalties + fees;
  }
  
  calculateRemainingAmount(dossier: any): number {
    const totalDue = this.calculateTotalDue(dossier);
    const paid = dossier.montantPaye || 0;
    return totalDue - paid;
  }
  
  getDossierPaymentPercentage(dossier: any): number {
    const total = this.calculateTotalDue(dossier);
    const paid = dossier.montantPaye || 0;
    return total ? Math.round((paid / total) * 100) : 0;
  }
  
  // Obtenir la liste des débiteurs uniques
  get uniqueDebtors(): any[] {
    const debtorsMap = new Map();
    this.availableDossiers.forEach(dossier => {
      if (dossier.debiteurId && dossier.nomDebiteur) {
        debtorsMap.set(dossier.debiteurId, {
          id: dossier.debiteurId,
          name: dossier.nomDebiteur
        });
      }
    });
    return Array.from(debtorsMap.values());
  }
  
  // Obtenir la liste des dossiers uniques
  get uniqueDossiers(): any[] {
    return this.availableDossiers.map(dossier => ({
      id: dossier.nodeId,
      number: dossier.numeroDossier || 'Sans numéro'
    }));
  }
}