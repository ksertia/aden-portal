export interface DebtCase {
  id: string;
  caseNumber: string;
  debtor: DebtorInfo;
  creditor: CreditorInfo;
  amount: number;
  amountPaid: number;
  debtBreakdown: DebtBreakdown;
  status: CaseStatus;
  priority: Priority;
  createdAt: Date;
  dueDate: Date;
  assignedBailiff?: string;
  assignedLawyer?: string;
  documents: CaseDocument[];
  paymentPlan?: PaymentPlan;
  history: CaseActivity[];
}

export interface DebtBreakdown {
  principalAmount: number;
  interests: InterestDetail[];
  penalties: PenaltyDetail[];
  fees: FeeDetail[];
  totalInterests: number;
  totalPenalties: number;
  totalFees: number;
  totalAmount: number;
}

export interface InterestDetail {
  id: string;
  type: 'legal' | 'contractual' | 'delay';
  rate: number;
  startDate: Date;
  endDate?: Date;
  amount: number;
  description: string;
}

export interface PenaltyDetail {
  id: string;
  type: 'late_payment' | 'breach' | 'administrative';
  amount: number;
  appliedDate: Date;
  description: string;
}

export interface FeeDetail {
  id: string;
  type: 'legal' | 'administrative' | 'collection';
  amount: number;
  appliedDate: Date;
  description: string;
}
export interface DebtorInfo {
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phone: string;
  address: Address;
  type: 'individual' | 'company';
}

export interface CreditorInfo {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface PaymentPlan {
  id: string;
  totalAmount: number;
  monthlyAmount: number;
  startDate: Date;
  endDate: Date;
  installments: PaymentInstallment[];
}

export interface PaymentInstallment {
  id: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
}

export interface PaymentProposal {
  id: string;
  caseId: string;
  proposedBy: string;
  totalAmount: number;
  monthlyAmount: number;
  duration: number;
  startDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  notes?: string;
}

export interface CaseNote {
  id: string;
  caseId: string;
  content: string;
  type: 'call' | 'email' | 'meeting' | 'legal' | 'payment';
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  isPrivate: boolean;
}

export interface CaseFilter {
  status?: CaseStatus[];
  priority?: Priority[];
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface CaseActivity {
  id: string;
  type: ActivityType;
  description: string;
  date: Date;
  userId: string;
  userName: string;
}

export enum CaseStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  NEGOTIATION = 'negotiation',
  LEGAL_ACTION = 'legal_action',
  PAYMENT_PLAN = 'payment_plan',
  COMPLETED = 'completed',
  CLOSED = 'closed'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum DocumentType {
  INVOICE = 'invoice',
  CONTRACT = 'contract',
  CORRESPONDENCE = 'correspondence',
  LEGAL_NOTICE = 'legal_notice',
  PAYMENT_PROOF = 'payment_proof',
  COURT_DOCUMENT = 'court_document'
}

export enum ActivityType {
  CASE_CREATED = 'case_created',
  STATUS_CHANGED = 'status_changed',
  PAYMENT_RECEIVED = 'payment_received',
  DOCUMENT_UPLOADED = 'document_uploaded',
  CORRESPONDENCE_SENT = 'correspondence_sent',
  LEGAL_ACTION_INITIATED = 'legal_action_initiated',
  REMINDER_SENT = 'reminder_sent',
  FORMAL_NOTICE_SENT = 'formal_notice_sent'
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CedantPortfolio {
  id: string;
  cedantId: string;
  name: string;
  description: string;
  totalAmount: number;
  invoicesCount: number;
  status: PortfolioStatus;
  createdAt: Date;
  submittedAt?: Date;
  evaluatedAt?: Date;
  soldAt?: Date;
  salePrice?: number;
  buyerId?: string;
  documents: PortfolioDocument[];
  invoices: CedantInvoice[];
}

export interface CedantInvoice {
  id: string;
  portfolioId: string;
  invoiceNumber: string;
  debtorName: string;
  debtorEmail: string;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  description: string;
  attachments: InvoiceDocument[];
}

export interface PortfolioDocument {
  id: string;
  name: string;
  type: PortfolioDocumentType;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface InvoiceDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
}

export enum PortfolioStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_EVALUATION = 'under_evaluation',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SOLD = 'sold'
}

export enum InvoiceStatus {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  DISPUTED = 'disputed'
}

export enum PortfolioDocumentType {
  PORTFOLIO_SUMMARY = 'portfolio_summary',
  AGING_REPORT = 'aging_report',
  DEBTOR_ANALYSIS = 'debtor_analysis',
  LEGAL_DOCUMENTS = 'legal_documents',
  CONTRACTS = 'contracts',
  OTHER = 'other'
}