import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';


// Interface pour les échéances (ajoutez en haut du fichier si nécessaire)
interface Echeance {
  id: string;
  dossierId: string;
  dossierNumero: string;
  debiteurName: string;
  montant: number;
  dateEcheance: Date;
  datePaiement?: Date;
  statut: 'paid' | 'current' | 'future';
  modePaiement?: string;
  progress?: number;
  createdBy: string;
}
@Component({
  selector: 'app-partner-payment-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './partner-payment-tracking.html',
  styleUrls: ['./partner-payment-tracking.css']
})
export class PartnerPaymentTracking implements OnInit {
  // Données des dossiers
  availableDossiers: any[] = [];
  isLoading = true;
  errorMessage = '';

  // Statistiques
  totalTransactions = 0;
  totalPayments = 0;
  totalCommissions = 0;
  commissionsReceived = 0;

  // Historique des transactions
showHistoryDrawer = false;
searchTerm = '';
dateFilter = '';
typeFilter = '';
statusFilter = '';

// Données d'exemple pour l'historique
transactionsHistory = [
  {
    id: 1,
    date: new Date('2024-12-01'),
    reference: 'TXN-001',
    dossierNumber: 'DOS-001',
    amount: 1000,
    paymentType: 'card',
    status: 'success',
    currency: 'XOF',
    debtorCreditor: 'Créancier',
    invoice: '#FAC-001'
  },
  {
    id: 2,
    date: new Date('2024-11-28'),
    reference: 'TXN-002',
    dossierNumber: 'DOS-001',
    amount: 500,
    paymentType: 'mobile',
    status: 'pending',
    currency: 'XOF',
    debtorCreditor: 'Créancier',
    invoice: '#FAC-001'
  },
  {
    id: 3,
    date: new Date('2024-11-25'),
    reference: 'TXN-003',
    dossierNumber: 'DOS-002',
    amount: 1000,
    paymentType: 'card',
    status: 'failed',
    currency: 'XOF',
    debtorCreditor: 'Débiteur',
    invoice: '#FAC-002'
  },
  {
    id: 4,
    date: new Date('2024-11-20'),
    reference: 'TXN-004',
    dossierNumber: 'DOS-003',
    amount: 750,
    paymentType: 'paypal',
    status: 'success',
    currency: 'EUR',
    debtorCreditor: 'Créancier',
    invoice: '#FAC-003'
  }
];

// Suivi des transactions
showTrackingDrawer = false;
activePaymentTab: 'paid' | 'current' | 'future' = 'current';

// Données pour le suivi des transactions
echeances: any[] = [];
filteredEcheances: any[] = [];
trackingFilters = {
  searchTerm: '',
  status: '',
  priority: ''
};
selectedStatus = '';
selectedPriority = '';



  // Données de paiement
  showPaymentDrawer = false;
  currentStep: 'selection' | 'currency' | 'details' | 'paymentMethod' | 'paymentInfo' | 'otp' | 'recap' | 'confirmation' = 'selection';
  selectedPaymentMethod: string = '';
  selectedPaymentProvider: string = '';
  mobileNumber: string = '';
  mobileAmount: number = 0;
  mobileOtp: string = '';
  otpSent: boolean = false;
  resendCooldown: number = 0;
  cardNumber: string = '';
  cardHolderName: string = '';
  cardExpiryMonth: string = '';
  cardExpiryYear: string = '';
  cardCvv: string = '';
  paypalEmail: string = '';
  transactionReference: string = '';
  transactionDate: Date = new Date();
  paymentAmount = 0;
  selectedDossier: any = null;
  selectedDossierId: string = '';
  selectedCurrency: string = 'XOF';
  exchangeRate: number = 1;
  penalties = 0;
  taxes = 0;
  transactionFees = 0;
  totalFees = 0;
  totalToPay = 0;
  totalToPayInSelectedCurrency = 0;

