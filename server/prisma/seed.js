// ============================================
// Seed Database - Données de test
// ============================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed de la base de données...\n');

  // ============================================
  // 1. VILLES ITALIENNES
  // ============================================
  console.log('📍 Création des villes...');

  const cities = await Promise.all([
    prisma.city.upsert({
      where: { slug: 'milan' },
      update: {},
      create: {
        name: 'Milan',
        slug: 'milan',
        region: 'Lombardia',
        latitude: 45.4642,
        longitude: 9.1900,
        description: 'Capitale économique et mode de l\'Italie',
        order: 1
      }
    }),
    prisma.city.upsert({
      where: { slug: 'rome' },
      update: {},
      create: {
        name: 'Rome',
        slug: 'rome',
        region: 'Lazio',
        latitude: 41.9028,
        longitude: 12.4964,
        description: 'Capitale de l\'Italie, ville historique',
        order: 2
      }
    }),
    prisma.city.upsert({
      where: { slug: 'turin' },
      update: {},
      create: {
        name: 'Turin',
        slug: 'turin',
        region: 'Piemonte',
        latitude: 45.0703,
        longitude: 7.6869,
        description: 'Ville industrielle et culturelle',
        order: 3
      }
    }),
    prisma.city.upsert({
      where: { slug: 'florence' },
      update: {},
      create: {
        name: 'Florence',
        slug: 'florence',
        region: 'Toscana',
        latitude: 43.7696,
        longitude: 11.2558,
        description: 'Berceau de la Renaissance',
        order: 4
      }
    }),
    prisma.city.upsert({
      where: { slug: 'bologne' },
      update: {},
      create: {
        name: 'Bologne',
        slug: 'bologne',
        region: 'Emilia-Romagna',
        latitude: 44.4949,
        longitude: 11.3426,
        description: 'Ville universitaire et gastronomique',
        order: 5
      }
    })
  ]);

  console.log(`✅ ${cities.length} villes créées\n`);

  // ============================================
  // 2. CATÉGORIES
  // ============================================
  console.log('🏷️  Création des catégories...');

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'restaurant' },
      update: {},
      create: {
        name: 'Restaurant',
        slug: 'restaurant',
        icon: '🍽️',
        color: '#EF4444',
        order: 1
      }
    }),
    prisma.category.upsert({
      where: { slug: 'coiffeur' },
      update: {},
      create: {
        name: 'Coiffeur / Barbier',
        slug: 'coiffeur',
        icon: '💇',
        color: '#8B5CF6',
        order: 2
      }
    }),
    prisma.category.upsert({
      where: { slug: 'epicerie' },
      update: {},
      create: {
        name: 'Épicerie Africaine',
        slug: 'epicerie',
        icon: '🛒',
        color: '#10B981',
        order: 3
      }
    }),
    prisma.category.upsert({
      where: { slug: 'mode' },
      update: {},
      create: {
        name: 'Mode & Vêtements',
        slug: 'mode',
        icon: '👗',
        color: '#F59E0B',
        order: 4
      }
    }),
    prisma.category.upsert({
      where: { slug: 'beaute' },
      update: {},
      create: {
        name: 'Beauté & Cosmétiques',
        slug: 'beaute',
        icon: '💄',
        color: '#EC4899',
        order: 5
      }
    }),
    prisma.category.upsert({
      where: { slug: 'service' },
      update: {},
      create: {
        name: 'Services',
        slug: 'service',
        icon: '🔧',
        color: '#6366F1',
        order: 6
      }
    })
  ]);

  console.log(`✅ ${categories.length} catégories créées\n`);

  // ============================================
  // 3. UTILISATEURS
  // ============================================
  console.log('👥 Création des utilisateurs...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@afroitalia.com' },
    update: {},
    create: {
      email: 'admin@afroitalia.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'AfroItalia',
      role: 'ADMIN',
      isVerified: true
    }
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      isVerified: true
    }
  });

  const businessOwner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      passwordHash: hashedPassword,
      firstName: 'Maria',
      lastName: 'Rossi',
      role: 'BUSINESS',
      isVerified: true
    }
  });

  console.log('✅ 3 utilisateurs créés (mot de passe: password123)\n');
  console.log('   - admin@afroitalia.com (ADMIN)');
  console.log('   - john@example.com (USER)');
  console.log('   - owner@example.com (BUSINESS)\n');

  // ============================================
  // 4. ENTREPRISES
  // ============================================
  console.log('🏢 Création des entreprises...');

  const business1 = await prisma.business.create({
    data: {
      ownerId: businessOwner.id,
      name: 'Ristorante Africano Milano',
      slug: 'ristorante-africano-milano-' + Date.now(),
      description: 'Découvrez les saveurs authentiques de l\'Afrique de l\'Ouest dans notre restaurant chaleureux. Spécialités sénégalaises et nigérianes.',
      shortDesc: 'Cuisine africaine authentique à Milan',
      cityId: cities[0].id, // Milan
      categoryId: categories[0].id, // Restaurant
      address: 'Via Paolo Sarpi, 123',
      latitude: 45.4808,
      longitude: 9.1844,
      zipCode: '20154',
      phone: '+39 02 1234567',
      email: 'info@ristoranteafricano.it',
      subscriptionTier: 'PREMIUM',
      status: 'VERIFIED',
      isVerified: true,
      verifiedAt: new Date()
    }
  });

  const business2 = await prisma.business.create({
    data: {
      ownerId: businessOwner.id,
      name: 'African Hair Salon',
      slug: 'african-hair-salon-' + Date.now(),
      description: 'Salon de coiffure spécialisé dans les coiffures afro. Tresses, nattes, tissages et soins capillaires.',
      shortDesc: 'Coiffure afro professionnelle',
      cityId: cities[0].id, // Milan
      categoryId: categories[1].id, // Coiffeur
      address: 'Via Padova, 45',
      latitude: 45.4875,
      longitude: 9.2194,
      zipCode: '20127',
      phone: '+39 02 9876543',
      subscriptionTier: 'BASIC',
      status: 'VERIFIED',
      isVerified: true,
      verifiedAt: new Date()
    }
  });

  const business3 = await prisma.business.create({
    data: {
      ownerId: businessOwner.id,
      name: 'Africa Market Roma',
      slug: 'africa-market-roma-' + Date.now(),
      description: 'Épicerie africaine proposant une large gamme de produits alimentaires, cosmétiques et articles traditionnels d\'Afrique.',
      shortDesc: 'Produits africains à Rome',
      cityId: cities[1].id, // Rome
      categoryId: categories[2].id, // Épicerie
      address: 'Via Casilina, 789',
      latitude: 41.8864,
      longitude: 12.5439,
      zipCode: '00177',
      phone: '+39 06 1234567',
      website: 'https://africamarket.it',
      subscriptionTier: 'FREE',
      status: 'VERIFIED',
      isVerified: true,
      verifiedAt: new Date()
    }
  });

  console.log(`✅ 3 entreprises créées\n`);

  // ============================================
  // 5. REVIEWS
  // ============================================
  console.log('⭐ Création des avis...');

  await prisma.review.create({
    data: {
      businessId: business1.id,
      userId: user1.id,
      rating: 5,
      comment: 'Excellente cuisine ! Le thieboudienne était délicieux. Ambiance chaleureuse et service impeccable.',
      isVisible: true
    }
  });

  await prisma.review.create({
    data: {
      businessId: business1.id,
      userId: admin.id,
      rating: 4,
      comment: 'Très bon restaurant, portions généreuses. Je recommande !',
      isVisible: true
    }
  });

  await prisma.review.create({
    data: {
      businessId: business2.id,
      userId: user1.id,
      rating: 5,
      comment: 'Coiffeuse très professionnelle, mes tresses sont parfaites !',
      isVisible: true
    }
  });

  console.log('✅ 3 avis créés\n');

  // ============================================
  // 6. FAVORIS
  // ============================================
  console.log('❤️  Création des favoris...');

  await prisma.favorite.create({
    data: {
      userId: user1.id,
      businessId: business1.id
    }
  });

  console.log('✅ 1 favori créé\n');

  console.log('🎉 Seed terminé avec succès !\n');
  console.log('Vous pouvez maintenant vous connecter avec :');
  console.log('  Email: admin@afroitalia.com');
  console.log('  Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
