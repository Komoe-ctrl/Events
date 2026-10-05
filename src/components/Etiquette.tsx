import { Text } from "react-native";

export type CouleurEtiquette = "succes" | "erreur" | "attention" | "info" | "neutre";

const CLASSES_COULEUR: Record<CouleurEtiquette, string> = {
  succes: "bg-succes text-succes-ink",
  erreur: "bg-erreur text-erreur-ink",
  attention: "bg-attention text-attention-ink",
  info: "bg-info text-info-ink",
  // Etats sans connotation positive/negative (UTILISEE, ANNULEE, BROUILLON) :
  // meme traitement que le fond de l'ecran assombri, pas une couleur d'etat.
  neutre: "bg-surface-sunken text-ink-muted",
};

/** Badge de statut generique — couleurs semantiques uniquement (jamais
 * `accent`, reserve aux accents ponctuels comme le prix). Remplace les deux
 * implementations dupliquees (BadgeStatutReservation, BadgeStatut de
 * mes-evenements.tsx). */
export function Etiquette({ libelle, couleur }: { libelle: string; couleur: CouleurEtiquette }) {
  return (
    <Text
      className={`overflow-hidden rounded-full px-2 py-1 text-xs font-medium ${CLASSES_COULEUR[couleur]}`}
    >
      {libelle}
    </Text>
  );
}
