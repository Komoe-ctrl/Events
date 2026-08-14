import { Text } from "react-native";
import type { StatutReservation } from "@/types/reservation";

const STYLES: Record<StatutReservation, { classe: string; libelle: string }> = {
  CONFIRMEE: { classe: "bg-brand-50 text-brand-700", libelle: "Confirmée" },
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
