import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { DebtCase } from '../../../models/case.model';

@Component({
  selector: 'app-creditor-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './creditor-notifications.component.html',
  styleUrls: ['./creditor-notifications.component.css']
})
export class CreditorNotificationsComponent implements OnInit {
  notifications: any[] = [];
  filteredNotifications: any[] = [];
  
  selectedType = '';
  selectedStatus = '';
  selectedPeriod = 'all';
  
  showSettingsModal = false;
  showCaseDetailsModal = false;
  selectedCase: DebtCase | null = null;
  
  settings = {
    emailNotifications: {
      payments: true,
      legalActions: true,
      statusChanges: true,
      reminders: false
    },
    pushNotifications: {
      enabled: true,
      urgentOnly: false
    },
    reportFrequency: 'weekly'
  };

  constructor(
    private router: Router,
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    // Simulation de notifications
    this.notifications = [
      {
        id: '1',
        type: 'payment',
        title: 'Paiement reçu',
        message: 'Un paiement de 500€ a été reçu pour le dossier REC2024-001 (Jean Dupont)',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        actionUrl: '/creditor/cases/1'
      },
      {
        id: '2',
        type: 'legal',
        title: 'Action légale initiée',
        message: 'Une procédure judiciaire a été engagée pour le dossier REC2024-002',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        actionUrl: '/creditor/cases/2'
      },
      {
        id: '3',
        type: 'status',
        title: 'Changement de statut',
        message: 'Le dossier REC2024-003 est passé en négociation',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true,
        actionUrl: '/creditor/cases/3'
      },
      {
        id: '4',
        type: 'reminder',
        title: 'Relance envoyée',
        message: 'Une relance par email a été envoyée pour le dossier REC2024-004',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true,
        actionUrl: '/creditor/cases/4'
      },
      {
        id: '5',
        type: 'system',
        title: 'Rapport mensuel disponible',
        message: 'Votre rapport mensuel d\'activité est maintenant disponible au téléchargement',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        read: true,
        actionUrl: '/professional/reports'
      }
    ];
    
    this.filteredNotifications = [...this.notifications];
  }

  filterNotifications() {
    this.filteredNotifications = this.notifications.filter(notification => {
      const typeMatch = !this.selectedType || notification.type === this.selectedType;
      const statusMatch = !this.selectedStatus || 
        (this.selectedStatus === 'read' && notification.read) ||
        (this.selectedStatus === 'unread' && !notification.read);
      
      let periodMatch = true;
      if (this.selectedPeriod !== 'all') {
        const now = new Date();
        const notificationDate = new Date(notification.createdAt);
        
        switch (this.selectedPeriod) {
          case 'today':
            periodMatch = notificationDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            periodMatch = notificationDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            periodMatch = notificationDate >= monthAgo;
            break;
        }
      }
      
      return typeMatch && statusMatch && periodMatch;
    });
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.read);
  }

  markAsRead(notification: any) {
    if (!notification.read) {
      notification.read = true;
      // TODO: Appeler l'API pour marquer comme lu
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    // TODO: Appeler l'API pour marquer toutes comme lues
  }

  navigateToCase(notification: any) {
    // Marquer la notification comme lue
    this.markAsRead(notification);
    
    // Extraire l'ID du dossier depuis l'URL d'action
    if (notification.actionUrl && notification.actionUrl.includes('/creditor/cases/')) {
      const caseId = notification.actionUrl.split('/').pop();
      // Rediriger vers la page des créances avec le dossier sélectionné
      this.router.navigate(['/creditor/cases'], { 
        queryParams: { caseId: caseId },
        fragment: 'case-details'
      });
    } else {
      // Fallback vers la page des créances
      this.router.navigate(['/creditor/cases']);
    }
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

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'payment': 'Paiement',
      'legal': 'Légal',
      'reminder': 'Relance',
      'status': 'Statut',
      'system': 'Système'
    };
    return labels[type] || type;
  }

  closeSettingsModal() {
    this.showSettingsModal = false;
  }

  saveSettings() {
    // TODO: Sauvegarder les paramètres via l'API
    console.log('Paramètres sauvegardés:', this.settings);
    this.closeSettingsModal();
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  downloadCaseReport(case_: DebtCase) {
    console.log('Télécharger rapport pour:', case_.caseNumber);
    // TODO: Implémenter le téléchargement de rapport spécifique au dossier
  }
}