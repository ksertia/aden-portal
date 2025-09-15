import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class LanguageSwitcherComponent {
  currentLocale: string = 'fr';
  supportedLocales: string[] = ['fr', 'en'];

  constructor() {
    // Détecter la langue du navigateur
    const browserLang = navigator.language.split('-')[0];
    this.currentLocale = ['fr', 'en'].includes(browserLang) ? browserLang : 'fr';
  }

  switchLanguage(locale: string): void {
    this.currentLocale = locale;
    // Recharger la page avec la nouvelle locale
    const currentUrl = window.location.pathname;
    window.location.href = `/${locale}${currentUrl}`;
  }

  getLanguageLabel(locale: string): string {
    const labels: { [key: string]: string } = {
      'fr': 'FR',
      'en': 'EN'
    };
    return labels[locale];
  }
}