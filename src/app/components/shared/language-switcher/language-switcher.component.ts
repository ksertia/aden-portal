import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, SupportedLocale } from '../../../services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      <button 
        *ngFor="let locale of supportedLocales"
        class="lang-btn"
        [class.active]="locale === currentLocale"
        (click)="switchLanguage(locale)"
      >
        {{ getLanguageLabel(locale) }}
      </button>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }

    .lang-btn {
      padding: 6px 12px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
    }

    .lang-btn:hover {
      background: #f8fafc;
      color: var(--text);
    }

    .lang-btn.active {
      background: var(--primary);
      color: white;
    }

    .lang-btn.active:hover {
      background: var(--primary-dark);
    }
  `]
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