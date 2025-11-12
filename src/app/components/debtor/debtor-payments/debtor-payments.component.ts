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
  currentStep: 'selection' | 'currency' | 'details' | 'paymentMethod' | 'confirmation' = 'selection';
  
  // historique des paiement start
  showHistoryDrawer: boolean = false;
  payments = [
    { date: '01/12/2024', montant: '1 000 €', moyenPaiement: '💳 Carte Bancaire', statut: 'Réussi', reference: 'TXN-001', facture: '#FAC-001' },
    { date: '28/11/2024', montant: '500 €', moyenPaiement: '📱 Mobile Money', statut: 'En attente', reference: 'TXN-002', facture: '#FAC-001' },
    { date: '25/11/2024', montant: '1 000 €', moyenPaiement: '💳 Carte Bancaire', statut: 'Échoué', reference: 'TXN-003', facture: '#FAC-001' }
  ];
  // Données de filtrage
  selectedStatus: string = 'Tous les statuts';
  searchQuery: string = '';
  // Méthode pour fermer le drawer
  closeHistoryDrawer(): void {
    this.showHistoryDrawer = false;
  }
  // Méthode pour filtrer les paiements en fonction du statut et de la recherche
  getFilteredPayments() {
    return this.payments.filter(payment => {
      const matchesStatus = this.selectedStatus === 'Tous les statuts' || payment.statut === this.selectedStatus;
      const matchesSearch = payment.reference.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }
  // // Méthode pour fermer le drawer
  // closeHistoryDrawer(): void {
  //   this.showHistoryDrawer = false;
  // }
  // Méthode pour changer la recherche
  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
  }
  // historique des paiement end

  // Mode de paiement sélectionné
  selectedPaymentMethod: string = '';
  selectedPaymentProvider: string = '';

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
  selectedCurrency: string = 'XOF'; // Devise par défaut = XOF
  exchangeRate: number = 1;
  
  // Frais et calculs
  penalties = 0;
  taxes = 0;
  transactionFees = 0;
  totalFees = 0;
  totalToPay = 0; // En XOF (devise de base)
  totalToPayInSelectedCurrency = 0; // Dans la devise sélectionnée
  
  // Devises disponibles (taux de change depuis XOF)
  availableCurrencies = [
    { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.001524 }, // 1 XOF = 0.001524 EUR
    { code: 'USD', name: 'Dollar US', symbol: '$', rate: 0.00165 }, // 1 XOF = 0.00165 USD
    { code: 'GBP', name: 'Livre Sterling', symbol: '£', rate: 0.00130 }, // 1 XOF = 0.00130 GBP
    { code: 'CAD', name: 'Dollar Canadien', symbol: 'C$', rate: 0.00224 } // 1 XOF = 0.00224 CAD
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
    
    // Écouter les changements de langue
    this.i18nService.currentLocale$.subscribe(() => {
      this.loadTranslations();
    });
  }

  ngOnInit(): void {
    this.loadDebtorData();
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
        console.log('Réponse API paiements :', response);
        this.dossiers = response.data?.map((item: any) => item.map) || [];
        
        // Calculer les totaux
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
    
    // Pour le XOF, on formate sans décimales
    if (this.selectedCurrency === 'XOF') {
      return `${Math.round(amount).toLocaleString('fr-FR')} ${symbol}`;
    }
    
    // Pour les autres devises, on utilise le format standard avec 2 décimales
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
    
    // Arrondir à 2 décimales pour les devises autres que XOF
    return Math.round(converted * 100) / 100;
  }

  // Convertir un montant de la devise sélectionnée vers XOF
  convertToXOF(amountInCurrency: number): number {
    if (this.selectedCurrency === 'XOF') return amountInCurrency;
    
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    const converted = amountInCurrency / (currency?.rate || 1);
    
    return Math.round(converted); // XOF sans décimales
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
    this.selectedCurrency = 'XOF'; // Toujours réinitialiser à XOF
    this.selectedPaymentMethod = '';
    this.selectedPaymentProvider = '';
    this.exchangeRate = 1;
    this.paymentAmount = 0;
    this.resetFees();
    this.showPaymentDrawer = true;
  }

  // Fermer le drawer de paiement
  closePaymentDrawer() {
    this.showPaymentDrawer = false;
    this.currentStep = 'selection';
    this.selectedDossier = null;
    this.selectedDossierId = '';
    this.selectedCurrency = 'XOF'; // Réinitialiser à XOF
    this.selectedPaymentMethod = '';
    this.selectedPaymentProvider = '';
    this.paymentAmount = 0;
    this.resetFees();
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
      this.currentStep = 'details'; // On va directement aux détails après la devise
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
      this.currentStep = 'confirmation';
    }
  }

  // Calculer les frais (toujours en XOF d'abord)
  calculateFees() {
    if (!this.selectedDossier) return;

    // Pénalités si le dossier est en retard (en XOF)
    this.penalties = this.calculatePenalties(this.selectedDossier);
    
    // Taxes (exemple: 20% de TVA sur les pénalités) en XOF
    this.taxes = this.penalties * 0.20;
    
    // Frais de transaction (exemple: 1.5% du montant à payer) en XOF
    const baseAmount = this.calculateRemainingAmount(this.selectedDossier);
    this.transactionFees = baseAmount * 0.015;
    
    // Total des frais en XOF
    this.totalFees = this.penalties + this.taxes + this.transactionFees;
    
    // Total à payer en XOF (montant de base + frais)
    this.totalToPay = baseAmount + this.totalFees;
    
    // Total à payer dans la devise sélectionnée
    this.totalToPayInSelectedCurrency = this.convertToSelectedCurrency(this.totalToPay);
    
    // Par défaut, on propose de payer le total dans la devise sélectionnée
    this.paymentAmount = this.totalToPayInSelectedCurrency;
  }

  // Calculer les pénalités (en XOF)
  calculatePenalties(dossier: any): number {
    // Vérifier si le dossier est en retard
    const isOverdue = this.isDossierOverdue(dossier);
    
    if (!isOverdue) return 0;
    
    // Calculer les pénalités (exemple: 10% du montant restant) en XOF
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

  // Calculer le montant restant pour un dossier (en XOF)
  calculateRemainingAmount(dossier: any): number {
    const totalDue = this.calculateTotalDue(dossier);
    const paid = dossier.montantPaye || 0;
    return totalDue - paid;
  }

  // Calculer le total dû pour un dossier (incluant intérêts et frais) en XOF
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

  // Navigation dans le drawer - CORRIGÉ POUR LE NOUVEL ORDRE
  goBack() {
    if (this.currentStep === 'currency') {
      this.currentStep = 'selection';
      this.selectedDossier = null;
      this.selectedDossierId = '';
      this.resetFees();
    } else if (this.currentStep === 'details') {
      this.currentStep = 'currency';
    } else if (this.currentStep === 'paymentMethod') {
      this.currentStep = 'details';
    } else if (this.currentStep === 'confirmation') {
      this.currentStep = 'paymentMethod';
    }
  }

  // Traiter le paiement
  processPayment() {
    if (this.paymentAmount <= 0 || this.paymentAmount > this.totalToPayInSelectedCurrency) {
      alert('Montant de paiement invalide');
      return;
    }

    // Convertir le montant payé en XOF pour le traitement
    const amountInXOF = this.convertToXOF(this.paymentAmount);

    console.log('Paiement en cours pour le dossier:', this.selectedDossier?.numeroDossier);
    console.log('Montant payé:', this.paymentAmount, this.selectedCurrency);
    console.log('Montant converti en XOF:', amountInXOF);
    console.log('Taux de change utilisé:', this.exchangeRate);
    console.log('Mode de paiement:', this.selectedPaymentMethod);
    console.log('Fournisseur:', this.selectedPaymentProvider);
    
    // Simulation de paiement
    setTimeout(() => {
      alert(`Paiement de ${this.formatCurrency(this.paymentAmount)} effectué avec succès pour le dossier ${this.selectedDossier?.numeroDossier}!`);
      this.closePaymentDrawer();
      this.loadDebtorData();
    }, 2000);
  }

  // Ouvrir l'historique de paiement
  openPaymentHistory() {
    console.log('Ouvrir historique de paiement');
    alert('Fonctionnalité Historique de paiement - À implémenter');
  }

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

  // Obtenir le taux de change actuel
  getCurrentExchangeRate(): number {
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    return currency?.rate || 1;
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

  // Réinitialiser le mode de paiement
  resetPaymentMethod() {
    this.selectedPaymentMethod = '';
    this.selectedPaymentProvider = '';
  }
}