import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewToggleComponent } from '../../shared/view-toggle/view-toggle.component';
import { CedantService } from '../../../services/cedant.service';
import { AuthService } from '../../../services/auth.service';
import { CedantInvoice, InvoiceStatus, CedantPortfolio } from '../../../models/case.model';

@Component({
  selector: 'app-cedant-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent],
  template: `
    <div class="invoices-container">
      <div class="invoices-header fade-in-up">
        <div class="header-content">
          <div>
            <h1>Suivi des Factures</h1>
            <p>Gérez et suivez toutes vos factures clients</p>
          </div>
          <button class="btn btn-primary" (click)="showCreateModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouvelle facture
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-section fade-in-up">
        <div class="filters-card">
          <div class="filters-grid">
            <div class="filter-group">
              <label>Recherche</label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Numéro, débiteur..."
                (input)="filterInvoices()"
              >
            </div>
            
            <div class="filter-group">
              <label>Statut</label>
              <select [(ngModel)]="selectedStatus" (change)="filterInvoices()">
                <option value="">Tous les statuts</option>
                <option value="unpaid">Impayée</option>
                <option value="partially_paid">Partiellement payée</option>
                <option value="paid">Payée</option>
                <option value="overdue">En retard</option>
                <option value="disputed">Contestée</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Portefeuille</label>
              <select [(ngModel)]="selectedPortfolioId" (change)="filterInvoices()">
                <option value="">Tous les portefeuilles</option>
                <option *ngFor="let portfolio of portfolios" [value]="portfolio.id">
                  {{ portfolio.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-section fade-in-up">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ filteredInvoices.length }}</div>
              <div class="stat-label">Factures totales</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ getOverdueCount() }}</div>
              <div class="stat-label">Factures en retard</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(getTotalAmount()) }}</div>
              <div class="stat-label">Montant total</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ getPaymentRate() }}%</div>
              <div class="stat-label">Taux de paiement</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des factures -->
      <div class="invoices-content fade-in-up">
        <div class="invoices-list" *ngIf="filteredInvoices.length > 0; else noInvoices">
          <div class="list-header">
            <h3>Factures ({{ filteredInvoices.length }})</h3>
            <app-view-toggle 
              [currentView]="currentView" 
              (viewChange)="currentView = $event">
            </app-view-toggle>
          </div>
          
          <!-- Vue grille -->
          <div class="invoices-grid" *ngIf="currentView === 'grid'">
            <div class="invoice-card" *ngFor="let invoice of filteredInvoices">
              <div class="invoice-header">
                <div class="invoice-info">
                  <h3>{{ invoice.invoiceNumber }}</h3>
                  <p class="debtor-name">{{ invoice.debtorName }}</p>
                </div>
                <span class="status-badge" [ngClass]="'status-' + invoice.status">
                  {{ getStatusLabel(invoice.status) }}
                </span>
              </div>
              
              <div class="invoice-body">
                <div class="invoice-details">
                  <div class="detail-row">
                    <span class="label">Montant :</span>
                    <span class="value amount">{{ formatCurrency(invoice.amount) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Date d'émission :</span>
                    <span class="value">{{ formatDate(invoice.issueDate) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Date d'échéance :</span>
                    <span class="value" [ngClass]="{'overdue': isOverdue(invoice)}">{{ formatDate(invoice.dueDate) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Description :</span>
                    <span class="value">{{ invoice.description }}</span>
                  </div>
                </div>
                
                <div class="invoice-actions">
                  <button class="btn btn-primary small" (click)="viewInvoiceDetails(invoice)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Détails
                  </button>
                  <button class="btn btn-secondary small" (click)="editInvoice(invoice)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifier
                  </button>
                  <button class="btn btn-warning small" (click)="deleteInvoice(invoice)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Vue tableau -->
          <div class="invoices-table-container" *ngIf="currentView === 'table'">
            <table class="invoices-table">
              <thead>
                <tr>
                  <th>Facture</th>
                  <th>Débiteur</th>
                  <th>Montant</th>
                  <th>Émission</th>
                  <th>Échéance</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let invoice of filteredInvoices" class="invoice-row">
                  <td>
                    <div class="invoice-cell">
                      <div class="invoice-number">{{ invoice.invoiceNumber }}</div>
                      <div class="invoice-description">{{ invoice.description }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="debtor-cell">
                      <div class="debtor-name">{{ invoice.debtorName }}</div>
                      <div class="debtor-email">{{ invoice.debtorEmail }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="amount-cell">
                      <div class="amount-value">{{ formatCurrency(invoice.amount) }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="date-cell">{{ formatDate(invoice.issueDate) }}</div>
                  </td>
                  <td>
                    <div class="date-cell" [ngClass]="{'overdue': isOverdue(invoice)}">
                      {{ formatDate(invoice.dueDate) }}
                    </div>
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="'status-' + invoice.status">
                      {{ getStatusLabel(invoice.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="btn btn-primary small" (click)="viewInvoiceDetails(invoice)" title="Voir détails">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button class="btn btn-secondary small" (click)="editInvoice(invoice)" title="Modifier">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ng-template #noInvoices>
          <div class="no-invoices">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <h3>Aucune facture trouvée</h3>
            <p>Commencez par ajouter vos factures clients pour les suivre.</p>
            <button class="btn btn-primary" (click)="showCreateModal = true">
              Ajouter une facture
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Modal création de facture -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="closeCreateModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Ajouter une nouvelle facture</h3>
            <button class="modal-close" (click)="closeCreateModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="create-form">
              <div class="form-section">
                <h4>Informations de la facture</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>Numéro de facture</label>
                    <input type="text" [(ngModel)]="newInvoice.invoiceNumber" placeholder="INV-2024-001">
                  </div>
                  <div class="form-group">
                    <label>Portefeuille</label>
                    <select [(ngModel)]="newInvoice.portfolioId">
                      <option value="">Sélectionner un portefeuille</option>
                      <option *ngFor="let portfolio of portfolios" [value]="portfolio.id">
                        {{ portfolio.name }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Montant</label>
                    <input type="number" [(ngModel)]="newInvoice.amount" min="1" step="0.01">
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="newInvoice.status">
                      <option value="unpaid">Impayée</option>
                      <option value="partially_paid">Partiellement payée</option>
                      <option value="paid">Payée</option>
                      <option value="overdue">En retard</option>
                      <option value="disputed">Contestée</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Date d'émission</label>
                    <input type="date" [(ngModel)]="newInvoice.issueDate">
                  </div>
                  <div class="form-group">
                    <label>Date d'échéance</label>
                    <input type="date" [(ngModel)]="newInvoice.dueDate">
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Description</label>
                  <textarea
                    [(ngModel)]="newInvoice.description"
                    rows="3"
                    placeholder="Description des services ou produits facturés..."
                  ></textarea>
                </div>
              </div>
              
              <div class="form-section">
                <h4>Informations du débiteur</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>Nom du débiteur</label>
                    <input type="text" [(ngModel)]="newInvoice.debtorName" placeholder="Nom de l'entreprise ou du client">
                  </div>
                  <div class="form-group">
                    <label>Email du débiteur</label>
                    <input type="email" [(ngModel)]="newInvoice.debtorEmail" placeholder="contact@client.fr">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeCreateModal()">Annuler</button>
            <button class="btn btn-primary" (click)="createInvoice()" [disabled]="!isCreateFormValid()">
              Ajouter la facture
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invoices-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .invoices-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .invoices-header p {
      font-size: 16px;
      color: var(--text-secondary);
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

    .filter-group input,
    .filter-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 14px;
    }

    .stats-section {
      margin-bottom: 32px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-icon.primary { background: var(--primary); }
    .stat-icon.success { background: var(--success); }
    .stat-icon.warning { background: var(--warning); }
    .stat-icon.info { background: #3b82f6; }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .list-header h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
    }

    .invoices-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .invoice-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      transition: all 0.2s ease;
    }

    .invoice-card:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .invoice-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .debtor-name {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .invoice-details {
      margin-bottom: 20px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .value {
      font-size: 14px;
      color: var(--text);
    }

    .value.amount {
      font-weight: 600;
      color: var(--primary);
    }

    .value.overdue {
      color: var(--error);
      font-weight: 600;
    }

    .invoice-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn.small {
      padding: 6px 12px;
      font-size: 12px;
    }

    .invoices-table-container {
      background: var(--surface);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .invoices-table {
      width: 100%;
      border-collapse: collapse;
    }

    .invoices-table th {
      background: #f8fafc;
      padding: 16px 12px;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    .invoices-table td {
      padding: 16px 12px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .invoice-row:hover {
      background: #f8fafc;
    }

    .invoice-cell, .debtor-cell, .amount-cell {
      display: flex;
      flex-direction: column;
    }

    .invoice-number, .debtor-name {
      font-weight: 600;
      color: var(--text);
      font-size: 14px;
      margin-bottom: 2px;
    }

    .invoice-description, .debtor-email {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .amount-cell .amount-value {
      font-weight: 600;
      font-size: 14px;
      color: var(--primary);
    }

    .date-cell {
      font-size: 14px;
      color: var(--text);
    }

    .date-cell.overdue {
      color: var(--error);
      font-weight: 600;
    }

    .table-actions {
      display: flex;
      gap: 4px;
    }

    .status-unpaid { background: #fee2e2; color: #991b1b; }
    .status-partially_paid { background: #fef3c7; color: #92400e; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-overdue { background: #fecaca; color: #7f1d1d; }
    .status-disputed { background: #fdf2f8; color: #be185d; }

    .no-invoices {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-secondary);
    }

    .no-invoices svg {
      margin-bottom: 24px;
      color: var(--text-secondary);
    }

    .no-invoices h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .no-invoices p {
      margin-bottom: 24px;
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

    .modal-content.large {
      max-width: 800px;
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

    .form-section {
      margin-bottom: 24px;
    }

    .form-section h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 6px;
      font-size: 14px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
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

    @media (max-width: 1024px) {
      .invoices-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .invoices-container {
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

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .invoices-table-container {
        overflow-x: auto;
      }

      .invoices-table {
        min-width: 700px;
      }
    }
  `]
})
export class CedantInvoicesComponent implements OnInit {
  invoices: CedantInvoice[] = [];
  filteredInvoices: CedantInvoice[] = [];
  portfolios: CedantPortfolio[] = [];
  currentView: 'grid' | 'table' = 'grid';
  
