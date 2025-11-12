import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
import { I18nService } from '../../../services/i18n.service';
import { DebtCase } from '../../../models/case.model';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';

@Component({
  selector: 'app-debtor-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './debtor-payments.component.html',
  styleUrls: ['./debtor-payments.component.css']
})
export class DebtorPaymentsComponent implements OnInit {
  translations: any = {};
  userCases: DebtCase[] = [];
  
  // Données de la dette
  totalDue = 0;
  alreadyPaid = 0;
  remainingBalance = 0;
  dossiers: any[] = [];
  
  // États du drawer de paiement - ORDRE CORRIGÉ
  showPaymentDrawer = false;
  currentStep: 'selection' | 'currency' | 'details' | 'paymentMethod' | 'paymentInfo' | 'otp' | 'recap' | 'confirmation' = 'selection';

  // Mode de paiement sélectionné
  selectedPaymentMethod: string = '';
  selectedPaymentProvider: string = '';

  // Informations de paiement spécifiques
  // Mobile Money
  mobileNumber: string = '';
  mobileAmount: number = 0;
  mobileOtp: string = '';
  otpSent: boolean = false;
  resendCooldown: number = 0;
  
  // Carte Bancaire
  cardNumber: string = '';
  cardHolderName: string = '';
  cardExpiryMonth: string = '';
  cardExpiryYear: string = '';
  cardCvv: string = '';
  
  // PayPal
  paypalEmail: string = '';

  // Informations de transaction
  transactionReference: string = '';
  transactionDate: Date = new Date();

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
  
  // Données pour le paiement
  paymentAmount = 0;
  selectedDossier: any = null;
  selectedDossierId: string = '';
  selectedCurrency: string = 'XOF';
  exchangeRate: number = 1;
  
  // Frais et calculs
  penalties = 0;
  taxes = 0;
  transactionFees = 0;
  totalFees = 0;
  totalToPay = 0;
  totalToPayInSelectedCurrency = 0;
  
  // Devises disponibles
  availableCurrencies = [
    { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.001524 },
    { code: 'USD', name: 'Dollar US', symbol: '$', rate: 0.00165 },
    { code: 'GBP', name: 'Livre Sterling', symbol: '£', rate: 0.00130 },
    { code: 'CAD', name: 'Dollar Canadien', symbol: 'C$', rate: 0.00224 }
  ];
  
  // Loading states
  isLoading = true;
  errorMessage = '';

  constructor(
    private i18nService: I18nService,
    private authService: AuthService,
    private caseService: CaseService,
    private router: Router
  ) {
    this.loadTranslations();
    this.i18nService.currentLocale$.subscribe(() => {
      this.loadTranslations();
    });
  }

  ngOnInit(): void {
    this.loadDebtorData();
    this.generateTransactionReference();
  }

  private loadTranslations() {
    const currentLocale = this.i18nService.getCurrentLocale();
    this.i18nService.loadTranslations(currentLocale).subscribe(translations => {
      this.translations = translations;
    });
  }

  t(key: string): string {
    return this.i18nService.translate(key, this.translations);
  }

  // Charger les données du débiteur
  loadDebtorData() {
    const siteName = 'portail-recouvrement';
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.isLoading = false;
      return;
    }

    const debiteurNodeId = currentUser.nodeId;

    if (!debiteurNodeId) {
      this.errorMessage = 'Identifiant du débiteur introuvable.';
      this.isLoading = false;
      return;
    }

