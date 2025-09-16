import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LanguageSwitcherComponent } from '../shared/language-switcher/language-switcher.component';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, LanguageSwitcherComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  translations: any = {};
  
  contactForm = {
    firstName: '',
    lastName: '',
    email: '',
    profile: '',
    message: ''
  };

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

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  submitContactForm() {
    console.log('Formulaire de contact soumis:', this.contactForm);
    // TODO: Implémenter l'envoi du formulaire
  }
}