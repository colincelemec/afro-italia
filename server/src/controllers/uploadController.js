// ============================================
// Controller: Upload d'images (Cloudinary)
//
// Le fichier ne transite PAS par notre serveur : le navigateur
// l'envoie directement à Cloudinary. Notre API se contente de
// signer la demande, ce qui évite d'exposer la clé secrète et
// n'utilise ni bande passante ni disque côté serveur — essentiel
// sur Railway, dont le disque est effacé à chaque déploiement.
//
// Si Cloudinary n'est pas configuré, l'endpoint répond 503 et le
// formulaire retombe sur la saisie d'une URL : rien n'est cassé.
// ============================================

const crypto = require('crypto');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Valeurs d'exemple : traitées comme « non configuré »
const isPlaceholder = (v) => !v || /your-|xxx|changeme/i.test(v);

const isConfigured = Boolean(
  !isPlaceholder(CLOUD_NAME) && !isPlaceholder(API_KEY) && !isPlaceholder(API_SECRET)
);

// Dossiers autorisés : on ne laisse pas le client écrire où il veut
const ALLOWED_FOLDERS = ['afroitalia/logos', 'afroitalia/covers', 'afroitalia/avatars'];

/**
 * Signature Cloudinary : SHA-1 des paramètres triés + api_secret.
 * https://cloudinary.com/documentation/signatures
 */
function signParams(params, secret) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + secret).digest('hex');
}

/**
 * @route   GET /api/uploads/signature?folder=afroitalia/logos
 * @desc    Fournit une signature à usage unique pour un envoi direct
 * @access  Privé (authentifié)
 */
exports.getUploadSignature = (req, res) => {
  if (!isConfigured) {
    return res.status(503).json({
      success: false,
      message: 'Upload d\'images non configuré sur ce serveur.',
      configured: false,
    });
  }

  const folder = ALLOWED_FOLDERS.includes(req.query.folder)
    ? req.query.folder
    : ALLOWED_FOLDERS[0];

  const timestamp = Math.round(Date.now() / 1000);

  // Ces paramètres — et eux seuls — devront accompagner l'envoi.
  // Cloudinary rejette la requête si le client en modifie un.
  const params = {
    folder,
    timestamp,
    // Redimensionnement à la volée : on ne stocke pas des photos
    // de 8 Mo sorties d'un téléphone.
    transformation: 'c_limit,w_1600,h_1600,q_auto:good',
  };

  res.json({
    success: true,
    configured: true,
    data: {
      signature: signParams(params, API_SECRET),
      timestamp,
      folder,
      transformation: params.transformation,
      apiKey: API_KEY,
      cloudName: CLOUD_NAME,
      uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    },
  });
};

/**
 * @route   GET /api/uploads/status
 * @desc    Le formulaire sait s'il doit proposer l'upload ou l'URL
 * @access  Public
 */
exports.getUploadStatus = (req, res) => {
  res.json({ success: true, configured: isConfigured });
};

module.exports.isConfigured = isConfigured;
module.exports.signParams = signParams;
