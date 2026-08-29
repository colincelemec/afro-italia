// ============================================
// Service Upload — envoi direct vers Cloudinary
//
// Notre API signe la demande, puis le navigateur envoie le fichier
// directement à Cloudinary. Le serveur ne voit jamais le fichier :
// pas de bande passante consommée, pas de disque utilisé.
// ============================================

import api from './api';

// Limites côté client : on refuse avant d'envoyer, pas après
export const MAX_SIZE_MB = 5;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** L'envoi de fichiers est-il disponible sur ce serveur ? */
export async function isUploadAvailable() {
  try {
    const res = await api.get('/uploads/status');
    return Boolean(res.configured);
  } catch {
    return false;
  }
}

/**
 * Vérifie un fichier avant tout envoi.
 * @returns {string|null} message d'erreur, ou null si le fichier convient
 */
export function validateFile(file, messages = {}) {
  if (!file) return null;

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return messages.type || 'Format non accepté (JPG, PNG, WEBP ou GIF).';
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return (messages.size || `Fichier trop lourd (maximum ${MAX_SIZE_MB} Mo).`);
  }
  return null;
}

/**
 * Envoie une image et retourne son URL définitive.
 *
 * @param {File} file
 * @param {string} folder      'afroitalia/logos' | 'afroitalia/covers'
 * @param {Function} onProgress  reçoit un pourcentage (0-100)
 * @returns {Promise<string>}  URL sécurisée de l'image
 */
export async function uploadImage(file, folder, onProgress) {
  // 1. Demander une signature à notre API
  const res = await api.get('/uploads/signature', { folder });
  const { signature, timestamp, apiKey, uploadUrl, transformation } = res.data;

  // 2. Construire la requête pour Cloudinary
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('signature', signature);
  form.append('folder', folder);
  form.append('transformation', transformation);

  // 3. Envoyer — XMLHttpRequest plutôt que fetch, pour la progression
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) {
          resolve(body.secure_url);
        } else {
          reject(new Error(body?.error?.message || `Échec de l'envoi (${xhr.status})`));
        }
      } catch {
        reject(new Error('Réponse inattendue du service d\'images.'));
      }
    };

    xhr.onerror = () => reject(new Error('Connexion interrompue pendant l\'envoi.'));
    xhr.send(form);
  });
}

const uploadService = { isUploadAvailable, uploadImage, validateFile, MAX_SIZE_MB, ACCEPTED_TYPES };
export default uploadService;
