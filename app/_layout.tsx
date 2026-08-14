import "../global.css";

import { Anton_400Regular, useFonts } from "@expo-google-fonts/anton";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { definirLecteurJeton } from "@/lib/apiClient";
import { lireJeton } from "@/lib/authStorage";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/features/auth/AuthContext";

definirLecteurJeton(lireJeton);

// Ecran natif tenu ouvert le temps du chargement d'Anton (police des
// titres) : sans ca, un premier rendu avec la police systeme apparaitrait
// une fraction de seconde avant de basculer sur Anton, visible au demarrage
// a froid.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [policesChargees, erreurPolices] = useFonts({ Anton_400Regular });

  useEffect(() => {
    if (policesChargees || erreurPolices) {
      SplashScreen.hideAsync();
    }
  }, [policesChargees, erreurPolices]);

  if (!policesChargees && !erreurPolices) {
    return null;
  }

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
              name="reservation/[id]"
              options={{ title: "", headerBackTitle: "Retour" }}
            />
            <Stack.Screen
              name="mes-evenements"
              options={{ title: "Mes événements", headerBackTitle: "Retour" }}
            />
            <Stack.Screen
              name="publier"
              options={{ title: "Publier un événement", headerBackTitle: "Retour" }}
            />
            <Stack.Screen
              name="modifier-evenement/[id]"
              options={{ title: "Modifier l'événement", headerBackTitle: "Retour" }}
            />
            <Stack.Screen
              name="evenement/[id]/inscrits"
              options={{ title: "Inscrits", headerBackTitle: "Retour" }}
            />
            <Stack.Screen
              name="evenement/[id]/scanner"
              options={{ title: "Valider un billet", headerBackTitle: "Retour" }}
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
