import { Text } from "react-native";
import type { StatutReservation } from "@/types/reservation";

// Palette semantique distincte de l'accent (regle de discipline couleur) :
// CONFIRMEE utilisait bg-brand-50, recycle desormais la meme famille verte
// que PUBLIE ("etat actif/valide"), pas l'orange.
const STYLES: Record<StatutReservation, { classe: string; libelle: string }> = {
  CONFIRMEE: { classe: "bg-green-50 text-green-700", libelle: "Confirmée" },
  UTILISEE: { classe: "bg-surface-sunken text-ink-muted", libelle: "Utilisée" },
  ANNULEE: { classe: "bg-surface-sunken text-ink-faint", libelle: "Annulée" },
};

export function BadgeStatutReservation({ statut }: { statut: StatutReservation }) {
  const { classe, libelle } = STYLES[statut];
  return (
    <Text className={`overflow-hidden rounded-full px-2 py-1 text-xs font-medium ${classe}`}>
      {libelle}
    </Text>
  );
}
