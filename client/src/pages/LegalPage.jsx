// ============================================
// Legal Page — Privacy / Terms / Cookies / GDPR
// Contenuti multilingua da data/legalContent.js
// ============================================

import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';
import { LEGAL_DOCS, LEGAL_TYPES, LEGAL_COMPANY } from '../data/legalContent';
import Icon from '../components/common/Icon';
import '../styles/Legal.css';

const LegalPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (path) => getTranslation(path, language);
  const L = (obj) => (obj ? (obj[language] || obj.en) : '');

  const doc = LEGAL_DOCS[type];

  // Riporta in cima quando si cambia documento
  useEffect(() => { window.scrollTo({ top: 0 }); }, [type]);

  if (!doc) {
    return (
      <div className="legal">
        <div className="legal-container legal-notfound">
          <Icon name="alert" size={36} />
          <h2>{t('legal.notFound')}</h2>
          <Link to="/" className="legal-back">{t('legal.backHome')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="legal">
      <header className="legal-hero">
        <div className="legal-container">
          <h1><Icon name={doc.icon} size={26} /> {L(doc.title)}</h1>
          <p className="legal-updated">{L(LEGAL_COMPANY.updated)}</p>
        </div>
      </header>

      <div className="legal-container legal-layout">
        {/* Indice / navigazione tra documenti */}
        <aside className="legal-nav">
          <span className="legal-nav__label">{t('footer.legal')}</span>
          <ul>
            {LEGAL_TYPES.map(key => (
              <li key={key}>
                <Link
                  to={`/legal/${key}`}
                  className={key === type ? 'is-active' : ''}
                >
                  {L(LEGAL_DOCS[key].title)}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Contenuto del documento */}
        <article className="legal-doc">
          <p className="legal-intro">{L(doc.intro)}</p>

          {doc.sections.map((s, i) => (
            <section key={i} className="legal-section">
              <h2>{L(s.heading)}</h2>
              {L(s.body).split('\n\n').map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </section>
          ))}

          <div className="legal-footer-note">
            <Icon name="mail" size={14} /> {LEGAL_COMPANY.email}
          </div>

          <button className="legal-back-btn" onClick={() => navigate(-1)}>
            <Icon name="arrowL" size={15} /> {t('legal.back')}
          </button>
        </article>
      </div>
    </div>
  );
};

export default LegalPage;
