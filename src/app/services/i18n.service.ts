import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';

export type SupportedLocale = 'fr' | 'en';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLocaleSubject = new BehaviorSubject<SupportedLocale>('fr');
  public currentLocale$ = this.currentLocaleSubject.asObservable();
  
  private translationsCache = new Map<SupportedLocale, any>();

  constructor(private http: HttpClient) {
    // Récupérer la langue sauvegardée ou détecter celle du navigateur
    const savedLocale = localStorage.getItem('locale') as SupportedLocale;
    const browserLang = navigator.language.split('-')[0] as SupportedLocale;
    const defaultLocale = savedLocale || (['fr', 'en'].includes(browserLang) ? browserLang : 'fr');
    
    this.setLocale(defaultLocale);
  }

  getCurrentLocale(): SupportedLocale {
    return this.currentLocaleSubject.value;
  }

  setLocale(locale: SupportedLocale): void {
    this.currentLocaleSubject.next(locale);
    localStorage.setItem('locale', locale);
  }

  loadTranslations(locale: SupportedLocale): Observable<any> {
    if (this.translationsCache.has(locale)) {
      return new BehaviorSubject(this.translationsCache.get(locale)).asObservable();
    }

    return this.http.get(`/assets/i18n/${locale}.json`).pipe(
      map(translations => {
        this.translationsCache.set(locale, translations);
        return translations;
      }),
      shareReplay(1)
    );
  }

  translate(key: string, translations: any): string {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }

  getSupportedLocales(): SupportedLocale[] {
    return ['fr', 'en'];
  }
}