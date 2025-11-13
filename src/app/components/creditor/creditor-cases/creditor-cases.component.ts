import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase} from '../../../models/case.model';
import { AdminService } from '../../../services/admin.service';
import { DebtorInfo } from '../../../models/case.model';
import { CaseDocument, DocumentType } from '../../../models/case.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-creditor-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent, RouterModule],
  templateUrl: './creditor-cases.component.html',
  styleUrls: ['./creditor-cases.component.css']
})
export class CreditorCasesComponent implements OnInit {

  selectedCase: DebtCase | null = null;

  selectedIndex: number | null = null;
  showDrawer  = false;


  dossiers: any[] = [];
  isLoading = true;
  errorMessage = '';

  currentView: 'grid' | 'table' = 'table';

  selectedDetailCase: any;

  // --- Filtres ---
  filters = {
    searchTerm: '',
    status: '',
    priority: ''
  };

  selectedStatus = '';
  selectedPriority = '';
  filteredDossiers: any[] = [];

  // Liste brute et filtrée pour pouvoir extraire le lastname, le firstname, l'email, le telephone et le type du débiteur (importer depuis AdminService)
  debiteurs: DebtorInfo[] = [];
  filteredDebiteurs: DebtorInfo[] = [];
  selectedDebtor: DebtorInfo | undefined;

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

  // Les propriétés pour la visualisation des documents
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

  // Methode du modal de suppression d\'un document
  showDeleteConfirmation = false;
  documentToDelete: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casesService: CaseService,
    private authService: AuthService,
    private adminService: AdminService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {

    this.loadDossiers();
  }

  // Fonction pour charger les dossiers
  loadDossiers() {
    const siteName = 'portail-recouvrement';
    const currentUser = this.authService.getCurrentUser();

    // Verification si l'utilisateur est connecté
    if (!currentUser) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.isLoading = false;
      return;
    }

    const creancierNodeId = currentUser.nodeId;
    // Verification si l'utilisateur connecté à un NodeId
    if (!creancierNodeId) {
      this.errorMessage = 'Identifiant du créancier introuvable.';
      this.isLoading = false;
      return;
    }

    // Appel du web service pour la recuperation des dossiers du creanciers
    this.casesService.getDossiersCreancier(siteName, creancierNodeId).subscribe({
      next: (response) => {

        // Étape 1 : extraction correcte du tableau de dossiers
        const dossiers = response.data?.map((item: any) => item.map) || [];

        // Étape 2 : filtrage local
        this.dossiers = dossiers.filter(
          (d: any) => d.creancierNodeId === creancierNodeId
        );

        // Étape 3 : initialisation du tableau filtré
        this.filteredDossiers = [...this.dossiers];

        // IMPORTANT: Extraire les documents après avoir chargé les dossiers
        this.extractDocuments();

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Impossible de récupérer les dossiers.';
        this.isLoading = false;
      }
    });

