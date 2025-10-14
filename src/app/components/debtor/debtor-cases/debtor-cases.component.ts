import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../../services/case.service';
import { I18nService } from '../../../services/i18n.service';
import { DebtCase, CaseStatus, Priority, ActivityType, PaymentProposal, CaseFilter  } from '../../../models/case.model';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CreditorDetail } from '../../../models/case.model';
import { CaseDocument, DocumentType } from '../../../models/case.model';

@Component({
  selector: 'app-debtor-cases',
  standalone: true,
  imports: [CommonModule, ViewToggleComponent, RouterModule, FormsModule],
  templateUrl: './debtor-cases.component.html',
  styleUrls: ['./debtor-cases.component.css']
})
export class DebtorCasesComponent implements OnInit {
  dossiers: any[] = [];
  isLoading = true;
  errorMessage = '';

  translations: any = {};
  userCases: DebtCase[] = [];

  currentView: 'grid' | 'table' = 'table';
  // tiroir variale start
  // selectedDetailCase: DebtCase | null = null; // Case selected for details
  selectedDetailCase: any;
  showCaseDetailsModal = false; // Control whether the drawer is shown

  // tiroir variale end

  // --- Filtres ---
  filters = {
    searchTerm: '',
    status: '',
    priority: ''
  };

  selectedStatus = '';
  selectedPriority = '';
  filteredDossiers: any[] = [];


  showPaymentModal = false;
  showPaymentPlanModal = false;
  showDisputeModal = false;
  selectedCase: DebtCase | null = null;
   paymentAmount = 0;
  isProcessingPayment = false;
  
  paymentPlanProposal = {
    monthlyAmount: 0,
    duration: 0,
    startDate: '',
    notes: ''
  };
   isSubmittingDispute = false;

  // Liste brute et filtrée pour pouvoir extraire le lastname, le firstname, l'email, le telephone et le type du débiteur (importer depuis AdminService)
  creditors: CreditorDetail[] = [];
  filteredCreditors: CreditorDetail[] = [];

  selectedcreditor: CreditorDetail | undefined;

