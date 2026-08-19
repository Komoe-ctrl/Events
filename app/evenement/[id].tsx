import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/features/auth/AuthContext";
import { recupererEvenement } from "@/features/events/api";
import { creerReservation, recupererMesReservations } from "@/features/reservations/api";
import { ErreurApi } from "@/lib/apiClient";
import { formaterDateEvenement } from "@/lib/date";

const LIBELLES_CATEGORIE: Record<string, string> = {
  CONCERT: "Concert",
  SOIREE: "Soirée",
  CONFERENCE: "Conférence",
  SPORT: "Sport",
  CULTURE: "Culture",
  RELIGIEUX: "Religieux",
};

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
        {/* brand-700, pas brand-500 : #FF6B00 direct sur fond clair ne
            tient que 2.66:1 (mesure), sous le seuil non-textuel de 3:1. */}
        <ActivityIndicator color="#B84800" />
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
      <View className="relative">
        <Image
          source={data.image}
          style={{ width: "100%", height: 320 }}
          contentFit="cover"
        />
        {/* Meme langage que CarteEvenement : chips en aplat, pas de degrade —
            l'ecran vedette du produit doit rester coherent avec la carte qui
            y mene. */}
        <View className="absolute inset-x-0 top-0 flex-row items-start justify-between p-4">
          <Text className="overflow-hidden rounded-chip bg-ink px-2 py-1 text-label font-bold uppercase text-white">
            {LIBELLES_CATEGORIE[data.categorie] ?? data.categorie}
          </Text>
          <Text className="overflow-hidden rounded-chip bg-accent px-2 py-1 text-label font-bold uppercase text-accent-ink">
            {data.prix === null ? "Gratuit" : `${data.prix.toLocaleString("fr-FR")} FCFA`}
          </Text>
        </View>
      </View>
      <View className="p-5">
        <Text className="font-display text-display-lg leading-[36px] text-ink">
          {data.titre}
        </Text>
        {/* Texte explicatif, pas une action : encre sombre plutot
            qu'orange (regle de discipline couleur). */}
        <Text className="mt-2 text-sm font-medium text-ink-muted">
          {formaterDateEvenement(data.dateDebut)}
          {data.dateFin ? ` → ${formaterDateEvenement(data.dateFin)}` : ""}
        </Text>
        <Text className="mt-1 text-sm text-ink-muted">
          {data.adresse} · {data.commune}
        </Text>
        <Text className="mt-4 text-base leading-6 text-ink">{data.description}</Text>

        <View className="mt-6">
          {reservationExistante ? (
            <Link href={`/reservation/${reservationExistante.id}`} asChild>
              {/* Confirmation, pas une action : palette semantique verte
                  (etat "actif/valide"), distincte de l'accent orange —
                  meme famille que le badge CONFIRMEE. */}
              <Pressable className="rounded-card bg-green-50 p-4 active:opacity-70">
                <Text className="text-sm text-green-800">
                  Vous avez déjà réservé {reservationExistante.nombrePlaces} place
                  {reservationExistante.nombrePlaces > 1 ? "s" : ""}.
                </Text>
                <Text className="mt-1 text-sm text-green-700">
                  Code : {reservationExistante.code}
                </Text>
              </Pressable>
            </Link>
          ) : complet ? (
            <View className="items-center rounded-card bg-surface-sunken py-3">
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
                    className="h-9 w-9 items-center justify-center rounded-full bg-surface-sunken disabled:opacity-30"
                  >
                    <Text className="text-lg text-ink">−</Text>
                  </Pressable>
                  <Text className="w-6 text-center text-base font-medium text-ink">
                    {nombrePlaces}
                  </Text>
                  <Pressable
                    onPress={() => setNombrePlacesSaisi((n) => Math.min(maxPlaces, n + 1))}
                    disabled={nombrePlaces >= maxPlaces}
                    className="h-9 w-9 items-center justify-center rounded-full bg-surface-sunken disabled:opacity-30"
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
                className="items-center rounded-card bg-brand-500 py-3.5 active:opacity-80 disabled:opacity-50"
              >
                {/* Anton reserve aux titres, pas aux libelles/boutons —
                    meme traitement que les autres actions primaires. */}
                {mutationReservation.isPending ? (
                  <ActivityIndicator color="#1A1410" />
                ) : (
                  <Text className="text-base font-medium text-ink">Réserver</Text>
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
