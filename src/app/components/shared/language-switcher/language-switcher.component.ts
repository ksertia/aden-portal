import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, SupportedLocale } from '../../../services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
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
    if (locale !== this.currentLocale) {
      this.i18nService.setLocale(locale);
      // Plus besoin de recharger la page !
      // Le changement de langue déclenche automatiquement
      // le rechargement du contenu via currentLocale$ dans landing.component.ts
    }
  }

  getLanguageLabel(locale: SupportedLocale): string {
    const labels: { [key: string]: string } = {
      'fr': 'FR',
      'en': 'EN'
    };
    return labels[locale];
  }

  getFlagEmoji(locale: SupportedLocale): string {
    const flags: { [key: string]: string } = {
      'fr': '🇫🇷',
      'en': '🇬🇧'
    };
    return flags[locale];
  }
}