  searchTerm = '';
  selectedStatus = '';
  selectedPortfolioId = '';
  
  showCreateModal = false;
  
  newInvoice = {
    portfolioId: '',
    invoiceNumber: '',
    debtorName: '',
    debtorEmail: '',
    amount: 0,
    issueDate: '',
    dueDate: '',
    status: InvoiceStatus.UNPAID,
    description: ''
  };

  constructor(
    private cedantService: CedantService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.cedantService.getPortfolios(currentUser.id).subscribe(portfolios => {
      this.portfolios = portfolios;
    });

    this.cedantService.getInvoices().subscribe(invoices => {
      this.invoices = invoices;
      this.filteredInvoices = [...invoices];
    });
  }

  filterInvoices() {
    this.filteredInvoices = this.invoices.filter(invoice => {
      const matchesSearch = !this.searchTerm || 
        invoice.invoiceNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.debtorName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || invoice.status === this.selectedStatus;
      const matchesPortfolio = !this.selectedPortfolioId || invoice.portfolioId === this.selectedPortfolioId;
      
      return matchesSearch && matchesStatus && matchesPortfolio;
    });
  }

  getOverdueCount(): number {
    return this.filteredInvoices.filter(i => i.status === InvoiceStatus.OVERDUE).length;
  }

  getTotalAmount(): number {
    return this.filteredInvoices.reduce((sum, i) => sum + i.amount, 0);
  }

