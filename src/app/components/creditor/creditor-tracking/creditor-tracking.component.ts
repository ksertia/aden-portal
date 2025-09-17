import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase, CaseStatus } from '../../../models/case.model';

@Component({
  selector: 'app-creditor-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creditor-tracking.component.html',
  styleUrls: ['./creditor-tracking.component.css']
})
export class CreditorTrackingComponent implements OnInit {
  trackedCases: DebtCase[] = [];
  recentActivities: any[] = [];
  statusDistribution: any[] = [];
  monthlyRecovered = 0;
  averageRecoveryTime = 45;

  constructor(
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTrackingData();
    this.loadRecentActivities();
    this.calculateStatusDistribution();
  }

  loadTrackingData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.caseService.getCases().subscribe(cases => {
      this.trackedCases = cases.filter(c => 
        c.creditor.name === currentUser.companyName || 
        c.creditor.contactPerson === `${currentUser.firstName} ${currentUser.lastName}`
      );
      
      this.monthlyRecovered = this.trackedCases.reduce((sum, c) => sum + c.amountPaid, 0);
    });
  }

  loadRecentActivities() {
    // Simulation d'activités récentes
    this.recentActivities = [
      {
        type: 'payment',
        description: 'Paiement reçu de 500€ - Dossier REC2024-001',
        date: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
      },
      {
        type: 'reminder',
        description: 'Relance envoyée - Dossier REC2024-002',
        date: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        type: 'status',
        description: 'Statut modifié vers "Négociation" - Dossier REC2024-003',
        date: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      },
      {
        type: 'legal',
        description: 'Mise en demeure envoyée - Dossier REC2024-004',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      }
    ];
  }

  calculateStatusDistribution() {
    const statusCounts = this.trackedCases.reduce((acc, case_) => {
      acc[case_.status] = (acc[case_.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const total = this.trackedCases.length;
    
    this.statusDistribution = Object.entries(statusCounts).map(([key, count]) => ({
      key,
      label: this.getStatusLabel(key),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  getPaymentPercentage(case_: DebtCase): number {
    return Math.round((case_.amountPaid / case_.amount) * 100);
  }

  getRecentEvents(case_: DebtCase) {
    return case_.history.slice(-3).reverse();
  }

  getNextActions(case_: DebtCase): string[] {
    const actions = [];
    
    switch (case_.status) {
      case CaseStatus.PENDING:
        actions.push('Assignation à un huissier');
        break;
      case CaseStatus.ACTIVE:
        actions.push('Prochaine relance prévue');
        actions.push('Suivi téléphonique');
        break;
      case CaseStatus.NEGOTIATION:
        actions.push('Validation de l\'accord');
        break;
      case CaseStatus.LEGAL_ACTION:
        actions.push('Suivi procédure judiciaire');
        break;
    }
    
    return actions;
  }

  getActivityIconClass(type: string): string {
    return type;
  }

  getEventClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'payment_received': 'payment',
      'reminder_sent': 'reminder',
      'status_changed': 'status',
      'formal_notice_sent': 'legal'
    };
    return typeMap[type] || 'status';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else {
      return this.formatDate(date);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  refreshData() {
    this.loadTrackingData();
    this.loadRecentActivities();
    this.calculateStatusDistribution();
  }
}