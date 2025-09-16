import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, SupportedLocale } from '../../../services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: ` `,
  styles: [` `]
})
export class LanguageSwitcherComponent implements OnInit {
  currentLocale: SupportedLocale = 'fr';
  supportedLocales: SupportedLocale[] = ['fr', 'en'];

  constructor(private i18nService: I18nService) {}

  ngOnInit() {
    this.i18nService.currentLocale$.subscribe(locale => {
      this.currentLocale = locale;
    });
  }

  switchLanguage(locale: SupportedLocale): void {
    this.i18nService.setLocale(locale);
    // Recharger la page pour appliquer la nouvelle langue
    window.location.reload();
  }

  getLanguageLabel(locale: SupportedLocale): string {
    const labels: { [key: string]: string } = {
      'fr': 'FR',
      'en': 'EN'
    };
    return labels[locale];
  }
}