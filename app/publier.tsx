import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import {
  FormulaireEvenement,
  valeursVides,
  validerFormulaireEvenement,
  type ErreursFormulaireEvenement,
} from "@/components/FormulaireEvenement";
import { creerEvenement } from "@/features/events/api";
import { ErreurApi, ErreurReseau } from "@/lib/apiClient";

export default function Publier() {
  const queryClient = useQueryClient();
  const [valeurs, setValeurs] = useState(valeursVides());
  const [erreurs, setErreurs] = useState<ErreursFormulaireEvenement>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | undefined>();
  const [succes, setSucces] = useState(false);

  const mutation = useMutation({
    mutationFn: creerEvenement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evenements", "moi"] });
      setSucces(true);
    },
    onError: (erreur) => {
      setErreurGenerale(
        erreur instanceof ErreurApi || erreur instanceof ErreurReseau
          ? erreur.message
          : "Une erreur inattendue est survenue.",
      );
    },
  });

  const soumettre = () => {
    setErreurGenerale(undefined);
    const resultat = validerFormulaireEvenement(valeurs);
    setErreurs(resultat.erreurs ?? {});
    if (!resultat.donnees) return;
    mutation.mutate(resultat.donnees);
  };

  if (succes) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        {/* Icone d'etat "en attente", pas une action : meme couleur que le
            badge EN_ATTENTE (bleu neutre), pas l'accent orange. */}
        <Ionicons name="time-outline" size={48} color="#1D4ED8" />
        <Text className="mt-4 text-center text-lg font-medium text-ink">Événement soumis</Text>
        <Text className="mt-2 text-center text-sm text-ink-muted">
          Il est en attente de modération et ne sera visible publiquement qu'après validation
          par un administrateur.
        </Text>
        <Pressable
          onPress={() => router.push("/mes-evenements")}
          className="mt-6 rounded-card bg-brand-500 px-6 py-3 active:opacity-80"
        >
          <Text className="text-base font-medium text-white">Voir mes événements</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="p-6">
      <FormulaireEvenement valeurs={valeurs} onChange={setValeurs} erreurs={erreurs} />

      {erreurGenerale ? (
        <Text className="mb-4 text-sm text-red-600">{erreurGenerale}</Text>
      ) : null}

      <Pressable
        onPress={soumettre}
        disabled={mutation.isPending}
        className="items-center rounded-card bg-brand-500 py-3 active:opacity-80 disabled:opacity-50"
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-base font-medium text-white">Publier</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
