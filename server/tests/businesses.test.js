// ============================================
// Tests: /api/businesses — annuaire des activités
// ============================================

jest.mock('@prisma/client', () => require('./helpers/mockPrisma').prismaClientMock);

const request = require('supertest');
const app = require('../src/app');
const { mockPrisma, resetMockPrisma } = require('./helpers/mockPrisma');

const sampleBusiness = {
  id: 'biz_1',
  name: 'Ristorante Teranga',
  slug: 'ristorante-teranga',
  description: 'Cucina senegalese nel cuore di Milano',
  status: 'VERIFIED',
  isVerified: true,
  latitude: 45.46,
  longitude: 9.19,
  subscriptionTier: 'FREE',
  viewCount: 10,
  averageRating: 4.5,
  reviewCount: 12,
  city: { name: 'Milano', slug: 'milano' },
  category: { name: 'Ristorante', slug: 'restaurant', icon: null },
  owner: { firstName: 'Awa', lastName: 'Diop' },
};

beforeEach(() => resetMockPrisma());

describe('GET /api/businesses', () => {
  it('renvoie la liste paginée des activités (200)', async () => {
    mockPrisma.business.findMany.mockResolvedValue([sampleBusiness]);
    mockPrisma.business.count.mockResolvedValue(1);

    const res = await request(app).get('/api/businesses');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].slug).toBe('ristorante-teranga');
    expect(res.body.pagination).toMatchObject({ page: 1, total: 1, totalPages: 1 });
  });

  it('applique les filtres ville et catégorie', async () => {
    mockPrisma.business.findMany.mockResolvedValue([]);
    mockPrisma.business.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/businesses')
      .query({ city: 'milano', category: 'restaurant' });

    expect(res.status).toBe(200);
    const whereArg = mockPrisma.business.findMany.mock.calls[0][0].where;
    expect(whereArg.city).toEqual({ slug: 'milano' });
    expect(whereArg.category).toEqual({ slug: 'restaurant' });
  });

  it('respecte la pagination (page/limit)', async () => {
    mockPrisma.business.findMany.mockResolvedValue([]);
    mockPrisma.business.count.mockResolvedValue(30);

    const res = await request(app)
      .get('/api/businesses')
      .query({ page: 2, limit: 10 });

    expect(res.status).toBe(200);
    const args = mockPrisma.business.findMany.mock.calls[0][0];
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
    expect(res.body.pagination.totalPages).toBe(3);
  });
});

describe('GET /api/businesses/:slug', () => {
  it('renvoie le détail et incrémente le compteur de vues (200)', async () => {
    mockPrisma.business.findUnique.mockResolvedValue({ ...sampleBusiness, reviews: [] });
    mockPrisma.business.update.mockResolvedValue(sampleBusiness);

    const res = await request(app).get('/api/businesses/ristorante-teranga');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Ristorante Teranga');
    expect(mockPrisma.business.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'biz_1' },
        data: { viewCount: { increment: 1 } },
      })
    );
  });

  it('renvoie 404 si introuvable', async () => {
    mockPrisma.business.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/businesses/inexistant');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/businesses', () => {
  it('refuse la création sans authentification (401)', async () => {
    const res = await request(app).post('/api/businesses').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });
});
