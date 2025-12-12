import { Component, HostListener } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-creditor-payments',
  imports: [
    RouterLink,
    FormsModule,
    CommonModule
  ],
  templateUrl: './creditor-payments.html',
  styleUrl: './creditor-payments.css',
  providers: [DecimalPipe]
})
export class CreditorPayments {
  // État des tiroirs
  isHistoryDrawerOpen = false;
  isTrackingDrawerOpen = false;
  isPaymentDrawerOpen = false;

  // Variables pour les filtres du tiroir historique
  historyFilters = {
    dossier: 'all',
    debiteur: 'all',
    searchTerm: '',
    dateRange: '30days'
  };

  // Variables pour les filtres du tiroir tracking
  trackingFilters = {
    status: 'all',
    partner: 'all',
    searchTerm: ''
  };

  // Variables pour le formulaire de paiement
  paymentForm = {
    amount: '',
    method: 'mobile_money',
    debtor: '',
    reference: '',
    notes: ''
  };

  // Données exemple pour le tiroir historique
  paymentHistory = [
    { id: 1, reference: '#PAY-2024-001', debtor: 'Entreprise ABC', amount: 45250, method: 'Virement', status: 'received', date: '15/06/2024' },
    { id: 2, reference: '#PAY-2024-002', debtor: 'Société XYZ', amount: 12800, method: 'Mobile Money', status: 'pending', date: '14/06/2024' },
    { id: 3, reference: '#PAY-2024-003', debtor: 'Particulier Martin', amount: 3500, method: 'Carte bancaire', status: 'received', date: '13/06/2024' },
    { id: 4, reference: '#PAY-2024-004', debtor: 'Entreprise DEF', amount: 67000, method: 'Virement', status: 'failed', date: '12/06/2024' },
    { id: 5, reference: '#PAY-2024-005', debtor: 'Société GHI', amount: 23450, method: 'Prélèvement', status: 'received', date: '10/06/2024' },
    { id: 6, reference: '#PAY-2024-006', debtor: 'Startup JKL', amount: 8900, method: 'Mobile Money', status: 'received', date: '08/06/2024' }
  ];

  // Données exemple pour le tiroir tracking
  trackingData = [
    { id: 1, type: 'Reversement', partner: 'Cabinet Legal A', amount: 12000, status: 'completed', date: '15/06/2024' },
    { id: 2, type: 'Règlement', partner: 'Agence B', amount: 7500, status: 'pending', date: '14/06/2024' },
    { id: 3, type: 'Reversement', partner: 'Cabinet Legal C', amount: 23000, status: 'processing', date: '13/06/2024' }
  ];

  // Données pour les graphiques
  weeklyPayments = [
    { week: 'Sem 1', amount: 45000 },
    { week: 'Sem 2', amount: 68000 },
    { week: 'Sem 3', amount: 92000 },
    { week: 'Sem 4', amount: 82000 }
  ];

  constructor(private decimalPipe: DecimalPipe) {}

  // ============ Fonctions pour le tiroir historique ============

  // Ouvrir le tiroir historique
  openHistoryDrawer() {
    this.closeAllDrawers();
    this.isHistoryDrawerOpen = true;
    this.disableBodyScroll();
  }

  // Fermer le tiroir historique
  closeHistoryDrawer() {
    this.isHistoryDrawerOpen = false;
    this.enableBodyScroll();
  }

  // Réinitialiser les filtres du tiroir historique
  resetHistoryFilters() {
    this.historyFilters = {
      dossier: 'all',
      debiteur: 'all',
      searchTerm: '',
      dateRange: '30days'
    };
  }

