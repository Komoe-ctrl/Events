import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Text, View } from "react-native";
import { Carte } from "@/components/Carte";
import { Etiquette, type CouleurEtiquette } from "@/components/Etiquette";
import { EtatErreur } from "@/components/EtatErreur";
import { EtatVide } from "@/components/EtatVide";
import { SqueletteLigne } from "@/components/Squelette";
import { recupererMesEvenements } from "@/features/events/api";
import { formaterDateEvenement } from "@/lib/date";
import type { Evenement, StatutEvenement } from "@/types/event";

export default function MesEvenements() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["evenements", "moi"],
    queryFn: recupererMesEvenements,
  });

  if (isPending) {
    return (
      <View className="flex-1 bg-surface-sunken px-4 pt-4">
        {[1, 2, 3].map((n) => (
          <SqueletteLigne key={n} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-surface-sunken">
        <EtatErreur
          texte="Impossible de charger tes événements. Vérifie ta connexion."
          onReessayer={() => refetch()}
        />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="flex-1 bg-surface-sunken">
        <EtatVide icone="calendar-outline" texte="Tes événements publiés apparaîtront ici." />
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
    <Carte>
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
    </Carte>
  );

  if (modifiable) {
    return (
      <Link href={`/modifier-evenement/${evenement.id}`} asChild>
        {contenu}
      </Link>
    );
  }

  if (evenement.statut === "PUBLIE") {
    return (
      <Link href={`/evenement/${evenement.id}/inscrits`} asChild>
        {contenu}
      </Link>
    );
  }

  return contenu;
}

function BadgeStatut({ statut }: { statut: StatutEvenement }) {
  const styles: Record<StatutEvenement, { couleur: CouleurEtiquette; libelle: string }> = {
    BROUILLON: { couleur: "neutre", libelle: "Brouillon" },
    // Bleu (info) plutot qu'attention (ambre) : trop proche de l'orange
    // brand en teinte, et "en attente" est un etat neutre/informatif, pas
    // un avertissement (regle de discipline couleur).
    EN_ATTENTE: { couleur: "info", libelle: "En attente de modération" },
    PUBLIE: { couleur: "succes", libelle: "Publié" },
    REFUSE: { couleur: "erreur", libelle: "Refusé" },
  };
  const { couleur, libelle } = styles[statut];
  return <Etiquette couleur={couleur} libelle={libelle} />;
}
