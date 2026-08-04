// ============================================
// Add Service — modulo per pubblicare un servizio/attività
// Accessibile a qualunque utente autenticato.
// I dati sono salvati come "business" (stato PENDING → moderazione admin).
// ============================================

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import businessService from '../services/businessService';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';
import Icon from '../components/common/Icon';
import '../styles/AddService.css';

// Fix icone Leaflet (path di default rotto con i bundler)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ITALY_CENTER = [42.5, 12.5];

// Sposta la vista della mappa quando cambia il centro (es. città scelta)
const Recenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom());
  }, [center, zoom, map]);
  return null;
};

// Posiziona il pin al click sulla mappa
const LocationPicker = ({ position, onChange }) => {
  useMapEvents({
    click(e) { onChange([e.latlng.lat, e.latlng.lng]); },
  });
  return position ? (
    <Marker
      position={position}
      draggable
      eventHandlers={{ dragend: (e) => { const m = e.target.getLatLng(); onChange([m.lat, m.lng]); } }}
    />
  ) : null;
};

const AddService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  const { language } = useLanguage();
  const t = (path) => getTranslation(path, language);

  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    cityId: '',
    address: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    whatsapp: '',
    logo: '',
    coverImage: '',
  });
  const [position, setPosition] = useState(null); // [lat, lng]
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Carica città + categorie
  useEffect(() => {
    (async () => {
      try {
        const [cRes, catRes] = await Promise.all([
          businessService.getCities(),
          businessService.getCategories(),
        ]);
        setCities(cRes.data?.cities || []);
        setCategories(catRes.data?.categories || []);
      } catch (e) {
        setServerError(e.message);
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);

  // Modalità modifica: precompila dal servizio esistente
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        let biz = location.state?.business;
        if (!biz) {
          // Fallback: nessuno stato di routing (es. refresh) → cerca nei miei servizi
          const res = await businessService.getMyBusinesses();
          biz = (res.data || []).find(b => b.id === id);
        }
        if (!biz) { setServerError(t('app.addService.notFound')); return; }
        setForm({
          name: biz.name || '',
          categoryId: biz.categoryId || '',
          cityId: biz.cityId || '',
          address: biz.address || '',
          description: biz.description || '',
          website: biz.website || '',
          phone: biz.phone || '',
          email: biz.email || '',
          whatsapp: biz.whatsapp || '',
          logo: biz.logo || '',
          coverImage: biz.coverImage || '',
        });
        if (biz.latitude != null && biz.longitude != null) {
          setPosition([biz.latitude, biz.longitude]);
        }
      } catch (e) {
        setServerError(e.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  // Centro mappa: città scelta → suo centro, altrimenti Italia
  const selectedCity = useMemo(
    () => cities.find(c => c.id === form.cityId),
    [cities, form.cityId]
  );
  const mapCenter = position
    || (selectedCity ? [selectedCity.latitude, selectedCity.longitude] : ITALY_CENTER);
  const mapZoom = position ? 15 : (selectedCity ? 12 : 6);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError(null);
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = t('app.addService.errRequired');
    else if (form.name.trim().length < 2) err.name = t('app.addService.errNameShort');
    if (!form.categoryId) err.categoryId = t('app.addService.errRequired');
    if (!form.cityId) err.cityId = t('app.addService.errRequired');
    if (!form.address.trim()) err.address = t('app.addService.errRequired');
    if (!form.description.trim()) err.description = t('app.addService.errRequired');
    else if (form.description.trim().length < 20) err.description = t('app.addService.errDescShort');
    if (form.website && !/^https?:\/\/.+/i.test(form.website)) err.website = t('app.addService.errUrl');
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) err.email = t('app.addService.errEmail');
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Coordinate: pin scelto, oppure centro città (fallback gestito anche dal backend)
      const coords = position || (selectedCity ? [selectedCity.latitude, selectedCity.longitude] : null);
      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        cityId: form.cityId,
        address: form.address.trim(),
        description: form.description.trim(),
        website: form.website.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        logo: form.logo.trim(),
        coverImage: form.coverImage.trim(),
      };
      if (coords) { payload.latitude = coords[0]; payload.longitude = coords[1]; }

      if (isEdit) {
        await businessService.updateBusiness(id, payload);
      } else {
        await businessService.createBusiness(payload);
      }
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1600);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="as">
        <div className="as-container as-success">
          <div className="as-success__icon"><Icon name="check" size={40} /></div>
          <h2>{isEdit ? t('app.addService.successEditTitle') : t('app.addService.successTitle')}</h2>
          <p>{isEdit ? t('app.addService.successEditMsg') : t('app.addService.successMsg')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="as">
      <header className="as-hero">
        <div className="as-container">
          <h1><Icon name={isEdit ? 'pen' : 'store'} size={24} /> {isEdit ? t('app.addService.editTitle') : t('app.addService.title')}</h1>
          <p>{isEdit ? t('app.addService.editSubtitle') : t('app.addService.subtitle')}</p>
        </div>
      </header>

      <div className="as-container">
        {serverError && (
          <div className="as-alert">
            <Icon name="alert" size={16} /> {serverError}
            <button type="button" onClick={() => setServerError(null)}><Icon name="close" size={14} /></button>
          </div>
        )}

        <form className="as-form" onSubmit={handleSubmit} noValidate>
          {/* ── Informazioni principali ── */}
          <section className="as-card">
            <h3 className="as-card__title">{t('app.addService.sectionMain')}</h3>

            <div className="as-field">
              <label htmlFor="name">{t('app.addService.name')} *</label>
              <input id="name" name="name" type="text" value={form.name}
                onChange={handleChange} className={errors.name ? 'as-input as-input--err' : 'as-input'}
                placeholder={t('app.addService.namePh')} />
              {errors.name && <span className="as-err">{errors.name}</span>}
            </div>

            <div className="as-row">
              <div className="as-field">
                <label htmlFor="categoryId">{t('app.addService.category')} *</label>
                <select id="categoryId" name="categoryId" value={form.categoryId}
                  onChange={handleChange} disabled={loadingMeta}
                  className={errors.categoryId ? 'as-input as-input--err' : 'as-input'}>
                  <option value="">{loadingMeta ? t('app.addService.loading') : t('app.addService.selectCategory')}</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <span className="as-err">{errors.categoryId}</span>}
              </div>

              <div className="as-field">
                <label htmlFor="cityId">{t('app.addService.city')} *</label>
                <select id="cityId" name="cityId" value={form.cityId}
                  onChange={handleChange} disabled={loadingMeta}
                  className={errors.cityId ? 'as-input as-input--err' : 'as-input'}>
                  <option value="">{loadingMeta ? t('app.addService.loading') : t('app.addService.selectCity')}</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}{c.region ? ` (${c.region})` : ''}</option>)}
                </select>
                {errors.cityId && <span className="as-err">{errors.cityId}</span>}
              </div>
            </div>

            <div className="as-field">
              <label htmlFor="address">{t('app.addService.address')} *</label>
              <input id="address" name="address" type="text" value={form.address}
                onChange={handleChange} className={errors.address ? 'as-input as-input--err' : 'as-input'}
                placeholder={t('app.addService.addressPh')} />
              {errors.address && <span className="as-err">{errors.address}</span>}
            </div>

            <div className="as-field">
              <label htmlFor="description">{t('app.addService.description')} *</label>
              <textarea id="description" name="description" rows={4} value={form.description}
                onChange={handleChange} className={errors.description ? 'as-input as-input--err' : 'as-input'}
                placeholder={t('app.addService.descriptionPh')} />
              <span className="as-hint">{form.description.trim().length}/20 {t('app.addService.minChars')}</span>
              {errors.description && <span className="as-err">{errors.description}</span>}
            </div>
          </section>

          {/* ── Posizione sulla mappa ── */}
          <section className="as-card">
            <h3 className="as-card__title">{t('app.addService.sectionLocation')}</h3>
            <p className="as-hint as-hint--block">{t('app.addService.mapHelp')}</p>
            <div className="as-map">
              <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Recenter center={mapCenter} zoom={mapZoom} />
                <LocationPicker position={position} onChange={setPosition} />
              </MapContainer>
            </div>
            <span className="as-hint">
              {position
                ? `${t('app.addService.coords')}: ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
                : t('app.addService.coordsDefault')}
            </span>
          </section>

          {/* ── Contatti ── */}
          <section className="as-card">
            <h3 className="as-card__title">{t('app.addService.sectionContact')}</h3>
            <div className="as-row">
              <div className="as-field">
                <label htmlFor="website">{t('app.addService.website')}</label>
                <input id="website" name="website" type="url" value={form.website}
                  onChange={handleChange} className={errors.website ? 'as-input as-input--err' : 'as-input'}
                  placeholder="https://…" />
                {errors.website && <span className="as-err">{errors.website}</span>}
              </div>
              <div className="as-field">
                <label htmlFor="phone">{t('app.addService.phone')}</label>
                <input id="phone" name="phone" type="tel" value={form.phone}
                  onChange={handleChange} className="as-input" placeholder="+39 …" />
              </div>
            </div>
            <div className="as-row">
              <div className="as-field">
                <label htmlFor="email">{t('app.addService.email')}</label>
                <input id="email" name="email" type="email" value={form.email}
                  onChange={handleChange} className={errors.email ? 'as-input as-input--err' : 'as-input'}
                  placeholder="contatto@…" />
                {errors.email && <span className="as-err">{errors.email}</span>}
              </div>
              <div className="as-field">
                <label htmlFor="whatsapp">{t('app.addService.whatsapp')}</label>
                <input id="whatsapp" name="whatsapp" type="tel" value={form.whatsapp}
                  onChange={handleChange} className="as-input" placeholder="+39 …" />
              </div>
            </div>
          </section>

          {/* ── Immagini (facoltative, via URL) ── */}
          <section className="as-card">
            <h3 className="as-card__title">{t('app.addService.sectionImages')}</h3>
            <p className="as-hint as-hint--block">{t('app.addService.imagesHelp')}</p>
            <div className="as-row">
              <div className="as-field">
                <label htmlFor="logo">{t('app.addService.logo')}</label>
                <input id="logo" name="logo" type="url" value={form.logo}
                  onChange={handleChange} className="as-input" placeholder="https://…" />
              </div>
              <div className="as-field">
                <label htmlFor="coverImage">{t('app.addService.cover')}</label>
                <input id="coverImage" name="coverImage" type="url" value={form.coverImage}
                  onChange={handleChange} className="as-input" placeholder="https://…" />
              </div>
            </div>
          </section>

          <div className="as-actions">
            <button type="button" className="as-btn as-btn--ghost" onClick={() => navigate('/dashboard')}>
              {t('app.addService.cancel')}
            </button>
            <button type="submit" className="as-btn as-btn--primary" disabled={submitting || loadingMeta}>
              {submitting
                ? (isEdit ? t('app.addService.saving') : t('app.addService.submitting'))
                : (isEdit ? t('app.addService.save') : t('app.addService.submit'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddService;
