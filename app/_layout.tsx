import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { definirLecteurJeton } from "@/lib/apiClient";
import { lireJeton } from "@/lib/authStorage";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/features/auth/AuthContext";

definirLecteurJeton(lireJeton);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShadowVisible: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="evenement/[id]"
              options={{ title: "", headerBackTitle: "Retour" }}
            />
            <Stack.Screen
              name="connexion"
              options={{ presentation: "modal", title: "Connexion" }}
            />
            <Stack.Screen
              name="inscription"
              options={{ presentation: "modal", title: "Créer un compte" }}
            />
            <Stack.Screen
              name="mes-reservations"
              options={{ title: "Mes réservations", headerBackTitle: "Retour" }}
            />
            <Stack.Screen
              name="mes-evenements"
              options={{ title: "Mes événements", headerBackTitle: "Retour" }}
            />
            <Stack.Screen
              name="moderation"
              options={{ title: "Modération", headerBackTitle: "Retour" }}
            />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
