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
  template: `
    <div class="notifications-container">
      <div class="notifications-header fade-in-up">
        <div class="header-content">
          <div>
            <h1>Notifications</h1>
            <p>Recevez des alertes sur l'évolution de vos dossiers</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" (click)="markAllAsRead()" *ngIf="hasUnreadNotifications()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
              Tout marquer comme lu
            </button>
            <button class="btn btn-primary" (click)="showSettingsModal = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
              </svg>
              Paramètres
            </button>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-section fade-in-up">
        <div class="filters-card">
          <div class="filters-grid">
            <div class="filter-group">
              <label>Type de notification</label>
              <select [(ngModel)]="selectedType" (change)="filterNotifications()">
                <option value="">Tous les types</option>
                <option value="payment">Paiements</option>
                <option value="legal">Actions légales</option>
                <option value="reminder">Relances</option>
                <option value="status">Changements de statut</option>
                <option value="system">Système</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Statut</label>
              <select [(ngModel)]="selectedStatus" (change)="filterNotifications()">
                <option value="">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Période</label>
              <select [(ngModel)]="selectedPeriod" (change)="filterNotifications()">
                <option value="all">Toutes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des notifications -->
      <div class="notifications-content fade-in-up">
        <div class="notifications-list" *ngIf="filteredNotifications.length > 0; else noNotifications">
          <div class="notification-item" 
               *ngFor="let notification of filteredNotifications"
               [ngClass]="{'unread': !notification.read}"
               (click)="markAsRead(notification)">
            <div class="notification-icon" [ngClass]="'icon-' + notification.type">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path *ngIf="notification.type === 'payment'" d="M9 12l2 2 4-4"/>
                <circle *ngIf="notification.type === 'payment'" cx="12" cy="12" r="9"/>
                <path *ngIf="notification.type === 'legal'" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line *ngIf="notification.type === 'legal'" x1="12" y1="9" x2="12" y2="13"/>
                <line *ngIf="notification.type === 'legal'" x1="12" y1="17" x2="12.01" y2="17"/>
                <path *ngIf="notification.type === 'reminder'" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path *ngIf="notification.type === 'reminder'" d="M13.73 21a2 2 0 0 1-3.46 0"/>
                <path *ngIf="notification.type === 'status'" d="M12 2v6l3-3 3 3"/>
                <path *ngIf="notification.type === 'status'" d="M12 8v8"/>
                <path *ngIf="notification.type === 'status'" d="m8 14 4 4 4-4"/>
                <circle *ngIf="notification.type === 'system'" cx="12" cy="12" r="3"/>
                <path *ngIf="notification.type === 'system'" d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
              </svg>
            </div>
            
            <div class="notification-content">
              <div class="notification-header">
                <h3>{{ notification.title }}</h3>
                <div class="notification-meta">
                  <span class="notification-time">{{ getTimeAgo(notification.createdAt) }}</span>
                  <span class="notification-type-badge" [ngClass]="'type-' + notification.type">
                    {{ getTypeLabel(notification.type) }}
                  </span>
                </div>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
              <div class="notification-actions" *ngIf="notification.actionUrl">
                <a (click)="navigateToCase(notification)" class="notification-link">
                  Voir le dossier
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M7 17L17 7"/>
                    <path d="M7 7h10v10"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div class="notification-status" *ngIf="!notification.read">
              <div class="unread-dot"></div>
            </div>
          </div>
        </div>

        <ng-template #noNotifications>
          <div class="no-notifications">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <h3>Aucune notification</h3>
            <p>Vous n'avez aucune notification correspondant aux critères sélectionnés.</p>
          </div>
        </ng-template>
      </div>

      <!-- Modal paramètres -->
      <div class="modal-overlay" *ngIf="showSettingsModal" (click)="closeSettingsModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Paramètres de notification</h3>
            <button class="modal-close" (click)="closeSettingsModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="settings-form">
              <div class="settings-section">
                <h4>Notifications par email</h4>
                <div class="setting-item">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings.emailNotifications.payments">
                    <span class="checkmark"></span>
                    Paiements reçus
                  </label>
                </div>
                <div class="setting-item">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings.emailNotifications.legalActions">
                    <span class="checkmark"></span>
                    Actions légales
                  </label>
                </div>
                <div class="setting-item">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings.emailNotifications.statusChanges">
                    <span class="checkmark"></span>
                    Changements de statut
                  </label>
                </div>
                <div class="setting-item">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings.emailNotifications.reminders">
                    <span class="checkmark"></span>
                    Relances envoyées
                  </label>
                </div>
              </div>
              
              <div class="settings-section">
                <h4>Notifications push</h4>
                <div class="setting-item">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings.pushNotifications.enabled">
                    <span class="checkmark"></span>
                    Activer les notifications push
                  </label>
                </div>
                <div class="setting-item" *ngIf="settings.pushNotifications.enabled">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings.pushNotifications.urgentOnly">
                    <span class="checkmark"></span>
                    Notifications urgentes uniquement
                  </label>
                </div>
              </div>
              
              <div class="settings-section">
                <h4>Fréquence des rapports</h4>
                <div class="setting-item">
                  <label>Rapport périodique</label>
                  <select [(ngModel)]="settings.reportFrequency">
                    <option value="none">Aucun</option>
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeSettingsModal()">Annuler</button>
            <button class="btn btn-primary" (click)="saveSettings()">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notifications-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .notifications-header p {
      font-size: 16px;
      color: var(--text-secondary);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .filters-section {
      margin-bottom: 32px;
    }

    .filters-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .filter-group label {
      display: block;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .filter-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 14px;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .notification-item {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: var(--surface);
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .notification-item:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .notification-item.unread {
      border-left: 4px solid var(--primary);
      background: #eff6ff;
    }

    .notification-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .notification-icon.icon-payment { background: var(--success); }
    .notification-icon.icon-legal { background: var(--error); }
    .notification-icon.icon-reminder { background: var(--warning); }
    .notification-icon.icon-status { background: var(--primary); }
    .notification-icon.icon-system { background: #6b7280; }

    .notification-content {
      flex: 1;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .notification-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notification-time {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .notification-type-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .notification-type-badge.type-payment { background: #d1fae5; color: #065f46; }
    .notification-type-badge.type-legal { background: #fee2e2; color: #991b1b; }
    .notification-type-badge.type-reminder { background: #fef3c7; color: #92400e; }
    .notification-type-badge.type-status { background: #dbeafe; color: #1e40af; }
    .notification-type-badge.type-system { background: #f3f4f6; color: #374151; }

    .notification-message {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .notification-actions {
      margin-top: 12px;
    }

    .notification-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }

    .notification-link:hover {
      text-decoration: underline;
    }

    .notification-status {
      display: flex;
      align-items: flex-start;
      padding-top: 4px;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
    }

    .no-notifications {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-secondary);
    }

    .no-notifications svg {
      margin-bottom: 24px;
      color: var(--text-secondary);
    }

    .no-notifications h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    .modal-content {
      background: var(--surface);
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      animation: slideInUp 0.3s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
    }

    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
    }

    .modal-body {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .settings-section {
      margin-bottom: 32px;
    }

    .settings-section h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }

    .setting-item {
      margin-bottom: 16px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      font-size: 14px;
      color: var(--text);
    }

    .setting-item label:not(.checkbox-label) {
      display: block;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .setting-item select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 14px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid var(--border);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .notifications-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .notification-item {
        flex-direction: column;
        gap: 12px;
      }

      .notification-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
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