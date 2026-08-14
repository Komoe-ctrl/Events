const REGEX_TELEPHONE_IVOIRIEN = /^\+225(0[0-9]{9})$/;

/**
 * Normalise une saisie vers le format canonique +225XXXXXXXXXX (10 chiffres,
 * le premier etant 0 — plan de numerotation ivoirien depuis 2021, cf.
 * l'exemple de l'API : +2250700000000). Accepte les formats courants
 * ("0700000000", "+2250700000000", "2250700000000", avec espaces/tirets).
 * Renvoie null si aucun format reconnu — la validation cote API est plus
 * permissive (elle accepte a peu pres n'importe quel numero de 8 a 15
 * caracteres), celle-ci est volontairement plus stricte pour guider
 * l'utilisateur avant l'envoi.
 */
export function normaliserTelephoneIvoirien(saisie: string): string | null {
  const nettoye = saisie.trim().replace(/[\s-]/g, "");

  let candidat: string;
  if (nettoye.startsWith("+225")) {
    candidat = nettoye;
  } else if (nettoye.startsWith("225")) {
    candidat = `+${nettoye}`;
  } else if (nettoye.startsWith("0")) {
    candidat = `+225${nettoye}`;
  } else {
    candidat = nettoye;
  }

  return REGEX_TELEPHONE_IVOIRIEN.test(candidat) ? candidat : null;
}
