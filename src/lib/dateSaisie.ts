/**
 * Abidjan est en UTC+0 toute l'annee (pas d'heure d'ete — regle CLAUDE.md :
 * "la conversion vers l'heure locale d'Abidjan est la responsabilite du
 * client mobile"). Une date/heure locale saisie ici correspond donc
 * directement au meme instant en UTC, sans decalage a calculer. Format
 * saisi : JJ/MM/AAAA et HH:mm.
 */
export function construireDateIso(dateSaisie: string, heureSaisie: string): string | null {
  const matchDate = dateSaisie.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const matchHeure = heureSaisie.trim().match(/^(\d{2}):(\d{2})$/);
  if (!matchDate || !matchHeure) return null;

  const [, jourTxt, moisTxt, anneeTxt] = matchDate;
  const [, heureTxt, minuteTxt] = matchHeure;
  const jour = Number(jourTxt);
  const mois = Number(moisTxt);
  const annee = Number(anneeTxt);
  const heure = Number(heureTxt);
  const minute = Number(minuteTxt);

  if (mois < 1 || mois > 12 || jour < 1 || jour > 31 || heure > 23 || minute > 59) {
    return null;
  }

  const iso = `${anneeTxt}-${moisTxt}-${jourTxt}T${heureTxt}:${minuteTxt}:00.000Z`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  // Rejette les dates qui n'existent pas (ex. 31/02) : Date accepte
  // silencieusement et deborde sur le mois suivant sans cette verification.
  if (
    date.getUTCDate() !== jour ||
    date.getUTCMonth() + 1 !== mois ||
    date.getUTCFullYear() !== annee
  ) {
    return null;
  }

  return iso;
}

/** Sens inverse, pour pre-remplir un formulaire d'edition depuis une date ISO existante. */
export function decomposerDateIso(iso: string): { jour: string; heure: string } {
  const date = new Date(iso);
  const jour = String(date.getUTCDate()).padStart(2, "0");
  const mois = String(date.getUTCMonth() + 1).padStart(2, "0");
  const annee = String(date.getUTCFullYear());
  const heure = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  return { jour: `${jour}/${mois}/${annee}`, heure: `${heure}:${minute}` };
}
