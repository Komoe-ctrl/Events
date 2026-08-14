import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, SectionList, Text, View } from "react-native";
import { BadgeStatutReservation } from "@/components/BadgeStatutReservation";
import { recupererMesReservations } from "@/features/reservations/api";
import { formaterDateEvenement } from "@/lib/date";
import type { Reservation } from "@/types/reservation";

export default function MesReservations() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["reservations", "moi"],
    queryFn: recupererMesReservations,
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
          Impossible de charger tes réservations. Vérifie ta connexion.
        </Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken px-8">
        <Text className="text-center text-ink-muted">
          Tes réservations apparaîtront ici.
        </Text>
      </View>
    );
  }

  const maintenant = Date.now();
  const dateDe = (r: Reservation) =>
    r.evenement ? new Date(r.evenement.dateDebut).getTime() : 0;

  const aVenir = data
    .filter((r) => dateDe(r) >= maintenant)
    .sort((a, b) => dateDe(a) - dateDe(b));
  const passees = data
    .filter((r) => dateDe(r) < maintenant)
    .sort((a, b) => dateDe(b) - dateDe(a));

  const sections = [
    ...(aVenir.length > 0 ? [{ title: "À venir", data: aVenir }] : []),
    ...(passees.length > 0 ? [{ title: "Passées", data: passees }] : []),
  ];

  return (
    <SectionList
      className="bg-surface-sunken"
      contentContainerClassName="px-4 pt-4 pb-8"
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <Text className="mb-2 mt-4 text-sm font-medium uppercase text-ink-faint">
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => <CarteReservation reservation={item} />}
    />
  );
}

function CarteReservation({ reservation }: { reservation: Reservation }) {
  return (
    <Link href={`/reservation/${reservation.id}`} asChild>
      <Pressable className="mb-3 rounded-card bg-surface p-4 active:opacity-70">
        <Text className="text-base font-medium text-ink" numberOfLines={2}>
          {reservation.evenement?.titre ?? "Événement"}
        </Text>
        {reservation.evenement ? (
          <Text className="mt-1 text-sm text-ink-muted">
            {formaterDateEvenement(reservation.evenement.dateDebut)} ·{" "}
            {reservation.evenement.commune}
          </Text>
        ) : null}
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-xs text-ink-faint">
            {reservation.nombrePlaces} place{reservation.nombrePlaces > 1 ? "s" : ""}
          </Text>
          <BadgeStatutReservation statut={reservation.statut} />
        </View>
      </Pressable>
    </Link>
  );
}