  // Modes de paiement disponibles
  paymentMethods = [
    {
      id: 'mobile',
      name: 'Paiement Mobile',
      description: 'Payer via votre mobile money',
      providers: [
        { id: 'corisMoney', name: 'Coris Money', icon: '📱' },
        { id: 'orangeMoney', name: 'Orange Money', icon: '🟠' },
        { id: 'moovMoney', name: 'Moov Money', icon: '🔵' },
        { id: 'telecelMoney', name: 'Telecel Money', icon: '🟡' }
      ]
    },
    {
      id: 'card',
      name: 'Carte Bancaire',
      description: 'Payer par carte de crédit/débit',
      providers: [
        { id: 'visa', name: 'Carte Visa', icon: '💳' },
        { id: 'mastercard', name: 'Carte Mastercard', icon: '💳' },
        { id: 'localCard', name: 'Carte Bancaire Locale', icon: '🏦' }
      ]
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Payer via votre compte PayPal',
      providers: [
        { id: 'paypal', name: 'PayPal', icon: '🔵' }
      ]
    }
  ];

  // Devises disponibles
  availableCurrencies = [
    { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.001524 },
    { code: 'USD', name: 'Dollar US', symbol: '$', rate: 0.00165 },
    { code: 'GBP', name: 'Livre Sterling', symbol: '£', rate: 0.00130 },
    { code: 'CAD', name: 'Dollar Canadien', symbol: 'C$', rate: 0.00224 }
  ];

  constructor(
    private authService: AuthService,
    private caseService: CaseService
  ) {}

  ngOnInit() {
    this.loadPartnerDossiers();
  }

  // Charger les dossiers du partenaire
  loadPartnerDossiers() {
    const siteName = 'portail-recouvrement';
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

    // Appel API réel pour récupérer les dossiers du partenaire
    this.caseService.getDossiersPartenaire(siteName, partnerNodeId).subscribe({
      next: (response) => {
        // Extraction des dossiers depuis la réponse
        this.availableDossiers = response.data?.map((item: any) => item.map) || [];
        
        // Filtrer pour ne garder que les dossiers assignés au partenaire
        this.availableDossiers = this.availableDossiers.filter(
          (dossier: any) => dossier.partenaireNodeId === partnerNodeId
        );
        
        this.isLoading = false;
        this.calculateStatistics();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des dossiers partenaire:', error);
        this.errorMessage = 'Impossible de récupérer les dossiers.';
        this.isLoading = false;
      }
    });
  }

  // Calculer les statistiques
  calculateStatistics() {
    this.totalTransactions = this.availableDossiers.reduce((acc, dossier) => 
      acc + this.calculateTotalDue(dossier), 0);
    
    this.totalPayments = this.availableDossiers.reduce((acc, dossier) => 
      acc + (dossier.montantPaye || 0), 0);
    
    // Calcul des commissions (exemple: 10% du total payé)
    this.totalCommissions = this.totalPayments * 0.10;
    this.commissionsReceived = this.totalCommissions * 0.7; // 70% reçus
  }

  // Ouvrir le drawer de paiement
  openPaymentDrawer() {
    this.currentStep = 'selection';
    this.selectedDossier = null;
    this.selectedDossierId = '';
    this.selectedCurrency = 'XOF';
    this.selectedPaymentMethod = '';
    this.selectedPaymentProvider = '';
    this.exchangeRate = 1;
    this.paymentAmount = 0;
    this.resetFees();
    this.resetPaymentFields();
    this.generateTransactionReference();
    this.showPaymentDrawer = true;
  }

  // Fermer le drawer de paiement
  closePaymentDrawer() {
    this.showPaymentDrawer = false;
    this.currentStep = 'selection';
    this.selectedDossier = null;
    this.selectedDossierId = '';
    this.selectedCurrency = 'XOF';
    this.selectedPaymentMethod = '';
    this.selectedPaymentProvider = '';
    this.paymentAmount = 0;
    this.resetFees();
    this.resetPaymentFields();
  }

  // Sélectionner un dossier depuis les cartes
  selectDossierCard(dossier: any) {
    if (this.calculateRemainingAmount(dossier) <= 0) {
      return;
    }
    this.selectedDossierId = dossier.nodeId;
    this.selectedDossier = dossier;
  }

  // Sélectionner un dossier depuis le bouton "Effectuer un paiement"
  selectDossierForPayment(dossier: any) {
    this.selectedDossier = dossier;
    this.selectedDossierId = dossier.nodeId;
    this.openPaymentDrawer();
  }

  // Sélectionner un dossier depuis le select
  onDossierSelect() {
    if (this.selectedDossierId) {
      this.selectedDossier = this.availableDossiers.find(d => d.nodeId === this.selectedDossierId);
      if (this.selectedDossier) {
        this.currentStep = 'currency';
      }
    }
  }

