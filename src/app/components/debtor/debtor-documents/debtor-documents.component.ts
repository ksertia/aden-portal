import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseDocument, DocumentType } from '../../../models/case.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';

@Component({
  selector: 'app-debtor-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent],
  templateUrl: './debtor-documents.component.html',
  styleUrls: ['./debtor-documents.component.css']
})
export class DebtorDocumentsComponent implements OnInit {
  // Dossiers récupérés de l'API
  dossiers: any[] = [];
  
  cases: DebtCase[] = [];
  allDocuments: (CaseDocument & { caseId: string })[] = [];
  filteredDocuments: (CaseDocument & { caseId: string })[] = [];

  currentView: 'grid' | 'table' = 'table';
  
  searchTerm = '';
  selectedDocumentType = '';
  selectedCaseId = '';
  
  showViewModal = false;
  selectedDocument: CaseDocument | null = null;
  
  isLoading = true;
  errorMessage = '';

  // Les propriétés pour les documents
  showDocumentViewer = false;
  currentDocumentUrl: any = null;
  currentDocument: any = null;
  documentContentType = '';
  isLoadingDocument = false;
  safePdfUrl: SafeResourceUrl | null = null;


  constructor(
    private caseService: CaseService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
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

        // VÉRIFICATION CRITIQUE : s'assurer que doc n'est pas null
        if (!doc) {
          console.log('Document null ignoré');
          return; // Passer au document suivant
        }
        
        console.log('Document trouvé:', doc.fileName, 'Type:', doc.typeDocument);


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
      [DocumentType.CORRESPONDENCE]: 'Correspondance',
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
  // viewDocument(doc: CaseDocument) {
  //   if (doc.url && doc.url !== '#') {
  //     // Ouvrir dans un nouvel onglet
  //     window.open(doc.url, '_blank');
  //   } else {
  //     // Afficher dans le modal si pas d'URL
  //     this.selectedDocument = doc;
  //     this.showViewModal = true;
  //   }
  // }

  // Télécharger le document
  // downloadDocument(doc: CaseDocument) {
  //   if (doc.url && doc.url !== '#') {
  //     // Créer un lien temporaire pour télécharger
  //     const link = document.createElement('a');
  //     link.href = doc.url;
  //     link.download = doc.name;
  //     link.target = '_blank';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     console.log('Téléchargement du document:', doc.name);
  //   } else {
  //     console.log('URL de téléchargement non disponible pour:', doc.name);
  //     alert('Le document n\'est pas disponible au téléchargement pour le moment');
  //   }
  // }

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


  /* ============================================
   Pour la visualisation des  DOCUMENTS
   ============================================ */
  // Méthode pour visualiser un document
 viewDocument(doc: any) {
    console.log('Visualisation du document:', doc);

    const documentIdentifier = doc.nodeId || doc.id; //  fallback si nodeId absent
    
    if (!documentIdentifier) {
      alert('Identifiant du document manquant');
      return;
    }
    
    this.isLoadingDocument = true;
    this.currentDocument = doc;
  
    // Récupérer le contenu du document depuis le backend
    this.caseService.getDocumentContent(doc.id).subscribe({
      next: (blob) => {
        this.isLoadingDocument = false;

        // Création de l'URL temporaire
        const blobUrl = window.URL.createObjectURL(blob);
        this.currentDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.documentContentType = blob.type;
        
        // Ouvrir la modale de visualisation
        this.showDocumentViewer = true;
        
        console.log('Document chargé avec succès. Type:', blob.type);
      },
      error: (error) => {
        this.isLoadingDocument = false;
        console.error('Erreur lors du chargement du document:', error);
        alert('Impossible de charger le document. Veuillez réessayer.');
      }
    });
  }

  // Méthode pour fermer le visualiseur
  closeDocumentViewer() {
    if (this.currentDocumentUrl) {
      window.URL.revokeObjectURL(this.currentDocumentUrl);
    }
    this.showDocumentViewer = false;
    this.currentDocumentUrl = null;
    this.currentDocument = null;
    this.documentContentType = '';
  }

  // Méthode pour télécharger un document
  downloadDocument(doc: any) {
    console.log('Téléchargement du document:', doc);
    
    if (!doc.id) {
      alert('Identifiant du document manquant');
      return;
    }

    this.caseService.downloadDocument(doc.id, doc.name);
  }

  // Méthode pour vérifier si le document est un PDF
  isDocumentPDF(): boolean {
    return this.documentContentType === 'application/pdf' || 
    this.currentDocument?.name?.toLowerCase().endsWith('.pdf');
  }

  // Méthode pour vérifier si le document est une image
  isDocumentImage(): boolean {
    return this.documentContentType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(this.currentDocument?.name);
  }

  // Méthode pour ouvrir le document dans un nouvel onglet
  openInNewTab() {
    if (this.currentDocumentUrl) {
      // Si c’est un SafeResourceUrl, on le convertit
      const url = (this.currentDocumentUrl as any).changingThisBreaksApplicationSecurity || this.currentDocumentUrl;
      window.open(url, '_blank');
    }
  }

 formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

}