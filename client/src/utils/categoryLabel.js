// ============================================
// Nom de catégorie traduit
//
// Les catégories sont stockées en base avec un nom en français
// (« Beauté & Cosmétiques »). Affiché tel quel, ce nom restait en
// français même quand l'interface était en anglais ou en italien.
//
// On traduit donc à partir du `slug`, qui est stable et indépendant
// de la langue. Si une catégorie inconnue apparaît (ajoutée plus tard
// en base), on retombe proprement sur son nom d'origine.
// ============================================

import { getTranslation } from '../locales/translations';

// slug en base → clé de traduction
export const CATEGORY_LABEL_KEYS = {
  restaurant: 'app.activities.catRestaurants',
  coiffeur:   'app.activities.catHair',
  epicerie:   'app.activities.catGrocery',
  mode:       'app.activities.catFashion',
  beaute:     'app.activities.catBeauty',
  service:    'app.activities.catServices',
};

/**
 * Retourne le nom de la catégorie dans la langue courante.
 *
 * @param {Object} category  L'objet catégorie ({ slug, name })
 * @param {string} language  'en' | 'fr' | 'it'
 * @returns {string}
 */
export function getCategoryLabel(category, language) {
  if (!category) return '';

  const key = CATEGORY_LABEL_KEYS[category.slug];
  if (!key) return category.name || '';

  const translated = getTranslation(key, language);
  // getTranslation renvoie la clé elle-même si la traduction manque
  return translated === key ? (category.name || '') : translated;
}

export default getCategoryLabel;
