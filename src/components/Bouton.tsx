import { ActivityIndicator, Pressable, Text } from "react-native";

export type VarianteBouton = "primaire" | "secondaire" | "discret" | "danger";
export type TailleBouton = "normal" | "petit";

type Props = {
  variante?: VarianteBouton;
  taille?: TailleBouton;
  chargement?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: string;
  className?: string;
};

// Chaque variante encode sa propre opacite de pression (regle constatee dans
// le code existant, pas inventee) : les fonds pleins (primaire/danger)
// s'assombrissent moins (80%) qu'un bouton borde/texte seul (secondaire/
// discret, 70%) — un fond deja fortement colore rendrait un saut a 70%
// plus brutal visuellement qu'un simple contour.
const CLASSES_VARIANTE: Record<VarianteBouton, string> = {
  primaire: "bg-brand-500 active:opacity-80",
  secondaire: "border border-line active:opacity-70",
  discret: "active:opacity-70",
  danger: "bg-red-600 active:opacity-80",
};

const CLASSES_TEXTE_VARIANTE: Record<VarianteBouton, string> = {
  primaire: "text-ink", // pas text-white : blanc sur brand-500 ne tient que ~2.85:1 (mesure)
  secondaire: "text-ink",
  discret: "text-ink-muted",
  danger: "text-white",
};

const COULEUR_INDICATEUR_VARIANTE: Record<VarianteBouton, string> = {
  primaire: "#1A1410",
  secondaire: "#1A1410",
  discret: "#5C5248",
  danger: "#FFFFFF",
};

// Hauteur fixe par taille : le passage texte -> ActivityIndicator pendant
// le chargement ne doit jamais faire bouger la taille du bouton. petit
// reste au-dessus du minimum de zone tactile (44pt) malgre son padding
// plus serre.
const CLASSES_TAILLE: Record<TailleBouton, string> = {
  normal: "min-h-[48px] rounded-card px-6 py-3",
  petit: "min-h-[44px] rounded-chip px-4 py-2",
};

const CLASSES_TEXTE_TAILLE: Record<TailleBouton, string> = {
  normal: "text-base font-medium",
  petit: "text-sm font-medium",
};

export function Bouton({
  variante = "primaire",
  taille = "normal",
  chargement = false,
  disabled = false,
  onPress,
  children,
  className = "",
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || chargement}
      className={`items-center justify-center disabled:opacity-50 ${CLASSES_VARIANTE[variante]} ${CLASSES_TAILLE[taille]} ${className}`}
    >
      {chargement ? (
        <ActivityIndicator color={COULEUR_INDICATEUR_VARIANTE[variante]} />
      ) : (
        <Text className={`${CLASSES_TEXTE_VARIANTE[variante]} ${CLASSES_TEXTE_TAILLE[taille]}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
