import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { BadgeStatutReservation } from "@/components/BadgeStatutReservation";
import { recupererInscrits } from "@/features/reservations/api";
import type { ReservationOrganisateur } from "@/types/reservation";

export default function Inscrits() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError } = useQuery({
    queryKey: ["evenements", id, "inscrits"],
    queryFn: () => recupererInscrits(id),
    enabled: Boolean(id),
  });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken">
        <ActivityIndicator color="#D85314" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken px-8">
        <Text className="text-center text-ink-muted">
          Impossible de charger les inscrits. Vérifie ta connexion.
        </Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken px-8">
        <Text className="text-center text-ink-muted">
          Aucune réservation pour le moment.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="bg-surface-sunken"
      contentContainerClassName="px-4 pt-4 pb-8"
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <LigneInscrit reservation={item} />}
    />
  );
}

function LigneInscrit({ reservation }: { reservation: ReservationOrganisateur }) {
  return (
    <View className="mb-3 rounded-xl border border-line bg-surface p-4">
      <Text className="text-base font-medium text-ink">{reservation.utilisateur.nom}</Text>
      <Text className="mt-1 text-sm text-ink-muted">{reservation.utilisateur.telephone}</Text>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-ink-faint">
          {reservation.nombrePlaces} place{reservation.nombrePlaces > 1 ? "s" : ""}
        </Text>
        <BadgeStatutReservation statut={reservation.statut} />
      </View>
    </View>
  );
}
