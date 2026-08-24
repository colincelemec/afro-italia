// ============================================
// Controller: Admin
// ============================================

const { PrismaClient } = require('@prisma/client');
const { devDetails } = require('../utils/errorResponse');
const prisma = new PrismaClient();

/**
 * GET /api/admin/stats
 * Statistiques globales de la plateforme
 */
exports.getStats = async (req, res) => {
  try {
    // Compter les différentes entités
    const [
      totalUsers,
      totalBusinesses,
      totalReviews,
      totalCategories,
      totalCities,
      pendingBusinesses,
      verifiedBusinesses,
      reportedReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.review.count(),
      prisma.category.count(),
      prisma.city.count(),
      prisma.business.count({ where: { status: 'PENDING' } }),
      prisma.business.count({ where: { status: 'VERIFIED' } }),
      prisma.review.count({ where: { isReported: true } }),
    ]);

    // Statistiques par rôle
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    // Statistiques par statut d'entreprise
    const businessesByStatus = await prisma.business.groupBy({
      by: ['status'],
      _count: true,
    });

    // Entreprises récentes (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBusinesses = await prisma.business.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          users: {
            total: totalUsers,
            byRole: usersByRole,
          },
          businesses: {
            total: totalBusinesses,
            pending: pendingBusinesses,
            verified: verifiedBusinesses,
            recent: recentBusinesses,
            byStatus: businessesByStatus,
          },
          reviews: {
            total: totalReviews,
            reported: reportedReviews,
          },
          categories: totalCategories,
          cities: totalCities,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      ...devDetails(error),
    });
  }
};

/**
 * GET /api/admin/businesses
 * Liste de toutes les entreprises avec filtres
 */
exports.getAllBusinesses = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, cityId, categoryId, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construire les filtres
    const where = {};
    if (status) where.status = status;
    if (cityId) where.cityId = cityId;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, businesses] = await Promise.all([
      prisma.business.count({ where }),
      prisma.business.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          city: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    res.status(200).json({
      success: true,
      count: businesses.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: { businesses },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entreprises',
      ...devDetails(error),
    });
  }
};

/**
 * GET /api/admin/businesses/pending
 * Entreprises en attente de vérification
 */
exports.getPendingBusinesses = async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      where: { status: 'PENDING' },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        city: true,
        category: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      count: businesses.length,
      data: { businesses },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises en attente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entreprises en attente',
      ...devDetails(error),
    });
  }
};

/**
 * GET /api/admin/users
 * Liste de tous les utilisateurs
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construire les filtres
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              businesses: true,
              reviews: true,
              favorites: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: { users },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      ...devDetails(error),
    });
  }
};

/**
 * PATCH /api/admin/users/:id/role
 * Changer le rôle d'un utilisateur
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Valider le rôle
    if (!['USER', 'BUSINESS', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide',
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Empêcher de modifier son propre rôle
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre rôle',
      });
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Rôle mis à jour avec succès',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du rôle',
      ...devDetails(error),
    });
  }
};

/**
 * GET /api/admin/reviews/reported
 * Récupérer les avis signalés
 */
exports.getReportedReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isReported: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: { reviews },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis signalés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis signalés',
      ...devDetails(error),
    });
  }
};

/**
 * DELETE /api/admin/reviews/:id
 * Supprimer un avis (modération)
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    const businessId = review.businessId;

    // Supprimer l'avis
    await prisma.review.delete({
      where: { id },
    });

    // Mettre à jour les statistiques de l'entreprise
    const reviews = await prisma.review.findMany({
      where: { businessId, isVisible: true },
      select: { rating: true },
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await prisma.business.update({
      where: { id: businessId },
      data: {
        reviewCount: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Avis supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'avis',
      ...devDetails(error),
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Supprimer un utilisateur
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Empêcher de supprimer son propre compte
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte',
      });
    }

    // Supprimer l'utilisateur (cascade supprime les entreprises, avis, favoris)
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      ...devDetails(error),
    });
  }
};