    // Appel du web service pour la recuperation des données(extraction du lastname,firstname,email,telephone et type) du débiteurs 
    this.adminService.getDebiteurs(siteName).subscribe({
        next: (data: DebtorInfo[]) => {
          this.debiteurs = data;
          this.filteredDebiteurs = [...this.debiteurs];
        },
        error: (err) => console.error(err)
    });
  }

  // Ici on compare le debiteurNodeId avec nodeId du dossier qui correspond au debiteur 
  getDebiteurForDossier(dossier: any): DebtorInfo | undefined {
    const debiteurNodeId = dossier.debiteurNodeId?.trim(); // <-- on supprime les espaces
    return this.debiteurs.find(d => String(d.nodeId).trim() === String(debiteurNodeId));
  }

  // Réinitialiser tous les filtres
  resetFilters(): void {
    this.filters = {
      searchTerm: '',
      status: '',
      priority: ''
    };
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.filteredDossiers = [...this.dossiers];
  }

  // Appliquer les filtres (nom, prénom, nom d’entreprise, numéro ou objet de dossier)
  applyFilters(): void {
  const term = this.filters.searchTerm.toLowerCase().trim();
  const status = this.filters.status;
  const priority = this.filters.priority;

  this.filteredDossiers = this.dossiers.filter((dossier) => {
    const debiteur = this.getDebiteurForDossier(dossier); 
    const fullName = `${debiteur?.firstName || ''} ${debiteur?.lastName || ''}`.toLowerCase();
    const company = debiteur?.companyName?.toLowerCase() || '';

    const matchesTerm =
      !term ||
      dossier.numeroDossier?.toLowerCase().includes(term) ||
      dossier.objet?.toLowerCase().includes(term) ||
      fullName.includes(term) ||            
      company.includes(term);               

    const matchesStatus =
      !status ||
      dossier.stepGlobal === status ||
      this.getStatusLabel(dossier.stepGlobal).toLowerCase() ===
        this.getStatusLabel(status).toLowerCase();

    const matchesPriority = !priority || dossier.priorite === priority;

    return matchesTerm && matchesStatus && matchesPriority;
  });
}

  // Lorsqu’on change le filtre de statut
  updateStatusFilter(): void {
    this.filters.status = this.selectedStatus;
    this.applyFilters();
  }

  // Lorsqu’on change le filtre de priorité
  updatePriorityFilter(): void {
    this.filters.priority = this.selectedPriority;
    this.applyFilters();
  }

  getPaymentPercentage(dossier: any): number {
    const total = dossier.montantTotal || 0;
    const paid = dossier.montantPaye || 0;
    return total ? Math.round((paid / total) * 100) : 0;
  }

  getTotalDebt(): number {
    return this.filteredDossiers.reduce((acc, d) => acc + (d.montantTotal || 0), 0);
  }

  getTotalPaid(): number {
    return this.filteredDossiers.reduce((acc, d) => acc + (d.montantPaye || 0), 0);
  }

  getFormattedRemainingAmount(dossier: any): string {
    const reste = (dossier.montantTotal || 0) - (dossier.montantPaye || 0);
    return reste.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  }

  formatCurrency(amount: number): string {
    if (!amount) return '0 FCFA';
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  viewCaseDetails(index: number): void {
    this.selectedIndex = index;
    const dossier = this.filteredDossiers[index];
    
    // Stocke le dossier sélectionné
    this.selectedDetailCase = dossier;
    
    this.selectedDebtor = this.getDebiteurForDossier(dossier);
    
    this.showDrawer = true;
  }

  closeDrawer() {
    this.showDrawer  = false;
    this.selectedIndex  = null;
      
    // Nettoyer l'URL si on vient des notifications
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  downloadCaseReport(case_: DebtCase) {
  }

  generateCustomReport() {
    this.router.navigate(['/professional/reports']);
  }

  getRecentActivities(index: number) {
      
  }

  getActivityClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'payment_received': 'payment',
      'reminder_sent': 'reminder',
      'status_changed': 'status',
      'formal_notice_sent': 'legal',
      'legal_action_initiated': 'legal'
    };
    return typeMap[type] || 'status';
  }
  

  // Ajout methode start
  extractDocuments() {
    this.allDocuments = [];
    
    // Parcourir tous les dossiers pour extraire leurs documents
    this.dossiers.forEach(dossier => {
      
      // Vérifier si le dossier a des documents creéancier
      if (dossier.documentsCreancier?.myArrayList && Array.isArray(dossier.documentsCreancier.myArrayList)) {
        dossier.documentsCreancier.myArrayList.forEach((doc: any) => {
          
          const mappedType = this.mapDocumentType(doc.typeDocument);
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
      }
    });
    
    this.filteredDocuments = [...this.allDocuments];
  }

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
    
    const result = typeMapping[normalizedType] || DocumentType.CORRESPONDENCE;
 
    return result;
  }

  filterDocuments() {
    this.filteredDocuments = this.allDocuments.filter(doc => {
      const matchesSearch = !this.searchTerm || 
        doc.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getCaseNumber(doc.caseId).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedDocumentType || doc.type === this.selectedDocumentType;
      const matchesCase = !this.selectedCaseId || doc.caseId === this.selectedCaseId;
      
      return matchesSearch && matchesType && matchesCase;
    });
  }

   getLegalDocumentsCount(): number {
    return this.allDocuments.filter(doc => 
      doc.type === DocumentType.LEGAL_NOTICE || 
      doc.type === DocumentType.COURT_DOCUMENT
    ).length;
  }

  getPaymentProofsCount(): number {
    return this.allDocuments.filter(doc => 
      doc.type === DocumentType.PAYMENT_PROOF
    ).length;
  }

  // Modifiez la méthode getCaseNumber pour utiliser nodeId
  getCaseNumber(caseId: string): string {
    const dossier = this.dossiers.find(d => d.nodeId === caseId);
    return dossier?.numeroDossier || 'N/A';
  }

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
    }else {
      // Marquer comme erreur si aucun fichier n'est sélectionné
      this.uploadFormErrors.file = true;
      this.uploadErrorMessages.file = 'Veuillez sélectionner un fichier';
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
      alert('Veuillez d\'abord sélectionner un dossier');
      return false;
    }
    return true;
  }

  uploadDocument() {

    // Réinitialiser les erreurs
    this.resetUploadErrors();

    // Valider les champs
    let isValid = true;

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

    if (!isValid || this.isLoading) {
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('filedata', this.selectedFile!);

    const params = {
      objetNodeId: this.selectedDetailCase.nodeId,
      fieldName: 'documentsCreancier', 
      typeDocument: this.newDocument.type
    };

    // SAUVEGARDER le nom original AVANT l'upload
    const originalFileName = this.selectedFile!.name;

    this.casesService.uploadDocument(formData, params).subscribe({
      next: (response) => {
        this.isLoading = false;

        const uploadedFile = response.files[0];
        // FORCER le nom original peu importe ce que retourne Alfresco
        const newDoc: CaseDocument & { caseId: string } = {
          id: uploadedFile.documentNodeId,
          name: originalFileName, // TOUJOURS le nom original du fichier
          type: this.mapDocumentType(uploadedFile.typeDocument),
          url: '#',
          uploadedAt: new Date(),
          uploadedBy: 'Utilisateur actuel',
          caseId: this.selectedDetailCase.nodeId,
        };

        this.allDocuments.push(newDoc);
        this.filteredDocuments.push(newDoc);
        
        // AFFICHER LE MESSAGE DE SUCCÈS DANS LA MODALE
        this.showUploadSuccess = true;
        this.uploadSuccessMessage = 'Document ajouté avec succès!';
        
        // Fermer la modale d'upload après 3 secondes
        setTimeout(() => {
          this.showUploadSuccess = false;
          this.uploadSuccessMessage = '';
          this.closeUploadModal();
          // this.filterDocuments();
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        alert('Erreur lors de l\'upload du document. Veuillez réessayer.');
      }
    });
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

  deleteDocument(doc: CaseDocument & { caseId: string }) {

    // Vérifier que le document a un ID
    if (!doc.id) {
      alert('Impossible de supprimer le document : identifiant manquant');
      return;
    }

    // Appel du service pour supprimer le document
    this.casesService.deleteDocument(doc.id).subscribe({
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

  closeUploadModal() {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.newDocument = {
      caseId: '',
      type: '',
      name: ''
    };
    // RÉINITIALISER LE MESSAGE DE SUCCÈS
    this.showUploadSuccess = false;
    this.uploadSuccessMessage = '';
    this.resetUploadErrors(); // Réinitialiser les erreurs
  }

  // Fonction pour fermer la modal des documents
  closeDocumentsModal() {
    this.showDocumentsModal = false;
    // RÉINITIALISER LE MESSAGE DE SUPPRESSION
    this.showDeleteSuccess = false;
    this.deleteSuccessMessage = '';
  }

  // Méthode pour valider en temps réel
  validateField(fieldName: keyof typeof this.uploadFormErrors): void {
    switch (fieldName) {
      case 'type':
        this.uploadFormErrors.type = !this.newDocument.type;
        this.uploadErrorMessages.type = this.uploadFormErrors.type ? 'Veuillez sélectionner un type de document' : '';
        break;
      case 'name':
        this.uploadFormErrors.name = !this.newDocument.name || this.newDocument.name.trim() === '';
        this.uploadErrorMessages.name = this.uploadFormErrors.name ? 'Veuillez saisir un nom pour le document' : '';
        break;
      case 'file':
        this.uploadFormErrors.file = !this.selectedFile;
        this.uploadErrorMessages.file = this.uploadFormErrors.file ? 'Veuillez sélectionner un fichier' : '';
        break;
    }
  }

  // Ajout methode end
  openDocumentsModal() {
    if (this.selectedIndex !== null) {
      this.selectedDetailCase = this.filteredDossiers[this.selectedIndex];
    }
    
    if (this.selectedDetailCase) {
      // Filtrer uniquement les documents du dossier sélectionné
      this.filteredDocuments = this.allDocuments.filter(
        doc => doc.caseId === this.selectedDetailCase.nodeId
      );
    
    } else {
      // Afficher tous les documents si aucun dossier n'est sélectionné
      this.filteredDocuments = [...this.allDocuments];
    }
    
    this.showDocumentsModal = true;
  }

  // Compter les documents d'un dossier
  getDocumentsCount(dossier: any): number {
    if (!dossier) return 0;
    return dossier.documentsCreancier?.myArrayList?.length || 0;
  }

  // Méthode pour visualiser un document
  viewDocument(doc: any) {

    const documentIdentifier = doc.nodeId || doc.id; //  fallback si nodeId absent
    
    if (!documentIdentifier) {
      alert('Identifiant du document manquant');
      return;
    }
    
    this.isLoadingDocument = true;
    this.currentDocument = doc;
  
    // Récupérer le contenu du document depuis le backend
    this.casesService.getDocumentContent(doc.id).subscribe({
      next: (blob) => {
        this.isLoadingDocument = false;

        // Création de l'URL temporaire
        const blobUrl = window.URL.createObjectURL(blob);
        this.currentDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.documentContentType = blob.type;
        
        // Ouvrir la modale de visualisation
        this.showDocumentViewer = true;
      },
      error: (error) => {
        this.isLoadingDocument = false;
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
    
    if (!doc.id) {
      alert('Identifiant du document manquant');
      return;
    }
    this.casesService.downloadDocument(doc.id, doc.name);
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