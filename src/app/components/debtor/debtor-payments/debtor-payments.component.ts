import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-debtor-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './debtor-payments.component.html',
  styleUrls: ['./debtor-payments.component.css']
})
export class DebtorPaymentsComponent {
  translations: any = {};

  constructor(private i18nService: I18nService) {
    this.loadTranslations();

    // Écouter les changements de langue
    this.i18nService.currentLocale$.subscribe(() => {
      this.loadTranslations();
    });
  }

  private loadTranslations() {
    const currentLocale = this.i18nService.getCurrentLocale();
    this.i18nService.loadTranslations(currentLocale).subscribe(translations => {
      this.translations = translations;
    });
  }

  t(key: string): string {
    return this.i18nService.translate(key, this.translations);
  }
}

