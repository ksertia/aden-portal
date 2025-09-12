import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  CedantPortfolio, 
  CedantInvoice, 
  PortfolioStatus, 
  InvoiceStatus,
  PortfolioDocument,
  PortfolioDocumentType 
} from '../models/case.model';

@Injectable({
  providedIn: 'root'
})
export class CedantService {
  private mockPortfolios: CedantPortfolio[] = [
    {
      id: '1',
      cedantId: '5',
      name: 'Portefeuille Q1 2024',
      description: 'Créances clients du premier trimestre 2024',
      totalAmount: 125000,
      invoicesCount: 45,
      status: PortfolioStatus.UNDER_EVALUATION,
      createdAt: new Date('2024-01-15'),
      submittedAt: new Date('2024-01-20'),
      evaluatedAt: new Date('2024-01-25'),
      documents: [
        {
          id: '1',
          name: 'Synthèse du portefeuille Q1 2024.pdf',
          type: PortfolioDocumentType.PORTFOLIO_SUMMARY,
          url: '#',
          uploadedAt: new Date('2024-01-15'),
          uploadedBy: 'Thomas Moreau'
        },
        {
          id: '2',
          name: 'Analyse aging des créances.xlsx',
          type: PortfolioDocumentType.AGING_REPORT,
          url: '#',
          uploadedAt: new Date('2024-01-16'),
          uploadedBy: 'Thomas Moreau'
        }
      ],
      invoices: []
    },
    {
      id: '2',
      cedantId: '5',
      name: 'Portefeuille Q4 2023',
      description: 'Créances clients du quatrième trimestre 2023',
      totalAmount: 89000,
      invoicesCount: 32,
      status: PortfolioStatus.SOLD,
      createdAt: new Date('2023-12-01'),
      submittedAt: new Date('2023-12-05'),
      evaluatedAt: new Date('2023-12-10'),
      soldAt: new Date('2023-12-15'),
      salePrice: 75650,
      buyerId: 'buyer-1',
      documents: [],
      invoices: []
    }
  ];

  private mockInvoices: CedantInvoice[] = [
    {
      id: '1',
      portfolioId: '1',
      invoiceNumber: 'INV-2024-001',
      debtorName: 'Entreprise ABC',
      debtorEmail: 'contact@abc-entreprise.fr',
      amount: 2500,
      issueDate: new Date('2024-01-10'),
      dueDate: new Date('2024-02-10'),
      status: InvoiceStatus.OVERDUE,
      description: 'Prestation de services informatiques',
      attachments: []
    },
    {
      id: '2',
      portfolioId: '1',
      invoiceNumber: 'INV-2024-002',
      debtorName: 'Solutions XYZ',
      debtorEmail: 'facturation@xyz-solutions.fr',
      amount: 3200,
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      status: InvoiceStatus.UNPAID,
      description: 'Développement application mobile',
      attachments: []
    }
  ];

  getPortfolios(cedantId: string): Observable<CedantPortfolio[]> {
    return of(this.mockPortfolios.filter(p => p.cedantId === cedantId)).pipe(delay(300));
  }

  getPortfolioById(id: string): Observable<CedantPortfolio | null> {
    const portfolio = this.mockPortfolios.find(p => p.id === id);
    return of(portfolio || null).pipe(delay(200));
  }

  createPortfolio(portfolioData: Omit<CedantPortfolio, 'id' | 'createdAt' | 'invoices' | 'documents'>): Observable<CedantPortfolio> {
    const newPortfolio: CedantPortfolio = {
      ...portfolioData,
      id: Date.now().toString(),
      createdAt: new Date(),
      documents: [],
      invoices: []
    };
    
    this.mockPortfolios.push(newPortfolio);
    return of(newPortfolio).pipe(delay(500));
  }

  updatePortfolio(id: string, updates: Partial<CedantPortfolio>): Observable<CedantPortfolio> {
    const index = this.mockPortfolios.findIndex(p => p.id === id);
    if (index === -1) {
      return throwError(() => new Error('Portefeuille non trouvé'));
    }

    this.mockPortfolios[index] = { ...this.mockPortfolios[index], ...updates };
    return of(this.mockPortfolios[index]).pipe(delay(300));
  }

  submitPortfolio(id: string): Observable<CedantPortfolio> {
    return this.updatePortfolio(id, {
      status: PortfolioStatus.SUBMITTED,
      submittedAt: new Date()
    });
  }

  getInvoices(portfolioId?: string): Observable<CedantInvoice[]> {
    let invoices = this.mockInvoices;
    if (portfolioId) {
      invoices = invoices.filter(i => i.portfolioId === portfolioId);
    }
    return of(invoices).pipe(delay(300));
  }

  createInvoice(invoiceData: Omit<CedantInvoice, 'id' | 'attachments'>): Observable<CedantInvoice> {
    const newInvoice: CedantInvoice = {
      ...invoiceData,
      id: Date.now().toString(),
      attachments: []
    };
    
    this.mockInvoices.push(newInvoice);
    return of(newInvoice).pipe(delay(500));
  }

  updateInvoice(id: string, updates: Partial<CedantInvoice>): Observable<CedantInvoice> {
    const index = this.mockInvoices.findIndex(i => i.id === id);
    if (index === -1) {
      return throwError(() => new Error('Facture non trouvée'));
    }

    this.mockInvoices[index] = { ...this.mockInvoices[index], ...updates };
    return of(this.mockInvoices[index]).pipe(delay(300));
  }

  deleteInvoice(id: string): Observable<boolean> {
    const index = this.mockInvoices.findIndex(i => i.id === id);
    if (index === -1) {
      return throwError(() => new Error('Facture non trouvée'));
    }

    this.mockInvoices.splice(index, 1);
    return of(true).pipe(delay(300));
  }

  uploadPortfolioDocument(portfolioId: string, document: Omit<PortfolioDocument, 'id' | 'uploadedAt'>): Observable<PortfolioDocument> {
    const newDocument: PortfolioDocument = {
      ...document,
      id: Date.now().toString(),
      uploadedAt: new Date()
    };

    const portfolioIndex = this.mockPortfolios.findIndex(p => p.id === portfolioId);
    if (portfolioIndex !== -1) {
      this.mockPortfolios[portfolioIndex].documents.push(newDocument);
    }

    return of(newDocument).pipe(delay(500));
  }

  getStatistics(cedantId: string): Observable<any> {
    const portfolios = this.mockPortfolios.filter(p => p.cedantId === cedantId);
    const invoices = this.mockInvoices;

    const stats = {
      totalPortfolios: portfolios.length,
      activePortfolios: portfolios.filter(p => p.status === PortfolioStatus.SUBMITTED || p.status === PortfolioStatus.UNDER_EVALUATION).length,
      soldPortfolios: portfolios.filter(p => p.status === PortfolioStatus.SOLD).length,
      totalInvoices: invoices.length,
      totalAmount: portfolios.reduce((sum, p) => sum + p.totalAmount, 0),
      totalSold: portfolios.filter(p => p.status === PortfolioStatus.SOLD).reduce((sum, p) => sum + (p.salePrice || 0), 0),
      averageSaleTime: 15 // jours
    };

    return of(stats).pipe(delay(200));
  }
}