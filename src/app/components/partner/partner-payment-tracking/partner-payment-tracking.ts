import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';

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
}