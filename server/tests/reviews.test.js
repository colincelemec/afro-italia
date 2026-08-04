// ============================================
// Tests: /api/reviews — recensioni
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

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET);

const sampleReview = {
  id: 'rev_1',
  businessId: 'biz_1',
  userId: 'user_1',
  rating: 5,
  comment: 'Esperienza fantastica, cibo ottimo!',
  isVisible: true,
  createdAt: new Date().toISOString(),
  user: { id: 'user_1', firstName: 'Mario', lastName: 'Rossi', avatar: null },
};

beforeEach(() => resetMockPrisma());

describe('GET /api/reviews/:businessId', () => {
  it('renvoie les avis visibles d\'une activité (200)', async () => {
    mockPrisma.review.count.mockResolvedValue(1);
    mockPrisma.review.findMany.mockResolvedValue([sampleReview]);

    const res = await request(app).get('/api/reviews/biz_1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ businessId: 'biz_1', isVisible: true }),
      })
    );
  });
});

describe('POST /api/reviews', () => {
  it('refuse sans authentification (401)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ businessId: 'biz_1', rating: 5, comment: 'Ottimo posto, consigliato!' });

    expect(res.status).toBe(401);
  });

  it('refuse une note invalide (validation 400)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(authUser); // pour protect()

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${tokenFor(authUser.id)}`)
      .send({ businessId: 'biz_1', rating: 9, comment: 'Nota impossibile!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('refuse un token invalide (401)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', 'Bearer token-bidon')
      .send({ businessId: 'biz_1', rating: 5, comment: 'Ottimo posto!' });

    expect(res.status).toBe(401);
  });
});
