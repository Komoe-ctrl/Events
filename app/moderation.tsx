import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";
import { recupererEvenementsAModerer } from "@/features/events/api";
import { ErreurApi } from "@/lib/apiClient";
import { formaterDateEvenement } from "@/lib/date";
import type { Evenement } from "@/types/event";

export default function Moderation() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["evenements", "moderation"],
    queryFn: recupererEvenementsAModerer,
  });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken">
        <ActivityIndicator color="#D85314" />
      </View>
    );
  }

  if (isError) {
    // Le masquage de l'entree "Moderation" dans Profil (role !== ADMIN) n'est
    // qu'une commodite d'UI, pas une protection — un PARTICIPANT qui
    // atteindrait quand meme cette URL directement doit voir un refus
    // propre et explicite, pas un message qui laisse croire a un probleme
    // reseau. RolesGuard rejette avec ACCES_REFUSE (403) cote serveur.
    const accesRefuse = error instanceof ErreurApi && error.code === "ACCES_REFUSE";
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken px-8">
        <Text className="text-center text-ink-muted">
          {accesRefuse
            ? "Cet écran est réservé aux administrateurs."
            : "Impossible de charger la file de modération. Vérifie ta connexion."}
        </Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken px-8">
        <Text className="text-center text-ink-muted">
          Aucun événement en attente de modération.
        </Text>
      </View>
    );
  }

  // Plus ancien d'abord : un organisateur qui attend depuis trois jours
  // passe avant celui d'il y a une heure. GET /admin/evenements les renvoie
  // deja tries ainsi (AdminService.fileDeModeration : orderBy createdAt asc)
  // — tri repete ici pour ne pas dependre silencieusement d'un ordre serveur
  // non garanti par le type de retour.
  const evenements = [...data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <FlatList
      className="bg-surface-sunken"
      contentContainerClassName="px-4 pt-4 pb-8"
      data={evenements}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <Text className="mb-3 text-sm font-medium text-ink-muted">
          {evenements.length} événement{evenements.length > 1 ? "s" : ""} en attente
        </Text>
      }
      renderItem={({ item }) => <CarteAModerer evenement={item} />}
    />
  );
}

function CarteAModerer({ evenement }: { evenement: Evenement }) {
  return (
    <Link href={`/moderation/${evenement.id}`} asChild>
      <Pressable className="mb-3 overflow-hidden rounded-xl border border-line bg-surface active:opacity-80">
        <Image source={{ uri: evenement.image }} style={{ width: "100%", height: 120 }} />
        <View className="p-4">
          <Text className="text-base font-medium text-ink" numberOfLines={2}>
            {evenement.titre}
          </Text>
          <Text className="mt-1 text-sm text-ink-muted">
            {formaterDateEvenement(evenement.dateDebut)} · {evenement.commune}
          </Text>
          <Text className="mt-1 text-xs text-ink-faint">
            Soumis le {formaterDateEvenement(evenement.createdAt)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
