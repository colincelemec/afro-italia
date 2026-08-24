// ============================================
// Controller: Revendication de fiche
// « C'est mon activité » — un utilisateur demande à récupérer
// la fiche d'une entreprise créée lors du recensement.
// La vérification est faite manuellement par un administrateur.
// ============================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('../services/emailService');

/**
 * @route   POST /api/businesses/:id/claim
 * @desc    Demander la propriété d'une fiche
 * @access  Privé (authentifié)
 */
exports.createClaim = async (req, res) => {
  try {
    const { id: businessId } = req.params;
    const userId = req.user.id;
    const { fullName, role, phone, email, message } = req.body;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, ownerId: true },
    });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Attività non trovata.' });
    }

    // Déjà propriétaire : rien à revendiquer
    if (business.ownerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Sei già il proprietario di questa attività.',
      });
    }

    // Une demande en attente bloque les suivantes (sur cette fiche, tous utilisateurs confondus)
    const pending = await prisma.businessClaim.findFirst({
      where: { businessId, status: 'PENDING' },
    });
    if (pending) {
      const mine = pending.userId === userId;
      return res.status(409).json({
        success: false,
        message: mine
          ? 'Hai già una richiesta in corso per questa attività.'
          : 'Una richiesta è già in corso di verifica per questa attività.',
        alreadyPending: true,
      });
    }

    // Upsert : permet de redéposer une demande après un refus
    const claim = await prisma.businessClaim.upsert({
      where: { businessId_userId: { businessId, userId } },
      update: {
        fullName, role, phone, email, message,
        status: 'PENDING',
        adminNote: null,
        reviewedAt: null,
        reviewedById: null,
      },
      create: { businessId, userId, fullName, role, phone, email, message },
    });

    res.status(201).json({
      success: true,
      message: 'Richiesta inviata. Il nostro team la verificherà entro 24-48 ore.',
      data: claim,
    });
  } catch (error) {
    console.error('Erreur createClaim:', error);
    res.status(500).json({ success: false, message: 'Errore durante l\'invio della richiesta.' });
  }
};

/**
 * @route   GET /api/businesses/:id/claim/me
 * @desc    Statut de ma demande sur cette fiche (pour l'affichage du bouton)
 * @access  Privé
 */
exports.getMyClaim = async (req, res) => {
  try {
    const { id: businessId } = req.params;
    const claim = await prisma.businessClaim.findUnique({
      where: { businessId_userId: { businessId, userId: req.user.id } },
      select: { id: true, status: true, createdAt: true, adminNote: true },
    });
    res.json({ success: true, data: claim });
  } catch (error) {
    console.error('Erreur getMyClaim:', error);
    res.status(500).json({ success: false, message: 'Errore.' });
  }
};

/**
 * @route   GET /api/admin/claims
 * @desc    Liste des revendications (filtre par statut)
 * @access  Admin
 */
exports.getClaims = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const claims = await prisma.businessClaim.findMany({
      where,
      include: {
        business: { select: { id: true, name: true, slug: true, city: { select: { name: true } } } },
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, count: claims.length, data: { claims } });
  } catch (error) {
    console.error('Erreur getClaims:', error);
    res.status(500).json({ success: false, message: 'Errore nel recupero delle richieste.' });
  }
};

/**
 * @route   PATCH /api/admin/claims/:id
 * @desc    Approuver ou refuser une revendication
 * @access  Admin
 * body: { status: 'APPROVED' | 'REJECTED', adminNote? }
 */
exports.reviewClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Stato non valido.' });
    }

    const claim = await prisma.businessClaim.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, email: true, firstName: true } },
      },
    });
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Richiesta non trovata.' });
    }
    if (claim.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Richiesta già trattata.' });
    }

    // Approbation : transfert de propriété + passage du compte en rôle BUSINESS
    if (status === 'APPROVED') {
      await prisma.$transaction([
        prisma.business.update({
          where: { id: claim.businessId },
          data: { ownerId: claim.userId },
        }),
        prisma.user.update({
          where: { id: claim.userId },
          data: { role: 'BUSINESS' },
        }),
        prisma.businessClaim.update({
          where: { id },
          data: {
            status,
            adminNote: adminNote || null,
            reviewedAt: new Date(),
            reviewedById: req.user.id,
          },
        }),
        // Les autres demandes sur la même fiche deviennent caduques
        prisma.businessClaim.updateMany({
          where: { businessId: claim.businessId, status: 'PENDING', id: { not: id } },
          data: { status: 'REJECTED', adminNote: 'Fiche attribuée à un autre demandeur.' },
        }),
      ]);
    } else {
      await prisma.businessClaim.update({
        where: { id },
        data: {
          status,
          adminNote: adminNote || null,
          reviewedAt: new Date(),
          reviewedById: req.user.id,
        },
      });
    }

    // Notification au demandeur (non bloquant)
    emailService
      .sendClaimStatusEmail(claim.user, claim.business, status, adminNote)
      .catch(err => console.error('Email revendication non inviata:', err.message));

    res.json({
      success: true,
      message: status === 'APPROVED' ? 'Richiesta approvata.' : 'Richiesta rifiutata.',
    });
  } catch (error) {
    console.error('Erreur reviewClaim:', error);
    res.status(500).json({ success: false, message: 'Errore durante la revisione.' });
  }
};
