// ============================================
// usePageMeta — titre et métadonnées par page
//
// L'application est une SPA : sans cela, toutes les pages partagent
// le même <title> et la même description. Résultat : Google affiche
// le même libellé partout et un lien partagé sur WhatsApp montre
// « AfroItalia » au lieu du nom de l'activité.
//
// Note : les robots des réseaux sociaux (WhatsApp, Facebook) ne lisent
// pas le JavaScript. Ce hook corrige l'affichage dans le navigateur et
// pour Google ; pour des aperçus parfaits au partage il faudra du
// prerendering côté serveur.
// ============================================

import { useEffect } from 'react';

const SITE_NAME = 'AfroItalia';
const DEFAULT_IMAGE = '/logo_AfroItalia.png';

/** Crée ou met à jour une balise <meta> */
function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Crée ou met à jour <link rel="canonical"> */
function setCanonical(url) {
  if (!url) return;
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

/**
 * @param {Object}  meta
 * @param {string}  meta.title        Titre de la page (sans le nom du site)
 * @param {string}  meta.description  Description pour les moteurs et le partage
 * @param {string}  meta.image        URL absolue de l'image d'aperçu
 * @param {boolean} meta.noIndex      true pour les pages privées
 */
export default function usePageMeta({ title, description, image, noIndex = false } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    const url = window.location.href;
    const img = image || `${window.location.origin}${DEFAULT_IMAGE}`;

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:site_name', SITE_NAME);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:image', img);

    // Les pages privées ne doivent pas être indexées
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    setCanonical(url.split('?')[0]);
  }, [title, description, image, noIndex]);
}
