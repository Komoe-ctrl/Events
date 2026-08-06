import { Text, View } from "react-native";

export default function Carte() {
  return (
    <View className="flex-1 items-center justify-center bg-surface-sunken px-8">
      <Text className="text-center text-ink-muted">
        La carte arrive ici (react-native-maps est déjà installé).
      </Text>
    </View>
  );
}
