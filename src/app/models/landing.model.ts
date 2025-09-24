// models/navigation.model.ts
export interface Nav {
    locale: string;
  services: string;
  advantages: string;
  contact: string;
  login: string;
}

// models/hero.model.ts
export interface Hero {
    locale: string;
  title: string;
  subtitle: string;
  cta: {
    portal: string;
    learn: string;
  };
}

// models/service-item.model.ts
export interface ServiceItem {
  title: string;
  description: string;
  locale: string;
}

// models/services.model.ts
export interface Services {
  title: string;
  subtitle: string;
  locale: string;
  item: ServiceItem[]; 
}

// models/benefit.model.ts
export interface BenefitItem {
  title: string;
  description: string;
  locale: string;
}

export interface Benefits {
  title: string;
  subtitle: string;
  locale: string;
  security: BenefitItem;
  time: BenefitItem;
  reports: BenefitItem;
  communication: BenefitItem;
  compliance: BenefitItem;
  support: BenefitItem;
}

// models/stats.model.ts
export interface Statistiques {
  satisfaction: string;
  time_saving: string;
  cases_processed: string;
  support_available: string;
  locale: string;
}

// models/cta.model.ts
export interface CTA {
  title: string;
  subtitle: string;
  start: string;
  contact: string;
  locale: string;
}

// models/contact.model.ts
export interface ContactForm {
    locale: string;
  firstName: string;
  lastName: string;
  email: string;
  profile: string;
  message: string;
  send: string;
  profileOption: {
     selectProfile: string;
     debtor: string;
     bailiff: string;
     lawyer: string;
     creditor: string;
  }
  placeholder: {
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
  };
}

export interface Contact {
    locale: string;
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  form: ContactForm;
}

// models/footer.model.ts
export interface Footer {
    locale: string;
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
}

// models/common.model.ts
export interface Common {
    locale: string;
  digital_management: string;
  centralized_files: string;
}

// models/payments.model.ts
export interface Payments {
  title: string;
  subtitle: string;
  comingSoonTitle: string;
  comingSoonDescription: string;
}

// models/sidebar.model.ts
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
