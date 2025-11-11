import { Component, OnInit, NgZone, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseDocument, DocumentType } from '../../../models/case.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  showUploadModal = false;

  // RECUPERATION DES DOCUMENTS
  dossiers: any[] = [];
  cases: DebtCase[] = [];
  allDocuments: (CaseDocument & { caseId: string; source: string })[] = [];
  filteredDocuments: (CaseDocument & { caseId: string; source: string })[] = [];

  currentView: 'grid' | 'table' = 'table';

  selectedDetailCase: any;

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

  // Propriétés pour les messages temporaires ( ajout ou suppression reussi ou achouer d'un document)
  showUploadSuccess = false;
  uploadSuccessMessage = '';
  showDeleteSuccess = false;
  deleteSuccessMessage = '';

  // Methode du modal de suppression d\'un document
  showDeleteConfirmation = false;
  documentToDelete: any = null;

  // Propriétés pour la validation des champs avec mise en évidence rouge et messages d'erreur
  uploadFormErrors = {
    type: false,
    name: false,
    file: false
  };

  uploadErrorMessages = {
    type: '',
    name: '',
    file: ''
  };

  newDocument: any = {
    name: '',
    type: '',
    caseId: ''
  };
  
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private caseService: CaseService,
    private authService: AuthService,
    private adminService: AdminService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef, 
  ) {}

  ngOnInit() {
    this.loadData();
  }

  getLegalDocumentsCount(): number {
    return this.allDocuments.filter(doc => 
      doc.type === 'legal_notice' || doc.type === 'court_document'
    ).length;
  }

  getPaymentProofsCount(): number {
    return this.allDocuments.filter(doc => doc.type === 'payment_proof').length;
  }

  // Charger les données depuis l'API selon le rôle de l'utilisateur
  loadData() {
    const siteName = 'portail-recouvrement';
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.isLoading = false;
      return;
    }

    const userNodeId = currentUser.nodeId;
    const userRole = currentUser.role;

    if (!userNodeId) {
      this.errorMessage = 'Identifiant utilisateur introuvable.';
      this.isLoading = false;
      return;
    }

    this.loadUserDossiers(siteName, userNodeId, userRole);
  }

  // Charger uniquement les dossiers où l'utilisateur est impliqué
  loadUserDossiers(siteName: string, nodeId: string, role: any) {
    // Extraire le type de rôle correctement (supporte string ou objet)
    let roleType = '';
    
    if (typeof role === 'string') {
      roleType = role.toUpperCase();
    } else if (role && typeof role === 'object') {
      roleType = (role.type || role.name || '').toUpperCase();
    }

    let serviceCall;

    switch (roleType) {
      case 'AVOCAT':
      case 'LAWYER':
        serviceCall = this.caseService.getDossiersAvocat(siteName, nodeId);
        break;

      case 'DEBITEUR':
      case 'DEBTOR':
        serviceCall = this.caseService.getDossiersDebiteur(siteName, nodeId);
        break;

      case 'CREANCIER':
      case 'CREDITOR':
        serviceCall = this.caseService.getDossiersCreancier(siteName, nodeId);
        break;

      case 'CEDANT':
      case 'ASSYGNOR':
        serviceCall = this.caseService.getDossiersCedant(siteName, nodeId);
        break;

      case 'HUISSIER':
      case 'BAILIFF':
        serviceCall = this.caseService.getDossiersHuissier(siteName, nodeId);
        break;

      case 'PARTENAIRE':
      case 'PARTNER':
        serviceCall = this.caseService.getDossiersPartenaire(siteName, nodeId);
        break;

      default:
        serviceCall = this.caseService.getDossiersAvocat(siteName, nodeId);
    }

    serviceCall.subscribe({
      next: (response) => {
        
        // S'assurer que nous avons un tableau de dossiers
        let dossiersArray = [];
        
        if (response.data && Array.isArray(response.data)) {
          dossiersArray = response.data.map((item: any) => item.map);
        } else if (Array.isArray(response)) {
          dossiersArray = response.map((item: any) => item.map || item);
        }
        
        // Filtrer les dossiers pour ne garder que ceux où l'utilisateur est vraiment impliqué
        this.dossiers = this.filterUserDossiers(dossiersArray, nodeId, roleType);
        
        if (this.dossiers.length === 0) {
          this.errorMessage = 'Aucun dossier trouvé pour votre compte.';
        } else {
          this.extractAllDocuments();
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Impossible de récupérer les documents.';
        this.isLoading = false;
      }
    });
  }

  // Filtrer les dossiers pour ne garder que ceux où l'utilisateur est impliqué
  filterUserDossiers(dossiers: any[], userNodeId: string, userRole: string): any[] {
    
    const filteredDossiers = dossiers.filter(dossier => {
      
      // Vérifier selon le rôle de l'utilisateur
      switch (userRole) {
        case 'AVOCAT':
        case 'LAWYER':
          // Pour un avocat, vérifier s'il est l'avocat du dossier
          const isAvocat = dossier.avocatNodeId === userNodeId || 
          dossier.idAvocat === userNodeId ||
          (dossier.avocat && (dossier.avocat.nodeId === userNodeId || dossier.avocat.id === userNodeId));
          return isAvocat;

        case 'DEBITEUR':
        case 'DEBTOR':
          // Pour un débiteur, vérifier s'il est le débiteur du dossier
          const isDebiteur = dossier.debiteurNodeId === userNodeId || 
          dossier.idDebiteur === userNodeId ||
          (dossier.debiteur && (dossier.debiteur.nodeId === userNodeId || dossier.debiteur.id === userNodeId));
          return isDebiteur;

        case 'CREANCIER':
        case 'CREDITOR':
          // Pour un créancier, vérifier s'il est le créancier du dossier
          const isCreancier = dossier.creancierNodeId === userNodeId || 
          dossier.idCreancier === userNodeId ||
          (dossier.creancier && (dossier.creancier.nodeId === userNodeId || dossier.creancier.id === userNodeId));
          return isCreancier;

        case 'CEDANT':
        case 'ASSYGNOR':
          // Pour un cédant, vérifier s'il est le cedant du dossier
          const isCedant = dossier.cedantNodeId === userNodeId || 
          dossier.idCedant === userNodeId ||
          (dossier.cedant && (dossier.cedant.nodeId === userNodeId || dossier.cedant.id === userNodeId));
          return isCedant;

        case 'HUISSIER':
        case 'BAILIFF':
          // Pour un huissier, vérifier s'il est l'huissier du dossier
          const isHuissier = dossier.huissierNodeId === userNodeId || 
          dossier.idHuissier === userNodeId ||
          (dossier.huissier && (dossier.huissier.nodeId === userNodeId || dossier.huissier.id === userNodeId));
          return isHuissier;

        case 'PARTENAIRE':
        case 'PARTNER':
          // Pour un partenaire, vérifier s'il est le partenaire du dossier
          const ispartenaire = dossier.partenaireNodeId === userNodeId || 
          dossier.idPartenaire === userNodeId ||
          (dossier.partenaire && (dossier.partenaire.nodeId === userNodeId || dossier.partenaire.id === userNodeId));
          return ispartenaire;

        default:
          // Vérification générique
          const isInDossier = this.checkUserInDossier(dossier, userNodeId);
          return isInDossier;
      }
    });
    return filteredDossiers;
  }

  // Vérifier si l'utilisateur est présent dans le dossier
  checkUserInDossier(dossier: any, userNodeId: string, role?: string): boolean {
    // Vérifications directes par propriété
    if (dossier.debiteurNodeId === userNodeId || 
        dossier.creancierNodeId === userNodeId || 
        dossier.avocatNodeId === userNodeId || 
        dossier.huissierNodeId === userNodeId ||
        dossier.idDebiteur === userNodeId ||
        dossier.idCreancier === userNodeId ||
        dossier.idCedant === userNodeId ||
        dossier.idAvocat === userNodeId ||
        dossier.idPartenaire === userNodeId ||
        dossier.idHuissier === userNodeId) {
      return true;
    }

    // Vérifications dans les tableaux de participants
    if (dossier.participants && Array.isArray(dossier.participants)) {
      return dossier.participants.some((participant: any) => 
        participant.nodeId === userNodeId || participant.id === userNodeId
      );
    }

    // Vérification dans les propriétés étendues
    const userProperties = [
      'debiteur', 'creancier', 'avocat', 'huissier',
      'debtor', 'creditor', 'lawyer', 'bailiff'
    ];

    return userProperties.some(prop => {
      const participant = dossier[prop];
      return participant && (participant.nodeId === userNodeId || participant.id === userNodeId);
    });
  }

  // Extraire TOUS les documents de TOUTES les sources SANS DOUBLONS
  extractAllDocuments() {
    this.allDocuments = [];
    
    const processedDocumentIds = new Set<string>();
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.filteredDocuments = [];
      return;
    }
    
    // Liste de toutes les sources de documents possibles
    // const documentSources = [
    //   { key: 'documentsDebiteur', label: 'Débiteur' },
    //   { key: 'documentsCreancier', label: 'Créancier' },
    //   { key: 'documentsAvocat', label: 'Avocat' },
    //   { key: 'documentsHuissier', label: 'Huissier' },
    //   { key: 'documentsPartage', label: 'Partagé' },
    //   { key: 'documentsPartenaire', label: 'Partenaire' },
    //   { key: 'documentsCedant', label: 'Cédant' }
    // ];
    const documentSources = [
      { key: 'documentsPartage', label: 'Partage' },
    ];
    
    // Parcourir tous les dossiers (déjà filtrés pour l'utilisateur)
    this.dossiers.forEach((dossier, index) => {
      
      let documentsTrouves = 0;
      
      // Pour chaque source de documents
      documentSources.forEach(source => {
        const documentsContainer = dossier[source.key];
        
        // Vérifier si le conteneur de documents existe et contient un tableau
        if (documentsContainer?.myArrayList && Array.isArray(documentsContainer.myArrayList)) {
          
          // Extraire chaque document
          documentsContainer.myArrayList.forEach((doc: any, docIndex: number) => {
            
            // Créer un identifiant unique pour le document
            const docId = doc.documentNodeId || doc.id || 
              `${doc.fileName}_${doc.date}_${source.key}`;
            
            // Vérifier si le document a déjà été traité
            if (!processedDocumentIds.has(docId)) {
              processedDocumentIds.add(docId);
              
              const mappedType = this.mapDocumentType(doc.typeDocument);
              
              this.allDocuments.push({
                id: docId,
                name: doc.fileName || doc.name || 'Document sans nom',
                type: mappedType,
                url: doc.url || doc.downloadUrl || '#',
                uploadedAt: new Date(doc.date || doc.uploadedAt || doc.dateCreation || Date.now()),
                uploadedBy: doc.uploadedBy || dossier.createurUsername || 'Système',
                caseId: dossier.nodeId,
                source: source.label
              });
              
              documentsTrouves++;
            } else {
            }
          });
        } else {
        }
      });
    });
    
    this.filteredDocuments = [...this.allDocuments];
    
    // Log de débogage
    if (this.allDocuments.length === 0) {
    }
  }

  getDocumentsBySource(): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    this.allDocuments.forEach(doc => {
      const source = (doc as any).source || 'Inconnu';
      distribution[source] = (distribution[source] || 0) + 1;
    });
    return distribution;
  }

  mapDocumentType(apiType: string): DocumentType {
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

  filterDocuments() {
    this.filteredDocuments = this.allDocuments.filter(doc => {
      const matchesSearch = !this.searchTerm || 
      doc.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      this.getDocumentTypeLabel(doc.type).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      this.getCaseNumber(doc.caseId).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (doc as any).source?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedDocumentType || doc.type === this.selectedDocumentType;
      const matchesCase = !this.selectedCaseId || doc.caseId === this.selectedCaseId;
      
      return matchesSearch && matchesType && matchesCase;
    });
  }

  applyFilters() {
    this.filterDocuments();
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedDocumentType = '';
    this.selectedCaseId = '';
    this.filteredDocuments = [...this.allDocuments];
  }

  getCaseNumber(caseId: string): string {
    const dossier = this.dossiers.find(d => d.nodeId === caseId);
    return dossier?.numeroDossier || 'N/A';
  }

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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedDocument = null;
  }

  viewDocument(doc: any) {

    const documentIdentifier = doc.id || doc.nodeId;
    
    if (!documentIdentifier) {
      alert('Identifiant du document manquant');
      return;
    }
    
    this.isLoadingDocument = true;
    this.currentDocument = doc;
  
    this.caseService.getDocumentContent(documentIdentifier).subscribe({
      next: (blob) => {
        this.isLoadingDocument = false;
        const blobUrl = window.URL.createObjectURL(blob);
        this.currentDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.documentContentType = blob.type;
        this.showDocumentViewer = true;
      },
      error: (error) => {
        this.isLoadingDocument = false;
        alert('Impossible de charger le document. Veuillez réessayer.');
      }
    });
  }

  closeDocumentViewer() {
    if (this.currentDocumentUrl) {
      const url = (this.currentDocumentUrl as any).changingThisBreaksApplicationSecurity || this.currentDocumentUrl;
      if (url && typeof url === 'string') {
        window.URL.revokeObjectURL(url);
      }
    }
    this.showDocumentViewer = false;
    this.currentDocumentUrl = null;
    this.currentDocument = null;
    this.documentContentType = '';
  }

  downloadDocument(doc: any) {
    const documentId = doc.id || doc.nodeId;
    if (!documentId) {
      alert('Identifiant du document manquant');
      return;
    }
    this.caseService.downloadDocument(documentId, doc.name);
  }

  isDocumentPDF(): boolean {
    return this.documentContentType === 'application/pdf' || 
    this.currentDocument?.name?.toLowerCase().endsWith('.pdf');
  }

  isDocumentImage(): boolean {
    return this.documentContentType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(this.currentDocument?.name);
  }

  openInNewTab() {
    if (this.currentDocumentUrl) {
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

  get uniqueDossiers(): any[] {
    const uniqueMap = new Map();
    this.dossiers.forEach(dossier => {
      if (dossier.nodeId && !uniqueMap.has(dossier.nodeId)) {
        uniqueMap.set(dossier.nodeId, dossier);
      }
    });
    return Array.from(uniqueMap.values());
  }


  // Méthode pour obtenir les types de documents pour le select
  getDocumentTypes(): { value: string; label: string }[] {
    return [
      { value: 'invoice', label: 'Facture' },
      { value: 'contract', label: 'Contrat' },
      { value: 'correspondence', label: 'Correspondance' },
      { value: 'legal_notice', label: 'Mise en demeure' },
      { value: 'payment_proof', label: 'Preuve de paiement' },
      { value: 'court_document', label: 'Document judiciaire' }
    ];
  }

  // Méthode utilitaire pour obtenir un numéro de dossier affichable
  getDisplayCaseNumber(dossier: any): string {
    return dossier.numeroDossier || dossier.nodeId || 'Dossier sans identifiant';
  }

  // Fonction pour rediriger l\'utilisateur connecté vers son dashboard
  goBackToDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const userRole = currentUser.role;
    let roleType = '';

    // Gestion sécurisée du type avec vérifications
    if (typeof userRole === 'string') {
      roleType = userRole;
    } else if (userRole && typeof userRole === 'object') {
      // Vérification plus sécurisée pour les propriétés
      const roleObj = userRole as any; 
      roleType = (roleObj.type || roleObj.name || '').toUpperCase();
    } else {
      roleType = '';
    }

    // Rediriger vers le dashboard approprié
    switch (roleType) {
      case 'AVOCAT':
      case 'LAWYER':
        this.router.navigate(['/lawyer/dashboard']);
      break;

      case 'DEBITEUR':
      case 'DEBTOR':
        this.router.navigate(['/debtor/dashboard']);
      break;

      case 'CREANCIER':
      case 'CREDITOR':
        this.router.navigate(['/creditor/dashboard']);
      break;

      case 'CEDANT':
      case 'CéDANT':
        this.router.navigate(['/cedant/dashboard']);
      break;

      case 'HUISSIER':
      case 'BAILIFF':
        this.router.navigate(['/bailiff/dashboard']);
      break;

      case 'PARTENAIRE':
      case 'PARTNER':
        this.router.navigate(['/partner/dashboard']);
      break;

      default:
        // Redirection par défaut vers la page d'accueil
        console.warn('Rôle non reconnu, redirection vers la page d\'accueil');
        this.router.navigate(['/']);
      break;
    }
  }

  // Méthode améliorée pour la validation
  isUploadValid(): boolean {
    return !!(
      this.selectedDetailCase?.nodeId && 
      this.newDocument.type && 
      this.newDocument.name && 
      this.selectedFile
    );
  }

  // Méthode pour s'assurer qu'un dossier est sélectionné
  ensureCaseSelected(): boolean {
    if (!this.selectedDetailCase) {
      return false;
    }
    return true;
  }

//   uploadDocument() {

//   // Réinitialiser les erreurs
//   this.resetUploadErrors();

//   // Valider les champs
//   let isValid = true;

//   if (!this.newDocument.type) {
//     this.uploadFormErrors.type = true;
//     this.uploadErrorMessages.type = 'Veuillez sélectionner un type de document';
//     isValid = false;
//   }

//   if (!this.newDocument.name || this.newDocument.name.trim() === '') {
//     this.uploadFormErrors.name = true;
//     this.uploadErrorMessages.name = 'Veuillez saisir un nom pour le document';
//     isValid = false;
//     console.log('Erreur name');
//   }

//   if (!this.selectedFile) {
//     this.uploadFormErrors.file = true;
//     this.uploadErrorMessages.file = 'Veuillez sélectionner un fichier';
//     isValid = false;
//     console.log('Erreur file');
//   }

//   console.log('Validation résultat:', isValid, 'isLoading:', this.isLoading); 

//   if (!isValid || this.isLoading) {
//     console.log('Arrêt: validation échouée ou en cours de chargement');
//     return;
//   }

//   this.isLoading = true;
//   console.log('Début de l\'upload...');

//   const formData = new FormData();
//   formData.append('filedata', this.selectedFile!);

//   const params = {
//     objetNodeId: this.selectedDetailCase.nodeId,
//     fieldName: 'documentsPartage', 
//     typeDocument: this.newDocument.type
//   };

//   // SAUVEGARDER le nom original AVANT l'upload
//   const originalFileName = this.selectedFile!.name;

//   this.caseService.uploadDocument(formData, params).subscribe({
//     next: (response) => {
//       this.isLoading = false;
//       console.log('Document uploadé:', response);

//       const uploadedFile = response.files[0];
      
//       // FORCER le nom original peu importe ce que retourne Alfresco
//       const newDoc: CaseDocument & { caseId: string } = {
//         id: uploadedFile.documentNodeId,
//         name: originalFileName, 
//         type: this.mapDocumentType(uploadedFile.typeDocument),
//         url: '#',
//         uploadedAt: new Date(),
//         uploadedBy: 'Utilisateur actuel',
//         caseId: this.selectedDetailCase.nodeId,
//       };

//       // this.allDocuments.push(newDoc);
//       // this.filteredDocuments.push(newDoc);


//       // AFFICHER LE MESSAGE DE SUCCÈS DANS LA MODALE
//       this.showUploadSuccess = true;
//       this.uploadSuccessMessage = 'Document ajouté avec succès!';
      
//       // Fermer la modale d'upload après 3 secondes
//       setTimeout(() => {
//         this.showUploadSuccess = false;
//         this.uploadSuccessMessage = '';
//         this.closeUploadModal();
//         this.filterDocuments();
//       }, 3000);
//     },
//     error: (error) => {
//       this.isLoading = false;
//       console.error('Erreur lors de l\'upload:', error);
//       alert('Erreur lors de l\'upload du document. Veuillez réessayer.');
//     }
//   });
// }

  // Ajoutez cette méthode pour réinitialiser les erreurs
  // resetUploadErrors(): void {
  //   this.uploadFormErrors = {
  //     type: false,
  //     name: false,
  //     file: false
  //   };
  //   this.uploadErrorMessages = {
  //     type: '',
  //     name: '',
  //     file: ''
  //   };
  // }

  // Validation du formulaire d'upload
  validateUploadForm(): boolean {
    const errors = [];

    if (!this.newDocument.caseId) {
      errors.push('Veuillez sélectionner un dossier');
    }
    if (!this.newDocument.type) {
      errors.push('Veuillez sélectionner un type de document');
    }
    if (!this.newDocument.name) {
      errors.push('Veuillez saisir un nom pour le document');
    }
    if (!this.selectedFile) {
      errors.push('Veuillez sélectionner un fichier');
    }

    if (errors.length > 0) {
      alert('Erreurs dans le formulaire :\n' + errors.join('\n'));
      return false;
    }

    return true;
  }

  // Méthode de debug pour vérifier TOUS les paramètres
  debugUploadParams(): void {
    console.log('🔍 === DEBUG UPLOAD PARAMÈTRES ===');
    
    console.log('1. 📁 Dossier sélectionné:', this.newDocument.caseId);
    console.log('2. 📄 Fichier sélectionné:', this.selectedFile);
    console.log('3. 🏷️ Type document:', this.newDocument.type);
    console.log('4. 📝 Nom document:', this.newDocument.name);
    
    // Vérifier si le dossier existe dans la liste
    const dossierSelectionne = this.dossiers.find(d => d.nodeId === this.newDocument.caseId);
    console.log('5. ✅ Dossier trouvé dans la liste:', dossierSelectionne);
    
    // Vérifier FormData
    const formData = new FormData();
    formData.append('file', this.selectedFile!);
    console.log('6. 📦 FormData créé:', formData);
    
    console.log('7. 🎯 Paramètres à envoyer:', {
      objetNodeId: this.newDocument.caseId,
      fieldName: 'documentsPartage', 
      typeDocument: this.newDocument.type
    });
  }






  // MÉTHODE pour UPLOADER UN DOCUMENT 
  uploadDocument(): void {
    
    // Réinitialiser les erreurs
    this.resetUploadErrors();

    // Validation des champs
    let isValid = true;

    if (!this.newDocument.caseId) {
      this.uploadFormErrors.type = true;
      this.uploadErrorMessages.type = 'Veuillez sélectionner un dossier';
      isValid = false;
    }

    if (!this.newDocument.type) {
      this.uploadFormErrors.type = true;
      this.uploadErrorMessages.type = 'Veuillez sélectionner un type de document';
      isValid = false;
    }

    if (!this.newDocument.name || this.newDocument.name.trim() === '') {
      this.uploadFormErrors.name = true;
      this.uploadErrorMessages.name = 'Veuillez saisir un nom pour le document';
      isValid = false;
    }

    if (!this.selectedFile) {
      this.uploadFormErrors.file = true;
      this.uploadErrorMessages.file = 'Veuillez sélectionner un fichier';
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    if (this.isUploading) {
      return;
    }

    this.isUploading = true;

    // Créer FormData
    const formData = new FormData();
    formData.append('filedata', this.selectedFile!);

    // Déterminer le fieldName selon le rôle de l'utilisateur
    const currentUser = this.authService.getCurrentUser();
    let userFieldName = 'documentsPartage'; 
    
    if (currentUser?.role) {
      const role = typeof currentUser.role === 'string' ? currentUser.role : currentUser.role.type;
      switch(role.toUpperCase()) {
        case 'PARTENAIRE':
        case 'PARTNER':
          userFieldName = 'documentsPartenaire';
          break;
        case 'AVOCAT':
        case 'LAWYER':
          userFieldName = 'documentsAvocat';
          break;
        case 'HUISSIER':
        case 'BAILIFF':
          userFieldName = 'documentsHuissier';
          break;
        case 'CEDANT':
        case 'CéDANT':
          userFieldName = 'documentsCedant';
          break;
        case 'CREANCIER':
        case 'CREDITOR':
          userFieldName = 'documentsCreancier';
          break;
        case 'DEBITEUR':
        case 'DEBTOR':
          userFieldName = 'documentsDebiteur';
          break;
      }
    }

    // Sauvegarder le nom original
    const originalFileName = this.selectedFile!.name;

    // PREMIER UPLOAD : Dans le dossier spécifique à l'utilisateur
    const userParams = {
      objetNodeId: this.newDocument.caseId,
      fieldName: userFieldName,
      typeDocument: this.newDocument.type
    };

    // DEUXIÈME UPLOAD : Dans documentsPartage
    const sharedParams = {
      objetNodeId: this.newDocument.caseId,
      fieldName: 'documentsPartage',
      typeDocument: this.newDocument.type
    };

    // STRATÉGIE AMÉLIORÉE : Upload séquentiel avec gestion d'erreur granulaire
    this.executeSequentialUploads(userParams, sharedParams, originalFileName);
  }

  // NOUVELLE MÉTHODE POUR UPLOADS SÉQUENTIELS
  executeSequentialUploads(userParams: any, sharedParams: any, originalFileName: string): void {
    let userUploadSuccess = false;
    let sharedUploadSuccess = false;
    let userResponse: any = null;
    
    // 1. D'abord l'upload utilisateur (le plus important)
    this.caseService.uploadDocument(this.createFormData(), userParams).subscribe({
      next: (response) => {
        userUploadSuccess = true;
        userResponse = response;

        // 2. Ensuite l'upload partage (secondaire)
        this.caseService.uploadDocument(this.createFormData(), sharedParams).subscribe({
          next: (sharedResponse) => {
            sharedUploadSuccess = true;
            this.isUploading = false;
            
            // Les deux ont réussi
            this.handleUploadSuccess(userResponse, originalFileName, true, true);
          },
          error: (sharedError) => {
            sharedUploadSuccess = false;
            this.isUploading = false;
            
            // Seul l'upload utilisateur a réussi
            this.handleUploadSuccess(userResponse, originalFileName, true, false);
          }
        });
      },


      error: (userError) => {
        userUploadSuccess = false;
        
        // Essayer quand même l'upload partage au cas où
        this.caseService.uploadDocument(this.createFormData(), sharedParams).subscribe({
          next: (sharedResponse) => {
            sharedUploadSuccess = true;
            this.isUploading = false;
            
            // Seul l'upload partage a réussi
            this.handleUploadSuccess(sharedResponse, originalFileName, false, true);
          },
          error: (sharedError) => {
            sharedUploadSuccess = false;
            this.isUploading = false;
            
            // Les deux ont échoué
            this.handleUploadError('Tous les uploads ont échoué. Veuillez réessayer.');
          }
        });
      }
    });
  }

  // MÉTHODE UTILITAIRE POUR CRÉER FORMDATA
  createFormData(): FormData {
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('filedata', this.selectedFile);
    }
    return formData;
  }

  // Gestion du succès de l'upload - VERSION AVEC DOUBLE ENREGISTREMENT
  handleUploadSuccess(response: any, originalFileName: string, userSuccess: boolean, sharedSuccess: boolean): void {
    try {

      // Vérifier la structure de la réponse
      let uploadedFile;
      
      if (response.files && response.files.length > 0) {
        // Structure avec tableau files
        uploadedFile = response.files[0];
      } else if (response.entry) {
        // Structure Alfresco directe
        uploadedFile = response.entry;
      } else {
        // Structure inconnue - utiliser les données disponibles
        uploadedFile = response;
      }

      // Récupérer l'utilisateur courant
      const currentUser = this.authService.getCurrentUser();
      const userName = currentUser?.username || 'Utilisateur actuel';

      // Déterminer la source et le message
      let source = '';
      let successMessage = '';

      if (userSuccess && sharedSuccess) {
        source = 'Upload (Partagé)';
        successMessage = 'Document ajouté avec succès et partagé!';
      } else if (userSuccess && !sharedSuccess) {
        source = 'Upload (Utilisateur uniquement)';
        successMessage = 'Document ajouté (erreur lors du partage)';
      } else if (!userSuccess && sharedSuccess) {
        source = 'Upload (Partage uniquement)';
        successMessage = 'Document partagé (erreur lors de l\'enregistrement utilisateur)';
      }

      // Créer le nouveau document
      const newDoc: CaseDocument & { caseId: string; source: string } = {
        id: uploadedFile.documentNodeId || uploadedFile.id || `doc-${Date.now()}`,
        name: originalFileName, // Toujours utiliser le nom original
        type: this.mapDocumentType(uploadedFile.typeDocument || this.newDocument.type),
        url: uploadedFile.url || uploadedFile.downloadUrl || '#',
        uploadedAt: new Date(),
        uploadedBy: userName,
        caseId: this.newDocument.caseId,
        source: source 
      };


      // Mettre à jour les listes de documents
      if (userSuccess || sharedSuccess) {
        this.allDocuments = [...this.allDocuments, newDoc];
        this.filteredDocuments = [...this.allDocuments];

        // Afficher le message de succès adapté
        this.showUploadSuccess = true;
        this.uploadSuccessMessage = successMessage;

        // Fermer la modale et rafraîchir après délai
        setTimeout(() => {
          this.showUploadSuccess = false;
          this.uploadSuccessMessage = '';
          this.closeUploadModal();
          this.filterDocuments(); // Rafraîchir les filtres
          
          // Forcer la détection des changements
          this.cdr.detectChanges();
        }, 3000);
      }

    } catch (error) {
      
      let errorMsg = 'Erreur lors du traitement. ';
      if (userSuccess && sharedSuccess) {
        errorMsg += 'Le document a été uploadé et partagé.';
      } else if (userSuccess) {
        errorMsg += 'Le document a été uploadé (sans partage).';
      } else if (sharedSuccess) {
        errorMsg += 'Le document a été partagé (sans enregistrement utilisateur).';
      }
      
      alert(errorMsg);
      this.closeUploadModal();
    }
  }

  // Gestion des erreurs d'upload - VERSION AMÉLIORÉE
  handleUploadError(errorMessage: string): void {
    alert(errorMessage);
    this.isUploading = false;
  }

  // Ouvrir le modal d'upload
  openUploadModal(): void {
    this.showUploadModal = true;
    // Réinitialiser le formulaire
    this.newDocument = {
      name: '',
      type: '',
      caseId: ''
    };
    this.selectedFile = null;
    this.isUploading = false;
    this.showUploadSuccess = false;
    this.resetUploadErrors();
  }

  // Fermer le modal d'upload
  closeUploadModal(): void {
    this.showUploadModal = false;
    this.newDocument = {
      name: '',
      type: '',
      caseId: ''
    };
    this.selectedFile = null;
    this.isUploading = false;
    this.showUploadSuccess = false;
    this.resetUploadErrors();
  }

  // Gestion de la sélection de fichier
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      if (!this.newDocument.name) {
        this.newDocument.name = file.name;
      }

      // Réinitialiser l'erreur du fichier si un fichier est sélectionné
      this.uploadFormErrors.file = false;
      this.uploadErrorMessages.file = '';
    } else {
      // Marquer comme erreur si aucun fichier n'est sélectionné
      this.uploadFormErrors.file = true;
      this.uploadErrorMessages.file = 'Veuillez sélectionner un fichier';
    }
  }

  // Ajoutez cette méthode pour réinitialiser les erreurs
  resetUploadErrors(): void {
    this.uploadFormErrors = {
      type: false,
      name: false,
      file: false
    };
    this.uploadErrorMessages = {
      type: '',
      name: '',
      file: ''
    };
  }

  // Les autres méthodes restent inchangées...
  deleteDocument(doc: CaseDocument & { caseId: string }) {
    // Vérifier que le document a un ID
    if (!doc.id) {
      return;
    }

    // Appel du service pour supprimer le document
    this.caseService.deleteDocument(doc.id).subscribe({
      next: (response) => {
        // Supprimer le document des tableaux locaux
        this.allDocuments = this.allDocuments.filter(d => d.id !== doc.id);
        this.filteredDocuments = this.filteredDocuments.filter(d => d.id !== doc.id);

        // AFFICHER LE MESSAGE DE SUCCÈS POUR LA SUPPRESSION
        this.showDeleteSuccess = true;
        this.deleteSuccessMessage = 'Document supprimé avec succès!';

        // Cacher le message après 3 secondes
        setTimeout(() => {
          this.showDeleteSuccess = false;
          this.deleteSuccessMessage = '';
          this.filterDocuments();
        }, 3000);
      },
      error: (error) => {
        alert('Erreur lors de la suppression du document. Veuillez réessayer.');
      }
    });
  }

  // Methode du modal de suppression d\'un document
  confirmDeleteDocument(doc: any): void {
    this.documentToDelete = doc;
    this.showDeleteConfirmation = true;
  }

  executeDelete(): void {
    if (this.documentToDelete) {
      this.deleteDocument(this.documentToDelete);
      this.showDeleteConfirmation = false;
      this.documentToDelete = null;
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.documentToDelete = null;
  }

}