import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Invoice {
  id: string;
  dossierRef: string;
  crediteur: string;
  avocat: string;
  dateEmission: string;
  typePrestation: string;
  description: string;
  montantHT: number;
  tauxTVA: number;
  montantTVA: number;
  autresTaxes: number;
  totalTTC: number;
  validationDate: string;
  commentaires: string;
  status: 'draft' | 'validated' | 'sent' | 'paid';
  createdAt: Date;
}

@Component({
  selector: 'app-lawyer-consultations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lawyer-consultations.component.html',
  styleUrls: ['./lawyer-consultations.component.css']
})
export class LawyerConsultationsComponent implements OnInit {
  // Données
  allInvoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  
  // États d'affichage
  showForm = false;
  editingInvoice = false;
  currentView: 'grid' | 'table' = 'table';
  
  // Filtres
  searchTerm = '';
  selectedStatus = '';
  selectedType = '';
  
  // Chargement et erreurs
  isLoading = false;
  errorMessage = '';
  
  // Note courante pour le formulaire
  currentInvoice: Invoice = this.getEmptyInvoice();

  ngOnInit() {
    this.loadInvoices();
  }

  // Charger les notes existantes
  loadInvoices() {
    this.isLoading = true;
    
    // Simulation de chargement
    setTimeout(() => {
      this.allInvoices = [
        {
          id: '1',
          dossierRef: 'CR-2025-014',
          crediteur: 'Société ABC',
          avocat: 'Maître Jean DUPONT',
          dateEmission: '2025-11-04',
          typePrestation: 'conciliation',
          description: 'Participation à une audience de conciliation le 02/11/2025',
          montantHT: 120000,
          tauxTVA: 18,
          montantTVA: 21600,
          autresTaxes: 0,
          totalTTC: 141600,
          validationDate: '2025-11-04',
          commentaires: '',
          status: 'validated',
          createdAt: new Date('2025-11-04')
        },
        {
          id: '2',
          dossierRef: 'CR-2025-013',
          crediteur: 'Entreprise XYZ',
          avocat: 'Maître Jean DUPONT',
          dateEmission: '2025-10-28',
          typePrestation: 'consultation',
          description: 'Consultation juridique approfondie',
          montantHT: 72000,
          tauxTVA: 18,
          montantTVA: 12960,
          autresTaxes: 0,
          totalTTC: 84960,
          validationDate: '2025-10-28',
          commentaires: 'Client satisfait',
          status: 'paid',
          createdAt: new Date('2025-10-28')
        },
        {
          id: '3',
          dossierRef: 'CR-2025-012',
          crediteur: 'Société DEF',
          avocat: 'Maître Jean DUPONT',
          dateEmission: '2025-10-15',
          typePrestation: 'redaction',
          description: 'Rédaction de contrat commercial',
          montantHT: 85000,
          tauxTVA: 18,
          montantTVA: 15300,
          autresTaxes: 0,
          totalTTC: 100300,
          validationDate: '',
          commentaires: '',
          status: 'draft',
          createdAt: new Date('2025-10-15')
        }
      ];
      
      this.filteredInvoices = [...this.allInvoices];
      this.isLoading = false;
    }, 1000);
  }

  // Afficher le formulaire de nouvelle note
  showNewInvoiceForm() {
    this.currentInvoice = this.getEmptyInvoice();
    this.showForm = true;
    this.editingInvoice = false;
  }

  // Sauvegarder la note
  saveInvoice() {
    if (this.editingInvoice) {
      // Mettre à jour la note existante
      const index = this.allInvoices.findIndex(inv => inv.id === this.currentInvoice.id);
      if (index !== -1) {
        this.allInvoices[index] = { ...this.currentInvoice };
      }
    } else {
      // Créer une nouvelle note
      const newInvoice: Invoice = {
        ...this.currentInvoice,
        id: Date.now().toString(),
        createdAt: new Date(),
        status: 'draft'
      };
      this.allInvoices.unshift(newInvoice);
    }
    
    this.filterInvoices();
    this.cancelForm();
    alert(this.editingInvoice ? 'Note modifiée avec succès!' : 'Note créée avec succès!');
  }

  // Éditer une note
  editInvoice(invoice: Invoice) {
    this.currentInvoice = { ...invoice };
    this.showForm = true;
    this.editingInvoice = true;
  }

  // Voir une note
  viewInvoice(invoice: Invoice) {
    // Logique pour visualiser une note
    console.log('Visualiser la note:', invoice);
    alert(`Détails de la note ${invoice.dossierRef}`);
  }

  // Supprimer une note
  deleteInvoice(invoice: Invoice) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note d\'honoraires?')) {
      this.allInvoices = this.allInvoices.filter(inv => inv.id !== invoice.id);
      this.filterInvoices();
      alert('Note supprimée avec succès!');
    }
  }

  // Annuler le formulaire
  cancelForm() {
    this.showForm = false;
    this.editingInvoice = false;
    this.currentInvoice = this.getEmptyInvoice();
  }

  // Calculer les totaux
  calculateTotals() {
    this.currentInvoice.montantTVA = this.currentInvoice.montantHT * (this.currentInvoice.tauxTVA / 100);
    this.currentInvoice.totalTTC = this.currentInvoice.montantHT + this.currentInvoice.montantTVA + this.currentInvoice.autresTaxes;
  }

  // Filtrer les notes
  filterInvoices() {
    this.filteredInvoices = this.allInvoices.filter(invoice => {
      const matchesSearch = !this.searchTerm || 
        invoice.dossierRef.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.crediteur.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getTypeLabel(invoice.typePrestation).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || invoice.status === this.selectedStatus;
      const matchesType = !this.selectedType || invoice.typePrestation === this.selectedType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  // Appliquer les filtres (recherche en temps réel)
  applyFilters() {
    this.filterInvoices();
  }

  // Réinitialiser les filtres
  resetFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.filteredInvoices = [...this.allInvoices];
  }

  // Gestion des fichiers
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Fichiers sélectionnés:', files);
    }
  }

  // Obtenir une note vide
  private getEmptyInvoice(): Invoice {
    return {
      id: '',
      dossierRef: '',
      crediteur: '',
      avocat: 'Maître Jean DUPONT',
      dateEmission: new Date().toISOString().split('T')[0],
      typePrestation: 'conciliation',
      description: '',
      montantHT: 0,
      tauxTVA: 18,
      montantTVA: 0,
      autresTaxes: 0,
      totalTTC: 0,
      validationDate: '',
      commentaires: '',
      status: 'draft',
      createdAt: new Date()
    };
  }

  // Formater la date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Obtenir le libellé du type
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'conciliation': 'Audience de conciliation',
      'consultation': 'Consultation juridique',
      'redaction': 'Rédaction d\'acte',
      'procedure': 'Procédure judiciaire'
    };
    return labels[type] || type;
  }

  // Obtenir le libellé du statut
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Brouillon',
      'validated': 'Validé',
      'sent': 'Envoyé',
      'paid': 'Payé'
    };
    return labels[status] || status;
  }

  // Statistiques
  get pendingInvoicesCount(): number {
    return this.allInvoices.filter(inv => inv.status === 'draft').length;
  }

  getTotalAmount(): number {
    return this.allInvoices.reduce((total, inv) => total + inv.totalTTC, 0);
  }
}