  // Filtrer les paiements historiques
  getFilteredPayments() {
    return this.paymentHistory.filter(payment => {
      // Filtre par statut
      if (this.historyFilters.dossier !== 'all' && payment.status !== this.historyFilters.dossier) {
        return false;
      }

      // Filtre par type de débiteur
      if (this.historyFilters.debiteur !== 'all') {
        const debtorLower = payment.debtor.toLowerCase();
        const filterLower = this.historyFilters.debiteur.toLowerCase();
        
        if (filterLower === 'entreprise' && !debtorLower.includes('entreprise')) return false;
        if (filterLower === 'societe' && !debtorLower.includes('société') && !debtorLower.includes('societe')) return false;
        if (filterLower === 'particulier' && !debtorLower.includes('particulier')) return false;
      }

      // Filtre par recherche
      if (this.historyFilters.searchTerm) {
        const searchLower = this.historyFilters.searchTerm.toLowerCase();
        return payment.reference.toLowerCase().includes(searchLower) ||
               payment.debtor.toLowerCase().includes(searchLower) ||
               payment.method.toLowerCase().includes(searchLower);
      }

      return true;
    });
  }

  // ============ Fonctions pour le tiroir tracking ============

  // Ouvrir le tiroir de tracking
  openTrackingDrawer() {
    this.closeAllDrawers();
    this.isTrackingDrawerOpen = true;
    this.disableBodyScroll();
  }

  // Fermer le tiroir de tracking
  closeTrackingDrawer() {
    this.isTrackingDrawerOpen = false;
    this.enableBodyScroll();
  }

  // Réinitialiser les filtres de tracking
  resetTrackingFilters() {
    this.trackingFilters = {
      status: 'all',
      partner: 'all',
      searchTerm: ''
    };
  }

  // Filtrer les données de tracking
  getFilteredTracking() {
    return this.trackingData.filter(item => {
      // Filtre par statut
      if (this.trackingFilters.status !== 'all' && item.status !== this.trackingFilters.status) {
        return false;
      }

      // Filtre par partenaire
      if (this.trackingFilters.partner !== 'all') {
        const partnerMap: { [key: string]: string } = {
          'cabinet_a': 'Cabinet Legal A',
          'agence_b': 'Agence B',
          'cabinet_c': 'Cabinet Legal C'
        };
        if (item.partner !== partnerMap[this.trackingFilters.partner]) {
          return false;
        }
      }

      // Filtre par recherche
      if (this.trackingFilters.searchTerm) {
        const searchLower = this.trackingFilters.searchTerm.toLowerCase();
        return item.type.toLowerCase().includes(searchLower) ||
               item.partner.toLowerCase().includes(searchLower);
      }

      return true;
    });
  }

  // ============ Fonctions pour le tiroir paiement ============

  // Ouvrir le tiroir de paiement
  openPaymentDrawer() {
    this.closeAllDrawers();
    this.isPaymentDrawerOpen = true;
    this.disableBodyScroll();
  }

  // Fermer le tiroir de paiement
  closePaymentDrawer() {
    this.isPaymentDrawerOpen = false;
    this.enableBodyScroll();
    this.resetPaymentForm();
  }

  // Réinitialiser le formulaire de paiement
  resetPaymentForm() {
    this.paymentForm = {
      amount: '',
      method: 'mobile_money',
      debtor: '',
      reference: '',
      notes: ''
    };
  }

  // Soumettre le formulaire de paiement
  submitPaymentForm() {
    if (this.validatePaymentForm()) {
      // Ajouter à l'historique
      const newPayment = {
        id: this.paymentHistory.length + 1,
        reference: this.paymentForm.reference || `#PAY-${new Date().getFullYear()}-${(this.paymentHistory.length + 1).toString().padStart(3, '0')}`,
        debtor: this.paymentForm.debtor,
        amount: parseFloat(this.paymentForm.amount),
        method: this.getMethodLabel(this.paymentForm.method),
        status: 'pending',
        date: new Date().toLocaleDateString('fr-FR')
      };
      
      this.paymentHistory.unshift(newPayment);
      
      // Fermer le tiroir et réinitialiser
      this.closePaymentDrawer();
      
      // Afficher une notification
      alert(`Paiement de ${this.paymentForm.amount}€ enregistré avec succès!`);
    }
  }

