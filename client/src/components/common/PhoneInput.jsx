// ============================================
// PhoneInput — numero di telefono con prefisso paese
// - Selettore del paese con ricerca (bandiera + nome + prefisso)
// - Formattazione automatica mentre si digita, secondo il paese
//   (es. IT: 333 123 4567 · FR: 6 12 34 56 78 · US: (202) 555-0123)
// - Al genitore viene passato il numero in formato E.164 (+393331234567)
//
// I nomi dei paesi arrivano da Intl.DisplayNames: tradotti dal browser,
// nessun elenco da mantenere a mano.
// ============================================

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';
import Icon from './Icon';
import './PhoneInput.css';

// Paesi messi in cima: Italia + principali paesi della diaspora e d'Europa
const PINNED = [
  'IT',
  'SN', 'NG', 'MA', 'CI', 'CM', 'GH', 'EG', 'TN', 'DZ', 'ET', 'ER', 'SO', 'ML', 'CD',
  'FR', 'DE', 'GB', 'ES', 'BE', 'CH', 'PT', 'NL', 'US',
];

const DEFAULT_COUNTRY = 'IT';

// Normalizza per la ricerca (senza accenti, minuscole)
const normalize = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Bandiera emoji a partire dal codice ISO (IT → 🇮🇹)
const flagOf = (code) =>
  code
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));

/** Elenco dei paesi con nome tradotto, prefisso e bandiera */
function buildCountries(locale) {
  let displayNames = null;
  try {
    displayNames = new Intl.DisplayNames([locale || 'it'], { type: 'region' });
  } catch {
    displayNames = null; // browser molto vecchi: mostriamo il codice ISO
  }

  const all = getCountries().map((code) => {
    let name = code;
    try {
      name = displayNames?.of(code) || code;
    } catch {
      name = code;
    }
    return {
      code,
      name,
      callingCode: getCountryCallingCode(code),
      flag: flagOf(code),
    };
  });

  const pinned = PINNED.map((c) => all.find((x) => x.code === c)).filter(Boolean);
  const others = all
    .filter((c) => !PINNED.includes(c.code))
    .sort((a, b) => a.name.localeCompare(b.name, locale || 'it'));

  return { pinned, others, all };
}

