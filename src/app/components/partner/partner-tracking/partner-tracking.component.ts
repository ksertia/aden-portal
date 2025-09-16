import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerService } from '../../../services/partner.service';
import { AuthService } from '../../../services/auth.service';
import { PartnerUpdate, DebtCase } from '../../../models/case.model';

@Component({
  selector: 'app-partner-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-tracking.component.html',
  styleUrls: ['./partner-tracking.component.css']
})
export class PartnerTrackingComponent implements OnInit {
  allCededCases: DebtCase[] = [];
  allUpdates: PartnerUpdate[] = [];
  filteredUpdates: PartnerUpdate[] = [];
  
  selectedUpdateType = '';
  selectedCaseId = '';
  selectedPeriod = 'all';

  constructor(
    private partnerService: PartnerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.partnerService.getAssignedCases(currentUser.id).subscribe(cases => {
      this.allCededCases = cases;
    });

    this.partnerService.getPartnerUpdates().subscribe(updates => {
      this.allUpdates = updates;
      this.filteredUpdates = [...updates];
    });
  }

  filterUpdates() {
    this.filteredUpdates = this.allUpdates.filter(update => {
      const typeMatch = !this.selectedUpdateType || update.updateType === this.selectedUpdateType;
      const caseMatch = !this.selectedCaseId || update.caseId === this.selectedCaseId;
      
      let periodMatch = true;
      if (this.selectedPeriod !== 'all') {
        const now = new Date();
        const updateDate = new Date(update.createdAt);
        
        switch (this.selectedPeriod) {
          case 'today':
            periodMatch = updateDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            periodMatch = updateDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            periodMatch = updateDate >= monthAgo;
            break;
        }
      }
      
      return typeMatch && caseMatch && periodMatch;
    });
  }

  getCaseNumber(caseId: string): string {
    const case_ = this.allCededCases.find(c => c.id === caseId);
    return case_?.caseNumber || 'N/A';
  }

  getUpdateTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'payment_received': 'Paiement reçu',
      'status_change': 'Changement de statut',
      'action_taken': 'Action entreprise',
      'note_added': 'Note ajoutée'
    };
    return labels[type] || type;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return new Date(date).toLocaleDateString('fr-FR');
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}