// models/landing.model.ts

export interface Nav {
  services: string;
  advantages: string;
  contact: string;
  login: string;
  register: string
  benefits?: string;
}

export interface Hero {
  title: string;
  subtitle: string;
  cta: {
    portal: string;
    learn: string;
  };
}

export interface Header {
  id?: number;
  documentId?: string;
  logoTextPhoto?: string | null;
  logoText?: string;
  navServices?: string;
  navAdvantages?: string;
  navContact?: string;
  navLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  locale?: string;
  localizations?: any[];
}

// Service Item individuel
export interface ServiceItem {
  id: number;
  documentId: string;
  title: string;
  description: string;
  features: string[];
  locale: string;
}

// Services (collection parente)
export interface Services {
  title: string;
  subtitle: string;
  items?: ServiceItem[]; // optionnel car populate
}

// Benefit Item individuel
export interface BenefitItem {
  id: number;
  documentId: string;
  title: string;
  description: string;
  locale: string;
}

// Benefits (collection parente)
export interface Benefits {
  title: string;
  subtitle: string;
  items?: BenefitItem[]; // optionnel car populate
}

export interface Statistiques {
  satisfaction: string;
  time_saving: string;
  cases_processed: string;
  support_available: string;
}

export interface CTA {
  title: string;
  subtitle: string;
  start: string;
  contact: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  profile: string;
  message: string;
  send: string;
  placeholder: {
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
  };
  profileOption: {
    selectProfile: string;
    debtor: string;
    bailiff: string;
    lawyer: string;
    creditor: string;
  };
}

export interface Contact {
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  form: ContactFormData;
  nameAdresse: string;
  nameTelephone: string;
  nameEmail: string
}

export interface Footer {
  services: string;
  support: string;
  legal: string;
  contact: string;
  documentation: string;
  faq: string;
  terms: string;
  privacy: string;
  cgu: string;
  copyright: string;
  name: string;
  nameDescriptions: string
}

export interface Common {
  digital_management: string;
  centralized_files: string;
}

export interface Sidebar {
  logo: string;
  dashboard: string;
  myCases: string;
  payments: string;
  documents: string;
  bailiffCases: string;
  legalActions: string;
  lawyerCases: string;
  consultations: string;
  reports: string;
  myCredits: string;
  realTimeTracking: string;
  notifications: string;
  portfolios: string;
  invoices: string;
  salesProcess: string;
  documentsProfessional: string;
  profile: string;
  logout: string;
}

// models/roles.model.ts
export type Role =
  | 'DEBTOR'
  | 'BAILIFF'
  | 'LAWYER'
  | 'CREDITOR'
  | 'CEDANT'
  | 'RECOVERY_PARTNER'
  | 'PROFESSIONAL';

export interface Roles {
  DEBTOR: string;
  BAILIFF: string;
  LAWYER: string;
  CREDITOR: string;
  CEDANT: string;
  RECOVERY_PARTNER: string;
  PROFESSIONAL: string;
}
