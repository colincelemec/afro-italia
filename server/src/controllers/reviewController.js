// ============================================
// Controller: Reviews
// ============================================

const { PrismaClient } = require('@prisma/client');
const { devDetails } = require('../utils/errorResponse');
const prisma = new PrismaClient();

/**
 * POST /api/reviews
 * Créer un avis pour une entreprise
 */
exports.createReview = async (req, res) => {
  try {
    const { businessId, rating, comment, images } = req.body;
    const userId = req.user.id;

    // Vérifier si l'entreprise existe
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée',
      });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await prisma.review.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId,
        },
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis pour cette entreprise',
      });
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        businessId,
        userId,
        rating,
        comment,
        images: images || [],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Mettre à jour les statistiques de l'entreprise
    const reviews = await prisma.review.findMany({
      where: { businessId, isVisible: true },
      select: { rating: true },
    });

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await prisma.business.update({
      where: { id: businessId },
      data: {
        reviewCount: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Avis créé avec succès',
      data: { review },
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'avis',
      ...devDetails(error),
    });
  }
};

/**
 * GET /api/reviews/:businessId
 * Récupérer tous les avis d'une entreprise
 */
exports.getReviewsByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Compter le total
    const total = await prisma.review.count({
      where: {
        businessId,
        isVisible: true,
      },
    });

    // Récupérer les avis
    const reviews = await prisma.review.findMany({
      where: {
        businessId,
        isVisible: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: { reviews },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      ...devDetails(error),
    });
  }
};

/**
 * PUT /api/reviews/:id
 * Modifier son propre avis
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user.id;

    // Trouver l'avis
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    // Vérifier que c'est bien l'auteur
    if (review.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres avis',
      });
    }

    // Mettre à jour l'avis
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (images !== undefined) updateData.images = images;

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Recalculer la moyenne si la note a changé
    if (rating !== undefined) {
      const reviews = await prisma.review.findMany({
        where: { businessId: review.businessId, isVisible: true },
        select: { rating: true },
      });

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;

      await prisma.business.update({
        where: { id: review.businessId },
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Avis mis à jour avec succès',
      data: { review: updatedReview },
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'avis',
      ...devDetails(error),
    });
  }
};

/**
 * DELETE /api/reviews/:id
 * Supprimer son propre avis
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Trouver l'avis
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    // Vérifier que c'est bien l'auteur ou un admin
    if (review.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres avis',
      });
    }

    const businessId = review.businessId;

    // Supprimer l'avis
    await prisma.review.delete({
      where: { id },
    });

    // Mettre à jour les statistiques
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
 * POST /api/reviews/:id/response
 * Répondre à un avis (propriétaire de l'entreprise)
 */
exports.respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const userId = req.user.id;

    // Trouver l'avis avec l'entreprise
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        business: true,
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    // Vérifier que c'est le propriétaire de l'entreprise
    if (review.business.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire de l\'entreprise peut répondre',
      });
    }

    // Mettre à jour la réponse
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        response,
        respondedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Réponse ajoutée avec succès',
      data: { review: updatedReview },
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réponse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la réponse',
      ...devDetails(error),
    });
  }
};

/**
 * PATCH /api/reviews/:id/report
 * Signaler un avis
 */
exports.reportReview = async (req, res) => {
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

    // Marquer comme signalé
    await prisma.review.update({
      where: { id },
      data: { isReported: true },
    });

    res.status(200).json({
      success: true,
      message: 'Avis signalé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors du signalement de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du signalement de l\'avis',
      ...devDetails(error),
    });
  }
};

/**
 * PATCH /api/reviews/:id/visibility
 * Changer la visibilité d'un avis (ADMIN uniquement)
 */
exports.toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    // Mettre à jour la visibilité
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { isVisible },
    });

    // Recalculer les statistiques
    const reviews = await prisma.review.findMany({
      where: { businessId: review.businessId, isVisible: true },
      select: { rating: true },
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await prisma.business.update({
      where: { id: review.businessId },
      data: {
        reviewCount: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Visibilité mise à jour avec succès',
      data: { review: updatedReview },
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la visibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la visibilité',
      ...devDetails(error),
    });
  }
};
