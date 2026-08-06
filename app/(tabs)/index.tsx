import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { CarteEvenement } from "@/components/CarteEvenement";
import { recupererEvenements } from "@/features/events/api";
import { distanceKm } from "@/lib/distance";
import { usePosition } from "@/lib/usePosition";
import type { EvenementAvecDistance } from "@/types/event";

export default function AutourDeMoi() {
  const position = usePosition();
  const { data, isPending, isError } = useQuery({
    queryKey: ["evenements"],
    queryFn: recupererEvenements,
  });

  const evenements = useMemo<EvenementAvecDistance[]>(() => {
    if (!data) return [];
    if (position.statut !== "ok") {
      return data.map((e) => ({ ...e, distanceKm: null }));
    }
    return data
      .map((e) => ({ ...e, distanceKm: distanceKm(position, e) }))
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }, [data, position]);

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
          Impossible de charger les événements. Vérifie ta connexion.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="bg-surface-sunken"
      contentContainerClassName="px-4 pt-4 pb-8"
      data={evenements}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <CarteEvenement evenement={item} />}
      ListHeaderComponent={
        position.statut === "refuse" ? (
          <View className="mb-4 rounded-xl bg-brand-50 p-4">
            <Text className="text-sm text-brand-700">
              Active la localisation pour trier les événements par distance.
            </Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <Text className="mt-16 text-center text-ink-muted">
          Aucun événement pour le moment.
        </Text>
      }
    />
  );
}
