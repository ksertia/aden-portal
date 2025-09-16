import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter, CaseNote } from '../../../models/case.model';

@Component({
  selector: 'app-bailiff-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bailiff-cases.component.html',
  styleUrls: ['./bailiff-cases.component.css']
})
export class BailiffCasesComponent implements OnInit {
  cases: DebtCase[] = [];
  filteredCases: DebtCase[] = [];
  statistics: any = null;
  
  filters: CaseFilter = {};
  selectedStatus = '';
  selectedPriority = '';
  
  showCreateModal = false;
  showNoteModal = false;
  selectedCase: DebtCase | null = null;
  
  newCase: any = {
    debtor: { firstName: '', lastName: '', email: '', type: 'individual' },
    creditor: { name: '' },
    amount: 0,
    status: CaseStatus.PENDING,
    priority: Priority.MEDIUM
  };
  
  newNote: Partial<CaseNote> = {
    content: '',
    type: 'call',
    isPrivate: false
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

    this.caseService.getCasesByUserId(currentUser.id, currentUser.role)
      .subscribe(cases => {
        this.cases = cases;
        this.applyFilters();
      });
  }

  loadStatistics() {
    this.caseService.getStatistics()
      .subscribe(stats => {
        this.statistics = stats;
      });
  }

  applyFilters() {
    this.caseService.getCasesWithFilter(this.filters)
      .subscribe(cases => {
        this.filteredCases = cases.filter(c => c.assignedBailiff === this.authService.getCurrentUser()?.id);
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

  resetFilters() {
    this.filters = {};
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.filteredCases = [...this.cases];
  }

  getSuccessRate(): number {
    const completedCases = this.filteredCases.filter(c => c.status === CaseStatus.COMPLETED).length;
    return this.filteredCases.length > 0 ? Math.round((completedCases / this.filteredCases.length) * 100) : 0;
  }

  getTotalRecovered(): number {
    return this.filteredCases.reduce((sum, c) => sum + c.amountPaid, 0);
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

  editCase(case_: DebtCase) {
    console.log('Modifier le dossier:', case_.caseNumber);
    // TODO: Implémenter l'édition
  }

  addNote(case_: DebtCase) {
    this.selectedCase = case_;
    this.newNote = {
      content: '',
      type: 'call',
      isPrivate: false
    };
    this.showNoteModal = true;
  }

  viewCaseDetails(case_: DebtCase) {
    console.log('Voir détails du dossier:', case_.caseNumber);
    // TODO: Implémenter la vue détaillée
  }

  createCase() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const caseData = {
      ...this.newCase,
      assignedBailiff: currentUser.id,
      amountPaid: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    };

    this.caseService.createCase(caseData).subscribe({
      next: (newCase) => {
        this.cases.push(newCase);
        this.applyFilters();
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
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
        // TODO: Rafraîchir les données du dossier
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de la note:', error);
      }
    });
  }

  generateReport() {
    this.caseService.generateReport(this.filters).subscribe({
      next: (report) => {
        console.log('Rapport généré:', report);
        // TODO: Télécharger le rapport
      },
      error: (error) => {
        console.error('Erreur lors de la génération du rapport:', error);
      }
    });
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newCase = {
      debtor: { firstName: '', lastName: '', email: '', type: 'individual' },
      creditor: { name: '' },
      amount: 0,
      status: CaseStatus.PENDING,
      priority: Priority.MEDIUM
    };
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.selectedCase = null;
  }
}