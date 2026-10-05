import { Link } from "expo-router";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { formaterDateEvenement } from "@/lib/date";
import { formaterDistance } from "@/lib/distance";
import type { Evenement } from "@/types/event";

const LIBELLES_CATEGORIE: Record<string, string> = {
  CONCERT: "Concert",
  SOIREE: "Soirée",
  CONFERENCE: "Conférence",
  SPORT: "Sport",
  CULTURE: "Culture",
  RELIGIEUX: "Religieux",
};

type Props = {
  evenement: Evenement;
  // "moderation" : ancien CarteAModerer (app/moderation.tsx), fusionne ici
  // pour ne garder qu'une seule implementation du "carte -> fiche
  // evenement". Visuel non retouche au passage (rounded-xl, pas rounded-card
  // : la moderation n'a pas encore recu la passe de design, voir
  // tailwind.config.js) — seule la duplication de code disparait.
  variante?: "defaut" | "moderation";
};

export function CarteEvenement({ evenement, variante = "defaut" }: Props) {
  if (variante === "moderation") {
    return (
      <Link href={`/moderation/${evenement.id}`} asChild>
        <Pressable className="mb-3 overflow-hidden rounded-xl border border-line bg-surface active:opacity-80">
          <Image
            source={evenement.image}
            style={{ width: "100%", height: 120 }}
            contentFit="cover"
            transition={200}
          />
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

  return (
    <Link href={`/evenement/${evenement.id}`} asChild>
      <Pressable className="mb-3 overflow-hidden rounded-card bg-ink active:opacity-90">
        <View className="relative">
          <Image
            source={evenement.image}
            style={{ width: "100%", height: 180 }}
            contentFit="cover"
            transition={200}
          />
          {/* Chips en aplat, pas de degrade : la photo doit rester lisible
              telle quelle, l'etiquette porte sa propre couleur comme un
              autocollant plutot que de deteindre sur l'image. */}
          <View className="absolute inset-x-0 top-0 flex-row items-start justify-between p-3">
            {/* Etiquette de genre, pas une action ni un statut : reste en
                aplat noir plutot qu'orange, pour que l'orange ne signifie
                plus qu'une seule chose dans l'app (regle de discipline
                couleur). */}
            <Text className="overflow-hidden rounded-chip bg-ink px-2 py-1 text-label font-bold uppercase text-white">
              {LIBELLES_CATEGORIE[evenement.categorie] ?? evenement.categorie}
            </Text>
            <Text className="overflow-hidden rounded-chip bg-accent px-2 py-1 text-label font-bold uppercase text-accent-ink">
              {evenement.prix === null
                ? "Gratuit"
                : `${evenement.prix.toLocaleString("fr-FR")} FCFA`}
            </Text>
          </View>
        </View>
        <View className="px-3 py-3">
          <Text
            className="font-display text-display leading-[26px] text-white"
            numberOfLines={2}
          >
            {evenement.titre}
          </Text>
          <Text className="mt-1 text-sm text-white/70">
            {formaterDateEvenement(evenement.dateDebut)} · {evenement.commune}
            {evenement.distanceKm !== undefined
              ? ` · ${formaterDistance(evenement.distanceKm)}`
              : ""}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