   selectedIndex: number | null = null;
  // showCaseDetailsModal = false;

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
    private casesService: CaseService,
    private i18nService: I18nService,
    private authService: AuthService,
    private adminService: AdminService,
    private caseService: CaseService
  ) {}

  ngOnInit(): void {

    this.loadTranslations();
    this.i18nService.currentLocale$.subscribe(() => {
    this.loadTranslations();
    // Ajout
    this.loadData();
    });


    this.loadDossiers();
  }

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
    // Lorsque le bouton "Détails" est cliqué
  viewDossierDetails(dossier: any): void {
    // console.log("le dossier selectionner",dossier);
    this.selectedDetailCase = dossier;
    console.log("this.selectedDetailCase", this.selectedDetailCase);
    this.showCaseDetailsModal = true; // Afficher le tiroir
  }

  // Fermer le tiroir
  closeDrawer(): void {
    this.showCaseDetailsModal = false; // Fermer le tiroir
  }

   // Ici on compare le debiteurNodeId avec nodeId du dossier qui correspond au debiteur 
    getCreancierForDossier(dossier: any): CreditorDetail | undefined {
        return this.creditors.find(d => d.nodeId === dossier.creancierNodeId);
    }

  private loadTranslations() {
    const locale = this.i18nService.getCurrentLocale();
    this.i18nService.loadTranslations(locale).subscribe(translations => {
      this.translations = translations;
    });
  }
  t(key: string): string {
    return this.i18nService.translate(key, this.translations);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Élevée',
      'urgent': 'Urgente'
    };
    return labels[priority] || priority;
  }

  // viewCaseDetails(case_: DebtCase) {
    
  // }
  viewCaseDetails(index: number): void {
    this.selectedIndex = index;
    const dossier = this.filteredDossiers[index];
    this.selectedcreditor = this.getCreancierForDossier(dossier);
    this.showCaseDetailsModal = true;
  }
   downloadCaseReport(case_: DebtCase) {
    console.log('Télécharger rapport pour:', case_.caseNumber);
  }

  downloadDocument(doc: any) {
    console.log('Télécharger document:', doc.name);
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
      const matchesPriority = !priority || dossier.priority === priority;

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
  return reste.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

getInterestTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'legal': 'Intérêts légaux',
      'contractual': 'Intérêts contractuels',
      'delay': 'Intérêts de retard'
    };
    return labels[type] || type;
  }
  getReminderHistory(case_: DebtCase) {
    return case_.history.filter(activity => 
      activity.type === ActivityType.REMINDER_SENT || 
      activity.type === ActivityType.FORMAL_NOTICE_SENT ||
      activity.type === ActivityType.CORRESPONDENCE_SENT
    );
  }
    getReminderIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      [ActivityType.REMINDER_SENT]: 'email',
      [ActivityType.FORMAL_NOTICE_SENT]: 'legal',
      [ActivityType.CORRESPONDENCE_SENT]: 'mail'
    };
    return classes[type] || 'email';
  }
  getReminderTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      [ActivityType.REMINDER_SENT]: 'Relance',
      [ActivityType.FORMAL_NOTICE_SENT]: 'Mise en demeure',
      [ActivityType.CORRESPONDENCE_SENT]: 'Correspondance'
    };
    return labels[type] || 'Communication';
  }
   formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  makePayment(case_: DebtCase) {
    this.selectedCase = case_;
    this.paymentAmount = 0;
    this.showPaymentModal = true;
  }
  proposePaymentPlan(case_: DebtCase) {
    this.selectedCase = case_;
    this.paymentPlanProposal = {
      monthlyAmount: 0,
      duration: 0,
      startDate: this.getTomorrowDate(),
      notes: ''
    };
    this.showPaymentPlanModal = true;
  }
  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  fileDispute(case_: DebtCase) {
    this.selectedCase = case_;
    this.disputeForm = {
      reason: '',
      description: '',
      attachments: []
    };
    this.showDisputeModal = true;
  }
  disputeForm = {
    reason: '',
    description: '',
    attachments: [] as File[]
  };
   closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedCase = null;
    this.paymentAmount = 0;
    this.isProcessingPayment = false;
  }
   setPaymentAmount(amount: number) {
    this.paymentAmount = Math.round(amount * 100) / 100;
  }
     processPayment() {
    if (!this.selectedCase || this.paymentAmount <= 0) return;

    this.isProcessingPayment = true;

    this.casesService.createPayment(this.selectedCase.id, this.paymentAmount)
      .subscribe({
        next: (updatedCase) => {
          const caseIndex = this.userCases.findIndex(c => c.id === updatedCase.id);
          if (caseIndex >= 0) {
            this.userCases[caseIndex] = updatedCase;
          }
          this.closePaymentModal();
        },
        error: (error) => {
          console.error('Erreur lors du paiement:', error);
          this.isProcessingPayment = false;
        }
      });
  }
   closePaymentPlanModal() {
    this.showPaymentPlanModal = false;
    this.selectedCase = null;
  }
   calculatePaymentPlan() {
    if (this.paymentPlanProposal.monthlyAmount > 0 && this.selectedCase) {
      const remainingAmount = this.selectedCase.amount - this.selectedCase.amountPaid;
      this.paymentPlanProposal.duration = Math.ceil(remainingAmount / this.paymentPlanProposal.monthlyAmount);
    }
  }
   submitPaymentPlan() {
    if (!this.selectedCase || !this.isPaymentPlanValid()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const proposal: Omit<PaymentProposal, 'id' | 'createdAt'> = {
      caseId: this.selectedCase.id,
      proposedBy: currentUser.id,
      totalAmount: this.selectedCase.amount - this.selectedCase.amountPaid,
      monthlyAmount: this.paymentPlanProposal.monthlyAmount,
      duration: this.paymentPlanProposal.duration,
      startDate: new Date(this.paymentPlanProposal.startDate),
      status: 'pending',
      notes: this.paymentPlanProposal.notes
    };

    this.casesService.createPaymentProposal(proposal)
      .subscribe({
        next: () => {
          this.closePaymentPlanModal();
        },
        error: (error) => {
          console.error('Erreur lors de la soumission:', error);
        }
      });
  }
   isPaymentPlanValid(): boolean {
    return this.paymentPlanProposal.monthlyAmount > 0 &&
           this.paymentPlanProposal.duration > 0 &&
           this.paymentPlanProposal.startDate !== '' &&
           this.paymentPlanProposal.notes.trim() !== '';
  }
  closeDisputeModal() {
    this.showDisputeModal = false;
    this.selectedCase = null;
    this.disputeForm = {
      reason: '',
      description: '',
      attachments: []
    };
  }
   onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      if (file.size <= 10 * 1024 * 1024) { // 10MB max
        this.disputeForm.attachments.push(file);
      }
    });
  }
   formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  removeFile(index: number) {
    this.disputeForm.attachments.splice(index, 1);
  }
  submitDispute() {
    if (!this.selectedCase || !this.isDisputeValid()) return;

    this.isSubmittingDispute = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Simulation de l'envoi de contestation
    const disputeNote = {
      caseId: this.selectedCase.id,
      content: `Contestation déposée - Motif: ${this.disputeForm.reason} - Description: ${this.disputeForm.description}`,
      type: 'legal' as const,
      createdBy: currentUser.id,
      createdByName: `${currentUser.firstname} ${currentUser.lastname}`,
      isPrivate: false
    };

    this.casesService.addCaseNote(disputeNote).subscribe({
      next: () => {
        this.isSubmittingDispute = false;
        this.closeDisputeModal();
      },
      error: (error) => {
        console.error('Erreur lors de la contestation:', error);
        this.isSubmittingDispute = false;
      }
    });
  }
   isDisputeValid(): boolean {
    return this.disputeForm.reason !== '' && 
           this.disputeForm.description.trim() !== '';
  }
   getPenaltyTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'late_payment': 'Pénalité de retard',
      'breach': 'Pénalité de rupture',
      'administrative': 'Pénalité administrative'
    };
    return labels[type] || type;
  }



  // Ajout methode start
  loadData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCasesByUserId(currentUser.id, currentUser.role.name)
      .subscribe(cases => {
        this.cases = cases;
        this.extractDocuments();
      });
  }

  extractDocuments() {
    this.allDocuments = [];
    this.cases.forEach(case_ => {
      case_.documents.forEach(doc => {
        this.allDocuments.push({ ...doc, caseId: case_.id });
      });
    });
    this.filteredDocuments = [...this.allDocuments];
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
      doc.type === 'legal_notice' || doc.type === 'court_document'
    ).length;
  }

  getPaymentProofsCount(): number {
    return this.allDocuments.filter(doc => doc.type === 'payment_proof').length;
  }

  getCaseNumber(caseId: string): string {
    const case_ = this.cases.find(c => c.id === caseId);
    return case_?.caseNumber || 'N/A';
  }

  getDocumentTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'invoice': 'Facture',
      'contract': 'Contrat',
      'correspondence': 'Correspondance',
      'legal_notice': 'Mise en demeure',
      'payment_proof': 'Preuve de paiement',
      'court_document': 'Document judiciaire'
    };
    return labels[type] || type;
  }

  // formatDate(date: Date): string {
  //   return new Date(date).toLocaleDateString('fr-FR', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });
  // }

  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.selectedFile = file;
  //     if (!this.newDocument.name) {
  //       this.newDocument.name = file.name;
  //     }
  //   }
  // }

  isUploadValid(): boolean {
    return !!(this.newDocument.caseId && this.newDocument.type && this.newDocument.name && this.selectedFile);
  }

  uploadDocument() {
    if (!this.isUploadValid()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Simulation de l'upload
    const newDoc: CaseDocument & { caseId: string } = {
      id: Date.now().toString(),
      name: this.newDocument.name,
      type: this.newDocument.type as DocumentType,
      url: '#',
      uploadedAt: new Date(),
      uploadedBy: `${currentUser.username} ${currentUser.lastname}`,
      caseId: this.newDocument.caseId
    };

    this.allDocuments.unshift(newDoc);
    this.filterDocuments();
    this.closeUploadModal();

    console.log('Document ajouté:', newDoc);
  }

  viewDocument(doc: CaseDocument) {
    console.log('Visualisation du document:', doc.name);
    // TODO: Implémenter la visualisation
  }

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
  openDocumentsModal() {
    this.showDocumentsModal = true;
  }

  // Fonction pour fermer la modal des documents
  closeDocumentsModal() {
    this.showDocumentsModal = false;
  }


  // Ajout methode end


}
