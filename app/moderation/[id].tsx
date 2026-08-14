import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { recupererEvenementsAModerer } from "@/features/events/api";
import { formaterDateEvenement } from "@/lib/date";

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

  // Pas de GET /evenements/:id/moderation dedie : la file complete
  // (GET /admin/evenements) donne deja l'evenement en entier, et la fiche
  // publique ne renvoie jamais un EN_ATTENTE (trouverPublicParId filtre sur
  // PUBLIE). Meme repli que modifier-evenement/[id].tsx.
  const { data, isPending, isError } = useQuery({
    queryKey: ["evenements", "moderation"],
    queryFn: recupererEvenementsAModerer,
  });
  const evenement = data?.find((e) => e.id === id);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#D85314" />
      </View>
    );
  }

  if (isError || !evenement) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <Text className="text-center text-ink-muted">
          {isError
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
      </View>
    </ScrollView>
  );
}
