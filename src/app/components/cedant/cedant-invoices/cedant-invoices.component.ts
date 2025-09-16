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
  templateUrl: './cedant-invoices.component.html',
  styleUrls: ['./cedant-invoices.component.css']
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