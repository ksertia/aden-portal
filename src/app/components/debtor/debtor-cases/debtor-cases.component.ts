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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface InterestDetail {
  type: string;
  rate: number;
  amount: number;
}

interface PenaltyDetail {
  type: string;
  date: string;
  amount: number;
}

interface ReminderHistory {
  type: string;
  description: string;
  date: string;
  status?: string;
  sentBy?: string;
}

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

  // Liste brute et filtrée pour pouvoir extraire le lastname, le firstname, l'email, le telephone et le type du débiteur (importer depuis AdminService)
  creditors: CreditorDetail[] = [];
  filteredCreditors: CreditorDetail[] = [];

  selectedcreditor: CreditorDetail | undefined;

   selectedIndex: number | null = null;
  // showCaseDetailsModal = false;

  showReminderHistoryModal = false;
  reminderHistory: ReminderHistory[] = [];


  constructor(private casesService: CaseService,
    private i18nService: I18nService,
    private authService: AuthService,
    private adminService: AdminService,
    private caseService: CaseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {

    this.loadTranslations();
    this.i18nService.currentLocale$.subscribe(() => {
    this.loadTranslations();
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
  // Lorsque le bouton "Détails" est cliqué
  viewDossierDetails(dossier: any): void {
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

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Élevée',
      'urgent': 'Urgente'
    };
    return labels[priority] || priority;
  }

  viewCaseDetails(index: number): void {
    this.selectedIndex = index;
    const dossier = this.filteredDossiers[index];
    this.selectedcreditor = this.getCreancierForDossier(dossier);
    this.showCaseDetailsModal = true;
  }
   downloadCaseReport(case_: DebtCase) {
    console.log('Télécharger rapport pour:', case_.caseNumber);
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
      [ActivityType.CORRESPONDENCE_SENT]: 'Correspondant'
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
    // if (!this.selectedCase || this.paymentAmount <= 0) return;

    // this.isProcessingPayment = true;

    // this.casesService.createPayment(this.selectedCase.id, this.paymentAmount)
    //   .subscribe({
    //     next: (updatedCase) => {
    //       const caseIndex = this.userCases.findIndex(c => c.id === updatedCase.id);
    //       if (caseIndex >= 0) {
    //         this.userCases[caseIndex] = updatedCase;
    //       }
    //       this.closePaymentModal();
    //     },
    //     error: (error) => {
    //       console.error('Erreur lors du paiement:', error);
    //       this.isProcessingPayment = false;
    //     }
    //   });
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

    // this.casesService.createPaymentProposal(proposal)
    //   .subscribe({
    //     next: () => {
    //       this.closePaymentPlanModal();
    //     },
    //     error: (error) => {
    //       console.error('Erreur lors de la soumission:', error);
    //     }
    //   });
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

    // this.casesService.addCaseNote(disputeNote).subscribe({
    //   next: () => {
    //     this.isSubmittingDispute = false;
    //     this.closeDisputeModal();
    //   },
    //   error: (error) => {
    //     console.error('Erreur lors de la contestation:', error);
    //     this.isSubmittingDispute = false;
    //   }
    // });
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
  
  calculateTotalInterests(dossier: any): number {
  // Tu peux adapter cette logique selon ta structure de données
  // Pour l'instant, retourne 0 ou calcule depuis les données du dossier
  return dossier.montantInterets || 0;
}

calculateTotalPenalties(dossier: any): number {
  // Calcul des pénalités totales
  return dossier.montantPenalites || 0;
}

calculateTotalFees(dossier: any): number {
  // Calcul des frais (dossier, juridiques, etc.)
  return dossier.montantFrais || 0;
}


calculateTotalDue(dossier: any): number {
  // Montant total à payer = Principal + Intérêts + Pénalités + Frais
  const principal = dossier.montantTotal || 0;
  const interests = this.calculateTotalInterests(dossier);
  const penalties = this.calculateTotalPenalties(dossier);
  const fees = this.calculateTotalFees(dossier);
  
  return principal + interests + penalties + fees;
}

// Méthode pour calculer le reste à payer (inclut tout : intérêts, pénalités, frais)
calculateRemainingAmount(dossier: any): number {
  const totalDue = this.calculateTotalDue(dossier);
  const paid = dossier.montantPaye || 0;
  return totalDue - paid;
}

// Version formatée du reste à payer (utilise celle-ci dans ton template)
getFormattedRemainingAmountWithDetails(dossier: any): string {
  const remaining = this.calculateRemainingAmount(dossier);
  return this.formatCurrency(remaining);
}


// Méthode pour obtenir le détail des intérêts
getInterestsDetail(dossier: any): InterestDetail[] {
  const totalInterests = dossier.montantInterets || 0;
  
  // Si ton backend envoie des détails, utilise-les
  // Sinon, voici une répartition par défaut (à adapter selon tes besoins)
  if (dossier.detailInterets && Array.isArray(dossier.detailInterets)) {
    return dossier.detailInterets;
  }
  
  // Répartition par défaut (tu peux ajuster les pourcentages)
  const details: InterestDetail[] = [];
  
  if (totalInterests > 0) {
    // Exemple : 40% intérêts légaux, 60% intérêts de retard
    details.push({
      type: 'Intérêts légaux',
      rate: 3.5, // Taux légal en %
      amount: totalInterests * 0.4
    });
    
    details.push({
      type: 'Intérêts de retard',
      rate: 10, // Taux contractuel en %
      amount: totalInterests * 0.6
    });
  }
  
  return details;
}

// Méthode pour obtenir le détail des pénalités
getPenaltiesDetail(dossier: any): PenaltyDetail[] {
  const totalPenalties = dossier.montantPenalites || 0;
  
  // Si ton backend envoie des détails
  if (dossier.detailPenalites && Array.isArray(dossier.detailPenalites)) {
    return dossier.detailPenalites;
  }
  
  // Sinon, crée un détail par défaut
  const details: PenaltyDetail[] = [];
  
  if (totalPenalties > 0) {
    details.push({
      type: 'Pénalité de retard',
      date: dossier.dateEcheance || dossier.dateCreation,
      amount: totalPenalties
    });
  }
  
  return details;
}

  // Formater la date
  formatDateShort(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // Ouvrir le tiroir des relances
  openReminderHistory(dossier: any): void {
    this.reminderHistory = this.getReminderHistoryForDossier(dossier);
    this.showReminderHistoryModal = true;
  }

  // Fermer le tiroir des relances
  closeReminderHistory(): void {
    this.showReminderHistoryModal = false;
    this.reminderHistory = [];
  }

  // Récupérer l'historique des relances pour un dossier
  getReminderHistoryForDossier(dossier: any): ReminderHistory[] {
    // Si ton backend envoie un historique
    if (dossier.historiqueRelances && Array.isArray(dossier.historiqueRelances)) {
      return dossier.historiqueRelances;
    }
    
    // Sinon, créer un historique par défaut basé sur les données disponibles
    const history: ReminderHistory[] = [];
    
    // Exemple : créer des relances basées sur la phase du dossier
    if (dossier.phaseCode === 'MISE_EN_DEMEURE') {
      history.push({
        type: 'Mise en demeure',
        description: 'Mise en demeure formelle envoyée au débiteur',
        date: dossier.dateCreation,
        status: 'Envoyée',
        sentBy: 'Système'
      });
    }
    
    if (dossier.commentaires) {
      history.push({
        type: 'Relance',
        description: dossier.commentaires,
        date: dossier.dateCreation,
        status: 'Envoyée',
        sentBy: dossier.createurUsername || 'Admin'
      });
    }
    
    // Si pas d'historique
    if (history.length === 0) {
      history.push({
        type: 'Information',
        description: 'Aucune relance enregistrée pour le moment',
        date: dossier.dateCreation,
        status: 'N/A'
      });
    }
    
    return history;
  }

  // Obtenir l'icône selon le type de relance
  getReminderIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Relance': 'email',
      'Mise en demeure': 'legal',
      'Appel téléphonique': 'phone',
      'Courrier': 'mail',
      'Information': 'info'
    };
    return icons[type] || 'email';
  }


  // Ajout methode start
  extractDocuments() {
    this.allDocuments = [];
    
    console.log('Début extraction des documents...');
    
    // Parcourir tous les dossiers pour extraire leurs documents
    this.dossiers.forEach(dossier => {
      console.log('Dossier:', dossier.numeroDossier, 'Documents:', dossier.documentsDebiteur?.myArrayList);
      
      // Vérifier si le dossier a des documents débiteur
      if (dossier.documentsDebiteur?.myArrayList && Array.isArray(dossier.documentsDebiteur.myArrayList)) {
        dossier.documentsDebiteur.myArrayList.forEach((doc: any) => {
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
    this.casesService.getDocumentContent(doc.id).subscribe({
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


  isUploadValid(): boolean {
    return !!(this.newDocument.caseId && this.newDocument.type && this.newDocument.name && this.selectedFile);
  }

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
}

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

  // Fonction pour fermer la modal des documents
  closeDocumentsModal() {
    this.showDocumentsModal = false;
  }


  // Ajout methode end
  // Méthode pour filtrer les documents du dossier sélectionné
  openDocumentsModal() {
    if (this.selectedDetailCase) {
      // Filtrer uniquement les documents du dossier sélectionné
      this.filteredDocuments = this.allDocuments.filter(
        doc => doc.caseId === this.selectedDetailCase.nodeId
      );
    } else {
      // Afficher tous les documents
      this.filteredDocuments = [...this.allDocuments];
    }
    this.showDocumentsModal = true;
  }

  // Compter les documents d'un dossier
  getDocumentsCount(dossier: any): number {
    if (!dossier) return 0;
    return dossier.documentsDebiteur?.myArrayList?.length || 0;
  }

}
