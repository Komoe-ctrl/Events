import { Etiquette, type CouleurEtiquette } from "@/components/Etiquette";
import type { StatutReservation } from "@/types/reservation";

const STYLES: Record<StatutReservation, { couleur: CouleurEtiquette; libelle: string }> = {
  CONFIRMEE: { couleur: "succes", libelle: "Confirmée" },
  UTILISEE: { couleur: "neutre", libelle: "Utilisée" },
  // Neutre, pas erreur : une annulation n'est pas une erreur, juste un etat
  // terminal parmi d'autres (meme traitement qu'UTILISEE, deliberement).
  ANNULEE: { couleur: "neutre", libelle: "Annulée" },
};

export function BadgeStatutReservation({ statut }: { statut: StatutReservation }) {
  const { couleur, libelle } = STYLES[statut];
  return <Etiquette couleur={couleur} libelle={libelle} />;
}
