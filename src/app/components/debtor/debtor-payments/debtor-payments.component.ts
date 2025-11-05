import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
import { I18nService } from '../../../services/i18n.service';
import { AdminService } from '../../../services/admin.service';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { CreditorDetail } from '../../../models/case.model';
import { DebtCase } from '../../../models/case.model';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseDocument, DocumentType } from '../../../models/case.model';

@Component({
  selector: 'app-debtor-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ViewToggleComponent],
  templateUrl: './debtor-payments.component.html',
  styleUrls: ['./debtor-payments.component.css']
})
export class DebtorPaymentsComponent implements OnInit {


  // pour le drawer
    // Propriétés pour le paiement
isPaymentDrawerOpen = false;
currentPaymentStep = 1;
selectedDossier: any = null;
selectedCurrency = 'fcfa';
selectedPaymentMethod = 'mobile';
exchangeRates = {
  fcfa: 1,
  eur: 0.0015,
  usd: 0.0017,
  gbp: 0.0013
};
  //fin pour le drawer

  translations: any = {};
   dossiers: any[] = [];
    isLoading = true;
    errorMessage = '';
  
    userCases: DebtCase[] = [];
  
    currentView: 'grid' | 'table' = 'table';

    // Liste brute et filtrée pour pouvoir extraire le lastname, le firstname, l'email, le telephone et le type du débiteur (importer depuis AdminService)
    creditors: CreditorDetail[] = [];
    filteredCreditors: CreditorDetail[] = [];
  
    selectedcreditor: CreditorDetail | undefined;
// pour le filtrage des dossiers
     selectedStatus = '';
  selectedPriority = '';
  filteredDossiers: any[] = [];

    // Ajout start
    cases: DebtCase[] = [];
    allDocuments: (CaseDocument & { caseId: string })[] = [];
    filteredDocuments: (CaseDocument & { caseId: string })[] = [];
    currentViews: 'grid' | 'table' = 'table';
    showDocumentsModal: boolean = false;
    
    searchTerm = '';
    selectedDocumentType = '';
    selectedCaseId = '';
    
    showUploadModal = false;
    selectedFile: File | null = null;
    
    newDocument = {
      caseId: '',
      type: '',
      name: ''
    };
    // Ajout end


  constructor(private i18nService: I18nService, private adminService: AdminService, private casesService: CaseService, private authService: AuthService) {
    this.loadTranslations();

    // Écouter les changements de langue
    this.i18nService.currentLocale$.subscribe(() => {
      this.loadTranslations();
    });
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

  ngOnInit(): void {

    this.loadTranslations();
    this.i18nService.currentLocale$.subscribe(() => {
    this.loadTranslations();
    });


    this.loadDossiers();
  }

  // pour le status, le format currency(la dévise) et la priorité des dossiers

  formatCurrency(amount: number): string {
    if (!amount) return '0 FCFA';
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    });
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

  getPriorityClass(priority: string): string {
    switch(priority.toLowerCase()) {
      case 'low':
      case 'faible':
        return 'priorite-faible';
      case 'medium':
      case 'moyenne':
        return 'moyenne';
      case 'high':
      case 'elevee':
        return 'elevee';
      case 'urgent':
      case 'urgente':
        return 'urgente';
      case 'normal':
      case 'normale':
        return 'normale';
      default:
        return '';
    }
  }

  // pour la récupération des dossiers et créanciers
  loadDossiers() {
    const siteName = 'portail-recouvrement';
    const currentUser = this.authService.getCurrentUser();

    // Verification si l'utilisateur est connecté
    if (!currentUser) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.isLoading = false;
      return;
    }

    const debiteurNodeId = currentUser.nodeId;
    console.log('Débiteur connecté :', currentUser);
    console.log('debiteurNodeId envoyé :', debiteurNodeId);

    // Verification si l'utilisateur connecté à un NodeId
    if (!debiteurNodeId) {
      this.errorMessage = 'Identifiant du débiteur introuvable.';
      this.isLoading = false;
      return;
    }

