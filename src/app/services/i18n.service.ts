import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SupportedLocale = 'fr' | 'en';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLocaleSubject = new BehaviorSubject<SupportedLocale>('fr');
  public currentLocale$ = this.currentLocaleSubject.asObservable();

  private translations: Record<SupportedLocale, Record<string, string>> = {
    fr: {
      // Navigation
      'nav.services': 'Services',
      'nav.advantages': 'Avantages',
      'nav.contact': 'Contact',
      'nav.login': 'Se connecter',
      
      // Hero Section
      'hero.title': 'Simplifiez votre recouvrement de créances',
      'hero.subtitle': 'RecouvrePro est la plateforme digitale qui révolutionne la gestion du recouvrement. Débiteurs, huissiers et avocats collaborent efficacement pour résoudre les impayés.',
      'hero.cta.portal': 'Accéder au portail',
      'hero.cta.learn': 'En savoir plus',
      
      // Services Section
      'services.title': 'Une solution pour chaque acteur',
      'services.subtitle': 'RecouvrePro s\'adapte aux besoins spécifiques de chaque professionnel du recouvrement',
      'services.debtor.title': 'Pour les débiteurs',
      'services.debtor.description': 'Consultez vos dossiers, proposez des échéanciers et effectuez vos paiements en toute transparence.',
      'services.debtor.feature1': 'Consultation du montant dû, échéances, intérêts et pénalités',
      'services.debtor.feature2': 'Possibilité de soumettre des justificatifs de paiement ou autres documents',
      'services.debtor.feature3': 'Consultation de l\'historique des relances',
      'services.debtor.feature4': 'Demander un échelonnement ou formuler une contestation',
      'services.bailiff.title': 'Pour les huissiers',
      'services.bailiff.description': 'Gérez efficacement vos dossiers de recouvrement avec des outils professionnels avancés.',
      'services.bailiff.feature1': 'Gestion complète des dossiers',
      'services.bailiff.feature2': 'Automatisation des procédures',
      'services.bailiff.feature3': 'Rapports d\'activité détaillés',
      'services.bailiff.feature4': 'Communication centralisée',
      'services.lawyer.title': 'Pour les avocats',
      'services.lawyer.description': 'Accompagnez vos clients avec des outils juridiques spécialisés et un suivi personnalisé.',
      'services.lawyer.feature1': 'Analyse juridique approfondie',
      'services.lawyer.feature2': 'Consultations en ligne',
      'services.lawyer.feature3': 'Gestion documentaire sécurisée',
      'services.lawyer.feature4': 'Expertise légale intégrée',
      'services.creditor.title': 'Pour les créanciers',
      'services.creditor.description': 'Suivez en temps réel l\'évolution de vos créances et optimisez votre taux de recouvrement.',
      'services.creditor.feature1': 'Suivi temps réel de l\'avancement',
      'services.creditor.feature2': 'Consultation des documents et preuves',
      'services.creditor.feature3': 'Rapports périodiques détaillés',
      'services.creditor.feature4': 'Notifications de paiements et actions',
      'services.cedant.title': 'Pour les cédants',
      'services.cedant.description': 'Cédez vos créances clients en toute simplicité et suivez le processus de vente de bout en bout.',
      'services.cedant.feature1': 'Création et gestion de portefeuilles de créances',
      'services.cedant.feature2': 'Upload de documentation complète (contrats, factures, analyses)',
      'services.cedant.feature3': 'Suivi du processus d\'évaluation et de vente',
      'services.cedant.feature4': 'Gestion détaillée de vos factures clients',
      'services.cedant.feature5': 'Acceptation/refus des offres d\'achat',
      'services.cedant.feature6': 'Historique complet des transactions',
      
      // Benefits Section
      'benefits.title': 'Pourquoi choisir RecouvrePro ?',
      'benefits.subtitle': 'Une plateforme moderne qui transforme la gestion du recouvrement',
      'benefits.security.title': 'Sécurité maximale',
      'benefits.security.description': 'Vos données sont protégées par un chiffrement de niveau bancaire et des protocoles de sécurité avancés.',
      'benefits.time.title': 'Gain de temps',
      'benefits.time.description': 'Automatisez vos processus et réduisez le temps de traitement de vos dossiers de 60%.',
      'benefits.reports.title': 'Rapports intelligents',
      'benefits.reports.description': 'Générez des rapports détaillés et des analyses pour optimiser vos performances.',
      'benefits.communication.title': 'Communication fluide',
      'benefits.communication.description': 'Facilitez les échanges entre toutes les parties prenantes avec des outils de communication intégrés.',
      'benefits.compliance.title': 'Conformité légale',
      'benefits.compliance.description': 'Respectez automatiquement toutes les réglementations en vigueur avec nos mises à jour continues.',
      'benefits.support.title': 'Support expert',
      'benefits.support.description': 'Bénéficiez d\'un accompagnement personnalisé par nos experts du recouvrement.',
      
      // Stats Section
      'stats.satisfaction': 'Taux de satisfaction',
      'stats.time_saving': 'Gain de temps moyen',
      'stats.cases_processed': 'Dossiers traités',
      'stats.support_available': 'Support disponible',
      
      // CTA Section
      'cta.title': 'Prêt à révolutionner votre recouvrement ?',
      'cta.subtitle': 'Rejoignez des milliers de professionnels qui font confiance à RecouvrePro',
      'cta.start': 'Commencer maintenant',
      'cta.contact': 'Nous contacter',
      
      // Contact Section
      'contact.title': 'Contactez-nous',
      'contact.subtitle': 'Notre équipe d\'experts est à votre disposition',
      'contact.address': 'Adresse',
      'contact.phone': 'Téléphone',
      'contact.email': 'Email',
      'contact.form.firstName': 'Prénom',
      'contact.form.lastName': 'Nom',
      'contact.form.email': 'Email',
      'contact.form.profile': 'Profil',
      'contact.form.message': 'Message',
      'contact.form.send': 'Envoyer le message',
      'contact.form.selectProfile': 'Sélectionnez votre profil',
      'contact.form.debtor': 'Débiteur',
      'contact.form.bailiff': 'Huissier de justice',
      'contact.form.lawyer': 'Avocat',
      'contact.form.creditor': 'Créancier',
      'contact.form.firstNamePlaceholder': 'Votre prénom',
      'contact.form.lastNamePlaceholder': 'Votre nom',
      'contact.form.emailPlaceholder': 'votre.email@exemple.fr',
      'contact.form.messagePlaceholder': 'Décrivez votre besoin...',
      
      // Footer
      'footer.services': 'Services',
      'footer.support': 'Support',
      'footer.legal': 'Légal',
      'footer.contact': 'Nous contacter',
      'footer.documentation': 'Documentation',
      'footer.faq': 'FAQ',
      'footer.terms': 'Mentions légales',
      'footer.privacy': 'Politique de confidentialité',
      'footer.cgu': 'CGU',
      'footer.copyright': '© 2024 RecouvrePro. Tous droits réservés.',
      
      // Common
      'common.digital_management': 'Gestion digitale',
      'common.centralized_files': 'Tous vos dossiers centralisés'
    },
    en: {
      // Navigation
      'nav.services': 'Services',
      'nav.advantages': 'Benefits',
      'nav.contact': 'Contact',
      'nav.login': 'Sign in',
      
      // Hero Section
      'hero.title': 'Simplify your debt collection',
      'hero.subtitle': 'RecouvrePro is the digital platform that revolutionizes collection management. Debtors, bailiffs and lawyers collaborate efficiently to resolve unpaid debts.',
      'hero.cta.portal': 'Access portal',
      'hero.cta.learn': 'Learn more',
      
      // Services Section
      'services.title': 'A solution for every stakeholder',
      'services.subtitle': 'RecouvrePro adapts to the specific needs of each collection professional',
      'services.debtor.title': 'For debtors',
      'services.debtor.description': 'View your cases, propose payment plans and make payments with complete transparency.',
      'services.debtor.feature1': 'View amount due, deadlines, interest and penalties',
      'services.debtor.feature2': 'Ability to submit payment receipts or other documents',
      'services.debtor.feature3': 'View reminder history',
      'services.debtor.feature4': 'Request payment plan or file dispute',
      'services.bailiff.title': 'For bailiffs',
      'services.bailiff.description': 'Efficiently manage your collection cases with advanced professional tools.',
      'services.bailiff.feature1': 'Complete case management',
      'services.bailiff.feature2': 'Process automation',
      'services.bailiff.feature3': 'Detailed activity reports',
      'services.bailiff.feature4': 'Centralized communication',
      'services.lawyer.title': 'For lawyers',
      'services.lawyer.description': 'Support your clients with specialized legal tools and personalized follow-up.',
      'services.lawyer.feature1': 'In-depth legal analysis',
      'services.lawyer.feature2': 'Online consultations',
      'services.lawyer.feature3': 'Secure document management',
      'services.lawyer.feature4': 'Integrated legal expertise',
      'services.creditor.title': 'For creditors',
      'services.creditor.description': 'Track your receivables in real time and optimize your collection rate.',
      'services.creditor.feature1': 'Real-time progress tracking',
      'services.creditor.feature2': 'Document and evidence consultation',
      'services.creditor.feature3': 'Detailed periodic reports',
      'services.creditor.feature4': 'Payment and action notifications',
      'services.cedant.title': 'For assignors',
      'services.cedant.description': 'Assign your customer receivables with ease and track the sales process end-to-end.',
      'services.cedant.feature1': 'Creation and management of receivables portfolios',
      'services.cedant.feature2': 'Upload complete documentation (contracts, invoices, analyses)',
      'services.cedant.feature3': 'Track evaluation and sales process',
      'services.cedant.feature4': 'Detailed management of your customer invoices',
      'services.cedant.feature5': 'Accept/reject purchase offers',
      'services.cedant.feature6': 'Complete transaction history',
      
      // Benefits Section
      'benefits.title': 'Why choose RecouvrePro?',
      'benefits.subtitle': 'A modern platform that transforms collection management',
      'benefits.security.title': 'Maximum security',
      'benefits.security.description': 'Your data is protected by bank-level encryption and advanced security protocols.',
      'benefits.time.title': 'Time savings',
      'benefits.time.description': 'Automate your processes and reduce case processing time by 60%.',
      'benefits.reports.title': 'Smart reports',
      'benefits.reports.description': 'Generate detailed reports and analytics to optimize your performance.',
      'benefits.communication.title': 'Smooth communication',
      'benefits.communication.description': 'Facilitate exchanges between all stakeholders with integrated communication tools.',
      'benefits.compliance.title': 'Legal compliance',
      'benefits.compliance.description': 'Automatically comply with all current regulations with our continuous updates.',
      'benefits.support.title': 'Expert support',
      'benefits.support.description': 'Benefit from personalized support from our collection experts.',
      
      // Stats Section
      'stats.satisfaction': 'Satisfaction rate',
      'stats.time_saving': 'Average time savings',
      'stats.cases_processed': 'Cases processed',
      'stats.support_available': 'Support available',
      
      // CTA Section
      'cta.title': 'Ready to revolutionize your collection?',
      'cta.subtitle': 'Join thousands of professionals who trust RecouvrePro',
      'cta.start': 'Get started now',
      'cta.contact': 'Contact us',
      
      // Contact Section
      'contact.title': 'Contact us',
      'contact.subtitle': 'Our team of experts is at your disposal',
      'contact.address': 'Address',
      'contact.phone': 'Phone',
      'contact.email': 'Email',
      'contact.form.firstName': 'First name',
      'contact.form.lastName': 'Last name',
      'contact.form.email': 'Email',
      'contact.form.profile': 'Profile',
      'contact.form.message': 'Message',
      'contact.form.send': 'Send message',
      'contact.form.selectProfile': 'Select your profile',
      'contact.form.debtor': 'Debtor',
      'contact.form.bailiff': 'Bailiff',
      'contact.form.lawyer': 'Lawyer',
      'contact.form.creditor': 'Creditor',
      'contact.form.firstNamePlaceholder': 'Your first name',
      'contact.form.lastNamePlaceholder': 'Your last name',
      'contact.form.emailPlaceholder': 'your.email@example.com',
      'contact.form.messagePlaceholder': 'Describe your needs...',
      
      // Footer
      'footer.services': 'Services',
      'footer.support': 'Support',
      'footer.legal': 'Legal',
      'footer.contact': 'Contact us',
      'footer.documentation': 'Documentation',
      'footer.faq': 'FAQ',
      'footer.terms': 'Legal notices',
      'footer.privacy': 'Privacy policy',
      'footer.cgu': 'Terms of use',
      'footer.copyright': '© 2024 RecouvrePro. All rights reserved.',
      
      // Common
      'common.digital_management': 'Digital management',
      'common.centralized_files': 'All your files centralized'
    }
  };

  constructor() {
    // Détecter la langue du navigateur
    const browserLang = navigator.language.split('-')[0] as SupportedLocale;
    const supportedLang = ['fr', 'en'].includes(browserLang) ? browserLang : 'fr';
    this.setLocale(supportedLang);
  }

  getCurrentLocale(): SupportedLocale {
    return this.currentLocaleSubject.value;
  }

  setLocale(locale: SupportedLocale): void {
    this.currentLocaleSubject.next(locale);
    localStorage.setItem('locale', locale);
  }

  translate(key: string): string {
    const currentLocale = this.getCurrentLocale();
    return this.translations[currentLocale][key] || key;
  }

  getSupportedLocales(): SupportedLocale[] {
    return ['fr', 'en'];
  }
}