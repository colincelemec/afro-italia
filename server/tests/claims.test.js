// ============================================
// Tests: revendication de fiche (« C'est mon activité »)
// ============================================

jest.mock('@prisma/client', () => require('./helpers/mockPrisma').prismaClientMock);

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { mockPrisma, resetMockPrisma } = require('./helpers/mockPrisma');

const user = {
  id: 'user_1', email: 'mario@example.com', firstName: 'Mario',
  lastName: 'Rossi', role: 'USER', avatar: null, isVerified: true,
};
const admin = { ...user, id: 'admin_1', email: 'admin@afroitalia.it', role: 'ADMIN' };

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET);

const business = { id: 'biz_1', name: 'Ristorante Teranga', slug: 'teranga', ownerId: 'censimento_1' };

const validClaim = {
  fullName: 'Mario Rossi',
  role: 'Proprietario',
  phone: '+39 333 123 4567',
  email: 'mario@example.com',
  message: 'Gestisco questo ristorante dal 2015.',
};

const postClaim = (payload = validClaim, who = user) =>
  request(app)
    .post(`/api/businesses/${business.id}/claim`)
    .set('Authorization', `Bearer ${tokenFor(who.id)}`)
    .send(payload);

beforeEach(() => {
  resetMockPrisma();
  mockPrisma.user.findUnique.mockResolvedValue(user);
  mockPrisma.business.findUnique.mockResolvedValue(business);
  mockPrisma.businessClaim.findFirst.mockResolvedValue(null);
  mockPrisma.businessClaim.upsert.mockResolvedValue({ id: 'claim_1', status: 'PENDING' });
});

describe('POST /api/businesses/:id/claim', () => {
  it('crée une revendication (201)', async () => {
    const res = await postClaim();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.businessClaim.upsert).toHaveBeenCalled();
  });

  it('refuse sans authentification (401)', async () => {
    const res = await request(app)
      .post(`/api/businesses/${business.id}/claim`)
      .send(validClaim);
    expect(res.status).toBe(401);
  });

  it('renvoie 404 si la fiche n\'existe pas', async () => {
    mockPrisma.business.findUnique.mockResolvedValue(null);
    const res = await postClaim();
    expect(res.status).toBe(404);
  });

  it('refuse si l\'utilisateur est déjà propriétaire (400)', async () => {
    mockPrisma.business.findUnique.mockResolvedValue({ ...business, ownerId: user.id });
    const res = await postClaim();
    expect(res.status).toBe(400);
    expect(mockPrisma.businessClaim.upsert).not.toHaveBeenCalled();
  });

  it('refuse si une demande est déjà en attente (409)', async () => {
    mockPrisma.businessClaim.findFirst.mockResolvedValue({ id: 'c_9', userId: 'other', status: 'PENDING' });
    const res = await postClaim();
    expect(res.status).toBe(409);
    expect(res.body.alreadyPending).toBe(true);
  });

  it('valide les champs obligatoires (400)', async () => {
    const res = await postClaim({ ...validClaim, fullName: '', email: 'pas-un-email' });
    expect(res.status).toBe(400);
    const fields = (res.body.errors || []).map(e => e.path || e.param);
    expect(fields).toEqual(expect.arrayContaining(['fullName', 'email']));
  });

  it('accepte un téléphone fixe italien', async () => {
    const res = await postClaim({ ...validClaim, phone: '+39 02 1234567' });
    expect(res.status).toBe(201);
  });
});

describe('PATCH /api/admin/claims/:id', () => {
  const claim = {
    id: 'claim_1',
    businessId: business.id,
    userId: user.id,
    status: 'PENDING',
    business: { id: business.id, name: business.name, slug: business.slug },
    user: { id: user.id, email: user.email, firstName: user.firstName },
  };

  beforeEach(() => {
    mockPrisma.user.findUnique.mockResolvedValue(admin); // protect() → ADMIN
    mockPrisma.businessClaim.findUnique.mockResolvedValue(claim);
  });

  it('approuve : transfère la fiche et passe l\'utilisateur en BUSINESS', async () => {
    const res = await request(app)
      .patch('/api/admin/claims/claim_1')
      .set('Authorization', `Bearer ${tokenFor(admin.id)}`)
      .send({ status: 'APPROVED' });

    expect(res.status).toBe(200);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    // Le transfert de propriété fait partie de la transaction
    expect(mockPrisma.business.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { ownerId: user.id } })
    );
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: 'BUSINESS' } })
    );
  });

  it('refuse : ne transfère rien', async () => {
    const res = await request(app)
      .patch('/api/admin/claims/claim_1')
      .set('Authorization', `Bearer ${tokenFor(admin.id)}`)
      .send({ status: 'REJECTED', adminNote: 'Justificatif manquant' });

    expect(res.status).toBe(200);
    expect(mockPrisma.business.update).not.toHaveBeenCalled();
  });

  it('rejette un statut invalide (400)', async () => {
    const res = await request(app)
      .patch('/api/admin/claims/claim_1')
      .set('Authorization', `Bearer ${tokenFor(admin.id)}`)
      .send({ status: 'MAYBE' });
    expect(res.status).toBe(400);
  });

  it('refuse une demande déjà traitée (400)', async () => {
    mockPrisma.businessClaim.findUnique.mockResolvedValue({ ...claim, status: 'APPROVED' });
    const res = await request(app)
      .patch('/api/admin/claims/claim_1')
      .set('Authorization', `Bearer ${tokenFor(admin.id)}`)
      .send({ status: 'APPROVED' });
    expect(res.status).toBe(400);
  });

  it('interdit l\'accès à un non-admin (403)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(user); // rôle USER
    const res = await request(app)
      .patch('/api/admin/claims/claim_1')
      .set('Authorization', `Bearer ${tokenFor(user.id)}`)
      .send({ status: 'APPROVED' });
    expect(res.status).toBe(403);
  });
});

describe('Annuaire public (sans connexion)', () => {
  it('GET /api/businesses est accessible sans token', async () => {
    mockPrisma.business.findMany.mockResolvedValue([]);
    mockPrisma.business.count.mockResolvedValue(0);
    const res = await request(app).get('/api/businesses');
    expect(res.status).toBe(200);
  });

  it('GET /api/businesses/:slug est accessible sans token', async () => {
    mockPrisma.business.findUnique.mockResolvedValue({ ...business, reviews: [] });
    mockPrisma.business.update.mockResolvedValue(business);
    const res = await request(app).get('/api/businesses/teranga');
    expect(res.status).toBe(200);
  });
});