    // Appel du web service pour la recuperation des dossiers du debiteur
    this.casesService.getDossiersDebiteur(siteName, debiteurNodeId).subscribe({
      next: (response) => {
        console.log('Réponse API dossiers :', response);
        this.dossiers = response.data?.map((item: any) => item.map) || [];
        this.filteredDossiers = [...this.dossiers];

      // IMPORTANT: Extraire les documents après avoir chargé les dossiers
      this.extractDocuments();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des dossiers :', error);
        this.errorMessage = 'Impossible de récupérer les dossiers.';
        this.isLoading = false;
      }
    });

    // Appel du web service pour la recuperation des données(extraction du lastname,firstname,email,telephone et type) du creancier 
    this.adminService.getCreanciers(siteName).subscribe({
      next: (data: CreditorDetail[]) => {
        this.creditors = data;
        this.filteredCreditors = [...this.creditors];
      },
      error: (err) => console.error(err)
    });
  }
    

  getPaymentPercentage(dossier: any): number {
    const total = dossier.montantTotal || 0;
    const paid = dossier.montantPaye || 0;
    return total ? Math.round((paid / total) * 100) : 0;
  }

  getTotalDebt(): number {
    return this.filteredDossiers.reduce((acc, d) => acc + (d.montantTotal || 0), 0);
  }

   // Ici on compare le debiteurNodeId avec nodeId du dossier qui correspond au debiteur 
  getCreancierForDossier(dossier: any): CreditorDetail | undefined {
    return this.creditors.find(d => d.nodeId === dossier.creancierNodeId);
  }

  getTotalPaid(): number {
    return this.filteredDossiers.reduce((acc, d) => acc + (d.montantPaye || 0), 0);
  }
  getFormattedRemainingAmount(dossier: any): string {
    const reste = (dossier.montantTotal || 0) - (dossier.montantPaye || 0);
    return reste.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  }

  getInterestTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'legal': 'Intérêts légaux',
      'contractual': 'Intérêts contractuels',
      'delay': 'Intérêts de retard'
    };
    return labels[type] || type;
  }

   formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }



  //pour extracdocument
   extractDocuments() {
  this.allDocuments = [];
  
  console.log('Début extraction des documents...');
  console.log('Nombre de dossiers à traiter:', this.dossiers.length);
  
  // Parcourir tous les dossiers pour extraire leurs documents
  this.dossiers.forEach(dossier => {
    console.log('Dossier:', dossier.numeroDossier, 'Documents:', dossier.documentsDebiteur?.myArrayList);
    
    // Vérifier si le dossier a des documents débiteur
    if (dossier.documentsDebiteur?.myArrayList && Array.isArray(dossier.documentsDebiteur.myArrayList)) {
      dossier.documentsDebiteur.myArrayList.forEach((doc: any) => {
        // VÉRIFICATION CRITIQUE : s'assurer que doc n'est pas null
        if (!doc) {
          console.log('Document null ignoré');
          return; // Passer au document suivant
        }
        
        console.log('Document trouvé:', doc.fileName, 'Type:', doc.typeDocument);
        
        const mappedType = this.mapDocumentType(doc.typeDocument);
        console.log('Type mappé:', mappedType);
        
        this.allDocuments.push({
          id: doc.documentNodeId || doc.id || Date.now().toString() + Math.random(),
          name: doc.fileName || doc.name || 'Document sans nom',
          type: mappedType,
          url: doc.url || doc.downloadUrl || '#',
          uploadedAt: new Date(doc.date || doc.uploadedAt || doc.dateCreation || Date.now()),
          uploadedBy: doc.uploadedBy || dossier.createurUsername || 'Système',
          caseId: dossier.nodeId
        });
      });
    } else {
      console.log('Aucun document trouvé pour le dossier:', dossier.numeroDossier);
    }
  });
  
  this.filteredDocuments = [...this.allDocuments];
  console.log('Documents extraits (total):', this.allDocuments.length, this.allDocuments);
}

