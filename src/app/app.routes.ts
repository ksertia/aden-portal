import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './guards/auth.guard';
import { UserRole } from './models/user.model';

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
    loadComponent: () => import('./components/auth/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/main-layout.component').then(c => c.MainLayoutComponent),
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
        data: { roles: [UserRole.DEBTOR] },
        children: [
          {
            path: 'cases',
            loadComponent: () => import('./components/debtor/debtor-cases.component').then(c => c.DebtorCasesComponent)
          },
          {
            path: 'payments',
            loadComponent: () => import('./components/debtor/debtor-payments.component').then(c => c.DebtorPaymentsComponent)
          },
          {
            path: 'documents',
            loadComponent: () => import('./components/debtor/debtor-documents.component').then(c => c.DebtorDocumentsComponent)
          }
        ]
      },
      // Routes spécifiques à l'huissier
      {
        path: 'bailiff',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [UserRole.BAILIFF] },
        children: [
          {
            path: 'cases',
            loadComponent: () => import('./components/bailiff/bailiff-cases.component').then(c => c.BailiffCasesComponent)
          },
          {
            path: 'actions',
            loadComponent: () => import('./components/bailiff/bailiff-actions.component').then(c => c.BailiffActionsComponent)
          }
        ]
      },
      // Routes spécifiques à l'avocat
      {
        path: 'lawyer',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [UserRole.LAWYER] },
        children: [
          {
            path: 'cases',
            loadComponent: () => import('./components/lawyer/lawyer-cases.component').then(c => c.LawyerCasesComponent)
          },
          {
            path: 'consultations',
            loadComponent: () => import('./components/lawyer/lawyer-consultations.component').then(c => c.LawyerConsultationsComponent)
          }
        ]
      },
      // Routes spécifiques au créancier
      {
        path: 'creditor',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [UserRole.CREDITOR] },
        children: [
          {
            path: 'cases',
            loadComponent: () => import('./components/creditor/creditor-cases.component').then(c => c.CreditorCasesComponent)
          },
          {
            path: 'tracking',
            loadComponent: () => import('./components/creditor/creditor-tracking.component').then(c => c.CreditorTrackingComponent)
          },
          {
            path: 'notifications',
            loadComponent: () => import('./components/creditor/creditor-notifications.component').then(c => c.CreditorNotificationsComponent)
          }
        ]
      },
      // Routes spécifiques au cédant
      {
        path: 'cedant',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [UserRole.CEDANT] },
        children: [
          {
            path: 'portfolios',
            loadComponent: () => import('./components/cedant/cedant-portfolios.component').then(c => c.CedantPortfoliosComponent)
          },
          {
            path: 'invoices',
            loadComponent: () => import('./components/cedant/cedant-invoices.component').then(c => c.CedantInvoicesComponent)
          },
          {
            path: 'sales',
            loadComponent: () => import('./components/cedant/cedant-sales.component').then(c => c.CedantSalesComponent)
          }
        ]
      },
      // Routes communes aux professionnels (huissier et avocat)
      {
        path: 'professional',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [UserRole.BAILIFF, UserRole.LAWYER, UserRole.CREDITOR, UserRole.CEDANT] },
        children: [
          {
            path: 'reports',
            loadComponent: () => import('./components/professional/reports.component').then(c => c.ReportsComponent)
          },
          {
            path: 'documents',
            loadComponent: () => import('./components/professional/documents.component').then(c => c.DocumentsComponent)
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