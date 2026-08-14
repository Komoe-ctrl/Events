import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { CarteEvenement } from "@/components/CarteEvenement";
import { recupererEvenements } from "@/features/events/api";
import { usePosition } from "@/lib/usePosition";

export default function AutourDeMoi() {
  const position = usePosition();
  // Le tri par distance est fait par l'API (regle de domaine n.1 : haversine
  // en SQL, jamais en JavaScript). On se contente d'envoyer lat/lng quand ils
  // sont connus ; sans position, l'API renvoie les evenements sans distance.
  const coordonnees = position.statut === "ok" ? { lat: position.latitude, lng: position.longitude } : null;

  const { data, isPending, isError } = useQuery({
    queryKey: ["evenements", coordonnees],
    queryFn: () => recupererEvenements(coordonnees ?? {}),
  });

  const evenements = data ?? [];

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken">
        <ActivityIndicator color="#B84800" />
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
          // Notice, pas une action : l'accent est reserve aux actions
          // primaires et a l'etat actif (regle de discipline couleur), donc
          // pas d'aplat orange ici malgre l'ancienne tentation "ca doit se
          // remarquer".
          <View className="mb-3 rounded-card border border-line bg-surface px-4 py-3">
            <Text className="text-sm font-medium text-ink-muted">
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
