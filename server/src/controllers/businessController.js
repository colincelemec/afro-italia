// ============================================
// Controller: Business (Entreprises)
// ============================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('../services/emailService');
const { devDetails } = require('../utils/errorResponse');

/**
 * @route   GET /api/businesses
 * @desc    Récupérer toutes les entreprises (avec pagination et filtres)
 * @access  Public
 */
exports.getAllBusinesses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      category,
      status = 'VERIFIED',
      subscription
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construire les filtres
    const where = {
      status: status,
      isVerified: true
    };

    if (city) {
      where.city = { slug: city };
    }

    if (category) {
      where.category = { slug: category };
    }

    if (subscription) {
      where.subscriptionTier = subscription;
    }

    // Récupérer les entreprises avec pagination
    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          city: {
            select: { name: true, slug: true }
          },
          category: {
            select: { name: true, slug: true, icon: true }
          },
          owner: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: [
          { subscriptionTier: 'desc' }, // Premium d'abord
          { averageRating: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.business.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: businesses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur getAllBusinesses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entreprises',
      ...devDetails(error)
    });
  }
};

/**
 * @route   GET /api/businesses/search
 * @desc    Recherche avancée d'entreprises
 * @access  Public
 */
exports.searchBusinesses = async (req, res) => {
  try {
    const { q, city, category, lat, lng, radius = 10 } = req.query;

    const where = {
      status: 'VERIFIED',
      isVerified: true
    };

    // Recherche par texte
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { shortDesc: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (city) {
      where.city = { slug: city };
    }

    if (category) {
      where.category = { slug: category };
    }

    const businesses = await prisma.business.findMany({
      where,
      include: {
        city: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true, icon: true } }
      },
      take: 50
    });

    // Si lat/lng fournis, filtrer par distance (géolocalisation)
    let results = businesses;
    if (lat && lng) {
      results = businesses.filter(business => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          business.latitude,
          business.longitude
        );
        return distance <= parseFloat(radius);
      });
    }

    res.status(200).json({
      success: true,
      data: results,
      count: results.length
    });

  } catch (error) {
    console.error('Erreur searchBusinesses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      ...devDetails(error)
    });
  }
};

/**
 * @route   GET /api/businesses/:slug
 * @desc    Récupérer une entreprise par son slug
 * @access  Public
 */
exports.getBusinessBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        city: true,
        category: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        reviews: {
          where: { isVisible: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    // Incrémenter le compteur de vues
    await prisma.business.update({
      where: { id: business.id },
      data: { viewCount: { increment: 1 } }
    });

    res.status(200).json({
      success: true,
      data: business
    });

  } catch (error) {
    console.error('Erreur getBusinessBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'entreprise',
      ...devDetails(error)
    });
  }
};

/**
 * @route   POST /api/businesses
 * @desc    Créer une nouvelle entreprise
 * @access  Private (authentifié)
 */
exports.createBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body;

    // Liste blanche des champs autorisés (on ne fait jamais confiance au client
    // pour status, ownerId, isVerified, etc.)
    const allowed = [
      'name', 'description', 'shortDesc',
      'cityId', 'address', 'zipCode', 'latitude', 'longitude',
      'categoryId',
      'phone', 'email', 'website', 'whatsapp',
      'logo', 'coverImage',
      'facebook', 'instagram', 'twitter', 'tiktok',
    ];
    const businessData = {};
    for (const key of allowed) {
      if (body[key] !== undefined && body[key] !== '') businessData[key] = body[key];
    }

    // Vérifier que la ville existe (et récupérer ses coordonnées par défaut)
    const city = await prisma.city.findUnique({ where: { id: businessData.cityId } });
    if (!city) {
      return res.status(400).json({ success: false, message: 'Ville invalide' });
    }

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({ where: { id: businessData.categoryId } });
    if (!category) {
      return res.status(400).json({ success: false, message: 'Catégorie invalide' });
    }

    // Coordonnées : si non fournies, utiliser le centre de la ville
    businessData.latitude = businessData.latitude != null
      ? parseFloat(businessData.latitude) : city.latitude;
    businessData.longitude = businessData.longitude != null
      ? parseFloat(businessData.longitude) : city.longitude;

    // Générer un slug unique
    const slug = generateSlug(businessData.name);

    const business = await prisma.business.create({
      data: {
        ...businessData,
        slug,
        ownerId: userId,
        status: 'PENDING' // Doit être vérifié par un admin
      },
      include: {
        city: true,
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Entreprise créée avec succès. En attente de vérification.',
      data: business
    });

  } catch (error) {
    console.error('Erreur createBusiness:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'entreprise',
      ...devDetails(error)
    });
  }
};

