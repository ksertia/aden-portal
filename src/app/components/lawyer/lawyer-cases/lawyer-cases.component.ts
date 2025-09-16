import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter, CaseNote } from '../../../models/case.model';

@Component({
  selector: 'app-lawyer-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lawyer-cases.component.html',
  styleUrls: ['./lawyer-cases.component.css']
})
export class LawyerCasesComponent implements OnInit {
  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  statistics: any = null;
  
  filters: CaseFilter = {};
  selectedStatus = '';
  selectedPriority = '';
  dateFrom = '';
  dateTo = '';
  
  showReviewModal = false;
  showNoteModal = false;
  selectedCase: DebtCase | null = null;
  
  legalReview = {
    recommendation: '',
    analysis: '',
    nextSteps: ''
  };
  
  newNote: Partial<CaseNote> = {
    content: '',
    type: 'legal',
    isPrivate: true
  };

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCases();
    this.loadStatistics();
  }

  loadCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCases().subscribe(cases => {
      this.cases = cases;
      this.applyFilters();
    });
  }

  loadStatistics() {
    this.caseService.getStatistics().subscribe(stats => {
      this.statistics = stats;
    });
  }

  applyFilters() {
    this.caseService.getCasesWithFilter(this.filters).subscribe(cases => {
      this.filteredCases = cases;
    });
  }

  updateStatusFilter() {
    this.filters.status = this.selectedStatus ? [this.selectedStatus as CaseStatus] : undefined;
    this.applyFilters();
  }

  updatePriorityFilter() {
    this.filters.priority = this.selectedPriority ? [this.selectedPriority as Priority] : undefined;
    this.applyFilters();
  }

  updateDateFilter() {
    this.filters.dateFrom = this.dateFrom ? new Date(this.dateFrom) : undefined;
    this.filters.dateTo = this.dateTo ? new Date(this.dateTo) : undefined;
    this.applyFilters();
  }

  resetFilters() {
    this.filters = {};
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.filteredCases = [...this.cases];
  }

  getLegalActionCases(): number {
    return this.filteredCases.filter(c => c.status === CaseStatus.LEGAL_ACTION).length;
  }

  getSuccessRate(): number {
    const completedCases = this.filteredCases.filter(c => c.status === CaseStatus.COMPLETED).length;
    return this.filteredCases.length > 0 ? Math.round((completedCases / this.filteredCases.length) * 100) : 0;
  }

  getPaymentPercentage(case_: DebtCase): number {
    return Math.round((case_.amountPaid / case_.amount) * 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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
      'closed': 'Fermé'
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

  reviewCase(case_: DebtCase) {
    this.selectedCase = case_;
    this.legalReview = {
      recommendation: '',
      analysis: '',
      nextSteps: ''
    };
    this.showReviewModal = true;
  }

  addLegalNote(case_: DebtCase) {
    this.selectedCase = case_;
    this.newNote = {
      content: '',
      type: 'legal',
      isPrivate: true
    };
    this.showNoteModal = true;
  }

  saveLegalReview() {
    if (!this.selectedCase || !this.legalReview.analysis.trim()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const noteContent = `Révision juridique:\n\nRecommandation: ${this.legalReview.recommendation}\n\nAnalyse: ${this.legalReview.analysis}\n\nProchaines étapes: ${this.legalReview.nextSteps}`;

    const noteData = {
      caseId: this.selectedCase.id,
      content: noteContent,
      type: 'legal' as const,
      createdBy: currentUser.id,
      createdByName: `${currentUser.firstName} ${currentUser.lastName}`,
      isPrivate: true
    };

    this.caseService.addCaseNote(noteData).subscribe({
      next: () => {
        this.closeReviewModal();
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    });
  }

  saveNote() {
    if (!this.selectedCase || !this.newNote.content?.trim()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const noteData = {
      caseId: this.selectedCase.id,
      content: this.newNote.content!,
      type: this.newNote.type as CaseNote['type'],
      createdBy: currentUser.id,
      createdByName: `${currentUser.firstName} ${currentUser.lastName}`,
      isPrivate: this.newNote.isPrivate || false
    };

    this.caseService.addCaseNote(noteData).subscribe({
      next: () => {
        this.closeNoteModal();
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de la note:', error);
      }
    });
  }

  generateReport() {
    this.caseService.generateReport(this.filters).subscribe({
      next: (report) => {
        console.log('Rapport d\'activité généré:', report);
        // TODO: Télécharger le rapport
      },
      error: (error) => {
        console.error('Erreur lors de la génération du rapport:', error);
      }
    });
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.selectedCase = null;
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.selectedCase = null;
  }
}
