import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { recupererEvenement } from "@/features/events/api";
import { ErreurApi } from "@/lib/apiClient";

export default function FicheEvenement() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, error } = useQuery({
    queryKey: ["evenement", id],
    queryFn: () => recupererEvenement(id),
    enabled: Boolean(id),
  });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#D85314" />
      </View>
    );
  }

  if (error) {
    const introuvable = error instanceof ErreurApi && error.statutHttp === 404;
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <Text className="text-center text-ink-muted">
          {introuvable
            ? "Événement introuvable."
            : "Impossible de charger cet événement. Vérifie ta connexion."}
        </Text>
      </View>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-surface">
      <Image
        source={data.image}
        style={{ width: "100%", height: 220 }}
        contentFit="cover"
      />
      <View className="p-5">
        <Text className="text-xl font-medium text-ink">{data.titre}</Text>
        <Text className="mt-2 text-sm text-ink-muted">
          {data.adresse} · {data.commune}
        </Text>
        <Text className="mt-4 text-base leading-6 text-ink">{data.description}</Text>
      </View>
    </ScrollView>
  );
}