/**
 * @route   PUT /api/businesses/:id
 * @desc    Mettre à jour une entreprise
 * @access  Private (propriétaire uniquement)
 */
exports.updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const body = req.body;

    // Vérifier que l'utilisateur est le propriétaire
    const business = await prisma.business.findUnique({
      where: { id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    if (business.ownerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette entreprise'
      });
    }

    // Liste blanche : on ne laisse jamais le client modifier status, ownerId, etc.
    const allowed = [
      'name', 'description', 'shortDesc',
      'cityId', 'address', 'zipCode', 'latitude', 'longitude',
      'categoryId',
      'phone', 'email', 'website', 'whatsapp',
      'logo', 'coverImage',
      'facebook', 'instagram', 'twitter', 'tiktok',
    ];
    const updateData = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key] === '' ? null : body[key];
    }
    if (updateData.latitude != null) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude != null) updateData.longitude = parseFloat(updateData.longitude);

    const updated = await prisma.business.update({
      where: { id },
      data: updateData,
      include: {
        city: true,
        category: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Entreprise mise à jour',
      data: updated
    });

  } catch (error) {
    console.error('Erreur updateBusiness:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      ...devDetails(error)
    });
  }
};

/**
 * @route   DELETE /api/businesses/:id
 * @desc    Supprimer une entreprise
 * @access  Private (propriétaire ou admin)
 */
exports.deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const business = await prisma.business.findUnique({
      where: { id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    if (business.ownerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    await prisma.business.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Entreprise supprimée'
    });

  } catch (error) {
    console.error('Erreur deleteBusiness:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      ...devDetails(error)
    });
  }
};

/**
 * @route   POST /api/businesses/:id/favorite
 * @desc    Ajouter/retirer des favoris
 * @access  Private
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier si déjà en favoris
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId: id
        }
      }
    });

    if (existing) {
      // Retirer des favoris
      await prisma.favorite.delete({
        where: { id: existing.id }
      });

      return res.status(200).json({
        success: true,
        message: 'Retiré des favoris',
        isFavorite: false
      });
    } else {
      // Ajouter aux favoris
      await prisma.favorite.create({
        data: {
          userId,
          businessId: id
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Ajouté aux favoris',
        isFavorite: true
      });
    }

  } catch (error) {
    console.error('Erreur toggleFavorite:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur',
      ...devDetails(error)
    });
  }
};

/**
 * @route   GET /api/businesses/my/list
 * @desc    Récupérer mes entreprises
 * @access  Private
 */
exports.getMyBusinesses = async (req, res) => {
  try {
    const userId = req.user.id;

    const businesses = await prisma.business.findMany({
      where: { ownerId: userId },
      include: {
        city: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: businesses,
      count: businesses.length
    });

  } catch (error) {
    console.error('Erreur getMyBusinesses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur',
      ...devDetails(error)
    });
  }
};

/**
 * @route   PATCH /api/businesses/:id/verify
 * @desc    Vérifier une entreprise (ADMIN)
 * @access  Private/Admin
 */
exports.verifyBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await prisma.business.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        isVerified: true,
        verifiedAt: new Date()
      },
      include: { owner: { select: { email: true, firstName: true } } }
    });

    // Notifier le propriétaire par email (non bloquant)
    emailService
      .sendBusinessStatusEmail(business.owner, business, 'VERIFIED')
      .catch(err => console.error('Email approvazione non inviata:', err.message));

    res.status(200).json({
      success: true,
      message: 'Entreprise vérifiée',
      data: business
    });

  } catch (error) {
    console.error('Erreur verifyBusiness:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur',
      ...devDetails(error)
    });
  }
};

/**
 * @route   PATCH /api/businesses/:id/status
 * @desc    Changer le statut (ADMIN)
 * @access  Private/Admin
 */
exports.updateBusinessStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const business = await prisma.business.update({
      where: { id },
      data: { status },
      include: { owner: { select: { email: true, firstName: true } } }
    });

    // Notifier le propriétaire si approuvé/rejeté (non bloquant)
    if (status === 'VERIFIED' || status === 'REJECTED') {
      emailService
        .sendBusinessStatusEmail(business.owner, business, status)
        .catch(err => console.error('Email statut non inviata:', err.message));
    }

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour',
      data: business
    });

  } catch (error) {
    console.error('Erreur updateBusinessStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur',
      ...devDetails(error)
    });
  }
};

/**
 * @route   GET /api/businesses/:id/reviews
 * @desc    Récupérer les avis d'une entreprise
 * @access  Public
 */
exports.getBusinessReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          businessId: id,
          isVisible: true
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({
        where: {
          businessId: id,
          isVisible: true
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur getBusinessReviews:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur',
      ...devDetails(error)
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now();
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}