  // Les autres méthodes de paiement
  onCurrencySelect() {
    if (this.selectedCurrency) {
      const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
      this.exchangeRate = currency?.rate || 1;
      this.calculateFees();
      this.currentStep = 'details';
    }
  }

  goToPaymentMethod() {
    if (this.paymentAmount > 0 && this.paymentAmount <= this.totalToPayInSelectedCurrency) {
      this.currentStep = 'paymentMethod';
    }
  }

  onPaymentMethodSelect() {
    if (this.selectedPaymentMethod && this.selectedPaymentProvider) {
      this.currentStep = 'paymentInfo';
      this.resetPaymentFields();
    }
  }

  validateAndProceed() {
    if (!this.isPaymentInfoValid()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.selectedPaymentMethod === 'mobile') {
      this.sendOtp();
    } else {
      this.currentStep = 'recap';
    }
  }

  verifyOtpAndProceed() {
    if (!this.mobileOtp || this.mobileOtp.length !== 6) {
      alert('Veuillez entrer un code OTP valide à 6 chiffres');
      return;
    }
    this.currentStep = 'recap';
  }

  sendOtp() {
    if (!this.mobileNumber || !this.mobileAmount) {
      alert('Veuillez renseigner le numéro de téléphone et le montant');
      return;
    }

    setTimeout(() => {
      this.otpSent = true;
      this.resendCooldown = 60;
      this.startResendCooldown();
      this.currentStep = 'otp';
    }, 1000);
  }

  resendOtp() {
    if (this.resendCooldown > 0) return;
    this.sendOtp();
  }

  startResendCooldown() {
    const interval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  resetPaymentFields() {
    this.mobileNumber = '';
    this.mobileAmount = this.paymentAmount;
    this.mobileOtp = '';
    this.otpSent = false;
    this.resendCooldown = 0;
    this.cardNumber = '';
    this.cardHolderName = '';
    this.cardExpiryMonth = '';
    this.cardExpiryYear = '';
    this.cardCvv = '';
    this.paypalEmail = '';
  }

  isPaymentInfoValid(): boolean {
    if (this.selectedPaymentMethod === 'mobile') {
      return !!this.mobileNumber && !!this.mobileAmount && this.mobileAmount > 0;
    }
    
    if (this.selectedPaymentMethod === 'card') {
      return !!this.cardNumber && !!this.cardHolderName && !!this.cardExpiryMonth && 
             !!this.cardExpiryYear && !!this.cardCvv;
    }
    
    if (this.selectedPaymentMethod === 'paypal') {
      return !!this.paypalEmail;
    }
    
    return false;
  }

  getNextButtonLabel(): string {
    if (this.selectedPaymentMethod === 'mobile') {
      return 'Envoyer OTP';
    }
    return 'Suivant';
  }

  calculateFees() {
    if (!this.selectedDossier) return;

    this.penalties = this.calculatePenalties(this.selectedDossier);
    this.taxes = this.penalties * 0.20;
    const baseAmount = this.calculateRemainingAmount(this.selectedDossier);
    this.transactionFees = baseAmount * 0.015;
    this.totalFees = this.penalties + this.taxes + this.transactionFees;
    this.totalToPay = baseAmount + this.totalFees;
    this.totalToPayInSelectedCurrency = this.convertToSelectedCurrency(this.totalToPay);
    this.paymentAmount = this.totalToPayInSelectedCurrency;
  }

  calculatePenalties(dossier: any): number {
    const isOverdue = this.isDossierOverdue(dossier);
    if (!isOverdue) return 0;
    
    const remainingAmount = this.calculateRemainingAmount(dossier);
    return remainingAmount * 0.10;
  }

  isDossierOverdue(dossier: any): boolean {
    if (!dossier.dateEcheance) return false;
    
    const dueDate = new Date(dossier.dateEcheance);
    const today = new Date();
    return dueDate < today;
  }

  calculateRemainingAmount(dossier: any): number {
    const totalDue = this.calculateTotalDue(dossier);
    const paid = dossier.montantPaye || 0;
    return totalDue - paid;
  }

  calculateTotalDue(dossier: any): number {
    const principal = dossier.montantTotal || 0;
    const interests = dossier.montantInterets || 0;
    const penalties = dossier.montantPenalites || 0;
    const fees = dossier.montantFrais || 0;
    
    return principal + interests + penalties + fees;
  }

  resetFees() {
    this.penalties = 0;
    this.taxes = 0;
    this.transactionFees = 0;
    this.totalFees = 0;
    this.totalToPay = 0;
    this.totalToPayInSelectedCurrency = 0;
  }

  getDossierPaymentPercentage(dossier: any): number {
    const total = this.calculateTotalDue(dossier);
    const paid = dossier.montantPaye || 0;
    return total ? Math.round((paid / total) * 100) : 0;
  }

  goBack() {
    switch (this.currentStep) {
      case 'currency':
        this.currentStep = 'selection';
        this.selectedDossier = null;
        this.selectedDossierId = '';
        this.resetFees();
        break;
      case 'details':
        this.currentStep = 'currency';
        break;
      case 'paymentMethod':
        this.currentStep = 'details';
        break;
      case 'paymentInfo':
        this.currentStep = 'paymentMethod';
        break;
      case 'otp':
        this.currentStep = 'paymentInfo';
        this.otpSent = false;
        this.resendCooldown = 0;
        break;
      case 'recap':
        if (this.selectedPaymentMethod === 'mobile') {
          this.currentStep = 'otp';
        } else {
          this.currentStep = 'paymentInfo';
        }
        break;
      case 'confirmation':
        this.currentStep = 'recap';
        break;
    }
  }

  generateTransactionReference() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    this.transactionReference = `TRX-PART-${timestamp}-${random}`;
    this.transactionDate = new Date();
  }

