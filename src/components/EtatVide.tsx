import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Bouton } from "@/components/Bouton";

type Props = {
  icone: keyof typeof Ionicons.glyphMap;
  titre?: string;
  texte: string;
  action?: { libelle: string; onPress: () => void };
  couleurIcone?: string;
};

/** Centre son contenu dans l'espace disponible — ne force pas flex-1 : un
 * ecran peut l'inserer dans une zone partielle (ex. inscrits.tsx, qui garde
 * son resume de capacite et son bouton visibles au-dessus de l'etat vide). */
export function EtatVide({
  icone,
  titre,
  texte,
  action,
  couleurIcone = "#6B6560", // ink.faint
}: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name={icone} size={40} color={couleurIcone} />
      {titre ? (
        <Text className="mt-4 text-center text-lg font-medium text-ink">{titre}</Text>
      ) : null}
      <Text className={`text-center text-ink-muted ${titre ? "mt-2 text-sm" : ""}`}>
        {texte}
      </Text>
      {action ? (
        <Bouton variante="primaire" onPress={action.onPress} className="mt-6">
          {action.libelle}
        </Bouton>
      ) : null}
    </View>
  );
}
