import { Text, TextInput, View, type TextInputProps } from "react-native";

type Props = TextInputProps & {
  label: string;
  texteAide?: string;
  erreur?: string;
};

export function ChampTexte({ label, texteAide, erreur, ...proprietesInput }: Props) {
  return (
    <View className="mb-4">
      <Text className="mb-1 text-sm font-medium text-ink">{label}</Text>
      <TextInput
        className={`rounded-xl border px-4 py-3 text-base text-ink ${
          erreur ? "border-red-400" : "border-line"
        }`}
        placeholderTextColor="#6B6560"
        {...proprietesInput}
      />
      {/* Un seul emplacement, toujours de la meme hauteur (min-h) : erreur
          prioritaire sur texteAide, jamais les deux a la fois. Sans ce
          slot fixe, le formulaire saute d'une ligne des qu'une erreur de
          validation apparait ou disparait. */}
      <Text className={`mt-1 min-h-[20px] text-sm ${erreur ? "text-red-600" : "text-ink-faint"}`}>
        {erreur ?? texteAide ?? ""}
      </Text>
    </View>
  );
}
