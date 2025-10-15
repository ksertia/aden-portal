// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';
// import { LanguageSwitcherComponent } from '../shared/language-switcher/language-switcher.component';
// import { I18nService } from '../../services/i18n.service';
// import { Nav, Hero, Services, Benefits, Statistiques, CTA, Contact, Footer, Common } from '../../models/landing.model';
// import { LandingService } from '../../services/landing.service';

// @Component({
//   selector: 'app-landing',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, LanguageSwitcherComponent],
//   templateUrl: './landing.component.html',
//   styleUrls: ['./landing.component.css']
// })
// export class LandingComponent implements OnInit {
//   translations: any = {};
  

//   // Données depuis Strapi
//   nav?: Nav;
//   hero?: Hero;
//   services?: Services;
//   benefits?: Benefits;
//   stats?: Statistiques;
//   cta?: CTA;
//   contact?: Contact;
//   footer?: Footer;
//   common?: Common;

//   contactForm = {
//     firstName: '',
//     lastName: '',
//     email: '',
//     profile: '',
//     message: ''
//   };

//   constructor(
//     private i18nService: I18nService,
//     private landingService: LandingService
//   ) {}

//   ngOnInit() {
//     this.loadTranslations();

//     // Recharge à chaque changement de langue
//     this.i18nService.currentLocale$.subscribe(() => {
//       this.loadTranslations();
//       this.loadContent(); // recharge aussi depuis Strapi
//     });

//     this.loadContent();
//   }
//   private loadTranslations() {
//     const currentLocale = this.i18nService.getCurrentLocale();
//     this.i18nService.loadTranslations(currentLocale).subscribe(translations => {
//       this.translations = translations;
//     });
//   }

//   private loadContent() {
//     this.landingService.getNav().subscribe(res => {
//   if (res.data.length > 0) {
//     this.nav = res.data[0];  // déjà compatible
//   }
// });

// this.landingService.getHero().subscribe(res => {
//   if (res.data.length > 0) {
//     this.hero = res.data[0];
//   }
// });

// this.landingService.getServices().subscribe(res => {
//   if (res.data.length > 0) {
//     this.services = res.data[0]; // ⚡ pas de .attributes
//   }
// });

//     this.landingService.getBenefits().subscribe(res => {
//       if (res.data.length > 0) {
//         this.benefits = res.data[0];
//       }
//     });

//     this.landingService.getStats().subscribe(res => {
//       if (res.data.length > 0) {
//         this.stats = res.data[0];
//       }
//     });

//     this.landingService.getCTA().subscribe(res => {
//       if (res.data.length > 0) {
//         this.cta = res.data[0];
//       }
//     });

//     this.landingService.getContact().subscribe(res => {
//       if (res.data.length > 0) {
//         this.contact = res.data[0];
//       }
//     });

//     this.landingService.getFooter().subscribe(res => {
//       if (res.data.length > 0) {
//         this.footer = res.data[0];
//       }
//     });

//     this.landingService.getCommon().subscribe(res => {
//       if (res.data.length > 0) {
//         this.common = res.data[0];
//       }
//     });
//   }

//   t(key: string): string {
//     return this.i18nService.translate(key, this.translations);
//   }

//   scrollToSection(sectionId: string) {
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   }

//   submitContactForm() {
//     console.log('Formulaire de contact soumis:', this.contactForm);
//     // TODO: Envoyer à Strapi via POST si besoin
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LanguageSwitcherComponent } from '../shared/language-switcher/language-switcher.component';
import { I18nService } from '../../services/i18n.service';
import { Nav, Hero, Services, Benefits, Statistiques, CTA, Contact, Footer, Common } from '../../models/landing.model';
import { LandingService } from '../../services/landing.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, LanguageSwitcherComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  // Données depuis Strapi
  nav?: Nav;
  hero?: Hero;
  services?: Services;
  benefits?: Benefits;
  stats?: Statistiques;
  cta?: CTA;
  contact?: Contact;
  footer?: Footer;
  common?: Common;

  contactForm = {
    firstName: '',
    lastName: '',
    email: '',
    profile: '',
    message: ''
  };

  constructor(
    private i18nService: I18nService,
    private landingService: LandingService
  ) {}

  ngOnInit() {
    // Charger le contenu initial
    this.loadContent();

    // Recharger à chaque changement de langue
    this.i18nService.currentLocale$.subscribe(() => {
      this.loadContent();
    });
  }

  private loadContent() {
    const locale = this.i18nService.getCurrentLocale();

    this.landingService.getNav(locale).subscribe(data => {
      this.nav = data || undefined;
    });

    this.landingService.getHero(locale).subscribe(data => {
      this.hero = data || undefined;
    });

    this.landingService.getServices(locale).subscribe(data => {
      this.services = data || undefined;
    });

    this.landingService.getBenefits(locale).subscribe(data => {
      this.benefits = data || undefined;
    });

    this.landingService.getStats(locale).subscribe(data => {
      this.stats = data || undefined;
    });

    this.landingService.getCTA(locale).subscribe(data => {
      this.cta = data || undefined;
    });

    this.landingService.getContact(locale).subscribe(data => {
      this.contact = data || undefined;
    });

    this.landingService.getFooter(locale).subscribe(data => {
      this.footer = data || undefined;
    });

    this.landingService.getCommon(locale).subscribe(data => {
      this.common = data || undefined;
    });
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  submitContactForm() {
    console.log('Formulaire de contact soumis:', this.contactForm);
    // TODO: Envoyer à Strapi via POST si besoin
    // this.http.post(`${apiUrl}/contacts`, this.contactForm).subscribe(...)
  }
}