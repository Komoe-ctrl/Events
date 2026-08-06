import { Link } from "expo-router";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { formaterDistance } from "@/lib/distance";
import type { EvenementAvecDistance } from "@/types/event";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function CarteEvenement({ evenement }: { evenement: EvenementAvecDistance }) {
  return (
    <Link href={`/evenement/${evenement.id}`} asChild>
      <Pressable className="mb-4 overflow-hidden rounded-2xl border border-line bg-surface active:opacity-80">
        <Image
          source={evenement.image}
          style={{ width: "100%", height: 160 }}
          contentFit="cover"
          transition={200}
        />
        <View className="p-4">
          <Text className="text-base font-medium text-ink" numberOfLines={2}>
            {evenement.titre}
          </Text>
          <Text className="mt-1 text-sm text-ink-muted">
            {formatDate(evenement.dateDebut)}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm text-ink-faint">
              {evenement.commune}
              {evenement.distanceKm !== null
                ? ` · ${formaterDistance(evenement.distanceKm)}`
                : ""}
            </Text>
            <Text className="text-sm font-medium text-brand-600">
              {evenement.prix === null
                ? "Gratuit"
                : `${evenement.prix.toLocaleString("fr-FR")} FCFA`}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
