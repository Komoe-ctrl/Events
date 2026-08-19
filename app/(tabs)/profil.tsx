import { Ionicons } from "@expo/vector-icons";
import { Link, router, type Href } from "expo-router";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/features/auth/AuthContext";
import { URL_MENTIONS_LEGALES, URL_POLITIQUE_CONFIDENTIALITE } from "@/lib/legal";

export default function Profil() {
  const { etat, deconnexion } = useAuth();

  if (etat.statut === "chargement") {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken">
        <ActivityIndicator color="#B84800" />
      </View>
    );
  }

  if (etat.statut === "deconnecte") {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken px-8">
        <Text className="mb-4 text-center text-ink-muted">
          Connecte-toi pour voir tes réservations et publier des événements.
        </Text>
        <Pressable
          onPress={() => router.push("/connexion")}
          className="rounded-card bg-brand-500 px-6 py-3 active:opacity-80"
        >
          {/* Encre sombre, pas blanc : blanc sur brand-500 ne tient que
              ~2.85:1, sous le seuil 4.5:1 (mesure). */}
          <Text className="text-base font-medium text-ink">Se connecter</Text>
        </Pressable>

        {/* Accessibles sans compte : ni la politique de confidentialite ni
            les mentions legales ne doivent dependre d'une connexion. */}
        <View className="mt-8 items-center gap-2">
          <Pressable onPress={() => Linking.openURL(URL_POLITIQUE_CONFIDENTIALITE)}>
            <Text className="text-sm text-ink-muted underline">
              Politique de confidentialité
            </Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(URL_MENTIONS_LEGALES)}>
            <Text className="text-sm text-ink-muted underline">Mentions légales</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const { utilisateur } = etat;

  return (
    <ScrollView className="flex-1 bg-surface-sunken" contentContainerClassName="p-6">
      <View className="mb-6 rounded-card bg-surface p-5">
        <Text className="text-lg font-medium text-ink">{utilisateur.nom}</Text>
        <Text className="mt-1 text-sm text-ink-muted">{utilisateur.telephone}</Text>
      </View>

      <EntreeMenu titre="Mes réservations" icone="ticket-outline" href="/mes-reservations" />
      {utilisateur.role === "ORGANISATEUR" || utilisateur.role === "ADMIN" ? (
        <>
          <EntreeMenu titre="Mes événements" icone="calendar-outline" href="/mes-evenements" />
          <EntreeMenu titre="Publier un événement" icone="add-circle-outline" href="/publier" />
        </>
      ) : null}
      {utilisateur.role === "ADMIN" ? (
        <EntreeMenu titre="Modération" icone="shield-checkmark-outline" href="/moderation" />
      ) : null}

      <EntreeMenuLien
        titre="Politique de confidentialité"
        icone="document-text-outline"
        url={URL_POLITIQUE_CONFIDENTIALITE}
      />
      <EntreeMenuLien
        titre="Mentions légales"
        icone="information-circle-outline"
        url={URL_MENTIONS_LEGALES}
      />

      <Pressable
        onPress={() => deconnexion()}
        className="mt-6 items-center rounded-card border border-line py-3 active:opacity-70"
      >
        <Text className="text-base font-medium text-ink">Se déconnecter</Text>
      </Pressable>
    </ScrollView>
  );
}

function EntreeMenu({
  titre,
  icone,
  href,
}: {
  titre: string;
  icone: keyof typeof Ionicons.glyphMap;
  href: Href;
}) {
  return (
    <Link href={href} asChild>
      <Pressable className="mb-3 flex-row items-center justify-between rounded-card bg-surface px-4 py-4 active:opacity-70">
        <View className="flex-row items-center gap-3">
          <Ionicons name={icone} size={20} color="#5C5248" />
          <Text className="text-base text-ink">{titre}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#6B6560" />
      </Pressable>
    </Link>
  );
}

// Meme presentation que EntreeMenu, mais ouvre une URL externe (navigateur)
// au lieu de naviguer dans l'app : pas de route interne pour ce contenu,
// il vit sur une page web publique (voir src/lib/legal.ts).
function EntreeMenuLien({
  titre,
  icone,
  url,
}: {
  titre: string;
  icone: keyof typeof Ionicons.glyphMap;
  url: string;
}) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      className="mb-3 flex-row items-center justify-between rounded-card bg-surface px-4 py-4 active:opacity-70"
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icone} size={20} color="#5C5248" />
        <Text className="text-base text-ink">{titre}</Text>
      </View>
      <Ionicons name="open-outline" size={18} color="#948A7E" />
    </Pressable>
  );
}
