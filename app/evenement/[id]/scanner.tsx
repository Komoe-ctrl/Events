import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ChampTexte } from "@/components/ChampTexte";
import { validerReservation } from "@/features/reservations/api";
import { ErreurApi, ErreurReseau } from "@/lib/apiClient";
import type { Reservation } from "@/types/reservation";

/**
 * Le code identifie la reservation (et donc son evenement) de facon unique
 * — POST /reservations/valider ne prend pas d'id d'evenement, l'organisateur
 * peut valider n'importe lequel de ses billets depuis cet ecran quel que
 * soit l'evenement d'ou il y accede. Pas de restriction supplementaire
 * ajoutee ici : le serveur ne la prevoit pas non plus.
 */
export default function Scanner() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [resultat, setResultat] = useState<Reservation | null>(null);
  const [erreur, setErreur] = useState<string | undefined>();

  const mutation = useMutation({
    mutationFn: (code: string) => validerReservation(code),
    onSuccess: (reservation) => {
      setResultat(reservation);
      setErreur(undefined);
      setCode("");
      queryClient.invalidateQueries({
        queryKey: ["evenements", reservation.evenementId, "inscrits"],
      });
    },
    onError: (e) => {
      setResultat(null);
      // Les codes d'erreur (RESERVATION_DEJA_UTILISEE, RESERVATION_ANNULEE,
      // code introuvable, pas l'organisateur) sont deja distincts et clairs
      // dans le message renvoye par le serveur — pas besoin de les
      // re-distinguer nous-memes cote client.
      setErreur(
        e instanceof ErreurApi || e instanceof ErreurReseau
          ? e.message
          : "Une erreur inattendue est survenue.",
      );
    },
  });

  const valider = () => {
    setErreur(undefined);
    setResultat(null);
    if (code.trim().length === 0) {
      setErreur("Entre un code.");
      return;
    }
    mutation.mutate(code.trim().toUpperCase());
  };

  return (
    <View className="flex-1 bg-surface p-6">
      <ChampTexte
        label="Code de la réservation"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        placeholder="AG3NEB98"
      />

      <Pressable
        onPress={valider}
        disabled={mutation.isPending}
        className="items-center rounded-xl bg-brand-600 py-3 active:opacity-80 disabled:opacity-50"
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-base font-medium text-white">Valider</Text>
        )}
      </Pressable>

      {erreur ? (
        <View className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <Text className="text-sm text-red-700">{erreur}</Text>
        </View>
      ) : null}

      {resultat ? (
        <View className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <Text className="text-base font-medium text-green-800">Billet validé</Text>
          <Text className="mt-1 text-sm text-green-700">
            {resultat.nombrePlaces} place{resultat.nombrePlaces > 1 ? "s" : ""} · code{" "}
            {resultat.code}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
