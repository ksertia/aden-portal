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
    
    // Vérifier si on doit ouvrir un dossier spécifique depuis les notifications
    // this.route.queryParams.subscribe(params => {
    //   if (params['caseId']) {
    //     this.openCaseFromNotification(params['caseId']);
    //   }
    // });

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
      return this.debiteurs.find(d => d.nodeId === dossier.debiteurNodeId);
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

  viewCaseDetails(index: number): void {
    this.selectedIndex = index;
    const dossier = this.filteredDossiers[index];
    this.selectedDebtor = this.getDebiteurForDossier(dossier);
    console.log("selectedDebtor", this.selectedDebtor);
    this.showDrawer  = true;
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

  downloadDocument(doc: any) {
    console.log('Télécharger document:', doc.name);
    // TODO: Implémenter le téléchargement de document
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
  loadData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.casesService.getCasesByUserId(currentUser.id, currentUser.role.name)
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
      uploadedBy: `${currentUser.firstname} ${currentUser.lastname}`,
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