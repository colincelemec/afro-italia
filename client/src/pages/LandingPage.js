// ============================================
// LandingPage — stile GitHub.com (dark, glow, beam)
// adattato all'identità AfroItalia (marrone/ambra)
// ============================================

import React, { useEffect, useState, useRef } from 'react';
import Icon from '../components/common/Icon';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getCategoryLabel } from '../utils/categoryLabel';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';
import usePageMeta from '../hooks/usePageMeta';
import '../styles/LandingPage.css';

// Raccourcis de catégories affichés sur l'accueil
const CATEGORY_SHORTCUTS = [
  { slug: 'restaurant', icon: 'ristorante' },
  { slug: 'coiffeur',   icon: 'bellezza' },
  { slug: 'epicerie',   icon: 'negozio' },
  { slug: 'mode',       icon: 'moda' },
  { slug: 'beaute',     icon: 'cosmetici' },
  { slug: 'service',    icon: 'servizi' },
];

const LandingPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = (path) => getTranslation(path, language);

  // ── Aperçu de l'annuaire, directement sur l'accueil ──
  // Le visiteur voit de vraies activités sans compte ni clic supplémentaire.
  const [featured, setFeatured] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get('/businesses', { limit: 6 });
        if (active) setFeatured(res.data || []);
      } catch {
        if (active) setFeatured([]);
      }
    })();
    return () => { active = false; };
  }, []);

  // ── Suggestions pendant la frappe ──
  // Le visiteur voit apparaître les activités correspondantes dès les
  // premières lettres, et peut aller directement sur une fiche.
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeSuggest, setActiveSuggest] = useState(-1);
  const searchRef = useRef(null);

  // Recherche différée : on n'interroge pas le serveur à chaque touche
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    let active = true;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/businesses/search', { q });
        if (active) setSuggestions((res.data || []).slice(0, 6));
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 250);

    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  // Fermeture au clic à l'extérieur
  useEffect(() => {
    if (!showSuggest) return;
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showSuggest]);

  const openBusiness = (b) => {
    setShowSuggest(false);
    navigate(`/businesses/${b.slug}`);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    // Une suggestion est surlignée au clavier : on ouvre sa fiche
    if (activeSuggest >= 0 && suggestions[activeSuggest]) {
      openBusiness(suggestions[activeSuggest]);
      return;
    }
    const q = query.trim();
    setShowSuggest(false);
    navigate(q ? `/activities?q=${encodeURIComponent(q)}` : '/activities');
  };

  // Navigation au clavier dans la liste
  const onSearchKeyDown = (e) => {
    if (!showSuggest || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggest(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggest(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggest(false);
      setActiveSuggest(-1);
    }
  };

  usePageMeta({
    title: t('landing.hero.title'),
    description: t('landing.hero.description'),
  });

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

      {/* ════════ HERO — photo plein écran ════════ */}
      {/* La photo se règle dans LandingPage.css (--hero-image).
          Sans photo, un dégradé chaleureux prend le relais. */}
      <section className="hero-section hero-section--photo">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-content">
          <span className="hero-eyebrow">{t('landing.hero.eyebrow')}</span>
          <h1 className="hero-title">
            {t('landing.hero.title')}
          </h1>
          <p className="hero-description">{t('landing.hero.description')}</p>

          {/* Recherche : l'action principale de l'accueil, sans compte */}
          <div className="hero-search-wrap" ref={searchRef}>
            <form className="hero-search" onSubmit={submitSearch} role="search">
              <Icon name="search" size={20} className="hero-search__icon" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggest(true);
                  setActiveSuggest(-1);
                }}
                onFocus={() => setShowSuggest(true)}
                onKeyDown={onSearchKeyDown}
                placeholder={t('landing.search.placeholder')}
                aria-label={t('landing.search.placeholder')}
                role="combobox"
                aria-expanded={showSuggest && suggestions.length > 0}
                aria-controls="hero-suggest-list"
                aria-autocomplete="list"
              />
              <button type="submit" className="hero-search__btn">
                {t('landing.search.button')}
              </button>
            </form>

            {/* Propositions d'activités pendant la frappe */}
            {showSuggest && query.trim().length >= 2 && (
              <div className="hero-suggest" id="hero-suggest-list" role="listbox">
                {searching && suggestions.length === 0 ? (
                  <div className="hero-suggest__msg">{t('landing.search.searching')}</div>
                ) : suggestions.length === 0 ? (
                  <div className="hero-suggest__msg">{t('landing.search.noResult')}</div>
                ) : (
                  <>
                    {suggestions.map((b, i) => (
                      <button
                        type="button"
                        key={b.id}
                        role="option"
                        aria-selected={i === activeSuggest}
                        className={`hero-suggest__item ${i === activeSuggest ? 'is-active' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); openBusiness(b); }}
                        onMouseEnter={() => setActiveSuggest(i)}
                      >
                        <span className="hero-suggest__icon">
                          <Icon name="store" size={16} />
                        </span>
                        <span className="hero-suggest__text">
                          <strong>{b.name}</strong>
                          <small>
                            {getCategoryLabel(b.category, language)}
                            {b.city?.name ? ` · ${b.city.name}` : ''}
                          </small>
                        </span>
                        <Icon name="arrowR" size={14} className="hero-suggest__go" />
                      </button>
                    ))}
                    <button
                      type="button"
                      className="hero-suggest__all"
                      onMouseDown={(e) => { e.preventDefault(); submitSearch(e); }}
                    >
                      {t('landing.search.seeAllResults')} « {query.trim()} »
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/activities" className="hero-browse">
            {t('landing.search.browseAll')} <Icon name="arrowR" size={15} />
          </Link>
        </div>

        <div className="hero-scroll-indicator" aria-hidden="true">
          <Icon name="arrowDown" size={22} />
        </div>
      </section>

      {/* ════════ STATS BAND ════════ */}
      <section className="stats-band">
        <div className="container">
          <div className="stats-band__grid">
            {[
              { icon: 'pin', value: '16', label: 'cities' },
              { icon: 'grid', value: '6', label: 'categories' },
              { icon: 'globe', value: '3', label: 'languages' },
              { icon: 'heart', value: '100%', label: 'free' },
            ].map((s) => (
              <div className="stat-item gh-reveal" key={s.label}>
                <div className="stat-item__icon"><Icon name={s.icon} size={20} /></div>
                <span className="stat-item__value">{s.value}</span>
                <span className="stat-item__label">{t(`landing.stats.${s.label}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CATÉGORIES — accès direct ════════ */}
      <section className="home-cats">
        <div className="container">
          <h2 className="home-cats__title">{t('landing.browseCategories.title')}</h2>
          <div className="home-cats__grid">
            {CATEGORY_SHORTCUTS.map((c) => (
              <Link key={c.slug} to={`/activities?category=${c.slug}`} className="home-cat">
                <Icon name={c.icon} size={26} />
                <span>{getCategoryLabel({ slug: c.slug }, language)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ACTIVITÉS EN VEDETTE — visibles sans compte ════════ */}
      <section className="home-featured">
        <div className="container">
          <div className="home-featured__head">
            <div>
              <h2>{t('landing.featured.title')}</h2>
              <p>{t('landing.featured.subtitle')}</p>
            </div>
            <Link to="/activities" className="home-featured__all">
              {t('landing.featured.seeAll')} <Icon name="arrowR" size={15} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="home-featured__empty">{t('landing.featured.empty')}</p>
          ) : (
            <div className="home-featured__grid">
              {featured.map((b) => (
                <Link key={b.id} to={`/businesses/${b.slug}`} className="home-card">
                  <div className="home-card__media">
                    {b.coverImage || b.logo ? (
                      <img src={b.coverImage || b.logo} alt={b.name} loading="lazy" />
                    ) : (
                      <Icon name="store" size={38} className="home-card__fallback" />
                    )}
                  </div>
                  <div className="home-card__body">
                    <h3>{b.name}</h3>
                    <p className="home-card__meta">
                      {getCategoryLabel(b.category, language)}
                      {b.city?.name ? ` · ${b.city.name}` : ''}
                    </p>
                    <div className="home-card__rating">
                      <Icon name="star" size={13} />
                      <span>{(b.averageRating || 0).toFixed(1)}</span>
                      <span className="home-card__count">({b.reviewCount || 0})</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
            {['t1', 't2', 't3'].map((key) => (
              <div className="testimonial-card gh-card gh-reveal" key={key}>
                <div className="testimonial-quote" aria-hidden="true">"</div>
                <p className="testimonial-text">{t(`landing.testimonials.${key}.text`)}</p>
                <div className="testimonial-author">
                  <strong>{t(`landing.testimonials.${key}.name`)}</strong>
                  <span>{t(`landing.testimonials.${key}.role`)}</span>
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
