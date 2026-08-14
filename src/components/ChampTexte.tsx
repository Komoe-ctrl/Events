import { Text, TextInput, View, type TextInputProps } from "react-native";

type Props = TextInputProps & {
  label: string;
  erreur?: string;
};

export function ChampTexte({ label, erreur, ...proprietesInput }: Props) {
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
      {erreur ? <Text className="mt-1 text-sm text-red-600">{erreur}</Text> : null}
    </View>
  );
}
