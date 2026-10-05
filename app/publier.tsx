import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Bouton } from "@/components/Bouton";
import { EtatVide } from "@/components/EtatVide";
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
      <View className="flex-1 bg-surface">
        {/* Icone d'etat "en attente", pas une action : meme couleur que le
            token info (EN_ATTENTE), pas l'accent orange. */}
        <EtatVide
          icone="time-outline"
          couleurIcone="#1e40af"
          titre="Événement soumis"
          texte="Il est en attente de modération et ne sera visible publiquement qu'après validation par un administrateur."
          action={{
            libelle: "Voir mes événements",
            onPress: () => router.push("/mes-evenements"),
          }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="p-6"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Pressable onPress={Keyboard.dismiss}>
          <FormulaireEvenement valeurs={valeurs} onChange={setValeurs} erreurs={erreurs} />

          {erreurGenerale ? (
            <Text className="mb-4 text-sm text-red-600">{erreurGenerale}</Text>
          ) : null}

          <Bouton onPress={soumettre} chargement={mutation.isPending}>
            Publier
          </Bouton>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
