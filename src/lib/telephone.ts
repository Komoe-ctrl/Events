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

export type ContactOrganisateurInterprete =
  | { type: "telephone"; lienTel: string; lienWhatsapp: string; affichage: string }
  | { type: "texte"; affichage: string };

/**
 * Interprete Evenement.contactOrganisateur — un champ libre qui peut
 * contenir un numero, deux numeros, un numero suivi d'un pseudo Instagram,
 * ou n'importe quel texte. Un lien tel:/wa.me n'est propose que si le
 * contenu est, dans son integralite, un unique numero ivoirien bien forme.
 * Dans tous les autres cas : texte simple (affiche selectionnable pour
 * copier-coller, jamais cliquable). Jamais de lien construit a partir d'une
 * interpretation partielle du contenu (ex. extraire "le premier numero
 * trouve" dans "0700000000 / Instagram @orga") — on prefere renvoyer du
 * texte simple a un lien qui pointerait vers le mauvais numero.
 */
export function interpreterContactOrganisateur(
  contact: string,
): ContactOrganisateurInterprete {
  const affichage = contact.trim();
  const numero = normaliserNumeroSeul(affichage);

  if (numero) {
    return {
      type: "telephone",
      lienTel: `tel:${numero}`,
      lienWhatsapp: `https://wa.me/${numero.slice(1)}`,
      affichage,
    };
  }

  return { type: "texte", affichage };
}

/**
 * Contrairement a normaliserTelephoneIvoirien (reserve a la validation de
 * saisie a l'inscription, qui tolere un numero isole dans un champ dedie),
 * celle-ci rejette d'abord tout contenu qui n'est pas exclusivement compose
 * de chiffres/espaces/tirets/plus : un second numero separe par "/" ou ",",
 * un pseudo, une mention "WhatsApp uniquement"... font echouer la
 * reconnaissance avant meme d'atteindre la regex de forme.
 */
function normaliserNumeroSeul(valeur: string): string | null {
  if (!/^[0-9+\s-]+$/.test(valeur)) return null;
  return normaliserTelephoneIvoirien(valeur);
}
