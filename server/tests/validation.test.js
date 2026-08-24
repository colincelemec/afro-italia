// ============================================
// Tests: validation della creazione attività
// Regressione: i numeri fissi italiani venivano rifiutati
// (isMobilePhone accettava solo i cellulari).
// ============================================

jest.mock('@prisma/client', () => require('./helpers/mockPrisma').prismaClientMock);

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { mockPrisma, resetMockPrisma } = require('./helpers/mockPrisma');

const authUser = {
  id: 'user_1',
  email: 'test@example.com',
  firstName: 'Mario',
  lastName: 'Rossi',
  role: 'USER',
  avatar: null,
  isVerified: true,
};

const token = () => jwt.sign({ id: authUser.id }, process.env.JWT_SECRET);

// Payload minimo valido
const basePayload = {
  name: 'Ristorante Teranga',
  description: 'Cucina senegalese autentica nel cuore di Milano, aperta dal 2015.',
  cityId: 'city_1',
  categoryId: 'cat_1',
  address: 'Via Padova 36',
};

/** Invia il payload e restituisce la risposta */
const post = (payload) =>
  request(app)
    .post('/api/businesses')
    .set('Authorization', `Bearer ${token()}`)
    .send(payload);

/** Estrae i campi in errore dalla risposta di validazione */
const failedFields = (res) =>
  (res.body.errors || []).map(e => e.path || e.param);

beforeEach(() => {
  resetMockPrisma();
  mockPrisma.user.findUnique.mockResolvedValue(authUser); // per protect()
  // La creazione va a buon fine se la validazione passa
  mockPrisma.city.findUnique.mockResolvedValue({ id: 'city_1', latitude: 45.46, longitude: 9.19 });
  mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat_1', name: 'Ristorante', slug: 'restaurant' });
  mockPrisma.business.findUnique.mockResolvedValue(null);
  mockPrisma.business.findFirst.mockResolvedValue(null);
  mockPrisma.business.create.mockResolvedValue({ id: 'biz_1', ...basePayload });
});

describe('Validazione telefono — numeri italiani reali', () => {
  const validPhones = [
    '+39 02 1234567',    // fisso Milano con prefisso internazionale
    '02 1234567',        // fisso Milano
    '+39 06 12345678',   // fisso Roma
    '3331234567',        // cellulare senza spazi
    '+39 333 123 4567',  // cellulare con spazi
    '02-1234567',        // con trattini
    '(02) 1234567',      // con parentesi
    '+39.06.12345678',   // con punti
  ];

  it.each(validPhones)('accetta %s', async (phone) => {
    const res = await post({ ...basePayload, phone });
    expect(failedFields(res)).not.toContain('phone');
    expect(res.status).not.toBe(400);
  });

  const invalidPhones = ['abc', '12345', 'not a phone', '+39 abc 123'];

  it.each(invalidPhones)('rifiuta %s', async (phone) => {
    const res = await post({ ...basePayload, phone });
    expect(res.status).toBe(400);
    expect(failedFields(res)).toContain('phone');
  });

  it('accetta un telefono vuoto (campo facoltativo)', async () => {
    const res = await post({ ...basePayload, phone: '' });
    expect(failedFields(res)).not.toContain('phone');
  });
});

describe('Validazione sito web', () => {
  it.each(['https://miosito.it', 'http://www.miosito.it', 'miosito.it'])(
    'accetta %s',
    async (website) => {
      const res = await post({ ...basePayload, website });
      expect(failedFields(res)).not.toContain('website');
    }
  );

  it('rifiuta un dominio incompleto', async () => {
    const res = await post({ ...basePayload, website: 'https://sitosenzadominio' });
    expect(res.status).toBe(400);
    expect(failedFields(res)).toContain('website');
  });
});

describe('Campi obbligatori', () => {
  it('rifiuta una descrizione troppo corta', async () => {
    const res = await post({ ...basePayload, description: 'Troppo corta' });
    expect(res.status).toBe(400);
    expect(failedFields(res)).toContain('description');
  });

  it('rifiuta un indirizzo mancante', async () => {
    const res = await post({ ...basePayload, address: '' });
    expect(res.status).toBe(400);
    expect(failedFields(res)).toContain('address');
  });

  it('restituisce errori con un messaggio leggibile', async () => {
    const res = await post({ ...basePayload, phone: 'abc' });
    expect(res.body.errors[0]).toHaveProperty('msg');
    expect(typeof res.body.errors[0].msg).toBe('string');
  });
});
