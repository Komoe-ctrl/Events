import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Bouton } from "@/components/Bouton";
import { EtatErreur } from "@/components/EtatErreur";
import {
  FormulaireEvenement,
  valeursDepuisEvenement,
  valeursVides,
  validerFormulaireEvenement,
  type ErreursFormulaireEvenement,
  type ValeursFormulaireEvenement,
} from "@/components/FormulaireEvenement";
import { Squelette } from "@/components/Squelette";
import { modifierEvenement, recupererMesEvenements } from "@/features/events/api";
import { ErreurApi, ErreurReseau } from "@/lib/apiClient";
import { revenirOuAller } from "@/lib/navigation";

export default function ModifierEvenement() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["evenements", "moi"],
    queryFn: recupererMesEvenements,
  });
  const evenement = data?.find((e) => e.id === id);

  const [valeurs, setValeurs] = useState<ValeursFormulaireEvenement>(valeursVides());
  const [initialise, setInitialise] = useState(false);
  const [erreurs, setErreurs] = useState<ErreursFormulaireEvenement>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | undefined>();

  // Pre-remplit une seule fois, quand l'evenement arrive — pas a chaque
  // invalidation de ["evenements", "moi"], sinon les saisies en cours de
  // l'utilisateur seraient ecrasees par le refetch declenche a la fin.
  useEffect(() => {
    if (evenement && !initialise) {
      setValeurs(valeursDepuisEvenement(evenement));
      setInitialise(true);
    }
  }, [evenement, initialise]);

  const mutation = useMutation({
    mutationFn: (donnees: Parameters<typeof modifierEvenement>[1]) =>
      modifierEvenement(id, donnees),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evenements", "moi"] });
      revenirOuAller("/mes-evenements");
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

  if (isPending || !initialise) {
    return (
      <View className="flex-1 gap-4 bg-surface p-6">
        <Squelette hauteur={14} largeur="30%" />
        <Squelette hauteur={48} />
        <Squelette hauteur={14} largeur="30%" />
        <Squelette hauteur={48} />
        <Squelette hauteur={14} largeur="30%" />
        <Squelette hauteur={96} />
      </View>
    );
  }

  if (isError || !evenement) {
    return (
      <View className="flex-1 bg-surface">
        <EtatErreur
          texte={isError ? "Impossible de charger cet événement." : "Événement introuvable."}
          onReessayer={isError ? () => refetch() : undefined}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="p-6">
      <FormulaireEvenement valeurs={valeurs} onChange={setValeurs} erreurs={erreurs} />

      {erreurGenerale ? (
        <Text className="mb-4 text-sm text-red-600">{erreurGenerale}</Text>
      ) : null}

      <Bouton onPress={soumettre} chargement={mutation.isPending}>
        Enregistrer les modifications
      </Bouton>
    </ScrollView>
  );
}
