import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Bouton } from "@/components/Bouton";

type Props = {
  texte: string;
  onReessayer?: () => void;
};

/** Meme logique de mise en page qu'EtatVide (centre dans l'espace
 * disponible, ne force pas flex-1), mais une icone et un bouton "Reessayer"
 * fixes : une erreur de chargement n'a qu'une seule forme dans l'app. */
export function EtatErreur({ texte, onReessayer }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name="cloud-offline-outline" size={40} color="#6B6560" />
      <Text className="mt-4 text-center text-ink-muted">{texte}</Text>
      {onReessayer ? (
        <Bouton variante="secondaire" taille="petit" onPress={onReessayer} className="mt-4">
          Réessayer
        </Bouton>
      ) : null}
    </View>
  );
}
