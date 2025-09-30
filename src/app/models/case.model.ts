import { Partenaire } from "../components/admin/partenaire/partenaire";

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
  assignedPartner?: string;
  partnerCommission?: number;
  cededBy?: string;
  cededAt?: Date;
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
  situation:string;
  dette:number;
}
export interface ApiDebtorResponse {
  code: number;
  data: { map: any }[];
  details?: string;
  message?: string;
  totalItemCount?: number;
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
  FORMAL_NOTICE_SENT = 'formal_notice_sent',
  CASE_CEDED = 'case_ceded',
  PARTNER_UPDATE = 'partner_update'
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CedantPortfolio {
  cedantId: string;
  id: string;
  // cedantId: number;
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

export interface PartnerUpdate {
  id: string;
  caseId: string;
  partnerId: string;
  partnerName: string;
  updateType: 'status_change' | 'payment_received' | 'action_taken' | 'note_added';
  description: string;
  amount?: number;
  newStatus?: CaseStatus;
  createdAt: Date;
  documents?: CaseDocument[];
}

export interface CessionContract {
  id: string;
  caseId: string;
  partnerId: string;
  partnerName: string;
  cededBy: string;
  cededAt: Date;
  commission: number;
  terms: string;
  status: 'active' | 'completed' | 'terminated';
}

export interface CreditorDetail {
  dateCreation: string;
  createurUsername: string;
  typeObjet: string;
  phaseId: string;
  enInstance: boolean;
  delaiPaiementHabituel: number;
  adresseSiegeSocial: string;
  historiqueValidations: { myArrayList: any[] };
  stepGlobal: string;
  raisonSociale: string;
  valueObjet: string;
  isDeleted: boolean;
  labelObjet: string;
  nombreEmployes: number;
  niveauObjet: number;
  createur: { map: { title: string; username: string } };
  typeCreancier: string;
  phaseCode: string;
  secteurActivite: string;
  emailProfessionnel: string;
  rangObjet: number;
  contactPrincipal: string;
  assuranceCredit: boolean;
  owner: boolean;
  validateurs: { myArrayList: any[] };
  isArchive: boolean;
  isArchiveRm: boolean;
  chiffreAffaires: number;
  modeleObjet: string;
  telephone: string;
  codePostal: number;
  isFinish: boolean;
  enRetard: boolean;
  parentId: string;
  traite: boolean;
  objetId: string;
  statutGlobal: string;
  ifu: string;
  commentaires: string;
  step: string;
  nameObjet: string;
  nodeId: string;
}
export interface ApiCreditorResponse {
  code: number;
  data: { map: CreditorDetail }[];
  details?: string;
  message?: string;
  totalItemCount?: number;
}
// pour HUISSIER
export interface HuissierInfo {
  conventionne: boolean;
  dateCreation: string;
  numeroInscription: string;
  createurUsername: string;
  typeObjet: string;
  phaseId: string;
  habiliteRecouvrement: boolean;
  enInstance: boolean;
  dateInstallation: string;
  adresseSiegeSocial: string;
  historiqueValidations: {
    myArrayList: any[];   // à préciser si tu connais la structure exacte
  };
  stepGlobal: string;
  tarifHoraireMoyen: number;
  valueObjet: string;
  isDeleted: boolean;
  labelObjet: string;
  niveauObjet: number;
  createur: {
    map: {
      title: string;
      username: string;
    };
  };
  specialites: string[];
  phaseCode: string;
  emailProfessionnel: string;
  rangObjet: number;
  owner: boolean;
  validateurs: {
    myArrayList: any[];   // idem → tu peux affiner selon API
  };
  isArchive: boolean;
  isArchiveRm: boolean;
  nomEtude: string;
  nomHuissier: string;
  chambreDepartementale: string;
  modeleObjet: string;
  telephone: string;
  codePostal: number;
  isFinish: boolean;
  enRetard: boolean;
  parentId: string;
  traite: boolean;
  objetId: string;
  statutGlobal: string;
  commentaires: string;
  step: string;
  nameObjet: string;
  nodeId: string;
}
export interface ApiHuissierResponse {
  code: number;
  data: { map: HuissierInfo }[];
  details: string;
  message: string;
  totalItemCount: number;
}


// Pour les Partenaire
export interface PartenaireInfo {
  dateCreation: string;
  createurUsername: string;
  assuranceRC: boolean;
  enInstance: boolean;
  historiqueValidations: {
    myArrayList: any[];
  };
  valueObjet: string;
  labelObjet: string;
  niveauObjet: number;
  createur: {
    map: {
      title: string;
      username: string;
    };
  };
  phaseCode: string;
  delaiMoyenRecouvrement: number;
  emailProfessionnel: string;
  zonesGeographiques: string[];
  rangObjet: number;
  validateurs: {
    myArrayList: any[];
  };
  modeleObjet: string;
  seuilMontantMax: number;
  telephone: string;
  codePostal: number;
  dateFinConvention: string;
  objetId: string;
  statutGlobal: string;
  nameObjet: string;
  montantAssurance: number;
  nodeId: string;
  typeObjet: string; // "partenaire"
  phaseId: string;
  adresseSiegeSocial: string;
  stepGlobal: string;
  raisonSociale: string;
  tauxReussiteGlobal: number;
  isDeleted: boolean;
  seuilMontantMin: number;
  tauxCommission: number;
  dateConvention: string;
  contactPrincipal: string;
  owner: boolean;
  isArchive: boolean;
  isArchiveRm: boolean;
  isFinish: boolean;
  specialitesRecouvrement: string[];
  certifications: string[];
  enRetard: boolean;
  parentId: string;
  traite: boolean;
  numeroAgrement: string;
  conventionSignee: boolean;
  nomCommercial: string;
  ifu: string;
  commentaires: string;
  step: string;
  evaluationPerformance: number;
  typePartenaire: string;
}

// Réponse API typée
export interface ApiPartenaireResponse {
  code: number;
  data: { map: PartenaireInfo }[];
  details: string;
  message: string;
  totalItemCount: number;
}

// Pour les Avocats
export interface AvocatInfo {
  dateCreation: string;
  numeroInscription: string;
  createurUsername: string;
  nomAvocat: string;
  disponibilite: boolean;
  tarifHoraire: number;
  typeObjet: string;
  phaseId: string;
  habiliteRecouvrement: boolean;
  enInstance: boolean;
  historiqueValidations: {
    myArrayList: any[];
  };
  stepGlobal: string;
  nomCabinet: string;
  valueObjet: string;
  isDeleted: boolean;
  dateInscription: string;
  adresseCabinet: string;
  conventionHonoraires: string;
  labelObjet: string;
  niveauObjet: number;
  createur: {
    map: {
      title: string;
      username: string;
    };
  };
  specialites: string[];
  phaseCode: string;
  prenomAvocat: string;
  emailProfessionnel: string;
  noteEvaluation: number;
  rangObjet: number;
  barreau: string;
  owner: boolean;
  validateurs: {
    myArrayList: any[];
  };
  isArchive: boolean;
  isArchiveRm: boolean;
  modeleObjet: string;
  telephone: string;
  codePostal: number;
  isFinish: boolean;
  enRetard: boolean;
  parentId: string;
  languesParles: string[];
  traite: boolean;
  objetId: string;
  statutGlobal: string;
  tarifForfaitaire: number;
  commentaires: string;
  step: string;
  nameObjet: string;
  nodeId: string;
}
export interface ApiResponseAvocat {
  code: number;
  data: {
    map: AvocatInfo;
  }[];
  details: string;
  message: string;
  totalItemCount: number;
}








// Pour tout les profils