const PhoneInput = ({
  value = '',                 // E.164 (+393331234567) oppure vuoto
  onChange,                   // (e164: string, meta: {isValid, country}) => void
  defaultCountry = DEFAULT_COUNTRY,
  disabled = false,
  error = false,
  id = 'phone',
  locale = 'it',
  placeholder,
  // I testi arrivano tradotti dal componente genitore.
  searchPlaceholder = '',
  emptyLabel = '',
  countryLabel = 'Country',
}) => {
  const { pinned, others, all } = useMemo(() => buildCountries(locale), [locale]);

  const [country, setCountry] = useState(defaultCountry);
  const [national, setNational] = useState('');   // testo visibile, già formattato
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  // Ultimo valore emesso: evita di riscrivere il campo mentre si digita
  const lastEmitted = useRef('');

  // ── Sincronizza dal valore esterno (es. modalità modifica) ──
  useEffect(() => {
    if (value === lastEmitted.current) return; // valore che abbiamo appena emesso
    if (!value) {
      setNational('');
      return;
    }
    const parsed = parsePhoneNumberFromString(value);
    if (parsed) {
      if (parsed.country) setCountry(parsed.country);
      // Formato nazionale così com'è: lo 0 iniziale fa parte del numero
      // in Italia (02 123 4567) e va conservato.
      setNational(parsed.formatNational() || parsed.nationalNumber);
    } else {
      // Numero non riconosciuto: lo mostriamo così com'è
      setNational(value.replace(/^\+\d+\s*/, ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Chiude la tendina cliccando fuori
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // Tiene visibile l'elemento attivo con la tastiera
  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    listRef.current.querySelectorAll('.pi-option')[activeIndex]
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const currentCountry = useMemo(
    () => all.find((c) => c.code === country) || all.find((c) => c.code === DEFAULT_COUNTRY),
    [all, country]
  );

  /** Calcola l'E.164 e avvisa il genitore */
  const emit = useCallback((text, countryCode) => {
    const digits = (text || '').replace(/\D/g, '');
    if (!digits) {
      lastEmitted.current = '';
      onChange?.('', { isValid: false, country: countryCode });
      return;
    }
    const parsed = parsePhoneNumberFromString(text, countryCode);
    const e164 = parsed
      ? parsed.number
      : `+${getCountryCallingCode(countryCode)}${digits}`;
    lastEmitted.current = e164;
    onChange?.(e164, { isValid: Boolean(parsed?.isValid()), country: countryCode });
  }, [onChange]);

  // ── Digitazione: formatta al volo ──
  const handleInput = (e) => {
    const raw = e.target.value;
    // AsYouType formatta progressivamente; se l'utente cancella
    // manteniamo il testo grezzo per non bloccare la cancellazione.
    const formatted = new AsYouType(country).input(raw);
    const next = formatted.length >= raw.length ? formatted : raw;
    setNational(next);
    emit(next, country);
  };

  // ── Cambio paese: riformatta il numero già inserito ──
  const selectCountry = (code) => {
    setCountry(code);
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
    const digits = national.replace(/\D/g, '');
    const reformatted = digits ? new AsYouType(code).input(digits) : '';
    setNational(reformatted);
    emit(reformatted, code);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // ── Ricerca paese (nome o prefisso) ──
  const filtered = useMemo(() => {
    const q = normalize(query.trim()).replace(/^\+/, '');
    if (!q) return { pinned, others };
    const match = (c) =>
      normalize(c.name).includes(q) ||
      c.callingCode.includes(q) ||
      c.code.toLowerCase() === q;
    return { pinned: pinned.filter(match), others: others.filter(match) };
  }, [pinned, others, query]);

  const flatResults = useMemo(
    () => [...filtered.pinned, ...filtered.others],
    [filtered]
  );

  const onSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = flatResults[activeIndex] || flatResults[0];
      if (pick) selectCountry(pick.code);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(-1);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  // Esempio di numero locale come segnaposto (es. "333 123 4567")
  const nationalPlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    const examples = { IT: '333 123 4567', FR: '6 12 34 56 78', US: '(202) 555-0123' };
    return examples[country] || '123 456 789';
  }, [placeholder, country]);

  const renderOption = (c, index) => (
    <li
      key={c.code}
      role="option"
      aria-selected={c.code === country}
      className={`pi-option ${index === activeIndex ? 'is-active' : ''} ${c.code === country ? 'is-selected' : ''}`}
      onMouseDown={(e) => { e.preventDefault(); selectCountry(c.code); }}
      onMouseEnter={() => setActiveIndex(index)}
    >
      <span className="pi-option__flag" aria-hidden="true">{c.flag}</span>
      <span className="pi-option__name">{c.name}</span>
      <span className="pi-option__code">+{c.callingCode}</span>
    </li>
  );

  return (
    <div className={`pi ${error ? 'pi--err' : ''} ${disabled ? 'pi--disabled' : ''}`} ref={wrapRef}>
      <div className="pi-field">
        {/* Selettore del paese */}
        <button
          type="button"
          className="pi-country"
          onClick={openList}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`${countryLabel}: ${currentCountry?.name} +${currentCountry?.callingCode}`}
          title={currentCountry?.name}
        >
          <span className="pi-country__flag" aria-hidden="true">{currentCountry?.flag}</span>
          <span className="pi-country__code">+{currentCountry?.callingCode}</span>
          <Icon name="arrowDown" size={14} className="pi-country__caret" />
        </button>

        {/* Numero nazionale, formattato mentre si digita */}
        <input
          ref={inputRef}
          id={id}
          type="tel"
          className="pi-input"
          value={national}
          onChange={handleInput}
          disabled={disabled}
          placeholder={nationalPlaceholder}
          autoComplete="tel-national"
          inputMode="tel"
        />
      </div>

      {/* Tendina dei paesi */}
      {open && (
        <div className="pi-dropdown">
          <div className="pi-search">
            <Icon name="search" size={15} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
              onKeyDown={onSearchKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </div>

          <ul className="pi-list" role="listbox" ref={listRef}>
            {flatResults.length === 0 ? (
              <li className="pi-empty">{emptyLabel}</li>
            ) : (
              <>
                {filtered.pinned.map((c, i) => renderOption(c, i))}
                {filtered.pinned.length > 0 && filtered.others.length > 0 && (
                  <li className="pi-sep" role="presentation" />
                )}
                {filtered.others.map((c, i) => renderOption(c, filtered.pinned.length + i))}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
