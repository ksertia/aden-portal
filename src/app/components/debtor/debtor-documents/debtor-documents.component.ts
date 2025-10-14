import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseDocument, DocumentType } from '../../../models/case.model';

@Component({
  selector: 'app-debtor-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './debtor-documents.component.html',
  styleUrls: ['./debtor-documents.component.css']
})
export class DebtorDocumentsComponent implements OnInit {
  // Dossiers récupérés de l'API
  dossiers: any[] = [];
  
  cases: DebtCase[] = [];
  allDocuments: (CaseDocument & { caseId: string })[] = [];
  filteredDocuments: (CaseDocument & { caseId: string })[] = [];
  
  searchTerm = '';
  selectedDocumentType = '';
  selectedCaseId = '';
  
  showViewModal = false;
  selectedDocument: CaseDocument | null = null;
  
  isLoading = true;
  errorMessage = '';

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  // Charger les données depuis l'API
  loadData() {
    const siteName = 'portail-recouvrement';
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.isLoading = false;
      return;
    }

    const debiteurNodeId = currentUser.nodeId;
    console.log('Chargement des documents pour le débiteur:', debiteurNodeId);

    if (!debiteurNodeId) {
      this.errorMessage = 'Identifiant du débiteur introuvable.';
      this.isLoading = false;
      return;
    }

    // Appel du web service pour récupérer les dossiers du débiteur
    this.caseService.getDossiersDebiteur(siteName, debiteurNodeId).subscribe({
      next: (response) => {
        console.log('Réponse API dossiers pour documents:', response);
        this.dossiers = response.data?.map((item: any) => item.map) || [];
        
        // Extraire les documents après avoir chargé les dossiers
        this.extractDocuments();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des dossiers:', error);
        this.errorMessage = 'Impossible de récupérer les documents.';
        this.isLoading = false;
      }
    });
  }

  // Extraire tous les documents des dossiers
  extractDocuments() {
    this.allDocuments = [];
    
    console.log('Extraction des documents depuis', this.dossiers.length, 'dossiers');
    
    // Parcourir tous les dossiers pour extraire leurs documents
    this.dossiers.forEach(dossier => {
      // Vérifier si le dossier a des documents débiteur
      if (dossier.documentsDebiteur?.myArrayList && Array.isArray(dossier.documentsDebiteur.myArrayList)) {
        dossier.documentsDebiteur.myArrayList.forEach((doc: any) => {
          const mappedType = this.mapDocumentType(doc.typeDocument);
          
          this.allDocuments.push({
            id: doc.documentNodeId || doc.id || Date.now().toString() + Math.random(),
            name: doc.fileName || doc.name || 'Document sans nom',
            type: mappedType,
            url: doc.url || doc.downloadUrl || '#',
            uploadedAt: new Date(doc.date || doc.uploadedAt || doc.dateCreation || Date.now()),
            uploadedBy: doc.uploadedBy || dossier.createurUsername || 'Système',
            caseId: dossier.nodeId // Utiliser le nodeId du dossier comme caseId
          });
        });
      }
    });
    
    this.filteredDocuments = [...this.allDocuments];
    console.log('Total documents extraits:', this.allDocuments.length);
  }

  // Mapper les types de documents de l'API vers l'enum DocumentType
  mapDocumentType(apiType: string): DocumentType {
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
    
    return typeMapping[normalizedType] || DocumentType.CORRESPONDENCE;
  }

  // Filtrer les documents en fonction de la recherche et des filtres
  filterDocuments() {
    this.filteredDocuments = this.allDocuments.filter(doc => {
      const matchesSearch = !this.searchTerm || 
        doc.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getDocumentTypeLabel(doc.type).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getCaseNumber(doc.caseId).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedDocumentType || doc.type === this.selectedDocumentType;
      const matchesCase = !this.selectedCaseId || doc.caseId === this.selectedCaseId;
      
      return matchesSearch && matchesType && matchesCase;
    });
    
    console.log('Documents filtrés:', this.filteredDocuments.length);
  }

    // Appliquer les filtres (appelé lors de la saisie dans le champ de recherche)
  applyFilters() {
    this.filterDocuments();
  }

  // Réinitialiser tous les filtres
  resetFilters() {
    this.searchTerm = '';
    this.selectedDocumentType = '';
    this.selectedCaseId = '';
    this.filteredDocuments = [...this.allDocuments];
    console.log('Filtres réinitialisés. Affichage de tous les documents:', this.allDocuments.length);
  }

  // Récupérer le numéro de dossier
  getCaseNumber(caseId: string): string {
    const dossier = this.dossiers.find(d => d.nodeId === caseId);
    return dossier?.numeroDossier || 'N/A';
  }

  // Récupérer l'étiquette pour un type de document
  getDocumentTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      [DocumentType.INVOICE]: 'Facture',
      [DocumentType.CONTRACT]: 'Contrat',
      [DocumentType.CORRESPONDENCE]: 'Rapport',
      [DocumentType.LEGAL_NOTICE]: 'Mise en demeure',
      [DocumentType.PAYMENT_PROOF]: 'Preuve de paiement',
      [DocumentType.COURT_DOCUMENT]: 'Document judiciaire'
    };
    return labels[type] || type;
  }

  // Formater la date pour l'affichage
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Afficher le document dans un modal
  viewDocument(doc: CaseDocument) {
    if (doc.url && doc.url !== '#') {
      // Ouvrir dans un nouvel onglet
      window.open(doc.url, '_blank');
    } else {
      // Afficher dans le modal si pas d'URL
      this.selectedDocument = doc;
      this.showViewModal = true;
    }
  }

  // Télécharger le document
  downloadDocument(doc: CaseDocument) {
    if (doc.url && doc.url !== '#') {
      // Créer un lien temporaire pour télécharger
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Téléchargement du document:', doc.name);
    } else {
      console.log('URL de téléchargement non disponible pour:', doc.name);
      alert('Le document n\'est pas disponible au téléchargement pour le moment');
    }
  }

  // Fermer le modal de visualisation
  closeViewModal() {
    this.showViewModal = false;
    this.selectedDocument = null;
  }

  // Compter les documents par type
  getDocumentCountByType(type: DocumentType): number {
    return this.allDocuments.filter(doc => doc.type === type).length;
  }

  // Obtenir la taille totale des documents (si disponible)
  getTotalDocumentsSize(): string {
    // TODO: Implémenter si la taille est disponible dans l'API
    return 'N/A';
  }

}