import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, StrapiRole } from '../../models/user.model';
import { DebtCase } from '../../models/case.model';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentUser: User | null = null;
  userCases: DebtCase[] = [];
  statistics: any = null;

  translations: any = {};

  constructor(
    private authService: AuthService,
    private i18nService: I18nService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    this.loadTranslations();
    this.i18nService.currentLocale$.subscribe(() => {
      this.loadTranslations();
    });
  }

  private loadTranslations() {
    const locale = this.i18nService.getCurrentLocale();
    this.i18nService.loadTranslations(locale).subscribe(translations => {
      this.translations = translations;
    });
  }

  t(key: string): string {
    return this.i18nService.translate(key, this.translations);
  }

  // Formatage du montant en devise
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

}
