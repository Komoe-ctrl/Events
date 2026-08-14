import { useQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { BadgeStatutReservation } from "@/components/BadgeStatutReservation";
import { recupererEvenement } from "@/features/events/api";
import { recupererInscrits } from "@/features/reservations/api";
import type { ReservationOrganisateur } from "@/types/reservation";

function BoutonValiderBillet({ evenementId }: { evenementId: string }) {
  return (
    <Link href={`/evenement/${evenementId}/scanner`} asChild>
      <Pressable className="mb-4 items-center rounded-xl bg-brand-600 py-3 active:opacity-80">
        <Text className="text-base font-medium text-white">Valider un billet</Text>
      </Pressable>
    </Link>
  );
}

function ResumeCapacite({
  placesPrises,
  capacite,
}: {
  placesPrises: number;
  capacite: number | null;
}) {
  return (
    <View className="mb-4 rounded-xl border border-line bg-surface p-4">
      <Text className="text-base font-medium text-ink">
        {capacite === null
          ? `${placesPrises} place${placesPrises > 1 ? "s" : ""} réservée${placesPrises > 1 ? "s" : ""}`
          : `${placesPrises} / ${capacite} places`}
      </Text>
    </View>
  );
}

export default function Inscrits() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isPending, isError } = useQuery({
    queryKey: ["evenements", id, "inscrits"],
    queryFn: () => recupererInscrits(id),
    enabled: Boolean(id),
  });

  // Evenement PUBLIE garanti (seul statut qui mene a cet ecran depuis Mes
  // evenements) : l'endpoint public suffit pour recuperer sa capacite.
  const { data: evenement } = useQuery({
    queryKey: ["evenement", id],
    queryFn: () => recupererEvenement(id),
    enabled: Boolean(id),
  });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken">
        <ActivityIndicator color="#D85314" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken px-8">
        <Text className="text-center text-ink-muted">
          Impossible de charger les inscrits. Vérifie ta connexion.
        </Text>
      </View>
    );
  }

  // ANNULEE ne compte pas dans les places prises — coherent avec le calcul
  // serveur de placesRestantes (CONFIRMEE + UTILISEE uniquement).
  const placesPrises = data
    .filter((r) => r.statut !== "ANNULEE")
    .reduce((somme, r) => somme + r.nombrePlaces, 0);

  if (data.length === 0) {
    return (
      <View className="flex-1 bg-surface-sunken px-4 pt-4">
        {evenement ? (
          <ResumeCapacite placesPrises={placesPrises} capacite={evenement.capacite} />
        ) : null}
        <BoutonValiderBillet evenementId={id} />
        <View className="flex-1 items-center justify-center px-4 pb-16">
          <Text className="text-center text-ink-muted">
            Aucune réservation pour le moment.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      className="bg-surface-sunken"
      contentContainerClassName="px-4 pt-4 pb-8"
      data={data}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          {evenement ? (
            <ResumeCapacite placesPrises={placesPrises} capacite={evenement.capacite} />
          ) : null}
          <BoutonValiderBillet evenementId={id} />
        </>
      }
      renderItem={({ item }) => <LigneInscrit reservation={item} />}
    />
  );
}

function LigneInscrit({ reservation }: { reservation: ReservationOrganisateur }) {
  return (
    <View className="mb-3 rounded-xl border border-line bg-surface p-4">
      <Text className="text-base font-medium text-ink">{reservation.utilisateur.nom}</Text>
      <Text className="mt-1 text-sm text-ink-muted">{reservation.utilisateur.telephone}</Text>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-ink-faint">
          {reservation.nombrePlaces} place{reservation.nombrePlaces > 1 ? "s" : ""}
        </Text>
        <BadgeStatutReservation statut={reservation.statut} />
      </View>
    </View>
  );
}