    this.caseService.getDossiersDebiteur(siteName, debiteurNodeId).subscribe({
      next: (response) => {
        this.dossiers = response.data?.map((item: any) => item.map) || [];
        this.calculatePaymentTotals(this.dossiers);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données :', error);
        this.errorMessage = 'Impossible de récupérer les données de paiement.';
        this.isLoading = false;
      }
    });
  }

  // Calculer les totaux de paiement
  calculatePaymentTotals(dossiers: any[]) {
    this.totalDue = dossiers.reduce((acc, dossier) => acc + (dossier.montantTotal || 0), 0);
    this.alreadyPaid = dossiers.reduce((acc, dossier) => acc + (dossier.montantPaye || 0), 0);
    this.remainingBalance = this.totalDue - this.alreadyPaid;
  }

  // Formater les montants en devise
  formatCurrency(amount: number): string {
    if (!amount) return `0 ${this.getCurrencySymbol()}`;
    
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

  // Obtenir le symbole de la devise sélectionnée
  getCurrencySymbol(): string {
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    return currency?.symbol || 'FCFA';
  }

  // Convertir un montant XOF vers la devise sélectionnée
  convertToSelectedCurrency(amountInXOF: number): number {
    if (this.selectedCurrency === 'XOF') return amountInXOF;
    
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    const converted = amountInXOF * (currency?.rate || 1);
    
    return Math.round(converted * 100) / 100;
  }

  // Convertir un montant de la devise sélectionnée vers XOF
  convertToXOF(amountInCurrency: number): number {
    if (this.selectedCurrency === 'XOF') return amountInCurrency;
    
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    const converted = amountInCurrency / (currency?.rate || 1);
    
    return Math.round(converted);
  }

  // Obtenir le taux inverse (1 [devise] = ? XOF)
  getInverseExchangeRate(): number {
    if (this.selectedCurrency === 'XOF') return 1;
    
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    return 1 / (currency?.rate || 1);
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

  // Sélectionner un dossier
  onDossierSelect() {
    if (this.selectedDossierId) {
      this.selectedDossier = this.dossiers.find(d => d.nodeId === this.selectedDossierId);
      if (this.selectedDossier) {
        this.currentStep = 'currency';
      }
    }
  }

  // Sélectionner une devise
  onCurrencySelect() {
    if (this.selectedCurrency) {
      const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
      this.exchangeRate = currency?.rate || 1;
      this.calculateFees();
      this.currentStep = 'details'; // On va aux détails APRÈS la devise
    }
  }

  // Aller au mode de paiement depuis les détails
  goToPaymentMethod() {
    if (this.paymentAmount > 0 && this.paymentAmount <= this.totalToPayInSelectedCurrency) {
      this.currentStep = 'paymentMethod';
    }
  }

  // Sélectionner un mode de paiement
  onPaymentMethodSelect() {
    if (this.selectedPaymentMethod && this.selectedPaymentProvider) {
      this.currentStep = 'paymentInfo';
      this.resetPaymentFields();
    }
  }

  // Valider et procéder à l'étape suivante
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

  // Vérifier OTP et procéder
  verifyOtpAndProceed() {
    if (!this.mobileOtp || this.mobileOtp.length !== 6) {
      alert('Veuillez entrer un code OTP valide à 6 chiffres');
      return;
    }

    // Simuler la vérification OTP
    console.log('Vérification OTP:', this.mobileOtp);
    this.currentStep = 'recap';
  }

  // Envoyer OTP pour Mobile Money
  sendOtp() {
    if (!this.mobileNumber || !this.mobileAmount) {
      alert('Veuillez renseigner le numéro de téléphone et le montant');
      return;
    }

    // Simulation d'envoi d'OTP
    console.log('Envoi OTP à:', this.mobileNumber);
    console.log('Montant:', this.mobileAmount);
    
    // Simuler un délai d'envoi
    setTimeout(() => {
      this.otpSent = true;
      this.resendCooldown = 60;
      this.startResendCooldown();
      this.currentStep = 'otp';
    }, 1000);
  }

  // Renvoyer OTP
  resendOtp() {
    if (this.resendCooldown > 0) return;

    this.sendOtp();
  }

  // Démarrer le compte à rebours pour renvoi OTP
  startResendCooldown() {
    const interval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  // Réinitialiser les champs de paiement
  resetPaymentFields() {
    // Mobile Money
    this.mobileNumber = '';
    this.mobileAmount = this.paymentAmount;
    this.mobileOtp = '';
    this.otpSent = false;
    this.resendCooldown = 0;
    
    // Carte Bancaire
    this.cardNumber = '';
    this.cardHolderName = '';
    this.cardExpiryMonth = '';
    this.cardExpiryYear = '';
    this.cardCvv = '';
    
    // PayPal
    this.paypalEmail = '';
  }

  // Vérifier la validité des informations de paiement
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

  // Obtenir le libellé du bouton suivant
  getNextButtonLabel(): string {
    if (this.selectedPaymentMethod === 'mobile') {
      return 'Envoyer OTP';
    }
    return 'Suivant';
  }

  // Calculer les frais
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

  // Calculer les pénalités
  calculatePenalties(dossier: any): number {
    const isOverdue = this.isDossierOverdue(dossier);
    if (!isOverdue) return 0;
    
    const remainingAmount = this.calculateRemainingAmount(dossier);
    return remainingAmount * 0.10;
  }

  // Vérifier si le dossier est en retard
  isDossierOverdue(dossier: any): boolean {
    if (!dossier.dateEcheance) return false;
    
    const dueDate = new Date(dossier.dateEcheance);
    const today = new Date();
    return dueDate < today;
  }

  // Calculer le montant restant pour un dossier
  calculateRemainingAmount(dossier: any): number {
    const totalDue = this.calculateTotalDue(dossier);
    const paid = dossier.montantPaye || 0;
    return totalDue - paid;
  }

  // Calculer le total dû pour un dossier
  calculateTotalDue(dossier: any): number {
    const principal = dossier.montantTotal || 0;
    const interests = dossier.montantInterets || 0;
    const penalties = dossier.montantPenalites || 0;
    const fees = dossier.montantFrais || 0;
    
    return principal + interests + penalties + fees;
  }

  // Réinitialiser les frais
  resetFees() {
    this.penalties = 0;
    this.taxes = 0;
    this.transactionFees = 0;
    this.totalFees = 0;
    this.totalToPay = 0;
    this.totalToPayInSelectedCurrency = 0;
  }

  // Obtenir le pourcentage de paiement
  getPaymentPercentage(): number {
    return this.totalDue ? Math.round((this.alreadyPaid / this.totalDue) * 100) : 0;
  }

  // Obtenir le pourcentage de paiement pour un dossier spécifique
  getDossierPaymentPercentage(dossier: any): number {
    const total = this.calculateTotalDue(dossier);
    const paid = dossier.montantPaye || 0;
    return total ? Math.round((paid / total) * 100) : 0;
  }

  // Navigation dans le drawer - ORDRE CORRIGÉ
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

  // Générer une référence de transaction
  generateTransactionReference() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    this.transactionReference = `TRX-${timestamp}-${random}`;
    this.transactionDate = new Date();
  }

  // Traiter le paiement
  processPayment() {
    if (this.paymentAmount <= 0 || this.paymentAmount > this.totalToPayInSelectedCurrency) {
      alert('Montant de paiement invalide');
      return;
    }

    const amountInXOF = this.convertToXOF(this.paymentAmount);

    console.log('Paiement en cours pour le dossier:', this.selectedDossier?.numeroDossier);
    console.log('Montant payé:', this.paymentAmount, this.selectedCurrency);
    console.log('Montant converti en XOF:', amountInXOF);
    console.log('Référence transaction:', this.transactionReference);
    
    // Log des informations spécifiques selon la méthode
    if (this.selectedPaymentMethod === 'mobile') {
      console.log('Mobile Number:', this.mobileNumber);
      console.log('Mobile Amount:', this.mobileAmount);
      console.log('OTP:', this.mobileOtp);
    } else if (this.selectedPaymentMethod === 'card') {
      console.log('Card Number:', this.cardNumber);
      console.log('Card Holder:', this.cardHolderName);
    } else if (this.selectedPaymentMethod === 'paypal') {
      console.log('PayPal Email:', this.paypalEmail);
    }
    
    // Simulation de paiement
    setTimeout(() => {
      this.currentStep = 'confirmation';
    }, 2000);
  }

  // Télécharger le reçu
  downloadReceipt() {
    console.log('Téléchargement du reçu pour la transaction:', this.transactionReference);
    alert('Fonctionnalité de téléchargement du reçu - À implémenter');
  }

  // Ouvrir l'historique de paiement
  // openPaymentHistory() {
  //   console.log('Ouvrir historique de paiement');
  //   alert('Fonctionnalité Historique de paiement - À implémenter');
  // }

  // Ouvrir les détails de la dette
  openDebtDetails() {
    console.log('Ouvrir détails de la dette');
    alert('Fonctionnalité Détails dettes - À implémenter');
  }

  // Formater la date
  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // Obtenir le statut du dossier
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

  // Obtenir le nom complet de la devise
  getCurrencyName(): string {
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    return currency?.name || 'Franc CFA';
  }

  // Méthodes utilitaires pour les modes de paiement
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



  //_-----------------Historique de paiement Start-----------------------------------

  showHistoryDrawer = false;
  selectedStatus: string = '';
  searchQuery: string = '';
  payments = [
    { date: '01/12/2024', amount: '1 000 €', paymentMethod: '💳 Carte Bancaire', status: 'success', reference: 'TXN-001', invoice: '#FAC-001' },
    { date: '28/11/2024', amount: '500 €', paymentMethod: '📱 Mobile Money', status: 'pending', reference: 'TXN-002', invoice: '#FAC-001' },
    { date: '25/11/2024', amount: '1 000 €', paymentMethod: '💳 Carte Bancaire', status: 'failed', reference: 'TXN-003', invoice: '#FAC-001' },
  ];
  
  filteredPayments = this.payments;

  // closeHistoryDrawer() {
  //   this.showHistoryDrawer = false;
  // }

  // Méthode pour ouvrir le drawer
  openPaymentHistory() {
    this.showHistoryDrawer = true;
  }

  // Méthode pour fermer le drawer
  closeHistoryDrawer() {
    this.showHistoryDrawer = false;
  }

  filterHistory() {
    this.filteredPayments = this.payments.filter(payment => {
      const matchesStatus = this.selectedStatus ? payment.status === this.selectedStatus : true;
      const matchesQuery = payment.reference.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }
  //_----------------------Historique de paiement End-------------------------------
}