import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter } from '../../../models/case.model';
import { AdminService } from '../../../services/admin.service';
import { DebtorInfo } from '../../../models/case.model';
import { CaseDocument, DocumentType } from '../../../models/case.model';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casesService: CaseService,
    private authService: AuthService,
    private adminService: AdminService
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
    console.log('Créancier connecté :', currentUser);
    console.log('creancierNodeId envoyé :', creancierNodeId);

    // Verification si l'utilisateur connecté à un NodeId
    if (!creancierNodeId) {
      this.errorMessage = 'Identifiant du créancier introuvable.';
      this.isLoading = false;
      return;
    }

    // Appel du web service pour la recuperation des dossiers du creanciers
    this.casesService.getDossiersCreancier(siteName, creancierNodeId).subscribe({
      next: (response) => {
        console.log('Réponse API dossiers :', response);

        // Étape 1 : extraction correcte du tableau de dossiers
        const dossiers = response.data?.map((item: any) => item.map) || [];

        // Étape 2 : filtrage local
        this.dossiers = dossiers.filter(
          (d: any) => d.creancierNodeId === creancierNodeId
        );

        // Étape 3 : initialisation du tableau filtré
        this.filteredDossiers = [...this.dossiers];
        console.log('Dossiers filtrés pour ce créancier :', this.dossiers);

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
    // return this.debiteurs.find(d => d.nodeId === dossier.debiteurNodeId);
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

  // Appliquer les filtres (recherche, statut, priorité)
  applyFilters(): void {
    const term = this.filters.searchTerm.toLowerCase().trim();
    const status = this.filters.status;
    const priority = this.filters.priority;

    this.filteredDossiers = this.dossiers.filter((dossier) => {
      const matchesTerm =
      !term ||
      dossier.numeroDossier?.toLowerCase().includes(term) ||
      dossier.objet?.toLowerCase().includes(term) ||
      dossier.nomDebiteur?.toLowerCase().includes(term);

      // const matchesStatus = !status || dossier.statutGlobal === status;
      const matchesStatus =!status ||dossier.statutGlobal === status ||
      this.getStatusLabel(dossier.statutGlobal).toLowerCase() === this.getStatusLabel(status).toLowerCase();
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
      month: 'short',
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

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'FAIBLE': 'Faible',
      'MOYENNE': 'Moyenne',
      'Élevée': 'Élevée',
      // 'HAUTE': 'Élevée',
      'urgent': 'Urgente'
    };
    return labels[priority] || priority;
  }

  // viewCaseDetails(index: number): void {
  //   this.selectedIndex = index;
  //   const dossier = this.filteredDossiers[index];
  //   this.selectedDebtor = this.getDebiteurForDossier(dossier);
  //   console.log("selectedDebtor", this.selectedDebtor);
  //   this.showDrawer  = true;
  // }
  viewCaseDetails(index: number): void {
  this.selectedIndex = index;
  const dossier = this.filteredDossiers[index];
  
  // IMPORTANT: Stocker le dossier sélectionné
  this.selectedDetailCase = dossier;
  
  this.selectedDebtor = this.getDebiteurForDossier(dossier);
  console.log("selectedDebtor", this.selectedDebtor);
  console.log("selectedDetailCase", this.selectedDetailCase);
  
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
    console.log('Télécharger rapport pour:', case_.caseNumber);
    // TODO: Implémenter le téléchargement de rapport spécifique au dossier
  }

  // downloadDocument(doc: any) {
  //   console.log('Télécharger document:', doc.name);
    
  // }

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
  // loadData() {
  //   const currentUser = this.authService.getCurrentUser();
  //   if (!currentUser) return;

  //   this.casesService.getCasesByUserId(currentUser.id, currentUser.role.name)
  //     .subscribe(cases => {
  //       this.cases = cases;
  //       this.extractDocuments();
  //     });
  // }

  // extractDocuments() {
  //   this.allDocuments = [];
  //   this.cases.forEach(case_ => {
  //     case_.documents.forEach(doc => {
  //       this.allDocuments.push({ ...doc, caseId: case_.id });
  //     });
  //   });
  //   this.filteredDocuments = [...this.allDocuments];
  // }
  extractDocuments() {
    this.allDocuments = [];
    
    console.log('Début extraction des documents...');
    
    // Parcourir tous les dossiers pour extraire leurs documents
    this.dossiers.forEach(dossier => {
      console.log('Dossier:', dossier.numeroDossier, 'Documents:', dossier.documentsCreancier?.myArrayList);
      
      // Vérifier si le dossier a des documents creéancier
      if (dossier.documentsCreancier?.myArrayList && Array.isArray(dossier.documentsCreancier.myArrayList)) {
        dossier.documentsCreancier.myArrayList.forEach((doc: any) => {
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

  // getLegalDocumentsCount(): number {
  //   return this.allDocuments.filter(doc => 
  //     doc.type === 'legal_notice' || doc.type === 'court_document'
  //   ).length;
  // }
   getLegalDocumentsCount(): number {
    return this.allDocuments.filter(doc => 
      doc.type === DocumentType.LEGAL_NOTICE || 
      doc.type === DocumentType.COURT_DOCUMENT
    ).length;
  }

  // getPaymentProofsCount(): number {
  //   return this.allDocuments.filter(doc => doc.type === 'payment_proof').length;
  // }
  getPaymentProofsCount(): number {
    return this.allDocuments.filter(doc => 
      doc.type === DocumentType.PAYMENT_PROOF
    ).length;
  }

  // getCaseNumber(caseId: string): string {
  //   const case_ = this.cases.find(c => c.id === caseId);
  //   return case_?.caseNumber || 'N/A';
  // }

  // getDocumentTypeLabel(type: string): string {
  //   const labels: { [key: string]: string } = {
  //     'invoice': 'Facture',
  //     'contract': 'Contrat',
  //     'correspondence': 'Correspondance',
  //     'legal_notice': 'Mise en demeure',
  //     'payment_proof': 'Preuve de paiement',
  //     'court_document': 'Document judiciaire'
  //   };
  //   return labels[type] || type;
  // }

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
    }
  }

  isUploadValid(): boolean {
    return !!(this.newDocument.caseId && this.newDocument.type && this.newDocument.name && this.selectedFile);
  }

  // uploadDocument() {
  //   if (!this.isUploadValid()) return;

  //   const currentUser = this.authService.getCurrentUser();
  //   if (!currentUser) return;

  //   // Simulation de l'upload
  //   const newDoc: CaseDocument & { caseId: string } = {
  //     id: Date.now().toString(),
  //     name: this.newDocument.name,
  //     type: this.newDocument.type as DocumentType,
  //     url: '#',
  //     uploadedAt: new Date(),
  //     uploadedBy: `${currentUser.firstname} ${currentUser.lastname}`,
  //     caseId: this.newDocument.caseId
  //   };

  //   this.allDocuments.unshift(newDoc);
  //   this.filterDocuments();
  //   this.closeUploadModal();

  //   console.log('Document ajouté:', newDoc);
  // }
   uploadDocument() {
  if (!this.isUploadValid()) return;

  const currentUser = this.authService.getCurrentUser();
  if (!currentUser) return;

  // Utiliser le dossier sélectionné comme caseId
  const caseId = this.selectedDetailCase?.nodeId || this.newDocument.caseId;

  const newDoc: CaseDocument & { caseId: string } = {
    id: Date.now().toString(),
    name: this.newDocument.name,
    type: this.newDocument.type as DocumentType,
    url: '#', // À remplacer par l'URL réelle après upload sur le serveur
    uploadedAt: new Date(),
    uploadedBy: `${currentUser.firstname} ${currentUser.lastname}`,
    caseId: caseId
  };

  this.allDocuments.unshift(newDoc);
  this.openDocumentsModal(); // Rafraîchir la liste filtrée
  this.closeUploadModal();

  console.log('Document ajouté:', newDoc);

  console.log('Dossier sélectionné:', this.selectedDetailCase?.numeroDossier);
  console.log('NodeId utilisé:', caseId);
  console.log('Documents filtrés après ajout:', this.filteredDocuments);
}

  // viewDocument(doc: CaseDocument) {
  //   console.log('Visualisation du document:', doc.name);
  //   // TODO: Implémenter la visualisation
  // }

  // downloadDocument(doc: CaseDocument) {
  //   console.log('Téléchargement du document:', doc.name);
  //   // TODO: Implémenter le téléchargement
  // }

  deleteDocument(doc: CaseDocument) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.allDocuments = this.allDocuments.filter(d => d.id !== doc.id);
      this.filterDocuments();
      console.log('Document supprimé:', doc.name);
    }
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.newDocument = {
      caseId: '',
      type: '',
      name: ''
    };
  }
  // Fonction pour ouvrir la modal des documents
  // openDocumentsModal() {
  //   this.showDocumentsModal = true;
  // }

  // Fonction pour fermer la modal des documents
  closeDocumentsModal() {
    this.showDocumentsModal = false;
  }


  // Ajout methode end

  // Méthode pour filtrer les documents du dossier sélectionné
  // openDocumentsModal() {
  //   if (this.selectedDetailCase) {
  //     // Filtrer uniquement les documents du dossier sélectionné
  //     this.filteredDocuments = this.allDocuments.filter(
  //       doc => doc.caseId === this.selectedDetailCase.nodeId
  //     );
  //   } 
  //   else {
  //     // Afficher tous les documents
  //     this.filteredDocuments = [...this.allDocuments];
  //   }
  //   this.showDocumentsModal = true;
  // }
  openDocumentsModal() {
  // Stocker le dossier sélectionné
  if (this.selectedIndex !== null) {
    this.selectedDetailCase = this.filteredDossiers[this.selectedIndex];
  }
  
  if (this.selectedDetailCase) {
    // Filtrer uniquement les documents du dossier sélectionné
    this.filteredDocuments = this.allDocuments.filter(
      doc => doc.caseId === this.selectedDetailCase.nodeId
    );
    
    console.log('Documents du dossier', this.selectedDetailCase.numeroDossier, ':', this.filteredDocuments);
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

  // Méthode pour télécharger un document
  downloadDocument(doc: any) {
    if (doc.url && doc.url !== '#') {
      window.open(doc.url, '_blank');
    } else {
      console.log('URL de téléchargement non disponible pour:', doc.name);
      alert('Le document n\'est pas disponible au téléchargement');
    }
  }

  // Méthode pour visualiser un document
  viewDocument(doc: any) {
    if (doc.url && doc.url !== '#') {
      window.open(doc.url, '_blank');
    } else {
      console.log('URL non disponible pour:', doc.name);
      alert('Impossible de visualiser ce document');
    }
  }

}