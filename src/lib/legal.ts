/**
 * URL publiques des documents legaux, ouvertes dans le navigateur depuis
 * l'onglet Profil. Servies par le portfolio Next.js (depot separe,
 * https://github.com/Komoe-ctrl/portfolio) — lit content/legal/*.md au
 * build (remark/rehype), source unique, aucune synchronisation
 * automatique entre les deux depots : copier les .md de ce depot vers
 * portfolio/content/legal/ a chaque changement de contenu (voir
 * legal/NOTES.md).
 *
 * Domaine du portfolio (lib/site.ts, SITE_URL) : a remplacer ici le jour
 * ou un nom de domaine propre est pris — c'est le seul endroit a changer
 * cote app.
 */
export const URL_POLITIQUE_CONFIDENTIALITE =
  "https://komoe-emile.vercel.app/fr/legal/confidentialite";
export const URL_MENTIONS_LEGALES =
  "https://komoe-emile.vercel.app/fr/legal/mentions-legales";
