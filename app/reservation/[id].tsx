import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import {
  annulerReservation,
  recupererMesReservations,
  recupererReservationEnCache,
} from "@/features/reservations/api";
import { ErreurApi } from "@/lib/apiClient";
import { formaterDateEvenement } from "@/lib/date";
import { revenirOuAller } from "@/lib/navigation";

export default function DetailReservation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [confirmationVisible, setConfirmationVisible] = useState(false);

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
      revenirOuAller("/mes-reservations");
    },
  });

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
            onPress={() => setConfirmationVisible(true)}
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

      {/* Alert.alert() de react-native est un no-op sur web (react-native-web
          l'implemente comme une classe vide) : aucune confirmation ne
          s'affichait jamais et le bouton semblait ne rien faire. Modal, lui,
          est reellement implemente sur web (portail + focus trap) — modale
          maison plutot que de dependre d'une API qui ne marche que sur
          natif. */}
      <Modal
        visible={confirmationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmationVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 p-6">
          <View className="w-full max-w-sm rounded-2xl bg-surface p-5">
            <Text className="text-lg font-medium text-ink">Annuler la réservation ?</Text>
            <Text className="mt-2 text-sm text-ink-muted">
              Vous pourrez réserver à nouveau si vous changez d'avis.
            </Text>
            <View className="mt-5 flex-row justify-end gap-3">
              <Pressable
                onPress={() => setConfirmationVisible(false)}
                className="rounded-lg px-4 py-2 active:opacity-70"
              >
                <Text className="text-base text-ink">Non</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setConfirmationVisible(false);
                  mutationAnnulation.mutate();
                }}
                className="rounded-lg bg-red-600 px-4 py-2 active:opacity-80"
              >
                <Text className="text-base font-medium text-white">
                  Annuler la réservation
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
