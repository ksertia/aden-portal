import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './guards/auth.guard';
import { StrapiRole } from './models/user.model';



export const routes: Routes = [
  {
    path: '',
    redirectTo: '/accueil',
    pathMatch: 'full'
  },
  {
    path: 'accueil',
    loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/auth/forgot-password/forgot-password').then(c => c.ForgotPassword)
  },
  {
    path: 'reset-code',
    loadComponent: () => import('./components/auth/reset-code/reset-code').then(c => c.ResetCode)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/auth/reset-password/reset-password').then(c => c.ResetPassword)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register').then(c => c.Register)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/main-layout/main-layout.component').then(c => c.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(c => c.ProfileComponent)
      },

      // Routes spécifiques au débiteur
      {
        path: 'debtor',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [StrapiRole.DEBTOR] },
        
        children: [
          {
            path: 'cases',
            loadComponent: () => import('./components/debtor/debtor-cases/debtor-cases.component').then(c => c.DebtorCasesComponent)
          },
          {
            path: 'payments',
            loadComponent: () => import('./components/debtor/debtor-payments/debtor-payments.component').then(c => c.DebtorPaymentsComponent)
          },
          // {
          //   path: 'documents',
          //   loadComponent: () => import('./components/debtor/debtor-documents/debtor-documents.component').then(c => c.DebtorDocumentsComponent)
          // },
          {
            path: 'dashboard',
            loadComponent: () => import('./components/debtor/debtor-dashboard/debtor-dashboard').then(c => c.DebtorDashboard)
          }
        ]
      },

      // Routes spécifiques à l'huissier
      {
        path: 'bailiff',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [StrapiRole.BAILIFF] },
        children: [
          {
            path: 'cases',
            loadComponent: () => import('./components/bailiff/bailiff-cases/bailiff-cases.component').then(c => c.BailiffCasesComponent)
          },
          {
            path: 'actions',
            loadComponent: () => import('./components/bailiff/bailiff-actions/bailiff-actions.component').then(c => c.BailiffActionsComponent)
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./components/bailiff/bailiff-dashboard/bailiff-dashboard').then(c => c.BailiffDashboard)
          }
        ]
      },

      // Routes spécifiques à l'avocat
      {
        path: 'lawyer',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [StrapiRole.LAWYER] },
        children: [
          {
            path: 'cases',
            loadComponent: () => import('./components/lawyer/lawyer-cases/lawyer-cases.component').then(c => c.LawyerCasesComponent)
          },
          {
            path: 'consultations',
            loadComponent: () => import('./components/lawyer/lawyer-consultations/lawyer-consultations.component').then(c => c.LawyerConsultationsComponent)
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./components/lawyer/lawyer-dashboard/lawyer-dashboard').then(c => c.LawyerDashboard)
          }
        ]
      },

      // Routes spécifiques au créancier
      {
        path: 'creditor',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [StrapiRole.CREDITOR] },
        children: [
          {
            path: 'cases',
            loadComponent: () => import('./components/creditor/creditor-cases/creditor-cases.component').then(c => c.CreditorCasesComponent)
          },
          {
            path: 'tracking',
            loadComponent: () => import('./components/creditor/creditor-tracking/creditor-tracking.component').then(c => c.CreditorTrackingComponent)
          },
          {
            path: 'notifications',
            loadComponent: () => import('./components/creditor/creditor-notifications/creditor-notifications.component').then(c => c.CreditorNotificationsComponent)
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./components/creditor/creditor-dashboard/creditor-dashboard').then(c => c.CreditorDashboard)
          }
        ]
      },

      // Routes spécifiques aux partenaires de recouvrement
      {
        path: 'partner',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [StrapiRole.RECOVERY_PARTNER] },
        children: [
          {
            path: 'cases',
            loadComponent: () => import('./components/partner/partner-cases/partner-cases.component').then(c => c.PartnerCasesComponent)
          },
          {
            path: 'tracking',
            loadComponent: () => import('./components/partner/partner-tracking/partner-tracking.component').then(c => c.PartnerTrackingComponent)
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./components/partner/partner-dashboard/partner-dashboard').then(c => c.PartnerDashboard)
          },
          {
            path: 'payment-tracking',
            loadComponent: () => import('./components/partner/partner-payment-tracking/partner-payment-tracking').then(c => c.PartnerPaymentTracking)
          },
           {
            path: 'payment-processor',
            loadComponent: () => import('./components/partner/payment-processor/payment-processor').then(c => c.PaymentProcessor)
          }
        ]
      },

      // Routes spécifiques au cédant
      {
        path: 'cedant',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [StrapiRole.CEDANT] },
        children: [
          {
            path: 'portfolios',
            loadComponent: () => import('./components/cedant/cedant-portfolios/cedant-portfolios.component').then(c => c.CedantPortfoliosComponent)
          },
          {
            path: 'invoices',
            loadComponent: () => import('./components/cedant/cedant-invoices/cedant-invoices.component').then(c => c.CedantInvoicesComponent)
          },
          {
            path: 'sales',
            loadComponent: () => import('./components/cedant/cedant-sales/cedant-sales.component').then(c => c.CedantSalesComponent)
          },
          {
            path: 'ceded-cases',
            loadComponent: () => import('./components/cedant/cedant-ceded-cases/cedant-ceded-cases.component').then(c => c.CedantCededCasesComponent)
          },
           {
            path: 'dashboard',
            loadComponent: () => import('./components/cedant/cedant-dashboard/cedant-dashboard').then(c => c.CedantDashboard)
          }
        ]
      },

      // Routes communes aux professionnels (huissier et avocat)
      {
        path: 'professional',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [StrapiRole.BAILIFF, StrapiRole.LAWYER, StrapiRole.CREDITOR, StrapiRole.DEBTOR, StrapiRole.CEDANT, StrapiRole.RECOVERY_PARTNER] },
        children: [
          {
            path: 'reports',
            loadComponent: () => import('./components/professional/reports/reports.component').then(c => c.ReportsComponent)
          },
          {
            path: 'documents',
            loadComponent: () => import('./components/professional/documents/documents.component').then(c => c.DocumentsComponent)
          }
        ]
      },

      // Route spécifiques à l'administrateurs
      {
        path: 'Administrateur',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [StrapiRole.ADMINISTRATEUR] },
        children: [
          
          {
            path: 'user-list',
            loadComponent: () => import('./components/admin/user-list/user-list').then(c => c.UserList)
          },
          {
            path: 'user-create',
            loadComponent: () => import('./components/admin/user-create/user-create.component').then(c => c.UserCreateComponent)
          },
          { 
            path: 'creancier',
            loadComponent: () => import('./components/admin/creancier/creancier').then(c => c.Creancier)
          },
          { 
            path: 'debiteur',
            loadComponent: () => import('./components/admin/debiteur/debiteur').then(m => m.Debiteur)
          },
          { 
            path: 'huissier',
            loadComponent: () => import('./components/admin/huissier/huissier').then(c => c.Huissier)
          },
          { 
            path: 'avocat',
            loadComponent: () => import('./components/admin/avocat/avocat').then(c => c.Avocat)
          },
          { 
            path: 'cedant',
            loadComponent: () => import('./components/admin/cedant/cedant').then(c => c.Cedant)
          },
          { 
            path: 'partenaire',
            loadComponent: () => import('./components/admin/partenaire/partenaire').then(c => c.Partenaire)
          },
          { 
            path: 'dashboard',
            loadComponent: () => import('./components/admin/dashboard/dashboard').then(c => c.Dashboard)
          }

        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/accueil'
  }
];