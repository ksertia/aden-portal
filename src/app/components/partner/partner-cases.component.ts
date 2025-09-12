import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../services/partner.service';
import { AuthService } from '../../services/auth.service';
import { DebtCase, CaseStatus, Priority, CaseFilter, PartnerUpdate } from '../../models/case.model';

@Component({
  selector: 'app-partner-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-cases.component.html',
  styleUrls: ['./partner-cases.component.css']
})
export class PartnerCasesComponent implements OnInit {
  assignedCases: DebtCase[] = [];
  statistics: any = null;
  
  showStatusModal = false;
  showPaymentModal = false;
  showNoteModal = false;
  showDetailsModal = false;
  selectedCase: DebtCase | null = null;
  
  statusUpdate = {
    newStatus: CaseStatus.ACTIVE,
    description: ''
  };
  
  paymentUpdate = {
    amount: 0,
    description: ''
  };
  
  noteUpdate = {
    type: 'action_taken' as 'action_taken' | 'note_added',
    content: ''
  };

  constructor(
    private partnerService: PartnerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAssignedCases();
    this.loadStatistics();
  }

  loadAssignedCases() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.partnerService.getAssignedCases(currentUser.id).subscribe(cases => {
      this.assignedCases = cases;
    });
  }

  loadStatistics() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.partnerService.getPartnerStatistics(currentUser.id).subscribe(stats => {
      this.statistics = stats;
    });
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

  updateCaseStatus(case_: DebtCase) {
    this.selectedCase = case_;
    this.statusUpdate = {
      newStatus: case_.status,
      description: ''
    };
    this.showStatusModal = true;
  }

  recordPayment(case_: DebtCase) {
    this.selectedCase = case_;
    this.paymentUpdate = {
      amount: 0,
      description: ''
    };
    this.showPaymentModal = true;
  }

  addNote(case_: DebtCase) {
    this.selectedCase = case_;
    this.noteUpdate = {
      type: 'action_taken',
      content: ''
    };
    this.showNoteModal = true;
  }

  viewCaseDetails(case_: DebtCase) {
    this.selectedCase = case_;
    this.showDetailsModal = true;
  }

  saveStatusUpdate() {
    if (!this.selectedCase || !this.statusUpdate.description.trim()) return;

    this.partnerService.updateCaseStatus(
      this.selectedCase.id,
      this.statusUpdate.newStatus,
      this.statusUpdate.description
    ).subscribe({
      next: (updatedCase) => {
        const caseIndex = this.assignedCases.findIndex(c => c.id === updatedCase.id);
        if (caseIndex >= 0) {
          this.assignedCases[caseIndex] = updatedCase;
        }
        this.closeStatusModal();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
      }
    });
  }

  savePayment() {
    if (!this.selectedCase || this.paymentUpdate.amount <= 0) return;

    this.partnerService.recordPayment(
      this.selectedCase.id,
      this.paymentUpdate.amount,
      this.paymentUpdate.description
    ).subscribe({
      next: (updatedCase) => {
        const caseIndex = this.assignedCases.findIndex(c => c.id === updatedCase.id);
        if (caseIndex >= 0) {
          this.assignedCases[caseIndex] = updatedCase;
        }
        this.loadStatistics(); // Recharger les stats pour les commissions
        this.closePaymentModal();
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement:', error);
      }
    });
  }

  saveNote() {
    if (!this.selectedCase || !this.noteUpdate.content.trim()) return;

    this.partnerService.addPartnerNote(
      this.selectedCase.id,
      this.noteUpdate.content,
      this.noteUpdate.type
    ).subscribe({
      next: () => {
        this.closeNoteModal();
        // Recharger les données pour voir la nouvelle note
        this.loadAssignedCases();
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de la note:', error);
      }
    });
  }

  generatePartnerReport() {
    console.log('Génération du rapport d\'activité partenaire');
    // TODO: Implémenter la génération de rapport
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedCase = null;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedCase = null;
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.selectedCase = null;
  }

  getActivityClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'payment_received': 'payment',
      'reminder_sent': 'reminder',
      'status_changed': 'status',
      'formal_notice_sent': 'legal',
      'legal_action_initiated': 'legal',
      'case_ceded': 'cession',
      'partner_update': 'partner'
    };
    return typeMap[type] || 'status';
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedCase = null;
  }

  downloadDocument(doc: any) {
    console.log('Télécharger document:', doc.name);
    // TODO: Implémenter le téléchargement
  }

  viewDocument(doc: any) {
    console.log('Visualiser document:', doc.name);
    // TODO: Implémenter la visualisation
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
}