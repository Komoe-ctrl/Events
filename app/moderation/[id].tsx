import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { ChampTexte } from "@/components/ChampTexte";
import { modererEvenement, recupererEvenementsAModerer } from "@/features/events/api";
import { ErreurApi, ErreurReseau } from "@/lib/apiClient";
import { formaterDateEvenement } from "@/lib/date";
import { revenirOuAller } from "@/lib/navigation";

const LIBELLES_CATEGORIE: Record<string, string> = {
  CONCERT: "Concert",
  SOIREE: "Soirée",
  CONFERENCE: "Conférence",
  SPORT: "Sport",
  CULTURE: "Culture",
  RELIGIEUX: "Religieux",
};

export default function DetailModeration() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [motifRefus, setMotifRefus] = useState("");
  const [erreur, setErreur] = useState<string | undefined>();

  // Pas de GET /evenements/:id/moderation dedie : la file complete
  // (GET /admin/evenements) donne deja l'evenement en entier, et la fiche
  // publique ne renvoie jamais un EN_ATTENTE (trouverPublicParId filtre sur
  // PUBLIE). Meme repli que modifier-evenement/[id].tsx.
  const { data, isPending, isError, error: erreurChargement } = useQuery({
    queryKey: ["evenements", "moderation"],
    queryFn: recupererEvenementsAModerer,
  });
  const evenement = data?.find((e) => e.id === id);

  const mutation = useMutation({
    mutationFn: (donnees: { statut: "PUBLIE" | "REFUSE"; motifRefus?: string }) =>
      modererEvenement(id, donnees),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evenements", "moderation"] });
      queryClient.invalidateQueries({ queryKey: ["evenement", id] });
      revenirOuAller("/moderation");
    },
    onError: (e) => {
      setErreur(
        e instanceof ErreurApi || e instanceof ErreurReseau
          ? e.message
          : "Une erreur inattendue est survenue.",
      );
    },
  });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#D85314" />
      </View>
    );
  }

  if (isError || !evenement) {
    // Meme logique que la liste : le masquage dans Profil n'est qu'une
    // commodite d'UI, la vraie protection est le 403 ACCES_REFUSE du
    // serveur — un non-admin qui atteint cette URL directement doit lire
    // un refus explicite, pas un message qui laisse croire a une panne.
    const accesRefuse = erreurChargement instanceof ErreurApi && erreurChargement.code === "ACCES_REFUSE";
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <Text className="text-center text-ink-muted">
          {accesRefuse
            ? "Cet écran est réservé aux administrateurs."
            : isError
              ? "Impossible de charger cet événement."
              : "Événement introuvable ou déjà modéré."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface">
      <Image
        source={evenement.image}
        style={{ width: "100%", height: 220 }}
        contentFit="cover"
      />
      <View className="p-5">
        <Text className="text-xs font-medium uppercase text-ink-faint">
          {LIBELLES_CATEGORIE[evenement.categorie] ?? evenement.categorie}
        </Text>
        <Text className="mt-1 text-xl font-medium text-ink">{evenement.titre}</Text>
        <Text className="mt-2 text-sm text-ink-muted">
          {formaterDateEvenement(evenement.dateDebut)}
          {evenement.dateFin ? ` → ${formaterDateEvenement(evenement.dateFin)}` : ""}
        </Text>
        <Text className="mt-1 text-sm text-ink-muted">
          {evenement.adresse}, {evenement.commune}
        </Text>

        <View className="mt-4 flex-row gap-4">
          <Text className="text-sm text-ink">
            {evenement.prix === null ? "Gratuit" : `${evenement.prix.toLocaleString("fr-FR")} FCFA`}
          </Text>
          <Text className="text-sm text-ink">
            {evenement.capacite === null ? "Capacité illimitée" : `${evenement.capacite} places`}
          </Text>
        </View>

        <Text className="mt-5 text-base leading-6 text-ink">{evenement.description}</Text>

        <View className="mt-6 rounded-xl border border-line bg-surface-sunken p-4">
          <Text className="text-xs font-medium uppercase text-ink-faint">Contact organisateur</Text>
          <Text className="mt-1 text-sm text-ink">{evenement.contactOrganisateur}</Text>
        </View>

        <Text className="mt-4 text-xs text-ink-faint">
          Soumis le {formaterDateEvenement(evenement.createdAt)}
        </Text>

        <Pressable
          onPress={() => {
            setErreur(undefined);
            mutation.mutate({ statut: "PUBLIE" });
          }}
          disabled={mutation.isPending}
          className="mt-8 items-center rounded-xl bg-brand-600 py-3 active:opacity-80 disabled:opacity-50"
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-medium text-white">Approuver</Text>
          )}
        </Pressable>

        <View className="mt-6">
          <ChampTexte
            label="Motif du refus"
            value={motifRefus}
            onChangeText={setMotifRefus}
            multiline
            numberOfLines={3}
            placeholder="Pourquoi cet événement n'est pas publié…"
          />
          <Pressable
            onPress={() => {
              setErreur(undefined);
              mutation.mutate({ statut: "REFUSE", motifRefus: motifRefus.trim() });
            }}
            disabled={mutation.isPending || motifRefus.trim().length === 0}
            className="items-center rounded-xl border border-red-300 py-3 active:opacity-70 disabled:opacity-40"
          >
            <Text className="text-base font-medium text-red-700">Refuser</Text>
          </Pressable>
        </View>

        {erreur ? <Text className="mt-4 text-sm text-red-600">{erreur}</Text> : null}
      </View>
    </ScrollView>
  );
}
