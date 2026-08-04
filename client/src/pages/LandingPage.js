// ============================================
// LandingPage — stile GitHub.com (dark, glow, beam)
// adattato all'identità AfroItalia (marrone/ambra)
// ============================================

import React, { useEffect } from 'react';
import Icon from '../components/common/Icon';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const { language } = useLanguage();
  const t = (path) => getTranslation(path, language);

  // ── Scroll-reveal in stile GitHub ──
  useEffect(() => {
    const els = document.querySelectorAll('.landing-page .gh-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">

      {/* ════════ HERO ════════ */}
      <section className="hero-section">
        {/* Effetti: orbe luminose + griglia + stelle */}
        <div className="gh-stars" aria-hidden="true"></div>
        <div className="gh-orb gh-orb--gold" aria-hidden="true"></div>
        <div className="gh-orb gh-orb--brown" aria-hidden="true"></div>
        <div className="gh-orb gh-orb--ember" aria-hidden="true"></div>

        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gh-gradient-text">{t('landing.hero.title')}</span>
          </h1>
          <p className="hero-description">{t('landing.hero.description')}</p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary">
              {t('landing.hero.ctaGetStarted')}
              <Icon name="arrowR" size={16} />
            </Link>
            <Link to="/login" className="btn btn-secondary">
              {t('landing.hero.ctaSignIn')}
            </Link>
          </div>
        </div>

        <div className="hero-scroll-indicator" aria-hidden="true">
          <Icon name="arrowDown" size={22} />
        </div>
      </section>

      {/* ════════ MISSIONE ════════ */}
      <section id="mission" className="mission-section">
        <div className="container">
          <div className="section-header gh-reveal">
            <span className="gh-eyebrow gh-eyebrow--gold">AfroItalia</span>
            <h2 className="section-title">{t('landing.mission.title')}</h2>
          </div>
          <div className="mission-content">
            {[1, 2, 3].map((n) => (
              <div className="mission-card gh-card gh-reveal" key={n}>
                <h3>{t(`landing.mission.card${n}.title`)}</h3>
                <p>{t(`landing.mission.card${n}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ COME FUNZIONA — beam verticale ════════ */}
      <section className="how-it-works-section">
        <div className="gh-beam" aria-hidden="true"></div>
        <div className="container">
          <div className="section-header gh-reveal">
            <span className="gh-eyebrow gh-eyebrow--ember">Step by step</span>
            <h2 className="section-title">{t('landing.howItWorks.title')}</h2>
          </div>
          <div className="steps-container">
            {[1, 2, 3].map((n) => (
              <div className="step gh-reveal" key={n}>
                <div className="step-number">{n}</div>
                <h3>{t(`landing.howItWorks.step${n}.title`)}</h3>
                <p>{t(`landing.howItWorks.step${n}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FUNZIONALITÀ ════════ */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header gh-reveal">
            <span className="gh-eyebrow gh-eyebrow--gold">Features</span>
            <h2 className="section-title">{t('landing.features.title')}</h2>
          </div>
          <div className="features-grid">
            {[
              { icon: 'store',    key: 'businessDirectory' },
              { icon: 'star',     key: 'reviews' },
              { icon: 'calendar', key: 'events' },
              { icon: 'pin',      key: 'location' },
              { icon: 'chart',    key: 'dashboard' },
              { icon: 'users',    key: 'community' },
            ].map((f) => (
              <div className="feature-card gh-card gh-reveal" key={f.key}>
                <div className="feature-icon"><Icon name={f.icon} size={26} /></div>
                <h3>{t(`landing.features.${f.key}.title`)}</h3>
                <p>{t(`landing.features.${f.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ VANTAGGI ════════ */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header gh-reveal">
            <span className="gh-eyebrow gh-eyebrow--ember">Why AfroItalia</span>
            <h2 className="section-title">{t('landing.benefits.title')}</h2>
          </div>
          <div className="benefits-container">
            <div className="benefit-column gh-card gh-reveal">
              <h3>{t('landing.benefits.forCustomers.title')}</h3>
              <ul className="benefit-list">
                {[1, 2, 3, 4, 5].map((n) => (
                  <li key={n}>
                    <Icon name="check" size={16} className="benefit-check" />
                    {t(`landing.benefits.forCustomers.benefit${n}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="benefit-column gh-card gh-reveal">
              <h3>{t('landing.benefits.forBusinesses.title')}</h3>
              <ul className="benefit-list">
                {[1, 2, 3, 4, 5].map((n) => (
                  <li key={n}>
                    <Icon name="check" size={16} className="benefit-check" />
                    {t(`landing.benefits.forBusinesses.benefit${n}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ TESTIMONIANZE ════════ */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header gh-reveal">
            <span className="gh-eyebrow gh-eyebrow--gold">Community</span>
            <h2 className="section-title">{t('landing.testimonials.title')}</h2>
          </div>
          <div className="testimonials-grid">
            {[
              {
                text: "AfroItalia helped me discover amazing African restaurants in Milan I never knew existed. It's become my go-to platform!",
                name: 'Amina K.',
                role: 'Customer - Milano',
              },
              {
                text: "Since joining AfroItalia, my hair salon's visibility has increased by 300%. The platform truly supports African businesses.",
                name: 'Emmanuel O.',
                role: 'Business Owner - Roma',
              },
              {
                text: "Finally, a platform that celebrates our community! I've connected with so many entrepreneurs and customers through AfroItalia.",
                name: 'Fatou D.',
                role: 'Business Owner - Torino',
              },
            ].map((tm) => (
              <div className="testimonial-card gh-card gh-reveal" key={tm.name}>
                <div className="testimonial-quote" aria-hidden="true">"</div>
                <p className="testimonial-text">{tm.text}</p>
                <div className="testimonial-author">
                  <strong>{tm.name}</strong>
                  <span>{tm.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA FINALE ════════ */}
      <section className="final-cta-section">
        <div className="gh-orb gh-orb--cta" aria-hidden="true"></div>
        <div className="container gh-reveal">
          <h2><span className="gh-gradient-text">{t('landing.finalCta.title')}</span></h2>
          <p>{t('landing.finalCta.description')}</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              {t('landing.finalCta.signUpButton')}
              <Icon name="arrowR" size={16} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              {t('landing.finalCta.signInButton')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
