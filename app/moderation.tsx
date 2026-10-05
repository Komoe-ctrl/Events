import { useQuery } from "@tanstack/react-query";
import { FlatList, Text, View } from "react-native";
import { CarteEvenement } from "@/components/CarteEvenement";
import { EtatErreur } from "@/components/EtatErreur";
import { EtatVide } from "@/components/EtatVide";
import { SqueletteCarteModeration } from "@/components/Squelette";
import { recupererEvenementsAModerer } from "@/features/events/api";
import { ErreurApi } from "@/lib/apiClient";

export default function Moderation() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["evenements", "moderation"],
    queryFn: recupererEvenementsAModerer,
  });

  if (isPending) {
    return (
      <View className="flex-1 bg-surface-sunken px-4 pt-4">
        {[1, 2, 3].map((n) => (
          <SqueletteCarteModeration key={n} />
        ))}
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
      <View className="flex-1 bg-surface-sunken">
        <EtatErreur
          texte={
            accesRefuse
              ? "Cet écran est réservé aux administrateurs."
              : "Impossible de charger la file de modération. Vérifie ta connexion."
          }
          // Pas de "Reessayer" sur un refus d'acces : retenter ne changera
          // pas le role de l'utilisateur connecte.
          onReessayer={accesRefuse ? undefined : () => refetch()}
        />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="flex-1 bg-surface-sunken">
        <EtatVide
          icone="shield-checkmark-outline"
          texte="Aucun événement en attente de modération."
        />
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
      renderItem={({ item }) => <CarteEvenement evenement={item} variante="moderation" />}
    />
  );
}
