import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseStatus, Priority, ActivityType, PaymentProposal } from '../../../models/case.model';

@Component({
  selector: 'app-debtor-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './debtor-cases.component.html',
  styleUrls: ['./debtor-cases.component.css']
})
export class DebtorCasesComponent implements OnInit {
  userCases: DebtCase[] = [];
  statistics: any = null;
  
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

  disputeForm = {
    reason: '',
    description: '',
    attachments: [] as File[]
  };

  isSubmittingDispute = false;

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserCases();
    this.loadStatistics();
  }

  loadUserCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCasesByUserId(currentUser.id, currentUser.role)
      .subscribe(cases => {
        this.userCases = cases;
      });
  }

  loadStatistics() {
    this.caseService.getStatistics()
      .subscribe(stats => {
        this.statistics = stats;
      });
  }

  getTotalDebt(): number {
    return this.userCases.reduce((sum, case_) => sum + (case_.amount - case_.amountPaid), 0);
  }

  getTotalPaid(): number {
    return this.userCases.reduce((sum, case_) => sum + case_.amountPaid, 0);
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
      month: 'long',
      day: 'numeric'
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  getInterestTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'legal': 'Intérêts légaux',
      'contractual': 'Intérêts contractuels',
      'delay': 'Intérêts de retard'
    };
    return labels[type] || type;
  }

  getPenaltyTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'late_payment': 'Pénalité de retard',
      'breach': 'Pénalité de rupture',
      'administrative': 'Pénalité administrative'
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

  getReminderTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      [ActivityType.REMINDER_SENT]: 'Relance',
      [ActivityType.FORMAL_NOTICE_SENT]: 'Mise en demeure',
      [ActivityType.CORRESPONDENCE_SENT]: 'Correspondance'
    };
    return labels[type] || 'Communication';
  }

  getReminderIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      [ActivityType.REMINDER_SENT]: 'email',
      [ActivityType.FORMAL_NOTICE_SENT]: 'legal',
      [ActivityType.CORRESPONDENCE_SENT]: 'mail'
    };
    return classes[type] || 'email';
  }

  makePayment(case_: DebtCase) {
    this.selectedCase = case_;
    this.paymentAmount = 0;
    this.showPaymentModal = true;
  }

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

    this.caseService.createPayment(this.selectedCase.id, this.paymentAmount)
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

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  isPaymentPlanValid(): boolean {
    return this.paymentPlanProposal.monthlyAmount > 0 &&
           this.paymentPlanProposal.duration > 0 &&
           this.paymentPlanProposal.startDate !== '' &&
           this.paymentPlanProposal.notes.trim() !== '';
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

    this.caseService.createPaymentProposal(proposal)
      .subscribe({
        next: () => {
          this.closePaymentPlanModal();
        },
        error: (error) => {
          console.error('Erreur lors de la soumission:', error);
        }
      });
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

  removeFile(index: number) {
    this.disputeForm.attachments.splice(index, 1);
  }

  isDisputeValid(): boolean {
    return this.disputeForm.reason !== '' && 
           this.disputeForm.description.trim() !== '';
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
      createdByName: `${currentUser.firstName} ${currentUser.lastName}`,
      isPrivate: false
    };

    this.caseService.addCaseNote(disputeNote).subscribe({
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

  viewCaseDetails(case_: DebtCase) {
    console.log('Voir détails du dossier:', case_.caseNumber);
  }
}
