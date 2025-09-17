import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseDocument, DocumentType } from '../../../models/case.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  cases: DebtCase[] = [];
  allDocuments: (CaseDocument & { caseId: string })[] = [];
  filteredDocuments: (CaseDocument & { caseId: string })[] = [];
  currentView: 'grid' | 'table' = 'grid';
  
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

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCasesByUserId(currentUser.id, currentUser.role)
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      uploadedBy: `${currentUser.firstName} ${currentUser.lastName}`,
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

  downloadDocument(doc: CaseDocument) {
    console.log('Téléchargement du document:', doc.name);
    // TODO: Implémenter le téléchargement
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
}