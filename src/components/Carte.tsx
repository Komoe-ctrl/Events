import type { ReactNode } from "react";
import { View } from "react-native";
import { Pressable } from "@/components/Pressable";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
};

/** Conteneur de liste standard : p-4 est le padding de carte canonique
 * (CLAUDE.md, systeme de design). Avec onPress, devient tactile (retour
 * d'opacite coherent via le Pressable partage) ; sans, reste un simple
 * conteneur pour du contenu non cliquable (ex. resume de capacite). */
export function Carte({ children, onPress, className = "" }: Props) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`mb-3 rounded-card bg-surface p-4 ${className}`}>
        {children}
      </Pressable>
    );
  }
  return <View className={`mb-3 rounded-card bg-surface p-4 ${className}`}>{children}</View>;
}