  processPayment() {
    if (this.paymentAmount <= 0 || this.paymentAmount > this.totalToPayInSelectedCurrency) {
      alert('Montant de paiement invalide');
      return;
    }

    const amountInXOF = this.convertToXOF(this.paymentAmount);

    console.log('Paiement partenaire en cours pour le dossier:', this.selectedDossier?.numeroDossier);
    console.log('Montant payé:', this.paymentAmount, this.selectedCurrency);
    console.log('Montant converti en XOF:', amountInXOF);
    console.log('Référence transaction:', this.transactionReference);
    
    // Simulation de paiement
    setTimeout(() => {
      this.currentStep = 'confirmation';
      // Recharger les données après paiement
      this.loadPartnerDossiers();
    }, 2000);
  }

  downloadReceipt() {
    console.log('Téléchargement du reçu pour la transaction:', this.transactionReference);
    alert('Fonctionnalité de téléchargement du reçu - À implémenter');
  }

  // Méthodes utilitaires
  formatCurrency(amount: number): string {
    if (!amount) return `0 FCFA`;
    
    const selectedCurrency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    const symbol = selectedCurrency?.symbol || 'FCFA';
    
    if (this.selectedCurrency === 'XOF') {
      return `${Math.round(amount).toLocaleString('fr-FR')} ${symbol}`;
    }
    
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ` ${symbol}`;
  }

  formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Non définie';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Date invalide';
  }
}

  convertToSelectedCurrency(amountInXOF: number): number {
    if (this.selectedCurrency === 'XOF') return amountInXOF;
    
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    const converted = amountInXOF * (currency?.rate || 1);
    
    return Math.round(converted * 100) / 100;
  }

  convertToXOF(amountInCurrency: number): number {
    if (this.selectedCurrency === 'XOF') return amountInCurrency;
    
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    const converted = amountInCurrency / (currency?.rate || 1);
    
    return Math.round(converted);
  }

  getInverseExchangeRate(): number {
    if (this.selectedCurrency === 'XOF') return 1;
    
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    return 1 / (currency?.rate || 1);
  }

  getCurrencySymbol(): string {
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    return currency?.symbol || 'FCFA';
  }

  getCurrencyName(): string {
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    return currency?.name || 'Franc CFA';
  }

  getPaymentMethodName(): string {
    const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
    return method?.name || '';
  }

  getPaymentProviderName(): string {
    const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
    const provider = method?.providers.find(p => p.id === this.selectedPaymentProvider);
    return provider?.name || '';
  }

  getPaymentMethodIcon(): string {
    const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
    const provider = method?.providers.find(p => p.id === this.selectedPaymentProvider);
    return provider?.icon || '💳';
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

  // pour le drawer historique

  // Getter pour les transactions filtrées
get filteredTransactions() {
  let filtered = this.transactionsHistory;

  // Filtre par recherche
  if (this.searchTerm) {
    filtered = filtered.filter(t => 
      t.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      t.dossierNumber.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Filtre par date
  if (this.dateFilter) {
    const today = new Date();
    filtered = filtered.filter(t => {
      switch (this.dateFilter) {
        case 'today':
          return t.date.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return t.date >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1);
          return t.date >= monthAgo;
        case 'last-month':
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          return t.date >= lastMonth && t.date < thisMonth;
        default:
          return true;
      }
    });
  }

  // Filtre par type
  if (this.typeFilter) {
    filtered = filtered.filter(t => t.paymentType === this.typeFilter);
  }

  // Filtre par statut
  if (this.statusFilter) {
    filtered = filtered.filter(t => t.status === this.statusFilter);
  }

  // Tri chronologique (plus récent en premier)
  return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Méthodes pour l'historique
openHistoryDrawer() {
  this.showHistoryDrawer = true;
  this.resetHistoryFilters();
}

closeHistoryDrawer() {
  this.showHistoryDrawer = false;
  this.resetHistoryFilters();
}

resetHistoryFilters() {
  this.searchTerm = '';
  this.dateFilter = '';
  this.typeFilter = '';
  this.statusFilter = '';
}

viewTransactionDetails(transaction: any) {
  console.log('Détails de la transaction:', transaction);
  // Implémentez la logique pour afficher les détails
  alert(`Détails de la transaction ${transaction.reference}\nDossier: ${transaction.dossierNumber}\nMontant: ${transaction.amount} ${transaction.currency}\nStatut: ${this.getStatusLabel(transaction.status)}`);
}

exportToPDF() {
  console.log('Export PDF des transactions');
  // Implémentez la logique d'export PDF
  alert('Fonctionnalité d\'export PDF - À implémenter');
}

getPaymentMethodLabel(type: string): string {
  const labels: { [key: string]: string } = {
    'mobile': 'Mobile Money',
    'card': 'Carte Bancaire',
    'paypal': 'PayPal'
  };
  return labels[type] || type;
}

// pour le drawer suivi des paiements

// Méthodes pour le suivi des transactions
openTrackingDrawer() {
  this.showTrackingDrawer = true;
  this.loadEcheances();
  this.resetTrackingFilters();
}

closeTrackingDrawer() {
  this.showTrackingDrawer = false;
  this.resetTrackingFilters();
}

resetTrackingFilters() {
  this.trackingFilters = {
    searchTerm: '',
    status: '',
    priority: ''
  };
  this.selectedStatus = '';
  this.selectedPriority = '';
  this.filteredEcheances = [...this.echeances];
}

loadEcheances() {
  // Données mockées pour test
  this.echeances = [
    {
      id: '1',
      dossierId: 'doss1',
      dossierNumero: 'DOS-2024-001',
      debiteurName: 'Jean Dupont',
      montant: 150000,
      dateEcheance: new Date('2024-01-15'),
      datePaiement: new Date('2024-01-15'),
      statut: 'paid',
      modePaiement: 'Virement bancaire',
      progress: 100,
      createdBy: 'system'
    },
    {
      id: '2',
      dossierId: 'doss2',
      dossierNumero: 'DOS-2024-002',
      debiteurName: 'Marie Martin',
      montant: 75000,
      dateEcheance: new Date(),
      statut: 'current',
      progress: 50,
      createdBy: 'system'
    },
    {
      id: '3',
      dossierId: 'doss3',
      dossierNumero: 'DOS-2024-003',
      debiteurName: 'Pierre Durand',
      montant: 200000,
      dateEcheance: new Date(new Date().setDate(new Date().getDate() + 10)),
      statut: 'future',
      createdBy: 'system'
    }
  ];
  this.filteredEcheances = [...this.echeances];
}

setActivePaymentTab(tab: 'paid' | 'current' | 'future') {
  this.activePaymentTab = tab;
}

getDaysRemaining(dateEcheance: Date): number {
  const today = new Date();
  const echeance = new Date(dateEcheance);
  const diffTime = echeance.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

getDaysUntil(dateEcheance: Date): number {
  return this.getDaysRemaining(dateEcheance);
}

// Méthodes pour les actions
viewPaymentDetails(echeance: any) {
  console.log('Voir détails paiement:', echeance);
  alert(`Détails du paiement:\nDossier: ${echeance.dossierNumero}\nDébiteur: ${echeance.debiteurName}\nMontant: ${this.formatCurrency(echeance.montant)}\nStatut: ${echeance.statut}`);
}

recordPayment(echeance: any) {
  console.log('Enregistrer paiement:', echeance);
  this.openPaymentDrawer();
}

sendReminder(echeance: any) {
  console.log('Envoyer rappel:', echeance);
  alert(`Rappel envoyé pour le dossier ${echeance.dossierNumero}`);
}

scheduleReminder(echeance: any) {
  console.log('Planifier rappel:', echeance);
  alert(`Rappel planifié pour le dossier ${echeance.dossierNumero}`);
}

viewEcheanceDetails(echeance: any) {
  console.log('Voir détails échéance:', echeance);
  alert(`Détails de l'échéance:\nDossier: ${echeance.dossierNumero}\nDébiteur: ${echeance.debiteurName}\nÉchéance:
     ${this.formatDate(echeance.dateEcheance)}\nMontant: ${this.formatCurrency(echeance.montant)}`);
}

// Filtres pour le suivi
updateStatusFilter(): void {
  this.trackingFilters.status = this.selectedStatus;
  this.applyTrackingFilters();
}

updatePriorityFilter(): void {
  this.trackingFilters.priority = this.selectedPriority;
  this.applyTrackingFilters();
}

applyTrackingFilters(): void {
  if (!this.echeances || this.echeances.length === 0) {
    this.filteredEcheances = [];
    return;
  }

  let filtered = [...this.echeances];

  // Filtre par terme de recherche
  if (this.trackingFilters.searchTerm) {
    const searchTerm = this.trackingFilters.searchTerm.toLowerCase().trim();
    filtered = filtered.filter(echeance => 
      echeance.dossierNumero?.toLowerCase().includes(searchTerm) ||
      echeance.debiteurName?.toLowerCase().includes(searchTerm) ||
      echeance.modePaiement?.toLowerCase().includes(searchTerm) ||
      this.formatCurrency(echeance.montant)?.toLowerCase().includes(searchTerm)
    );
  }

  // Filtre par statut
  if (this.trackingFilters.status) {
    filtered = filtered.filter(echeance => {
      switch (this.trackingFilters.status) {
        case 'pending':
          return echeance.statut === 'current' && this.getDaysRemaining(echeance.dateEcheance) > 0;
        case 'active':
          return echeance.statut === 'current';
        case 'negotiation':
          return echeance.statut === 'current' && echeance.progress && echeance.progress > 0;
        case 'legal_action':
          return echeance.statut === 'current' && this.getDaysRemaining(echeance.dateEcheance) < 0;
        case 'completed':
          return echeance.statut === 'paid';
        case 'new':
          return echeance.statut === 'future' && this.getDaysUntil(echeance.dateEcheance) > 30;
        default:
          return true;
      }
    });
  }

  // Filtre par priorité
  if (this.trackingFilters.priority) {
    filtered = filtered.filter(echeance => {
      const daysRemaining = this.getDaysRemaining(echeance.dateEcheance);
      const isOverdue = daysRemaining < 0;
      const isUrgent = daysRemaining <= 3 && daysRemaining >= 0;
      const isHighPriority = echeance.montant > 100000;
      
      switch (this.trackingFilters.priority.toLowerCase()) {
        case 'faible':
          return !isOverdue && !isUrgent && !isHighPriority;
        case 'moyenne':
          return isHighPriority && !isUrgent && !isOverdue;
        case 'elevee':
          return isUrgent || (isHighPriority && daysRemaining <= 7);
        case 'urgent':
          return isOverdue || (isUrgent && isHighPriority);
        default:
          return true;
      }
    });
  }

  this.filteredEcheances = filtered;
}

// Obtenir les échéances filtrées
getPaidEcheances(): any[] {
  const source = this.filteredEcheances.length > 0 ? this.filteredEcheances : this.echeances;
  return source.filter(e => e.statut === 'paid');
}

getCurrentEcheances(): any[] {
  const source = this.filteredEcheances.length > 0 ? this.filteredEcheances : this.echeances;
  return source.filter(e => e.statut === 'current');
}

getFutureEcheances(): any[] {
  const source = this.filteredEcheances.length > 0 ? this.filteredEcheances : this.echeances;
  return source.filter(e => e.statut === 'future');
}
}