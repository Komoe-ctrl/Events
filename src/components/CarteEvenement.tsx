import { Link } from "expo-router";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { formaterDateEvenement } from "@/lib/date";
import { formaterDistance } from "@/lib/distance";
import type { Evenement } from "@/types/event";

export function CarteEvenement({ evenement }: { evenement: Evenement }) {
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
            {formaterDateEvenement(evenement.dateDebut)}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm text-ink-faint">
              {evenement.commune}
              {evenement.distanceKm !== undefined
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
