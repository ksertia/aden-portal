import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';

// Interface pour les transactions d'historique
interface TransactionHistory {
  id: string;
  reference: string;
  dossierNumber: string;
  clientName: string;
  amount: number;
  date: Date;
  paymentMethod: string;
  clientType: 'debtor' | 'creditor';
  transactionType: 'payment' | 'reimbursement';
  currency: string;
}

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
  totalAmount: number;
  totalPayments: number;
  totalCollected: number;
  pendingCollection: number;
  commissionRate: number;
  commissionAmount: number;
}

// Interface pour les commissions
interface Commission {
  id: string;
  reference: string;
  dateDemande: Date;
  montant: number;
  statut: 'paid' | 'pending' | 'rejected';
  datePaiement?: Date;
  dossierReference: string;
  creancier: string;
  partenaire: string;
  montantRecouvre: number;
  tauxCommission: number;
  referencePaiement: string;
}

interface CommissionStats {
  tauxCommission: number;
  commissionsDues: number;
  commissionsPayees: number;
  dernierReversement: Date | null;
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
    commissionRate: 10,
    commissionAmount: 0
  };
  
  // Liste des dossiers du partenaire
  availableDossiers: any[] = [];
  
  // Liste des paiements
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  
  // Filtres pour les paiements
  filters = {
    startDate: '',
    endDate: '',
    debtorId: '',
    dossierId: '',
    searchTerm: ''
  };
  
  // Pagination pour les paiements
  itemsPerPage = 10;
  currentPage = 1;
  totalItems = 0;
  pageSizes = [10, 25, 50, 100];
  
  // Drawers
  showHistoryDrawer = false;
  showPortfolioDrawer = false;
  showCommissionDrawer = false;
  showTransactionHistoryDrawer = false;
  
  // Détails du paiement
  showPaymentDetailModal = false;
  selectedPayment: Payment | null = null;
  
  // Propriétés pour l'historique des transactions
  transactionHistory: TransactionHistory[] = [];
  filteredHistory: TransactionHistory[] = [];
  selectedTransaction: TransactionHistory | null = null;
  
  // Filtres pour l'historique
  historyFilters = {
    reference: '',
    dossier: '',
    client: '',
    startDate: '',
    endDate: '',
    clientType: '',
    transactionType: ''
  };

  // Pagination pour l'historique
  historyItemsPerPage = 10;
  historyCurrentPage = 1;
  historyTotalItems = 0;

  // Propriétés pour la commission
  commissionStats: CommissionStats = {
    tauxCommission: 10,
    commissionsDues: 0,
    commissionsPayees: 0,
    dernierReversement: null
  };

  commissions: Commission[] = [];
  commissionActiveTab: 'history' | 'status' = 'history';

   // Propriétés pour la demande de reversement
  showCommissionRequestForm = false;
  commissionRequestData = {
    dossierReference: 'CRC-2025-008',
    creancier: 'Société ABC',
    partenaire: 'Partenaire Recouvrement',
    demandeNumber: '',
    montantRecouvre: 10000000,
    tauxCommission: 10,
    montantCommission: 1000000,
    referencePaiement: 'V000125AB',
    commentaires: '',
    fichiers: {
      preuveRecouvrement: null as File | null,
      contratCommission: null as File | null
    }
  };
  
  isSubmittingRequest = false;
  fileUploadStates = {
    preuveRecouvrement: false,
    contratCommission: false
  };

  constructor(
    private authService: AuthService,
    private caseService: CaseService
  ) {}
  
  ngOnInit() {
    this.loadDashboardData();
    this.initializeDateFilters();
    this.loadTransactionHistory();
    this.loadCommissions();
  }
  
  // Initialiser les filtres de date
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
    
    this.loadPartnerDossiers(partnerNodeId);
  }
  
  // Charger les dossiers du partenaire
  loadPartnerDossiers(partnerNodeId: string) {
    const siteName = 'portail-recouvrement';
    
    this.caseService.getDossiersPartenaire(siteName, partnerNodeId).subscribe({
      next: (response) => {
        this.availableDossiers = response.data?.map((item: any) => item.map) || [];
        this.availableDossiers = this.availableDossiers.filter(
          (dossier: any) => dossier.partenaireNodeId === partnerNodeId
        );
        
        this.calculateStats();
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

  // Méthodes pour les commissions
  loadCommissions() {
    // Données mockées
    this.commissions = [
      {
        id: '1',
        reference: 'DRC-2025-001',
        dateDemande: new Date('2025-05-10'),
        montant: 1000000,
        statut: 'paid',
        datePaiement: new Date('2025-05-15'),
        dossierReference: 'CRC-2025-008',
        creancier: 'Société ABC',
        partenaire: 'Partenaire Recouvrement',
        montantRecouvre: 10000000,
        tauxCommission: 10,
        referencePaiement: 'V000125AB'
      },
      {
        id: '2',
        reference: 'DRC-2025-002',
        dateDemande: new Date('2025-04-05'),
        montant: 750000,
        statut: 'paid',
        datePaiement: new Date('2025-04-12'),
        dossierReference: 'CRC-2025-007',
        creancier: 'Entreprise DEF',
        partenaire: 'Partenaire Recouvrement',
        montantRecouvre: 7500000,
        tauxCommission: 10,
        referencePaiement: 'V000124CD'
      },
      {
        id: '3',
        reference: 'DRC-2025-003',
        dateDemande: new Date('2025-03-20'),
        montant: 1500000,
        statut: 'paid',
        datePaiement: new Date('2025-03-25'),
        dossierReference: 'CRC-2025-006',
        creancier: 'Société GHI',
        partenaire: 'Partenaire Recouvrement',
        montantRecouvre: 15000000,
        tauxCommission: 10,
        referencePaiement: 'V000123EF'
      },
      {
        id: '4',
        reference: 'DRC-2025-004',
        dateDemande: new Date(),
        montant: 1200000,
        statut: 'pending',
        dossierReference: 'CRC-2025-009',
        creancier: 'Entreprise JKL',
        partenaire: 'Partenaire Recouvrement',
        montantRecouvre: 12000000,
        tauxCommission: 10,
        referencePaiement: 'V000126GH'
      },
      {
        id: '5',
        reference: 'DRC-2025-005',
        dateDemande: new Date(new Date().setDate(new Date().getDate() - 2)),
        montant: 800000,
        statut: 'rejected',
        dossierReference: 'CRC-2025-010',
        creancier: 'Société MNO',
        partenaire: 'Partenaire Recouvrement',
        montantRecouvre: 8000000,
        tauxCommission: 10,
        referencePaiement: 'V000127IJ'
      }
    ];
    this.calculateCommissionStats();
  }

  calculateCommissionStats() {
    const commissionsPayees = this.commissions.filter(c => c.statut === 'paid');
    const commissionsEnAttente = this.commissions.filter(c => c.statut === 'pending' || c.statut === 'rejected');
    
    this.commissionStats.commissionsPayees = commissionsPayees.reduce((sum, c) => sum + c.montant, 0);
    this.commissionStats.commissionsDues = commissionsEnAttente.reduce((sum, c) => sum + c.montant, 0);
    
    // Trouver la date du dernier reversement
    const datesPaiement = commissionsPayees
      .filter(c => c.datePaiement)
      .map(c => new Date(c.datePaiement!))
      .sort((a, b) => b.getTime() - a.getTime());
    
    this.commissionStats.dernierReversement = datesPaiement.length > 0 ? datesPaiement[0] : null;
  }

  // Méthodes pour filtrer les commissions
  getCommissionsPayees(): Commission[] {
    return this.commissions.filter(c => c.statut === 'paid');
  }

  getCommissionsEnAttente(): Commission[] {
    return this.commissions.filter(c => c.statut === 'pending' || c.statut === 'rejected');
  }

  // Méthode pour formater les montants en FCFA
  formatFCFA(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }

  // Méthode pour obtenir le libellé du statut
  getCommissionStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'paid': 'Payé',
      'pending': 'En attente',
      'rejected': 'Rejeté'
    };
    return labels[statut] || statut;
  }

  // Méthodes pour les onglets de commission
  setCommissionTab(tab: 'history' | 'status') {
    this.commissionActiveTab = tab;
  }

  // Méthode pour obtenir la classe CSS du statut
  getCommissionStatusClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'paid': 'status-paid',
      'pending': 'status-pending',
      'rejected': 'status-rejected'
    };
    return classes[statut] || '';
  }

  requestCommissionPayout() {
    console.log('Demande de reversement de commission');
    this.openCommissionRequestForm();
  }

  viewCommissionDetails(commission: Commission) {
    console.log('Détails de la commission:', commission);
    
    const details = `
Détails de la commission ${commission.reference}

Informations générales:
- Référence: ${commission.reference}
- Date de demande: ${this.formatDate(commission.dateDemande)}
- Statut: ${this.getCommissionStatusLabel(commission.statut)}
${commission.datePaiement ? `- Date de paiement: ${this.formatDate(commission.datePaiement)}` : ''}

Informations financières:
- Montant recouvré: ${this.formatFCFA(commission.montantRecouvre)}
- Taux de commission: ${commission.tauxCommission}%
- Commission: ${this.formatFCFA(commission.montant)}
- Référence paiement: ${commission.referencePaiement}

Parties concernées:
- Créancier: ${commission.creancier}
- Partenaire: ${commission.partenaire}
- Dossier: ${commission.dossierReference}
    `;
    
    alert(details);
  }
  
  // Calculer les statistiques
  calculateStats() {
    this.stats.totalAmount = this.availableDossiers.reduce((sum, dossier) => {
      const principal = dossier.montantTotal || 0;
      const interests = dossier.montantInterets || 0;
      const penalties = dossier.montantPenalites || 0;
      const fees = dossier.montantFrais || 0;
      return sum + principal + interests + penalties + fees;
    }, 0);
    
    this.stats.totalCollected = this.availableDossiers.reduce((sum, dossier) => {
      return sum + (dossier.montantPaye || 0);
    }, 0);
    
    this.stats.pendingCollection = this.stats.totalAmount - this.stats.totalCollected;
    this.stats.totalPayments = this.availableDossiers.reduce((sum, dossier) => {
      return sum + (dossier.montantPaye > 0 ? 1 : 0);
    }, 0);
    
    this.stats.commissionAmount = this.stats.totalCollected * (this.stats.commissionRate / 100);
  }
  
  // Charger les paiements
  loadPayments() {
    this.payments = [];
    
    this.availableDossiers.forEach((dossier, index) => {
      if (dossier.montantPaye > 0) {
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
    
    this.totalItems = this.payments.length;
    this.applyFilters();
  }
  
  // Appliquer les filtres des paiements
  applyFilters() {
    let filtered = [...this.payments];
    
    if (this.filters.startDate) {
      const startDate = new Date(this.filters.startDate);
      filtered = filtered.filter(p => new Date(p.paymentDate) >= startDate);
    }
    
    if (this.filters.endDate) {
      const endDate = new Date(this.filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => new Date(p.paymentDate) <= endDate);
    }
    
    if (this.filters.debtorId) {
      filtered = filtered.filter(p => p.debiteurId === this.filters.debtorId);
    }
    
    if (this.filters.dossierId) {
      filtered = filtered.filter(p => p.dossierId === this.filters.dossierId);
    }
    
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
    this.currentPage = 1;
  }
  
  // Réinitialiser les filtres des paiements
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
  
  // Gestion de la pagination pour les paiements
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
  
  // Charger l'historique des transactions
  loadTransactionHistory() {
    this.transactionHistory = [
      {
        id: '1',
        reference: '#TRX-2024-001',
        dossierNumber: '#CR-2024-015',
        clientName: 'Entreprise ABC',
        amount: 25000,
        date: new Date('2024-06-15'),
        paymentMethod: 'Mobile Money',
        clientType: 'debtor',
        transactionType: 'payment',
        currency: 'EUR'
      },
      {
        id: '2',
        reference: '#TRX-2024-002',
        dossierNumber: '#CR-2024-014',
        clientName: 'Société XYZ',
        amount: 15800,
        date: new Date('2024-06-14'),
        paymentMethod: 'Carte Bancaire',
        clientType: 'debtor',
        transactionType: 'payment',
        currency: 'EUR'
      },
      {
        id: '3',
        reference: '#TRX-2024-003',
        dossierNumber: '-',
        clientName: 'Cabinet Legal A',
        amount: 12500,
        date: new Date('2024-06-10'),
        paymentMethod: 'Virement',
        clientType: 'creditor',
        transactionType: 'reimbursement',
        currency: 'EUR'
      }
    ];

    // Ajouter plus de données
    for (let i = 4; i <= 856; i++) {
      const year = 2024;
      const month = Math.floor(Math.random() * 6) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      
      const clientTypes: ('debtor' | 'creditor')[] = ['debtor', 'creditor'];
      const clientType = clientTypes[Math.floor(Math.random() * clientTypes.length)];
      
      const transactionTypes: ('payment' | 'reimbursement')[] = ['payment', 'reimbursement'];
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      
      const paymentMethods = ['Mobile Money', 'Carte Bancaire', 'Virement', 'Chèque', 'Espèces'];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      const dossierNumbers = clientType === 'debtor' 
        ? [`#CR-2024-${String(100 + i).padStart(3, '0')}`, `#CR-2023-${String(200 + i).padStart(3, '0')}`]
        : ['-'];
      
      const clientNames = [
        'Entreprise ABC', 'Société XYZ', 'Cabinet Legal A', 'Entreprise DEF',
        'Société GHI', 'Compagnie JKL', 'Groupe MNO', 'Holding PQR',
        'Industries STU', 'Corporation VWX'
      ];
      
      this.transactionHistory.push({
        id: i.toString(),
        reference: `#TRX-${year}-${String(i).padStart(3, '0')}`,
        dossierNumber: dossierNumbers[Math.floor(Math.random() * dossierNumbers.length)],
        clientName: clientNames[Math.floor(Math.random() * clientNames.length)],
        amount: Math.floor(Math.random() * 50000) + 5000,
        date: new Date(year, month - 1, day),
        paymentMethod: paymentMethod,
        clientType: clientType,
        transactionType: transactionType,
        currency: 'EUR'
      });
    }

    this.historyTotalItems = this.transactionHistory.length;
    this.applyHistoryFilters();
  }
  
  // Ouvrir/Fermer l'historique des transactions (drawer)
  openTransactionHistoryDrawer() {
    this.showTransactionHistoryDrawer = true;
    this.resetHistoryFilters();
  }

  closeTransactionHistoryDrawer() {
    this.showTransactionHistoryDrawer = false;
    this.selectedTransaction = null;
  }

  // Réinitialiser les filtres de l'historique
  resetHistoryFilters() {
    this.historyFilters = {
      reference: '',
      dossier: '',
      client: '',
      startDate: '',
      endDate: '',
      clientType: '',
      transactionType: ''
    };
    this.historyCurrentPage = 1;
    this.applyHistoryFilters();
  }

  // Appliquer les filtres de l'historique
  applyHistoryFilters() {
    let filtered = [...this.transactionHistory];

    if (this.historyFilters.reference) {
      filtered = filtered.filter(t => 
        t.reference.toLowerCase().includes(this.historyFilters.reference.toLowerCase())
      );
    }

    if (this.historyFilters.dossier) {
      filtered = filtered.filter(t => 
        t.dossierNumber.toLowerCase().includes(this.historyFilters.dossier.toLowerCase())
      );
    }

    if (this.historyFilters.client) {
      filtered = filtered.filter(t => 
        t.clientName.toLowerCase().includes(this.historyFilters.client.toLowerCase())
      );
    }

    if (this.historyFilters.startDate) {
      const startDate = new Date(this.historyFilters.startDate);
      filtered = filtered.filter(t => new Date(t.date) >= startDate);
    }

    if (this.historyFilters.endDate) {
      const endDate = new Date(this.historyFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.date) <= endDate);
    }

    if (this.historyFilters.clientType) {
      filtered = filtered.filter(t => t.clientType === this.historyFilters.clientType);
    }

    if (this.historyFilters.transactionType) {
      filtered = filtered.filter(t => t.transactionType === this.historyFilters.transactionType);
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.filteredHistory = filtered;
    this.historyTotalItems = filtered.length;
    this.historyCurrentPage = 1;
  }

  // Gestion de la pagination pour l'historique
  get paginatedHistory(): TransactionHistory[] {
    const startIndex = (this.historyCurrentPage - 1) * this.historyItemsPerPage;
    return this.filteredHistory.slice(startIndex, startIndex + this.historyItemsPerPage);
  }

  get historyTotalPages(): number {
    return Math.ceil(this.historyTotalItems / this.historyItemsPerPage);
  }

  goToHistoryPage(page: number) {
    if (page >= 1 && page <= this.historyTotalPages) {
      this.historyCurrentPage = page;
    }
  }

  nextHistoryPage() {
    if (this.historyCurrentPage < this.historyTotalPages) {
      this.historyCurrentPage++;
    }
  }

  prevHistoryPage() {
    if (this.historyCurrentPage > 1) {
      this.historyCurrentPage--;
    }
  }

  // Voir les détails d'une transaction
  viewTransactionDetails(transaction: TransactionHistory) {
    this.selectedTransaction = transaction;
    const details = `
Détails de la transaction:
- Référence: ${transaction.reference}
- Dossier: ${transaction.dossierNumber}
- Client: ${transaction.clientName}
- Type de client: ${this.getClientTypeLabel(transaction.clientType)}
- Montant: ${this.formatCurrencyEuro(transaction.amount)}
- Date: ${this.formatDate(transaction.date)}
- Moyen de paiement: ${transaction.paymentMethod}
- Type de transaction: ${this.getTransactionTypeLabel(transaction.transactionType)}
    `;
    
    alert(details);
  }

  // Méthodes utilitaires pour l'historique
  getClientTypeLabel(type: 'debtor' | 'creditor'): string {
    return type === 'debtor' ? 'Débiteur' : 'Créancier';
  }

  getTransactionTypeLabel(type: 'payment' | 'reimbursement'): string {
    return type === 'payment' ? 'Paiement' : 'Reversement';
  }

  formatCurrencyEuro(amount: number): string {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  }

  // Calcul des indices de pagination pour l'historique
  getHistoryStartIndex(): number {
    return (this.historyCurrentPage - 1) * this.historyItemsPerPage + 1;
  }

  getHistoryEndIndex(): number {
    const end = this.historyCurrentPage * this.historyItemsPerPage;
    return Math.min(end, this.historyTotalItems);
  }

  // Obtenir les numéros de page pour l'historique
  getHistoryPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (this.historyTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.historyTotalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.historyCurrentPage - 2);
      let end = Math.min(this.historyTotalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < this.historyTotalPages) {
        if (end < this.historyTotalPages - 1) {
          pages.push('...');
        }
        pages.push(this.historyTotalPages);
      }
    }
    
    return pages;
  }

  // Méthodes utilitaires existantes
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
  
  // Méthodes pour les autres drawers (existantes)
  openHistoryDrawer() {
    // Ancien historique simplifié
    this.showHistoryDrawer = true;
  }
  
  closeHistoryDrawer() {
    this.showHistoryDrawer = false;
  }
  
  openPortfolioDrawer() {
    this.showPortfolioDrawer = true;
  }
  
  closePortfolioDrawer() {
    this.showPortfolioDrawer = false;
  }
  
  openCommissionDrawer() {
    this.showCommissionDrawer = true;
  }
  
  closeCommissionDrawer() {
    this.showCommissionDrawer = false;
  }
  
  openPaymentDetail(payment: Payment) {
    this.selectedPayment = payment;
    this.showPaymentDetailModal = true;
  }
  
  closePaymentDetail() {
    this.showPaymentDetailModal = false;
    this.selectedPayment = null;
  }
  
  downloadReceipt(payment: Payment) {
    alert(`Téléchargement du reçu pour le paiement ${payment.reference}`);
  }
  
  // Pagination pour les paiements
  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < this.totalPages) {
        if (end < this.totalPages - 1) {
          pages.push('...');
        }
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }
  
  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalItems);
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
  
  // Données pour les anciens drawers
  get historyTransactions() {
    return this.payments.slice(0, 5);
  }
  
  get portfolioData() {
    return this.availableDossiers.map(dossier => ({
      dossierNumber: dossier.numeroDossier,
      debiteurName: dossier.nomDebiteur,
      totalAmount: this.calculateTotalDue(dossier),
      collectedAmount: dossier.montantPaye || 0,
      remainingAmount: this.calculateRemainingAmount(dossier),
      progress: this.getDossierPaymentPercentage(dossier)
    }));
  }
  
  get commissionData() {
    return [
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
      }
    ];
  }
  
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
  
  get uniqueDossiers(): any[] {
    return this.availableDossiers.map(dossier => ({
      id: dossier.nodeId,
      number: dossier.numeroDossier || 'Sans numéro'
    }));
  }

    // Ouvrir le formulaire de demande de reversement
  openCommissionRequestForm() {
    this.showCommissionRequestForm = true;
    this.generateDemandeNumber();
  }

  // Fermer le formulaire
  closeCommissionRequestForm() {
    this.showCommissionRequestForm = false;
    this.resetCommissionRequestForm();
  }

  // Générer un numéro de demande unique
  generateDemandeNumber() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    this.commissionRequestData.demandeNumber = `DRC-${new Date().getFullYear()}-${String(random).padStart(3, '0')}`;
  }

  // Gestion de l'upload de fichiers
  onCommissionFileSelected(event: Event, type: 'preuveRecouvrement' | 'contratCommission') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.commissionRequestData.fichiers[type] = input.files[0];
      this.fileUploadStates[type] = true;
    }
  }

  // Ouvrir le sélecteur de fichiers
  openCommissionFileSelector(type: 'preuveRecouvrement' | 'contratCommission') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.multiple = false;
    
    input.onchange = (event) => this.onCommissionFileSelected(event, type);
    input.click();
  }

  // Valider le formulaire
  validateCommissionRequest(): boolean {
    if (!this.commissionRequestData.dossierReference || !this.commissionRequestData.creancier || !this.commissionRequestData.partenaire) {
      alert('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    
    if (this.commissionRequestData.montantRecouvre <= 0 || this.commissionRequestData.tauxCommission <= 0) {
      alert('Les montants doivent être positifs');
      return false;
    }
    
    if (!this.commissionRequestData.fichiers.preuveRecouvrement) {
      alert('Veuillez télécharger la preuve de recouvrement');
      return false;
    }
    
    return true;
  }

  // Soumettre la demande de reversement
  submitCommissionRequest() {
    if (!this.validateCommissionRequest()) {
      return;
    }
    
    this.isSubmittingRequest = true;
    
    // Simulation d'envoi à l'API
    setTimeout(() => {
      const nouvelleCommission: Commission = {
        id: Date.now().toString(),
        reference: this.commissionRequestData.demandeNumber,
        dateDemande: new Date(),
        montant: this.commissionRequestData.montantCommission,
        statut: 'pending',
        dossierReference: this.commissionRequestData.dossierReference,
        creancier: this.commissionRequestData.creancier,
        partenaire: this.commissionRequestData.partenaire,
        montantRecouvre: this.commissionRequestData.montantRecouvre,
        tauxCommission: this.commissionRequestData.tauxCommission,
        referencePaiement: this.commissionRequestData.referencePaiement
      };
      
      // Ajouter la nouvelle commission à la liste
      this.commissions.push(nouvelleCommission);
      
      // Recalculer les statistiques
      this.calculateCommissionStats();
      
      // Réinitialiser le formulaire
      this.resetCommissionRequestForm();
      this.isSubmittingRequest = false;
      
      // Fermer le formulaire et revenir au drawer de commission
      this.showCommissionRequestForm = false;
      
      // Afficher un message de succès
      alert('Demande soumise avec succès ! Un email de confirmation vous sera envoyé.');
      
      // Revenir à l'onglet "Statut des paiements"
      this.setCommissionTab('status');
    }, 2000);
  }

  // Réinitialiser le formulaire
  resetCommissionRequestForm() {
    this.commissionRequestData = {
      dossierReference: 'CRC-2025-008',
      creancier: 'Société ABC',
      partenaire: 'Partenaire Recouvrement',
      demandeNumber: '',
      montantRecouvre: 10000000,
      tauxCommission: 10,
      montantCommission: 1000000,
      referencePaiement: 'V000125AB',
      commentaires: '',
      fichiers: {
        preuveRecouvrement: null,
        contratCommission: null
      }
    };
    
    this.fileUploadStates = {
      preuveRecouvrement: false,
      contratCommission: false
    };
  }

  // Mettre à jour le montant de la commission lorsque le taux change
  updateCommissionAmount() {
    this.commissionRequestData.montantCommission = 
      this.commissionRequestData.montantRecouvre * (this.commissionRequestData.tauxCommission / 100);
  }

  // Mettre à jour le montant recouvré
  updateMontantRecouvre(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value.replace(/\s/g, ''));
    if (!isNaN(value)) {
      this.commissionRequestData.montantRecouvre = value;
      this.updateCommissionAmount();
    }
  }

  // Mettre à jour le taux de commission
  updateTauxCommission(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      this.commissionRequestData.tauxCommission = value;
      this.updateCommissionAmount();
    }
  }

  // Méthode pour formater les montants avec séparateurs
  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }


}