/**
 * Contourne le cache CDN Cloudinary en cas d'erreur 404
 * Ajoute une transformation no-op (?a_0) qui force le CDN à requêter depuis le serveur
 * @param {string} url - URL de l'image Cloudinary
 * @returns {string} URL avec paramètre de contournement du cache
 */
export const bypassCloudinaryCache = (url) => {
  if (!url) return url;
  
  // Vérifie si c'est une URL Cloudinary
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary')) {
    // Ajoute ?a_0 ou &a_0 selon si l'URL a déjà des paramètres
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}a_0`;
  }
  
  return url;
};

/**
 * Applique le contournement à un tableau d'URLs
 * @param {Array<string>} urls - Tableau d'URLs
 * @returns {Array<string>} URLs modifiées
 */
export const bypassCacheForArray = (urls) => {
  if (!Array.isArray(urls)) return urls;
  return urls.map(bypassCloudinaryCache);
};
