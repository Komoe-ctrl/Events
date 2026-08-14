import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/features/auth/AuthContext";
import { recupererEvenement } from "@/features/events/api";
import { creerReservation, recupererMesReservations } from "@/features/reservations/api";
import { ErreurApi } from "@/lib/apiClient";

export default function FicheEvenement() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { etat } = useAuth();
  const queryClient = useQueryClient();
  const [nombrePlacesSaisi, setNombrePlacesSaisi] = useState(1);

  const { data, isPending, error } = useQuery({
    queryKey: ["evenement", id],
    queryFn: () => recupererEvenement(id),
    enabled: Boolean(id),
  });

  const { data: mesReservations } = useQuery({
    queryKey: ["reservations", "moi"],
    queryFn: recupererMesReservations,
    enabled: etat.statut === "connecte",
  });

  const reservationExistante = mesReservations?.find(
    (r) => r.evenementId === id && r.statut !== "ANNULEE",
  );

  const mutationReservation = useMutation({
    mutationFn: (nombrePlaces: number) => creerReservation(id, nombrePlaces),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evenement", id] });
      queryClient.invalidateQueries({ queryKey: ["reservations", "moi"] });
    },
    onError: (erreur) => {
      if (!(erreur instanceof ErreurApi)) return;
      // Course perdue : quelqu'un a pris la derniere place, ou une
      // reservation existait deja sans que le cache local le sache (deux
      // onglets, par exemple). Dans les deux cas l'affichage courant est
      // perime — on le corrige plutot que de laisser un bouton "Reserver"
      // actif sur un evenement complet ou deja reserve.
      if (erreur.code === "CAPACITE_INSUFFISANTE") {
        queryClient.invalidateQueries({ queryKey: ["evenement", id] });
      } else if (erreur.code === "RESERVATION_DEJA_ACTIVE") {
        queryClient.invalidateQueries({ queryKey: ["evenement", id] });
        queryClient.invalidateQueries({ queryKey: ["reservations", "moi"] });
      }
    },
  });

  const gererReservation = (nombrePlaces: number) => {
    if (etat.statut !== "connecte") {
      router.push("/connexion");
      return;
    }
    mutationReservation.mutate(nombrePlaces);
  };

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#D85314" />
      </View>
    );
  }

  if (error) {
    const introuvable = error instanceof ErreurApi && error.statutHttp === 404;
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <Text className="text-center text-ink-muted">
          {introuvable
            ? "Événement introuvable."
            : "Impossible de charger cet événement. Vérifie ta connexion."}
        </Text>
      </View>
    );
  }

  if (!data) {
    return null;
  }

  const complet = data.placesRestantes === 0;
  // Plafond serveur (CreerReservationDto : max 10) borne en plus par les
  // places reellement disponibles quand ce nombre est connu et petit.
  const maxPlaces = Math.min(data.placesRestantes ?? 10, 10);
  const nombrePlaces = Math.min(nombrePlacesSaisi, maxPlaces);

  return (
    <ScrollView className="flex-1 bg-surface">
      <Image
        source={data.image}
        style={{ width: "100%", height: 220 }}
        contentFit="cover"
      />
      <View className="p-5">
        <Text className="text-xl font-medium text-ink">{data.titre}</Text>
        <Text className="mt-2 text-sm text-ink-muted">
          {data.adresse} · {data.commune}
        </Text>
        <Text className="mt-4 text-base leading-6 text-ink">{data.description}</Text>

        <View className="mt-6">
          {reservationExistante ? (
            <View className="rounded-xl border border-line bg-surface-sunken p-4">
              <Text className="text-sm text-ink">
                Vous avez déjà réservé {reservationExistante.nombrePlaces} place
                {reservationExistante.nombrePlaces > 1 ? "s" : ""}.
              </Text>
              <Text className="mt-1 text-sm text-ink-muted">
                Code : {reservationExistante.code}
              </Text>
            </View>
          ) : complet ? (
            <View className="items-center rounded-xl bg-surface-sunken py-3">
              <Text className="text-base font-medium text-ink-muted">Complet</Text>
            </View>
          ) : (
            <>
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-ink">Nombre de places</Text>
                <View className="flex-row items-center gap-4">
                  <Pressable
                    onPress={() => setNombrePlacesSaisi((n) => Math.max(1, n - 1))}
                    disabled={nombrePlaces <= 1}
                    className="h-9 w-9 items-center justify-center rounded-full border border-line disabled:opacity-30"
                  >
                    <Text className="text-lg text-ink">−</Text>
                  </Pressable>
                  <Text className="w-6 text-center text-base font-medium text-ink">
                    {nombrePlaces}
                  </Text>
                  <Pressable
                    onPress={() => setNombrePlacesSaisi((n) => Math.min(maxPlaces, n + 1))}
                    disabled={nombrePlaces >= maxPlaces}
                    className="h-9 w-9 items-center justify-center rounded-full border border-line disabled:opacity-30"
                  >
                    <Text className="text-lg text-ink">+</Text>
                  </Pressable>
                </View>
              </View>
              {data.placesRestantes !== null && data.placesRestantes <= 10 ? (
                <Text className="mb-3 text-xs text-ink-faint">
                  {data.placesRestantes} place{data.placesRestantes > 1 ? "s" : ""} restante
                  {data.placesRestantes > 1 ? "s" : ""}
                </Text>
              ) : null}

              <Pressable
                onPress={() => gererReservation(nombrePlaces)}
                disabled={mutationReservation.isPending || etat.statut === "chargement"}
                className="items-center rounded-xl bg-brand-600 py-3 active:opacity-80 disabled:opacity-50"
              >
                {mutationReservation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-base font-medium text-white">Réserver</Text>
                )}
              </Pressable>
            </>
          )}

          {mutationReservation.isError ? (
            <Text className="mt-2 text-sm text-red-600">
              {mutationReservation.error.message}
            </Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
