import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseDocument, DocumentType } from '../../../models/case.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

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
    private sanitizer: DomSanitizer,
    private router: Router 
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

  deleteDocument(doc: CaseDocument) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.allDocuments = this.allDocuments.filter(d => d.id !== doc.id);
      this.filterDocuments();
      console.log('Document supprimé:', doc.name);
    }
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

    console.log('Utilisateur connecté:', {
      nodeId: userNodeId,
      role: userRole,
      username: currentUser.username
    });

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

    console.log('Type de rôle détecté:', roleType);

    let serviceCall;

    switch (roleType) {
      case 'AVOCAT':
      case 'LAWYER':
        console.log('Chargement des dossiers de l\'avocat:', nodeId);
        serviceCall = this.caseService.getDossiersAvocat(siteName, nodeId);
        break;

      case 'DEBITEUR':
      case 'DEBTOR':
        console.log('Chargement des dossiers du débiteur:', nodeId);
        serviceCall = this.caseService.getDossiersDebiteur(siteName, nodeId);
        break;

      case 'CREANCIER':
      case 'CREDITOR':
        console.log('Chargement des dossiers du créancier:', nodeId);
        serviceCall = this.caseService.getDossiersCreancier(siteName, nodeId);
        break;

      case 'HUISSIER':
      case 'BAILIFF':
        console.log('Chargement des dossiers de l\'huissier:', nodeId);
        serviceCall = this.caseService.getDossiersHuissier(siteName, nodeId);
        break;

      default:
        console.warn('Rôle non reconnu:', roleType, 'tentative avec avocat par défaut');
        serviceCall = this.caseService.getDossiersAvocat(siteName, nodeId);
    }

    serviceCall.subscribe({
      next: (response) => {
        console.log('Réponse API dossiers utilisateur:', response);
        
        // S'assurer que nous avons un tableau de dossiers
        let dossiersArray = [];
        
        if (response.data && Array.isArray(response.data)) {
          dossiersArray = response.data.map((item: any) => item.map);
        } else if (Array.isArray(response)) {
          dossiersArray = response.map((item: any) => item.map || item);
        }
        
        console.log('Dossiers bruts reçus:', dossiersArray);
        
        // Filtrer les dossiers pour ne garder que ceux où l'utilisateur est vraiment impliqué
        this.dossiers = this.filterUserDossiers(dossiersArray, nodeId, roleType);
        
        console.log(`Dossiers après filtrage: ${this.dossiers.length}`, this.dossiers);
        
        if (this.dossiers.length === 0) {
          console.warn('Aucun dossier trouvé pour cet utilisateur');
          this.errorMessage = 'Aucun dossier trouvé pour votre compte.';
        } else {
          this.extractAllDocuments();
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des dossiers:', error);
        this.errorMessage = 'Impossible de récupérer les documents.';
        this.isLoading = false;
      }
    });
  }

  // Filtrer les dossiers pour ne garder que ceux où l'utilisateur est impliqué
  filterUserDossiers(dossiers: any[], userNodeId: string, userRole: string): any[] {
    console.log(`Filtrage des dossiers pour l'utilisateur ${userNodeId} avec le rôle ${userRole}`);
    
    const filteredDossiers = dossiers.filter(dossier => {
      console.log('Vérification du dossier:', dossier);
      
      // Vérifier selon le rôle de l'utilisateur
      switch (userRole) {
        case 'AVOCAT':
        case 'LAWYER':
          // Pour un avocat, vérifier s'il est l'avocat du dossier
          const isAvocat = dossier.avocatNodeId === userNodeId || 
          dossier.idAvocat === userNodeId ||
          (dossier.avocat && (dossier.avocat.nodeId === userNodeId || dossier.avocat.id === userNodeId));
          console.log(`Dossier ${dossier.numeroDossier || dossier.nodeId} - Avocat correspond:`, isAvocat);
          return isAvocat;

        case 'DEBITEUR':
        case 'DEBTOR':
          // Pour un débiteur, vérifier s'il est le débiteur du dossier
          const isDebiteur = dossier.debiteurNodeId === userNodeId || 
          dossier.idDebiteur === userNodeId ||
          (dossier.debiteur && (dossier.debiteur.nodeId === userNodeId || dossier.debiteur.id === userNodeId));
          console.log(`Dossier ${dossier.numeroDossier || dossier.nodeId} - Débiteur correspond:`, isDebiteur);
          return isDebiteur;

        case 'CREANCIER':
        case 'CREDITOR':
          // Pour un créancier, vérifier s'il est le créancier du dossier
          const isCreancier = dossier.creancierNodeId === userNodeId || 
          dossier.idCreancier === userNodeId ||
          (dossier.creancier && (dossier.creancier.nodeId === userNodeId || dossier.creancier.id === userNodeId));
          console.log(`Dossier ${dossier.numeroDossier || dossier.nodeId} - Créancier correspond:`, isCreancier);
          return isCreancier;

        case 'HUISSIER':
        case 'BAILIFF':
          // Pour un huissier, vérifier s'il est l'huissier du dossier
          const isHuissier = dossier.huissierNodeId === userNodeId || 
          dossier.idHuissier === userNodeId ||
          (dossier.huissier && (dossier.huissier.nodeId === userNodeId || dossier.huissier.id === userNodeId));
          console.log(`Dossier ${dossier.numeroDossier || dossier.nodeId} - Huissier correspond:`, isHuissier);
          return isHuissier;

        default:
          // Vérification générique
          const isInDossier = this.checkUserInDossier(dossier, userNodeId);
          console.log(`Dossier ${dossier.numeroDossier || dossier.nodeId} - Présence générique:`, isInDossier);
          return isInDossier;
      }
    });

    console.log(`Dossiers filtrés: ${filteredDossiers.length}`);
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
        dossier.idAvocat === userNodeId ||
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
    
    console.log(' EXTRACTION DES DOCUMENTS');
    console.log('Nombre de dossiers à traiter:', this.dossiers.length);
    
    const processedDocumentIds = new Set<string>();
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('Utilisateur non connecté lors de l\'extraction des documents');
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
      { key: 'documentsPartage', label: 'Partage' }
    ];
    
    // Parcourir tous les dossiers (déjà filtrés pour l'utilisateur)
    this.dossiers.forEach((dossier, index) => {
      console.log(`\n--- Dossier ${index + 1}/${this.dossiers.length}: ${dossier.numeroDossier || dossier.nodeId} ---`);
      console.log('Structure du dossier:', dossier);
      
      let documentsTrouves = 0;
      
      // Pour chaque source de documents
      documentSources.forEach(source => {
        const documentsContainer = dossier[source.key];
        console.log(`Source ${source.key}:`, documentsContainer);
        
        // Vérifier si le conteneur de documents existe et contient un tableau
        if (documentsContainer?.myArrayList && Array.isArray(documentsContainer.myArrayList)) {
          console.log(`${source.label}: ${documentsContainer.myArrayList.length} document(s)`);
          
          // Extraire chaque document
          documentsContainer.myArrayList.forEach((doc: any, docIndex: number) => {
            console.log(`Document ${docIndex + 1}:`, doc);
            
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
                uploadedBy: doc.uploadedBy || source.label || 'Système',
                caseId: dossier.nodeId,
                source: source.label
              });
              
              documentsTrouves++;
            } else {
              console.log(`Document déjà traité: ${docId}`);
            }
          });
        } else {
          console.log(` ${source.label}: aucun document`);
        }
      });
      
      console.log(`Total documents trouvés dans ce dossier: ${documentsTrouves}`);
    });
    
    this.filteredDocuments = [...this.allDocuments];
    console.log('\n RÉSULTAT FINAL ');
    console.log('Total documents extraits (sans doublons):', this.allDocuments.length);
    console.log('Documents par source:', this.getDocumentsBySource());
    
    // Log de débogage
    if (this.allDocuments.length === 0) {
      console.warn('AUCUN DOCUMENT TROUVÉ - Vérifiez la structure des dossiers');
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
    
    console.log('Documents filtrés:', this.filteredDocuments.length);
  }

  applyFilters() {
    this.filterDocuments();
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedDocumentType = '';
    this.selectedCaseId = '';
    this.filteredDocuments = [...this.allDocuments];
    console.log('Filtres réinitialisés. Affichage de tous les documents:', this.allDocuments.length);
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
    console.log('Visualisation du document:', doc);

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
        console.log('Document chargé avec succès. Type:', blob.type);
      },
      error: (error) => {
        this.isLoadingDocument = false;
        console.error('Erreur lors du chargement du document:', error);
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
    console.log('Téléchargement du document:', doc);
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

 // AJOUTEZ CES MÉTHODES MANQUANTES :

  // Gestion de la sélection de fichier
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Optionnel: pré-remplir le nom du document avec le nom du fichier
      if (!this.newDocument.name) {
        this.newDocument.name = file.name.split('.')[0]; // Enlève l'extension
      }
    }
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
  }

  // Uploader le document
  uploadDocument(): void {
    if (!this.selectedFile || !this.newDocument.name || !this.newDocument.type || !this.newDocument.caseId) {
      alert('Veuillez remplir tous les champs et sélectionner un fichier');
      return;
    }

    this.isUploading = true;

    // Ici vous devrez appeler votre service d'upload
    // Exemple :
    this.caseService.uploadDocument(
      this.newDocument.caseId,
      this.selectedFile,
    ).subscribe({
      next: (response) => {
        this.isUploading = false;
        console.log('Document uploadé avec succès:', response);
        alert('Document uploadé avec succès');
        
        // Fermer le modal et recharger les documents
        this.closeUploadModal();
        this.loadData(); // Ou une méthode de rafraîchissement plus légère
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Erreur lors de l\'upload:', error);
        alert('Erreur lors de l\'upload du document');
      }
    });
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

    case 'HUISSIER':
    case 'BAILIFF':
      this.router.navigate(['/bailiff/dashboard']);
      break;

    default:
      // Redirection par défaut vers la page d'accueil
      console.warn('Rôle non reconnu, redirection vers la page d\'accueil');
      this.router.navigate(['/']);
      break;
  }
}

}