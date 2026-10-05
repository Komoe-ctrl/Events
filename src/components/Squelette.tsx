import { View } from "react-native";

type Props = {
  largeur?: number | `${number}%`;
  hauteur: number;
  arrondi?: "card" | "chip" | "full";
  className?: string;
};

const CLASSES_ARRONDI: Record<NonNullable<Props["arrondi"]>, string> = {
  card: "rounded-card",
  chip: "rounded-chip",
  full: "rounded-full",
};

/** Bloc de base : un rectangle plat, sans animation (voir CLAUDE.md —
 * l'etape fluidite du lot pourra ajouter un effet de pulsation, pas une
 * priorite ici). Compose les formes ci-dessous plutot que de l'utiliser nu
 * dans un ecran. */
export function Squelette({ largeur = "100%", hauteur, arrondi = "card", className = "" }: Props) {
  return (
    <View
      className={`bg-surface-sunken ${CLASSES_ARRONDI[arrondi]} ${className}`}
      style={{ width: largeur, height: hauteur }}
    />
  );
}

/** Meme forme que CarteEvenement : image 180px + deux lignes de texte.
 * Utilise aussi pour la file de moderation depuis la fusion CarteAModerer. */
export function SqueletteCarteEvenement() {
  return (
    <View className="mb-3 overflow-hidden rounded-card bg-surface">
      <Squelette hauteur={180} arrondi="card" className="rounded-b-none" />
      <View className="gap-2 px-3 py-3">
        <Squelette hauteur={20} largeur="70%" />
        <Squelette hauteur={14} largeur="45%" />
      </View>
    </View>
  );
}

/** Meme forme que la variante "moderation" de CarteEvenement : image 120px
 * + trois lignes de texte, carte claire a bordure. */
export function SqueletteCarteModeration() {
  return (
    <View className="mb-3 overflow-hidden rounded-xl border border-line bg-surface">
      <Squelette hauteur={120} arrondi="card" className="rounded-none" />
      <View className="gap-2 p-4">
        <Squelette hauteur={18} largeur="65%" />
        <Squelette hauteur={14} largeur="45%" />
        <Squelette hauteur={12} largeur="35%" />
      </View>
    </View>
  );
}

/** Meme forme qu'une ligne de liste standard (CarteReservation,
 * CarteEvenementOrganisateur, LigneInscrit) : carte p-4 avec titre + une
 * ligne secondaire + une ligne de pied. */
export function SqueletteLigne() {
  return (
    <View className="mb-3 gap-2 rounded-card bg-surface p-4">
      <Squelette hauteur={18} largeur="60%" />
      <Squelette hauteur={14} largeur="40%" />
      <Squelette hauteur={14} largeur="25%" className="mt-1" />
    </View>
  );
}

/** Meme forme qu'une fiche evenement en detail (evenement/[id].tsx,
 * moderation/[id].tsx) : image pleine largeur + titre + quelques lignes de
 * texte courant. */
export function SqueletteDetailEvenement() {
  return (
    <View>
      <Squelette hauteur={260} arrondi="card" className="rounded-none" />
      <View className="gap-3 p-5">
        <Squelette hauteur={28} largeur="80%" />
        <Squelette hauteur={14} largeur="50%" />
        <Squelette hauteur={14} largeur="90%" className="mt-2" />
        <Squelette hauteur={14} largeur="85%" />
        <Squelette hauteur={14} largeur="60%" />
      </View>
    </View>
  );
}
