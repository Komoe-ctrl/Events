import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import {
  annulerReservation,
  recupererMesReservations,
  recupererReservationEnCache,
} from "@/features/reservations/api";
import { ErreurApi } from "@/lib/apiClient";
import { formaterDateEvenement } from "@/lib/date";

export default function DetailReservation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

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

  const mutationAnnulation = useMutation({
    mutationFn: () => annulerReservation(id),
    onSuccess: (annulee) => {
      queryClient.invalidateQueries({ queryKey: ["reservations", "moi"] });
      queryClient.invalidateQueries({ queryKey: ["evenement", annulee.evenementId] });
      router.back();
    },
  });

  const confirmerAnnulation = () => {
    Alert.alert(
      "Annuler la réservation ?",
      "Vous pourrez réserver à nouveau si vous changez d'avis.",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Annuler la réservation",
          style: "destructive",
          onPress: () => mutationAnnulation.mutate(),
        },
      ],
    );
  };

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

      {reservation.statut === "CONFIRMEE" ? (
        <View className="mt-10">
          <Pressable
            onPress={confirmerAnnulation}
            disabled={mutationAnnulation.isPending}
            className="items-center rounded-xl border border-line py-3 active:opacity-70 disabled:opacity-50"
          >
            {mutationAnnulation.isPending ? (
              <ActivityIndicator color="#6B6560" />
            ) : (
              <Text className="text-base font-medium text-ink">Annuler la réservation</Text>
            )}
          </Pressable>
          {mutationAnnulation.isError ? (
            <Text className="mt-2 text-center text-sm text-red-600">
              {mutationAnnulation.error instanceof ErreurApi
                ? mutationAnnulation.error.message
                : "Impossible d'annuler. Vérifie ta connexion."}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
