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
  
  // États du drawer de paiement
  showPaymentDrawer = false;
  currentStep: 'selection' | 'currency' | 'details' | 'confirmation' = 'selection';
  
  // Données pour le paiement
  paymentAmount = 0;
  selectedDossier: any = null;
  selectedDossierId: string = '';
  selectedCurrency: string = 'EUR'; // Devise par défaut = EUR
  exchangeRate: number = 1;
  
  // Frais et calculs
  penalties = 0;
  taxes = 0;
  transactionFees = 0;
  totalFees = 0;
  totalToPay = 0; // En EUR
  totalToPayInSelectedCurrency = 0; // Dans la devise sélectionnée
  
  // Devises disponibles (taux de change simulés)
  availableCurrencies = [
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 1 },
    { code: 'USD', name: 'Dollar US', symbol: '$', rate: 1.08 },
    { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', rate: 655.96 },
    { code: 'GBP', name: 'Livre Sterling', symbol: '£', rate: 0.85 },
    { code: 'CAD', name: 'Dollar Canadien', symbol: 'C$', rate: 1.47 }
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
    const symbol = selectedCurrency?.symbol || '€';
    
    // Pour le XOF, on formate sans décimales
    if (this.selectedCurrency === 'XOF') {
      return `${amount.toLocaleString('fr-FR')} ${symbol}`;
    }
    
    // Pour les autres devises, on utilise le format standard
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: this.selectedCurrency,
      minimumFractionDigits: this.selectedCurrency === 'EUR' || this.selectedCurrency === 'USD' ? 2 : 0,
      maximumFractionDigits: this.selectedCurrency === 'EUR' || this.selectedCurrency === 'USD' ? 2 : 0
    }).replace('EUR', symbol).replace('USD', symbol);
  }

  // Obtenir le symbole de la devise sélectionnée
  getCurrencySymbol(): string {
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    return currency?.symbol || '€';
  }

  // Convertir un montant EUR vers la devise sélectionnée
  convertToSelectedCurrency(amountInEUR: number): number {
    if (this.selectedCurrency === 'EUR') return amountInEUR;
    
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    const converted = amountInEUR * (currency?.rate || 1);
    
    // Arrondir selon la devise
    if (this.selectedCurrency === 'XOF') {
      return Math.round(converted); // XOF sans décimales
    } else if (this.selectedCurrency === 'EUR' || this.selectedCurrency === 'USD') {
      return Math.round(converted * 100) / 100; // 2 décimales
    } else {
      return Math.round(converted * 100) / 100; // 2 décimales par défaut
    }
  }

  // Convertir un montant de la devise sélectionnée vers EUR
  convertToEUR(amountInCurrency: number): number {
    if (this.selectedCurrency === 'EUR') return amountInCurrency;
    
    const currency = this.availableCurrencies.find(c => c.code === this.selectedCurrency);
    const converted = amountInCurrency / (currency?.rate || 1);
    
    return Math.round(converted * 100) / 100; // 2 décimales pour EUR
  }

  // Ouvrir le drawer de paiement
  openPaymentDrawer() {
    this.currentStep = 'selection';
    this.selectedDossier = null;
    this.selectedDossierId = '';
    this.selectedCurrency = 'EUR'; // Toujours réinitialiser à EUR
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
    this.selectedCurrency = 'EUR'; // Réinitialiser à EUR
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
      this.currentStep = 'details';
    }
  }

  // Calculer les frais (toujours en EUR d'abord)
  calculateFees() {
    if (!this.selectedDossier) return;

    // Pénalités si le dossier est en retard (en EUR)
    this.penalties = this.calculatePenalties(this.selectedDossier);
    
    // Taxes (exemple: 20% de TVA sur les pénalités) en EUR
    this.taxes = this.penalties * 0.20;
    
    // Frais de transaction (exemple: 1.5% du montant à payer) en EUR
    const baseAmount = this.calculateRemainingAmount(this.selectedDossier);
    this.transactionFees = baseAmount * 0.015;
    
    // Total des frais en EUR
    this.totalFees = this.penalties + this.taxes + this.transactionFees;
    
    // Total à payer en EUR (montant de base + frais)
    this.totalToPay = baseAmount + this.totalFees;
    
    // Total à payer dans la devise sélectionnée
    this.totalToPayInSelectedCurrency = this.convertToSelectedCurrency(this.totalToPay);
    
    // Par défaut, on propose de payer le total dans la devise sélectionnée
    this.paymentAmount = this.totalToPayInSelectedCurrency;
  }

  // Calculer les pénalités (en EUR)
  calculatePenalties(dossier: any): number {
    // Vérifier si le dossier est en retard
    const isOverdue = this.isDossierOverdue(dossier);
    
    if (!isOverdue) return 0;
    
    // Calculer les pénalités (exemple: 10% du montant restant) en EUR
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

  // Calculer le montant restant pour un dossier (en EUR)
  calculateRemainingAmount(dossier: any): number {
    const totalDue = this.calculateTotalDue(dossier);
    const paid = dossier.montantPaye || 0;
    return totalDue - paid;
  }

  // Calculer le total dû pour un dossier (incluant intérêts et frais) en EUR
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

  // Navigation dans le drawer
  goBack() {
    if (this.currentStep === 'currency') {
      this.currentStep = 'selection';
      this.selectedDossier = null;
      this.selectedDossierId = '';
      this.resetFees();
    } else if (this.currentStep === 'details') {
      this.currentStep = 'currency';
    } else if (this.currentStep === 'confirmation') {
      this.currentStep = 'details';
    }
  }

  goToConfirmation() {
    if (this.paymentAmount > 0 && this.paymentAmount <= this.totalToPayInSelectedCurrency) {
      this.currentStep = 'confirmation';
    }
  }

  // Traiter le paiement
  processPayment() {
    if (this.paymentAmount <= 0 || this.paymentAmount > this.totalToPayInSelectedCurrency) {
      alert('Montant de paiement invalide');
      return;
    }

    // Convertir le montant payé en Euro pour le traitement
    const amountInEUR = this.convertToEUR(this.paymentAmount);

    console.log('Paiement en cours pour le dossier:', this.selectedDossier?.numeroDossier);
    console.log('Montant payé:', this.paymentAmount, this.selectedCurrency);
    console.log('Montant converti en EUR:', amountInEUR);
    console.log('Taux de change utilisé:', this.exchangeRate);
    
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
    return currency?.name || 'Euro';
  }
}