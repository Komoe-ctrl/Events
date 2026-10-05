import { Pressable as PressableRN, type PressableProps } from "react-native";

/**
 * Retour au toucher unique dans toute l'app : opacite immediate a l'appui
 * (classe active:), jamais de mise a l'echelle Reanimated en plus — choix
 * tranche une fois pour toutes (CLAUDE.md, systeme de design) plutot que
 * laisse au cas par cas. A utiliser pour toute surface tactile qui n'est
 * pas un Bouton (qui gere sa propre opacite selon sa variante) : lignes de
 * liste, cartes, menus.
 */
export function Pressable({
  className = "",
  ...proprietes
}: PressableProps & { className?: string }) {
  return <PressableRN className={`active:opacity-70 ${className}`} {...proprietes} />;
}
