// ============================================
// Controller: Authentication
// ============================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const emailService = require('../services/emailService');
const { devDetails } = require('../utils/errorResponse');

const prisma = new PrismaClient();

// Langues supportées pour les emails
const SUPPORTED_LANGS = ['it', 'fr', 'en'];
const pickLang = (lang) => (SUPPORTED_LANGS.includes(lang) ? lang : 'it');

/**
 * Générer un token JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà',
      });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
      },
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
      },
    });

    // Générer le token
    const token = generateToken(user.id);

    // Envoyer l'email de bienvenue (non bloquant : on n'échoue pas l'inscription si l'email plante)
    emailService
      .sendWelcomeEmail(user, pickLang(req.body.lang))
      .catch((err) => console.error('Email de bienvenue non envoyé:', err.message));

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      ...devDetails(error),
    });
  }
};

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Générer le token
    const token = generateToken(user.id);

    // Retourner l'utilisateur sans le mot de passe
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      ...devDetails(error),
    });
  }
};

/**
 * POST /api/auth/logout
 * Déconnexion (principalement géré côté client)
 */
exports.logout = async (req, res) => {
  try {
    // La déconnexion est principalement gérée côté client en supprimant le token
    // Ici on peut ajouter une logique de blacklist de token si nécessaire

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion',
      ...devDetails(error),
    });
  }
};

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      ...devDetails(error),
    });
  }
};

/**
 * PUT /api/auth/update-password
 * Changer le mot de passe
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Vérifier l'ancien mot de passe
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
      });
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash },
    });

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du mot de passe',
      ...devDetails(error),
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Demander un reset de mot de passe
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Pour des raisons de sécurité, on retourne toujours un succès
      return res.status(200).json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      });
    }

    // Générer un token de reset (valide 1 heure)
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const resetUrl = `${process.env.CLIENT_URL || ''}/reset-password?token=${resetToken}`;

    // Envoyer l'email de réinitialisation (non bloquant)
    emailService
      .sendPasswordResetEmail(user, resetUrl, pickLang(req.body.lang))
      .catch((err) => console.error('Email de reset non envoyé:', err.message));

    res.status(200).json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
    });
  } catch (error) {
    console.error('Erreur lors de la demande de reset:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande de reset',
      ...devDetails(error),
    });
  }
};

/**
 * POST /api/auth/google
 * Accesso con Google — riceve l'access token e verifica con Google userinfo
 */
exports.googleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Token Google mancante' });
    }

    // Recupera le info utente da Google usando l'access token
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: avatar } = googleRes.data;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email non disponibile nel profilo Google' });
    }

    // Cerca utente esistente per googleId o email
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      // Collega googleId se l'utente esiste ma non ha ancora il googleId
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: user.avatar || avatar, isVerified: true },
        });
      }
    } else {
      // Crea nuovo utente Google
      user = await prisma.user.create({
        data: { email, googleId, firstName, lastName, avatar, isVerified: true },
      });

      // Email de bienvenue pour le nouvel utilisateur Google (non bloquant)
      emailService
        .sendWelcomeEmail(user, pickLang(req.body.lang))
        .catch((err) => console.error('Email de bienvenue (Google) non envoyé:', err.message));
    }

    const token = generateToken(user.id);
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Accesso con Google riuscito',
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    console.error('Errore Google Auth:', error);
    res.status(401).json({ success: false, message: 'Token Google non valido' });
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Réinitialiser le mot de passe avec le token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré',
      });
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash },
    });

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe',
      ...devDetails(error),
    });
  }
};
