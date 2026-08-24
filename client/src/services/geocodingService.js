// ============================================
// Geocoding — da indirizzo a coordinate GPS
// Usa Nominatim (OpenStreetMap): gratuito, senza chiave API,
// coerente con le mappe Leaflet/OSM già usate nel progetto.
//
// Regole d'uso di Nominatim rispettate:
//  - massimo ~1 richiesta al secondo (il chiamante fa il debounce)
//  - ricerca limitata all'Italia (countrycodes=it)
//  - una sola richiesta alla volta (le precedenti vengono annullate)
// ============================================

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Richiesta in corso: viene annullata se ne parte una nuova
let currentController = null;

/**
 * Converte un indirizzo in coordinate.
 *
 * @param {string} address  Via e numero civico (es. "Via Padova 36")
 * @param {string} cityName Nome della città (es. "Milano")
 * @returns {Promise<{lat: number, lng: number, displayName: string} | null>}
 *          null se l'indirizzo non è stato trovato.
 * @throws  {Error} in caso di problema di rete (non se semplicemente non trovato)
 */
export async function geocodeAddress(address, cityName) {
  const street = (address || '').trim();
  if (!street) return null;

  // Annulla l'eventuale ricerca precedente ancora in corso
  if (currentController) currentController.abort();
  currentController = new AbortController();
  const { signal } = currentController;

  const query = [street, cityName, 'Italia'].filter(Boolean).join(', ');

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'it',
    addressdetails: '0',
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);

  const results = await res.json();
  if (!Array.isArray(results) || results.length === 0) return null;

  const { lat, lon, display_name: displayName } = results[0];
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

  return { lat: latitude, lng: longitude, displayName };
}

/** Annulla la ricerca in corso (es. smontaggio del componente) */
export function cancelGeocoding() {
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}

const geocodingService = { geocodeAddress, cancelGeocoding };
export default geocodingService;
