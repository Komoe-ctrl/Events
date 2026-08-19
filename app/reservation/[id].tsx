import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
        <ActivityIndicator color="#B84800" />
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
    // Fond sombre volontaire, pas un oubli de theme : cet ecran est concu
    // pour etre brandi a l'entree d'une salle, souvent dans le noir. Un
    // rectangle blanc pur sur fond sombre est ce qui se repere le plus vite
    // par l'organisateur qui scanne, et evite d'eblouir en plein ecran
    // blanc. Le QR et le code de secours restent en blanc/noir purs, jamais
    // teintes par la palette — la lisibilite prime sur l'identite visuelle
    // ici precisement.
    <View className="flex-1 bg-ink p-6">
      <StatusBar style="light" />
      {reservation.evenement ? (
        <View>
          <Text className="font-display text-display text-white">
            {reservation.evenement.titre}
          </Text>
          <Text className="mt-1 text-sm text-white/60">
            {formaterDateEvenement(reservation.evenement.dateDebut)} ·{" "}
            {reservation.evenement.commune}
          </Text>
        </View>
      ) : null}

      <View className="mt-8 items-center">
        <View className="rounded-card bg-white p-4">
          <QRCode value={reservation.code} size={220} />
        </View>
        <Text className="mt-5 text-center font-display text-display-lg tracking-[6px] text-white">
          {reservation.code}
        </Text>
        <Text className="mt-2 text-sm text-white/60">
          {reservation.nombrePlaces} place{reservation.nombrePlaces > 1 ? "s" : ""}
        </Text>
      </View>

      {reservation.statut === "CONFIRMEE" ? (
        <View className="mt-10">
          <Pressable
            onPress={() => setConfirmationVisible(true)}
            disabled={mutationAnnulation.isPending}
            className="items-center rounded-card border border-white/20 py-3 active:opacity-70 disabled:opacity-50"
          >
            {mutationAnnulation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-medium text-white/80">Annuler la réservation</Text>
            )}
          </Pressable>
          {mutationAnnulation.isError ? (
            <Text className="mt-2 text-center text-sm text-red-400">
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
          <View className="w-full max-w-sm rounded-card bg-surface p-5">
            <Text className="text-lg font-medium text-ink">Annuler la réservation ?</Text>
            <Text className="mt-2 text-sm text-ink-muted">
              Vous pourrez réserver à nouveau si vous changez d'avis.
            </Text>
            <View className="mt-5 flex-row justify-end gap-3">
              <Pressable
                onPress={() => setConfirmationVisible(false)}
                className="rounded-chip px-4 py-2 active:opacity-70"
              >
                <Text className="text-base text-ink">Non</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setConfirmationVisible(false);
                  mutationAnnulation.mutate();
                }}
                className="rounded-chip bg-red-600 px-4 py-2 active:opacity-80"
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
