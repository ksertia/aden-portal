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
      console.log('Services loaded:', this.services); // Debug
    });

    this.landingService.getBenefits(locale).subscribe(data => {
      this.benefits = data || undefined;
      console.log('Benefits loaded:', this.benefits); // Debug
    });

    this.landingService.getStats(locale).subscribe(data => {
      this.stats = data || undefined;
    });

    this.landingService.getCTA(locale).subscribe(data => {
      this.cta = data || undefined;
    });

    this.landingService.getContact(locale).subscribe(data => {
      this.contact = data || undefined;
      console.log('Contact loaded:', this.contact); // Debug
    });

    this.landingService.getFooter(locale).subscribe(data => {
      this.footer = data || undefined;
    });

    this.landingService.getCommon(locale).subscribe(data => {
      this.common = data || undefined;
    });
  }

  /**
   * Retourne la classe CSS pour l'icône du service en fonction de l'index
   */
  getServiceIconClass(index: number): string {
    const classes = ['debtor', 'bailiff', 'lawyer', 'creditor', 'cedant'];
    return classes[index] || 'debtor';
  }

  /**
   * Scroll smooth vers une section
   */
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Soumet le formulaire de contact
   */
  submitContactForm() {
    console.log('Formulaire de contact soumis:', this.contactForm);
    
    // Validation basique
    if (!this.contactForm.firstName || !this.contactForm.lastName || 
        !this.contactForm.email || !this.contactForm.message) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // TODO: Envoyer à Strapi ou à un service de messagerie
    // Exemple avec Strapi:
    // this.http.post(`${environment.apiUrl}/contact-submissions`, {
    //   data: this.contactForm
    // }).subscribe({
    //   next: (response) => {
    //     console.log('Message envoyé avec succès', response);
    //     this.resetContactForm();
    //     alert('Votre message a été envoyé avec succès !');
    //   },
    //   error: (error) => {
    //     console.error('Erreur lors de l\'envoi', error);
    //     alert('Une erreur est survenue. Veuillez réessayer.');
    //   }
    // });

    // Pour le moment, juste un reset et un message
    alert('Votre message a été envoyé avec succès !');
    this.resetContactForm();
  }

  /**
   * Réinitialise le formulaire de contact
   */
  private resetContactForm() {
    this.contactForm = {
      firstName: '',
      lastName: '',
      email: '',
      profile: '',
      message: ''
    };
  }
}