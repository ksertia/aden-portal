import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Invoice {
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
}

@Component({
  selector: 'app-lawyer-consultations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lawyer-consultations.component.html',
  styleUrls: ['./lawyer-consultations.component.css']
})
export class LawyerConsultationsComponent implements OnInit {
  showExistingInvoices = false;
  
  newInvoice: Invoice = {
    dossierRef: 'CR-2025-014',
    crediteur: 'Société ABC',
    avocat: 'Maître Jean DUPONT',
    dateEmission: '2025-11-04',
    typePrestation: 'Audience de conciliation',
    description: 'Participation à une audience de conciliation le 02/11/2025',
    montantHT: 120000,
    tauxTVA: 18,
    montantTVA: 21600,
    autresTaxes: 0,
    totalTTC: 141600,
    validationDate: '2025-11-04',
    commentaires: ''
  };

  invoices: Invoice[] = [
    {
      dossierRef: 'CR-2025-014',
      crediteur: 'Société ABC',
      avocat: 'Maître Jean DUPONT',
      dateEmission: '2025-11-04',
      typePrestation: 'Audience de conciliation',
      description: 'Participation à une audience de conciliation le 02/11/2025',
      montantHT: 120000,
      tauxTVA: 18,
      montantTVA: 21600,
      autresTaxes: 0,
      totalTTC: 141600,
      validationDate: '2025-11-04',
      commentaires: ''
    },
    {
      dossierRef: 'CR-2025-013',
      crediteur: 'Entreprise XYZ',
      avocat: 'Maître Jean DUPONT',
      dateEmission: '2025-10-28',
      typePrestation: 'Consultation juridique',
      description: 'Consultation juridique approfondie',
      montantHT: 72000,
      tauxTVA: 18,
      montantTVA: 12960,
      autresTaxes: 0,
      totalTTC: 84960,
      validationDate: '2025-10-28',
      commentaires: ''
    }
  ];

  ngOnInit() {
    this.calculateTotals();
  }

  toggleView(): void {
    this.showExistingInvoices = !this.showExistingInvoices;
  }

  calculateTotals(): void {
    this.newInvoice.montantTVA = this.newInvoice.montantHT * (this.newInvoice.tauxTVA / 100);
    this.newInvoice.totalTTC = this.newInvoice.montantHT + this.newInvoice.montantTVA + this.newInvoice.autresTaxes;
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount);
  }

  validateInvoice(): void {
    // Ajouter la nouvelle note à la liste
    this.invoices.push({...this.newInvoice});
    
    // Réinitialiser le formulaire
    this.resetForm();
    
    alert('Note d\'honoraires validée avec succès!');
  }

  modifyInvoice(): void {
    alert('Mode modification activé');
    // Implémenter la logique de modification
  }

  deleteInvoice(invoice?: Invoice): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note d\'honoraires?')) {
      if (invoice) {
        // Supprimer une note spécifique de la liste
        this.invoices = this.invoices.filter(inv => inv.dossierRef !== invoice.dossierRef);
      } else {
        // Réinitialiser le formulaire courant
        this.resetForm();
      }
      alert('Note d\'honoraires supprimée');
    }
  }

  viewInvoice(invoice: Invoice): void {
    // Afficher les détails d'une note
    console.log('Détails de la note:', invoice);
    alert(`Détails de la note ${invoice.dossierRef}`);
  }

  editInvoice(invoice: Invoice): void {
    // Charger la note dans le formulaire pour modification
    this.newInvoice = {...invoice};
    this.showExistingInvoices = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('Fichier sélectionné:', file.name);
    }
  }

  private resetForm(): void {
    this.newInvoice = {
      dossierRef: '',
      crediteur: '',
      avocat: 'Maître Jean DUPONT',
      dateEmission: new Date().toISOString().split('T')[0],
      typePrestation: 'Audience de conciliation',
      description: '',
      montantHT: 0,
      tauxTVA: 18,
      montantTVA: 0,
      autresTaxes: 0,
      totalTTC: 0,
      validationDate: new Date().toISOString().split('T')[0],
      commentaires: ''
    };
  }
}