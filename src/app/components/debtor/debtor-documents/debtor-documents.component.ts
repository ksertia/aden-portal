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
  cases: DebtCase[] = [];
  allDocuments: (CaseDocument & { caseId: string })[] = [];
  filteredDocuments: (CaseDocument & { caseId: string })[] = [];
  
  searchTerm = '';
  selectedDocumentType = '';
  selectedCaseId = '';
  
  showViewModal = false;
  selectedDocument: CaseDocument | null = null;

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  // Charger les données initiales
  loadData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Utilisation du rôle utilisateur pour récupérer les dossiers
    this.caseService.getCasesByUserId(currentUser.id, currentUser.role.name)  // Utilisation de currentUser.role.name
      .subscribe(cases => {
        this.cases = cases;
        this.extractDocuments();
      });
  }

  // Extraire tous les documents des dossiers
  extractDocuments() {
    this.allDocuments = [];
    this.cases.forEach(case_ => {
      case_.documents.forEach(doc => {
        this.allDocuments.push({ ...doc, caseId: case_.id });
      });
    });
    this.filteredDocuments = [...this.allDocuments];
  }

  // Filtrer les documents en fonction de la recherche et des filtres
  filterDocuments() {
    this.filteredDocuments = this.allDocuments.filter(doc => {
      const matchesSearch = !this.searchTerm || 
        doc.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getDocumentTypeLabel(doc.type).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedDocumentType || doc.type === this.selectedDocumentType;
      const matchesCase = !this.selectedCaseId || doc.caseId === this.selectedCaseId;
      
      return matchesSearch && matchesType && matchesCase;
    });
  }

  // Récupérer le numéro de dossier
  getCaseNumber(caseId: string): string {
    const case_ = this.cases.find(c => c.id === caseId);
    return case_?.caseNumber || 'N/A';
  }

  // Récupérer l'étiquette pour un type de document
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
    this.selectedDocument = doc;
    this.showViewModal = true;
  }

  // Simuler le téléchargement du document
  downloadDocument(doc: CaseDocument) {
    console.log('Téléchargement du document:', doc.name);
    // TODO: Implémenter le téléchargement réel
  }

  // Fermer le modal de visualisation
  closeViewModal() {
    this.showViewModal = false;
    this.selectedDocument = null;
  }
}
