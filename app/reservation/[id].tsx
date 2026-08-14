import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { recupererMesReservations } from "@/features/reservations/api";
import { formaterDateEvenement } from "@/lib/date";

export default function DetailReservation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError } = useQuery({
    queryKey: ["reservations", "moi"],
    queryFn: recupererMesReservations,
  });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#D85314" />
      </View>
    );
  }

  const reservation = data?.find((r) => r.id === id);

  if (isError || !reservation) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <Text className="text-center text-ink-muted">
          {isError ? "Impossible de charger cette réservation." : "Réservation introuvable."}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface p-6">
      {reservation.evenement ? (
        <View>
          <Text className="text-xl font-medium text-ink">{reservation.evenement.titre}</Text>
          <Text className="mt-1 text-sm text-ink-muted">
            {formaterDateEvenement(reservation.evenement.dateDebut)} ·{" "}
            {reservation.evenement.commune}
          </Text>
        </View>
      ) : null}

      <View className="mt-8 items-center">
        <Text className="text-3xl font-semibold tracking-widest text-ink">
          {reservation.code}
        </Text>
        <Text className="mt-2 text-sm text-ink-muted">
          {reservation.nombrePlaces} place{reservation.nombrePlaces > 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );
}