  // Valider le formulaire de paiement
  validatePaymentForm(): boolean {
    if (!this.paymentForm.amount || parseFloat(this.paymentForm.amount) <= 0) {
      alert('Veuillez entrer un montant valide');
      return false;
    }
    
    if (!this.paymentForm.debtor) {
      alert('Veuillez spécifier un débiteur');
      return false;
    }
    
    return true;
  }

  // ============ Fonctions utilitaires ============

  // Fermer tous les tiroirs
  private closeAllDrawers() {
    if (this.isHistoryDrawerOpen) this.closeHistoryDrawer();
    if (this.isTrackingDrawerOpen) this.closeTrackingDrawer();
    if (this.isPaymentDrawerOpen) this.closePaymentDrawer();
  }

  // Obtenir le libellé du moyen de paiement
  getMethodLabel(method: string): string {
    const methods: { [key: string]: string } = {
      'mobile_money': 'Mobile Money',
      'bank_transfer': 'Virement',
      'credit_card': 'Carte bancaire',
      'direct_debit': 'Prélèvement',
      'cash': 'Espèces'
    };
    return methods[method] || method;
  }

  // Obtenir la classe CSS pour le statut
  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'received': 'status-success',
      'pending': 'status-warning',
      'failed': 'status-danger',
      'completed': 'status-success',
      'processing': 'status-info'
    };
    return classes[status] || 'status-secondary';
  }

  // Obtenir le libellé du statut
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'received': 'Reçu',
      'pending': 'En attente',
      'failed': 'Échoué',
      'completed': 'Terminé',
      'processing': 'En traitement'
    };
    return labels[status] || status;
  }

  // Désactiver le défilement du body
  private disableBodyScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '15px'; // Compenser la scrollbar
  }

  // Réactiver le défilement du body
  private enableBodyScroll() {
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0';
  }

  // Gestion de la touche Échap
  @HostListener('document:keydown.escape')
  handleEscapeKey() {
    this.closeAllDrawers();
  }

  // Export des données
  exportPayments(format: 'csv' | 'excel' = 'csv') {
    const data = this.getFilteredPayments();
    
    // Simulation d'export CSV
    if (format === 'csv') {
      const csvContent = this.convertToCSV(data);
      this.downloadFile(csvContent, 'paiements.csv', 'text/csv');
    }
    
    alert(`Export ${format} de ${data.length} paiements effectué`);
  }

  // Convertir les données en CSV
  private convertToCSV(data: any[]): string {
    const headers = ['Référence', 'Débiteur', 'Montant', 'Moyen de paiement', 'Statut', 'Date'];
    const rows = data.map(item => [
      item.reference,
      item.debtor,
      item.amount,
      item.method,
      this.getStatusLabel(item.status),
      item.date
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }

  // Télécharger un fichier
  private downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Télécharger un reçu
  downloadReceipt(paymentId: number) {
    const payment = this.paymentHistory.find(p => p.id === paymentId);
    if (payment) {
      // Simuler le téléchargement d'un reçu
      const receiptContent = `Reçu de paiement\n\n` +
                            `Référence: ${payment.reference}\n` +
                            `Débiteur: ${payment.debtor}\n` +
                            `Montant: ${payment.amount} €\n` +
                            `Moyen de paiement: ${payment.method}\n` +
                            `Statut: ${this.getStatusLabel(payment.status)}\n` +
                            `Date: ${payment.date}\n\n` +
                            `Merci pour votre paiement.`;
      
      this.downloadFile(receiptContent, `receipt-${payment.reference}.txt`, 'text/plain');
    }
  }

  // Méthode pour calculer la hauteur des barres
  calculateBarHeight(amount: number): number {
    const maxAmount = Math.max(...this.weeklyPayments.map(w => w.amount));
    return maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  }

  // Fonction pour formater les nombres
  formatNumber(value: number, format: string = '1.2-2'): string {
    return this.decimalPipe.transform(value, format) || '0.00';
  }
}