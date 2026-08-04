// ============================================
// Mock Prisma — condiviso da tutti i test
// Ogni test gira senza database: le query Prisma
// sono jest.fn() configurabili per scenario.
// ============================================

const modelMethods = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
});

const mockPrisma = {
  user: modelMethods(),
  business: modelMethods(),
  review: modelMethods(),
  city: modelMethods(),
  category: modelMethods(),
  favorite: modelMethods(),
  payment: modelMethods(),
  $transaction: jest.fn((ops) => Promise.all(ops)),
  $disconnect: jest.fn(),
};

// Réinitialiser tous les mocks entre les tests
const resetMockPrisma = () => {
  for (const model of Object.values(mockPrisma)) {
    if (typeof model === 'object') {
      for (const fn of Object.values(model)) {
        if (jest.isMockFunction(fn)) fn.mockReset();
      }
    }
  }
  mockPrisma.$transaction.mockImplementation((ops) => Promise.all(ops));
};

// Factory pour jest.mock('@prisma/client')
const prismaClientMock = {
  PrismaClient: jest.fn(() => mockPrisma),
};

module.exports = { mockPrisma, resetMockPrisma, prismaClientMock };
