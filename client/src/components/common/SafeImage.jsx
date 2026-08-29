// ============================================
// SafeImage — image avec repli si le chargement échoue
//
// Une URL saisie à la main peut pointer vers une page web, un
// fichier local ou un lien privé : le navigateur affiche alors
// sa vilaine icône « image cassée ». Ici, on bascule proprement
// sur l'élément de remplacement prévu (icône de catégorie…).
//
// Usage :
//   <SafeImage src={b.coverImage} alt={b.name}
//              fallback={<Icon name="store" size={40} />} />
// ============================================

import React, { useState, useEffect } from 'react';

const SafeImage = ({ src, alt = '', className = '', fallback = null, ...rest }) => {
  const [failed, setFailed] = useState(false);

  // Une nouvelle URL mérite une nouvelle tentative
  useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) return fallback;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
};

export default SafeImage;
