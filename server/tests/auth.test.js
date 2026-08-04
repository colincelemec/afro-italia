// ============================================
// Tests: /api/auth — inscription et connexion
// ============================================

jest.mock('@prisma/client', () => require('./helpers/mockPrisma').prismaClientMock);

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { mockPrisma, resetMockPrisma } = require('./helpers/mockPrisma');

const validUser = {
  email: 'test@example.com',
  password: 'Password123',
  firstName: 'Mario',
  lastName: 'Rossi',
};

const dbUser = {
  id: 'user_1',
  email: validUser.email,
  firstName: 'Mario',
  lastName: 'Rossi',
  phone: null,
  role: 'USER',
  avatar: null,
  isVerified: false,
  createdAt: new Date().toISOString(),
};

beforeEach(() => resetMockPrisma());

describe('POST /api/auth/register', () => {
  it('crée un utilisateur et renvoie un token (201)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(dbUser);

    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.token).toBeDefined();
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('refuse un email déjà utilisé (400)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(dbUser);

    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it('refuse un email invalide (validation 400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('refuse un mot de passe trop court (validation 400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  it('connecte un utilisateur avec les bons identifiants (200)', async () => {
    const passwordHash = await bcrypt.hash(validUser.password, 10);
    mockPrisma.user.findUnique.mockResolvedValue({ ...dbUser, passwordHash });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('refuse un mauvais mot de passe (401)', async () => {
    const passwordHash = await bcrypt.hash('AutrePassword1', 10);
    mockPrisma.user.findUnique.mockResolvedValue({ ...dbUser, passwordHash });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('refuse un utilisateur inconnu (401)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@example.com', password: 'Password123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/auth/me', () => {
  it('refuse sans token (401)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
