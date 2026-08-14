import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { recupererMesEvenements } from "@/features/events/api";
import { formaterDateEvenement } from "@/lib/date";
import type { Evenement, StatutEvenement } from "@/types/event";

export default function MesEvenements() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["evenements", "moi"],
    queryFn: recupererMesEvenements,
  });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken">
        <ActivityIndicator color="#FF6B00" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken px-8">
        <Text className="text-center text-ink-muted">
          Impossible de charger tes événements. Vérifie ta connexion.
        </Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken px-8">
        <Text className="text-center text-ink-muted">
          Tes événements publiés apparaîtront ici.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="bg-surface-sunken"
      contentContainerClassName="px-4 pt-4 pb-8"
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <CarteEvenementOrganisateur evenement={item} />}
    />
  );
}

function CarteEvenementOrganisateur({ evenement }: { evenement: Evenement }) {
  const modifiable = evenement.statut === "BROUILLON" || evenement.statut === "EN_ATTENTE";

  const contenu = (
    <View className="mb-3 rounded-card bg-surface p-4">
      <Text className="text-base font-medium text-ink" numberOfLines={2}>
        {evenement.titre}
      </Text>
      <Text className="mt-1 text-sm text-ink-muted">
        {formaterDateEvenement(evenement.dateDebut)} · {evenement.commune}
      </Text>
      <View className="mt-2 flex-row items-center justify-between">
        <BadgeStatut statut={evenement.statut} />
        {/* Affordance de ligne, pas l'action primaire de l'ecran (celle-ci
            est "Publier un evenement", dans Profil) : encre attenuee plutot
            qu'orange repete sur chaque ligne de liste. */}
        {modifiable ? (
          <Text className="text-sm font-medium text-ink-muted">Modifier</Text>
        ) : evenement.statut === "PUBLIE" ? (
          <Text className="text-sm font-medium text-ink-muted">Voir les inscrits</Text>
        ) : null}
      </View>
      {evenement.statut === "REFUSE" && evenement.motifRefus ? (
        <Text className="mt-2 text-sm text-red-600">Motif : {evenement.motifRefus}</Text>
      ) : null}
    </View>
  );

  if (modifiable) {
    return (
      <Link href={`/modifier-evenement/${evenement.id}`} asChild>
        <Pressable className="active:opacity-70">{contenu}</Pressable>
      </Link>
    );
  }

  if (evenement.statut === "PUBLIE") {
    return (
      <Link href={`/evenement/${evenement.id}/inscrits`} asChild>
        <Pressable className="active:opacity-70">{contenu}</Pressable>
      </Link>
    );
  }

  return contenu;
}

function BadgeStatut({ statut }: { statut: StatutEvenement }) {
  const styles: Record<StatutEvenement, { classe: string; libelle: string }> = {
    BROUILLON: { classe: "bg-surface-sunken text-ink-faint", libelle: "Brouillon" },
    // Palette semantique distincte de l'accent : chaque statut a sa propre
    // famille de couleur, aucune ne recycle l'orange (regle de discipline
    // couleur).
    EN_ATTENTE: { classe: "bg-amber-50 text-amber-700", libelle: "En attente de modération" },
    PUBLIE: { classe: "bg-green-50 text-green-700", libelle: "Publié" },
    REFUSE: { classe: "bg-red-50 text-red-700", libelle: "Refusé" },
  };
  const { classe, libelle } = styles[statut];
  return (
    <Text className={`overflow-hidden rounded-full px-2 py-1 text-xs font-medium ${classe}`}>
      {libelle}
    </Text>
  );
}
