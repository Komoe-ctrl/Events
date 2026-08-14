import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { recupererMesReservations, recupererReservationEnCache } from "@/features/reservations/api";
import { formaterDateEvenement } from "@/lib/date";

export default function DetailReservation() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Source principale : le reseau, a jour (statut peut avoir change entre
  // temps, ex. UTILISEE apres un scan). Marche aussi sans reseau : source
  // de repli locale, ecrite a chaque fetch reussi de cette meme liste ou a
  // la creation de la reservation (voir src/lib/reservationCache.ts).
  const enLigne = useQuery({
    queryKey: ["reservations", "moi"],
    queryFn: recupererMesReservations,
  });
  const enCache = useQuery({
    queryKey: ["reservations", "moi", "cache", id],
    queryFn: () => recupererReservationEnCache(id),
  });

  const reservation = enLigne.data?.find((r) => r.id === id) ?? enCache.data ?? undefined;

  if (enLigne.isPending && enCache.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#D85314" />
      </View>
    );
  }

  if (!reservation) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <Text className="text-center text-ink-muted">
          Réservation introuvable.
          {enLigne.isError
            ? " Vérifie ta connexion — elle n'a peut-être pas encore été mise en cache sur cet appareil."
            : ""}
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
        <View className="rounded-2xl border border-line p-4">
          <QRCode value={reservation.code} size={200} />
        </View>
        <Text className="mt-4 text-3xl font-semibold tracking-widest text-ink">
          {reservation.code}
        </Text>
        <Text className="mt-2 text-sm text-ink-muted">
          {reservation.nombrePlaces} place{reservation.nombrePlaces > 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );
}