mapDocumentType(apiType: string): DocumentType {
    console.log('Mapping du type:', apiType);
    
    // Normaliser le type (enlever espaces, mettre en majuscules)
    const normalizedType = (apiType || '').trim().toUpperCase();
    
    const typeMapping: { [key: string]: DocumentType } = {
      'FACTURE': DocumentType.INVOICE,
      'INVOICE': DocumentType.INVOICE,
      'CONTRAT': DocumentType.CONTRACT,
      'CONTRACT': DocumentType.CONTRACT,
      'CORRESPONDANCE': DocumentType.CORRESPONDENCE,
      'CORRESPONDENCE': DocumentType.CORRESPONDENCE,
      'MISE_EN_DEMEURE': DocumentType.LEGAL_NOTICE,
      'LEGAL_NOTICE': DocumentType.LEGAL_NOTICE,
      'PREUVE_PAIEMENT': DocumentType.PAYMENT_PROOF,
      'PAYMENT_PROOF': DocumentType.PAYMENT_PROOF,
      'DOCUMENT_JUDICIAIRE': DocumentType.COURT_DOCUMENT,
      'COURT_DOCUMENT': DocumentType.COURT_DOCUMENT
    };
    
    const result = typeMapping[normalizedType] || DocumentType.CORRESPONDENCE;
    console.log('Résultat du mapping:', normalizedType, '->', result);
    
    return result;
  }


// ts pour le drawer 

// Méthodes pour le drawer de paiement
openPaymentDrawer(dossier: any): void {
  this.selectedDossier = dossier;
  this.currentPaymentStep = 1;
  this.selectedCurrency = 'fcfa';
  this.selectedPaymentMethod = 'mobile';
  this.isPaymentDrawerOpen = true;
}

closePaymentDrawer(): void {
  this.isPaymentDrawerOpen = false;
  this.selectedDossier = null;
}

goToPaymentStep(step: number): void {
  this.currentPaymentStep = step;
}

selectCurrency(currency: string): void {
  this.selectedCurrency = currency;
}

selectPaymentMethod(method: string): void {
  this.selectedPaymentMethod = method;
}

// Méthodes de calcul pour le résumé
calculateTotalDu(): number {
  if (!this.selectedDossier) return 0;
  
  return this.selectedDossier.montantTotal + 
         this.calculateInteretsLegaux() + 
         this.calculateInteretsRetard() + 
         this.calculatePenalitesRetard() + 
         this.calculateFraisDivers();
}

calculateInteretsLegaux(): number {
  if (!this.selectedDossier) return 0;
  // Implémentez votre logique de calcul des intérêts légaux
  return this.selectedDossier.montantTotal * 0.035;
}

calculateInteretsRetard(): number {
  if (!this.selectedDossier) return 0;
  // Implémentez votre logique de calcul des intérêts de retard
  return this.selectedDossier.montantTotal * 0.10;
}

calculatePenalitesRetard(): number {
  if (!this.selectedDossier) return 0;
  // Implémentez votre logique de calcul des pénalités
  return this.selectedDossier.montantTotal * 0.05;
}

calculateFraisDivers(): number {
  if (!this.selectedDossier) return 0;
  // Frais divers fixes ou calculés
  return 3000;
}

calculateResteAPayer(): number {
  if (!this.selectedDossier) return 0;
  return this.calculateTotalDu() - (this.selectedDossier.montantPaye || 0);
}

getCurrencySymbol(currency: string): string {
  const symbols: any = {
    fcfa: 'FCFA',
    eur: '€',
    usd: '$',
    gbp: '£'
  };
  return symbols[currency] || 'FCFA';
}

processPayment(): void {
  // Implémentez votre logique de traitement de paiement
  const amount = this.calculateResteAPayer();
  alert(`Paiement de ${this.formatCurrency(amount)} effectué avec succès pour le dossier: ${this.selectedDossier.numeroDossier}`);
  
  // Fermer le drawer après paiement
  this.closePaymentDrawer();
  
  // Ici, vous devriez appeler votre service de paiement
  // et mettre à jour les données
}



}

