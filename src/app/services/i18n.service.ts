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

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { environment } from '../../environment/environment';

// export type SupportedLocale = 'fr' | 'en';

// @Injectable({
//   providedIn: 'root'
// })
// export class I18nService {
//   private currentLocaleSubject = new BehaviorSubject<SupportedLocale>('fr');
//   public currentLocale$ = this.currentLocaleSubject.asObservable();

//   constructor(private http: HttpClient) {
//     // Récupérer la langue depuis localStorage ou utiliser 'fr' par défaut
//     const savedLocale = localStorage.getItem('locale') as SupportedLocale;
//     if (savedLocale && (savedLocale === 'fr' || savedLocale === 'en')) {
//       this.currentLocaleSubject.next(savedLocale);
//     }
//   }

//   getCurrentLocale(): SupportedLocale {
//     return this.currentLocaleSubject.value;
//   }

//   setLocale(locale: SupportedLocale): void {
//     localStorage.setItem('locale', locale);
//     this.currentLocaleSubject.next(locale);
//   }

//   // Méthode helper pour traduire (garde compatibilité)
//   translate(key: string, translations: any): string {
//     const keys = key.split('.');
//     let value = translations;
    
//     for (const k of keys) {
//       if (value && value[k]) {
//         value = value[k];
//       } else {
//         return key;
//       }
//     }
    
//     return value;
//   }

//   // Cette méthode n'est plus nécessaire avec Strapi i18n
//   loadTranslations(locale: SupportedLocale): Observable<any> {
//     // Retourne un observable vide car tout vient de Strapi maintenant
//     return new Observable(observer => {
//       observer.next({});
//       observer.complete();
//     });
//   }
// }