  getPaymentRate(): number {
    const paidInvoices = this.filteredInvoices.filter(i => i.status === InvoiceStatus.PAID).length;
    return this.filteredInvoices.length > 0 ? Math.round((paidInvoices / this.filteredInvoices.length) * 100) : 0;
  }

  isOverdue(invoice: CedantInvoice): boolean {
    return new Date(invoice.dueDate) < new Date() && invoice.status !== InvoiceStatus.PAID;
  }

  isCreateFormValid(): boolean {
    return !!(this.newInvoice.invoiceNumber && this.newInvoice.debtorName && 
              this.newInvoice.debtorEmail && this.newInvoice.amount > 0 &&
              this.newInvoice.issueDate && this.newInvoice.dueDate);
  }

  createInvoice() {
    if (!this.isCreateFormValid()) return;

    const invoiceData = {
      ...this.newInvoice,
      issueDate: new Date(this.newInvoice.issueDate),
      dueDate: new Date(this.newInvoice.dueDate)
    };

    this.cedantService.createInvoice(invoiceData).subscribe({
      next: (invoice) => {
        this.invoices.unshift(invoice);
        this.filterInvoices();
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
      }
    });
  }

  viewInvoiceDetails(invoice: CedantInvoice) {
    console.log('Voir détails de la facture:', invoice.invoiceNumber);
    // TODO: Implémenter la vue détaillée
  }

  editInvoice(invoice: CedantInvoice) {
    console.log('Modifier la facture:', invoice.invoiceNumber);
    // TODO: Implémenter l'édition
  }

  deleteInvoice(invoice: CedantInvoice) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      this.cedantService.deleteInvoice(invoice.id).subscribe({
        next: () => {
          this.invoices = this.invoices.filter(i => i.id !== invoice.id);
          this.filterInvoices();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'unpaid': 'Impayée',
      'partially_paid': 'Partiellement payée',
      'paid': 'Payée',
      'overdue': 'En retard',
      'disputed': 'Contestée'
    };
    return labels[status] || status;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newInvoice = {
      portfolioId: '',
      invoiceNumber: '',
      debtorName: '',
      debtorEmail: '',
      amount: 0,
      issueDate: '',
      dueDate: '',
      status: InvoiceStatus.UNPAID,
      description: ''
    };
  }
}