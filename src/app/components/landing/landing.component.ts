import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-container">
      <!-- Header -->
      <header class="landing-header">
        <nav class="navbar">
          <div class="nav-container">
            <div class="logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v6l3-3 3 3"/>
                <path d="M12 8v8"/>
                <path d="m8 14 4 4 4-4"/>
              </svg>
              <span>RecouvrePro</span>
            </div>
            <div class="nav-links">
              <a (click)="scrollToSection('services')">Services</a>
              <a (click)="scrollToSection('avantages')">Avantages</a>
              <a (click)="scrollToSection('contact')">Contact</a>
              <a routerLink="/login" class="btn btn-primary">Se connecter</a>
            </div>
          </div>
        </nav>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-content fade-in-up">
            <h1>Simplifiez votre recouvrement de créances</h1>
            <p class="hero-subtitle">
              RecouvrePro est la plateforme digitale qui révolutionne la gestion du recouvrement. 
              Débiteurs, huissiers et avocats collaborent efficacement pour résoudre les impayés.
            </p>
            <div class="hero-actions">
              <a routerLink="/login" class="btn btn-primary large">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10,17 15,12 10,7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Accéder au portail
              </a>
              <button class="btn btn-secondary large" (click)="scrollToSection('services')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                En savoir plus
              </button>
            </div>
          </div>
          <div class="hero-image fade-in-up">
            <div class="hero-illustration">
              <div class="illustration-card">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <h3>Gestion digitale</h3>
                <p>Tous vos dossiers centralisés</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section id="services" class="services-section">
        <div class="section-container">
          <div class="section-header fade-in-up">
            <h2>Une solution pour chaque acteur</h2>
            <p>RecouvrePro s'adapte aux besoins spécifiques de chaque professionnel du recouvrement</p>
          </div>
          
          <div class="services-grid">
            <div class="service-card fade-in-up">
              <div class="service-icon debtor">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3>Pour les débiteurs</h3>
              <p>Consultez vos dossiers, proposez des échéanciers et effectuez vos paiements en toute transparence.</p>
              <ul class="service-features">
                <li>Consultation du montant dû, échéances, intérêts et pénalités</li>
                <li>Possibilité de soumettre des justificatifs de paiement ou autres documents</li>
                <li>Consultation de l'historique des relances</li>
                <li>Demander un échelonnement ou formuler une contestation</li>
              </ul>
            </div>
            
            <div class="service-card fade-in-up">
              <div class="service-icon bailiff">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="9"/>
                </svg>
              </div>
              <h3>Pour les huissiers</h3>
              <p>Gérez efficacement vos dossiers de recouvrement avec des outils professionnels avancés.</p>
              <ul class="service-features">
                <li>Gestion complète des dossiers</li>
                <li>Automatisation des procédures</li>
                <li>Rapports d'activité détaillés</li>
                <li>Communication centralisée</li>
              </ul>
            </div>
            
            <div class="service-card fade-in-up">
              <div class="service-icon lawyer">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <h3>Pour les avocats</h3>
              <p>Accompagnez vos clients avec des outils juridiques spécialisés et un suivi personnalisé.</p>
              <ul class="service-features">
                <li>Analyse juridique approfondie</li>
                <li>Consultations en ligne</li>
                <li>Gestion documentaire sécurisée</li>
                <li>Expertise légale intégrée</li>
              </ul>
            </div>
            
            <div class="service-card fade-in-up">
              <div class="service-icon creditor">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>Pour les créanciers</h3>
              <p>Suivez en temps réel l'évolution de vos créances et optimisez votre taux de recouvrement.</p>
              <ul class="service-features">
                <li>Suivi temps réel de l'avancement</li>
                <li>Consultation des documents et preuves</li>
                <li>Rapports périodiques détaillés</li>
                <li>Notifications de paiements et actions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Avantages Section -->
      <section id="avantages" class="benefits-section">
        <div class="section-container">
          <div class="section-header fade-in-up">
            <h2>Pourquoi choisir RecouvrePro ?</h2>
            <p>Une plateforme moderne qui transforme la gestion du recouvrement</p>
          </div>
          
          <div class="benefits-grid">
            <div class="benefit-item fade-in-up">
              <div class="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Sécurité maximale</h3>
              <p>Vos données sont protégées par un chiffrement de niveau bancaire et des protocoles de sécurité avancés.</p>
            </div>
            
            <div class="benefit-item fade-in-up">
              <div class="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <h3>Gain de temps</h3>
              <p>Automatisez vos processus et réduisez le temps de traitement de vos dossiers de 60%.</p>
            </div>
            
            <div class="benefit-item fade-in-up">
              <div class="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 2v6l3-3 3 3-3 3v6"/>
                  <path d="M15 8h6"/>
                  <path d="M15 16h6"/>
                </svg>
              </div>
              <h3>Rapports intelligents</h3>
              <p>Générez des rapports détaillés et des analyses pour optimiser vos performances.</p>
            </div>
            
            <div class="benefit-item fade-in-up">
              <div class="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>Communication fluide</h3>
              <p>Facilitez les échanges entre toutes les parties prenantes avec des outils de communication intégrés.</p>
            </div>
            
            <div class="benefit-item fade-in-up">
              <div class="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3>Conformité légale</h3>
              <p>Respectez automatiquement toutes les réglementations en vigueur avec nos mises à jour continues.</p>
            </div>
            
            <div class="benefit-item fade-in-up">
              <div class="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <path d="M20 8v6"/>
                  <path d="M23 11h-6"/>
                </svg>
              </div>
              <h3>Support expert</h3>
              <p>Bénéficiez d'un accompagnement personnalisé par nos experts du recouvrement.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="section-container">
          <div class="stats-grid">
            <div class="stat-item fade-in-up">
              <div class="stat-number">95%</div>
              <div class="stat-label">Taux de satisfaction</div>
            </div>
            <div class="stat-item fade-in-up">
              <div class="stat-number">60%</div>
              <div class="stat-label">Gain de temps moyen</div>
            </div>
            <div class="stat-item fade-in-up">
              <div class="stat-number">10k+</div>
              <div class="stat-label">Dossiers traités</div>
            </div>
            <div class="stat-item fade-in-up">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Support disponible</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="section-container">
          <div class="cta-content fade-in-up">
            <h2>Prêt à révolutionner votre recouvrement ?</h2>
            <p>Rejoignez des milliers de professionnels qui font confiance à RecouvrePro</p>
            <div class="cta-actions">
              <a routerLink="/login" class="btn btn-primary large">
                Commencer maintenant
              </a>
              <button class="btn btn-secondary large" (click)="scrollToSection('contact')">
                Nous contacter
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="contact-section">
        <div class="section-container">
          <div class="section-header fade-in-up">
            <h2>Contactez-nous</h2>
            <p>Notre équipe d'experts est à votre disposition</p>
          </div>
          
          <div class="contact-grid">
            <div class="contact-info fade-in-up">
              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h3>Adresse</h3>
                  <p>123 Avenue des Affaires<br>75001 Paris, France</p>
                </div>
              </div>
              
              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h3>Téléphone</h3>
                  <p>+33 1 23 45 67 89</p>
                </div>
              </div>
              
              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <h3>Email</h3>
                  <p>contact&#64;recouvrepro.fr</p>
                </div>
              </div>
            </div>
            
            <div class="contact-form fade-in-up">
              <form class="form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Prénom</label>
                    <input type="text" placeholder="Votre prénom">
                  </div>
                  <div class="form-group">
                    <label>Nom</label>
                    <input type="text" placeholder="Votre nom">
                  </div>
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="votre.email@exemple.fr">
                </div>
                <div class="form-group">
                  <label>Profil</label>
                  <select>
                    <option>Sélectionnez votre profil</option>
                    <option>Débiteur</option>
                    <option>Huissier de justice</option>
                    <option>Avocat</option>
                    <option>Créancier</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Message</label>
                  <textarea rows="4" placeholder="Décrivez votre besoin..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Envoyer le message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-container">
          <div class="footer-content">
            <div class="footer-section">
              <div class="footer-logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v6l3-3 3 3"/>
                  <path d="M12 8v8"/>
                  <path d="m8 14 4 4 4-4"/>
                </svg>
                <span>RecouvrePro</span>
              </div>
              <p>La plateforme digitale qui révolutionne le recouvrement de créances.</p>
            </div>
            
            <div class="footer-section">
              <h3>Services</h3>
              <ul>
                <li><a href="#services">Pour les débiteurs</a></li>
                <li><a href="#services">Pour les huissiers</a></li>
                <li><a href="#services">Pour les avocats</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h3>Support</h3>
              <ul>
                <li><a href="#contact">Nous contacter</a></li>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h3>Légal</h3>
              <ul>
                <li><a href="#">Mentions légales</a></li>
                <li><a href="#">Politique de confidentialité</a></li>
                <li><a href="#">CGU</a></li>
              </ul>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p>&copy; 2024 RecouvrePro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
      background: var(--background);
    }

    /* Header */
    .landing-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
      z-index: 1000;
    }

    .navbar {
      padding: 16px 0;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 20px;
      color: var(--primary);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .nav-links a {
      text-decoration: none;
      color: var(--text);
      font-weight: 500;
      transition: color 0.2s ease;
      cursor: pointer;
    }

    .nav-links a:hover {
      color: var(--primary);
    }

    /* Hero Section */
    .hero-section {
      padding: 120px 0 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .hero-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 32px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: center;
    }

    .hero-content h1 {
      font-size: 48px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 24px;
    }

    .hero-subtitle {
      font-size: 20px;
      line-height: 1.6;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .btn.large {
      padding: 16px 32px;
      font-size: 16px;
    }

    .hero-illustration {
      display: flex;
      justify-content: center;
    }

    .illustration-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .illustration-card svg {
      margin-bottom: 16px;
      color: white;
    }

    .illustration-card h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    /* Sections */
    .section-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 32px;
    }

    .section-header {
      text-align: center;
      margin-bottom: 64px;
    }

    .section-header h2 {
      font-size: 36px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 16px;
    }

    .section-header p {
      font-size: 18px;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }

    /* Services Section */
    .services-section {
      padding: 80px 0;
      background: var(--surface);
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 32px;
    }

    .service-card {
      background: var(--background);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      transition: transform 0.2s ease;
    }

    .service-card:hover {
      transform: translateY(-4px);
    }

    .service-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      color: white;
    }

    .service-icon.debtor { background: var(--success); }
    .service-icon.bailiff { background: var(--warning); }
    .service-icon.lawyer { background: var(--primary); }
    .service-icon.creditor { background: #2563eb; }
    .service-icon.cedant { background: var(--success); }

    .service-card h3 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
    }

    .service-card p {
      color: var(--text-secondary);
      margin-bottom: 24px;
      line-height: 1.6;
    }

    .service-features {
      list-style: none;
      padding: 0;
    }

    .service-features li {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: var(--text);
      font-size: 14px;
    }

    .service-features li::before {
      content: "✓";
      color: var(--success);
      font-weight: bold;
    }

    /* Benefits Section */
    .benefits-section {
      padding: 80px 0;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }

    .benefit-item {
      text-align: center;
      padding: 24px;
    }

    .benefit-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .benefit-item h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
    }

    .benefit-item p {
      color: var(--text-secondary);
      line-height: 1.6;
    }

    /* Stats Section */
    .stats-section {
      padding: 80px 0;
      background: var(--primary);
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 32px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 16px;
      opacity: 0.9;
    }

    /* CTA Section */
    .cta-section {
      padding: 80px 0;
      background: var(--surface);
    }

    .cta-content {
      text-align: center;
    }

    .cta-content h2 {
      font-size: 36px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 16px;
    }

    .cta-content p {
      font-size: 18px;
      color: var(--text-secondary);
      margin-bottom: 32px;
    }

    .cta-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Contact Section */
    .contact-section {
      padding: 80px 0;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
    }

    .contact-item {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }

    .contact-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .contact-item h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .contact-item p {
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .form {
      background: var(--surface);
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 8px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 16px;
      font-family: inherit;
    }

    /* Footer */
    .footer {
      background: #1f2937;
      color: white;
      padding: 64px 0 24px;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 32px;
    }

    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 48px;
      margin-bottom: 48px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 20px;
      margin-bottom: 16px;
    }

    .footer-section h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
    }

    .footer-section ul li {
      margin-bottom: 8px;
    }

    .footer-section ul li a {
      color: #d1d5db;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .footer-section ul li a:hover {
      color: white;
    }

    .footer-bottom {
      border-top: 1px solid #374151;
      padding-top: 24px;
      text-align: center;
      color: #9ca3af;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .hero-container {
        grid-template-columns: 1fr;
        gap: 48px;
        text-align: center;
      }

      .contact-grid {
        grid-template-columns: 1fr;
        gap: 48px;
      }

      .footer-content {
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }
    }

    @media (max-width: 768px) {
      .nav-container {
        padding: 0 16px;
      }

      .nav-links {
        gap: 16px;
      }

      .section-container {
        padding: 0 16px;
      }

      .hero-content h1 {
        font-size: 36px;
      }

      .hero-subtitle {
        font-size: 18px;
      }

      .services-grid {
        grid-template-columns: 1fr;
      }

      .benefits-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }
    }

    @media (max-width: 640px) {
      .nav-links {
        display: none;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LandingComponent {
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}