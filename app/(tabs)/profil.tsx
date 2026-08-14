import { Ionicons } from "@expo/vector-icons";
import { Link, router, type Href } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/features/auth/AuthContext";

export default function Profil() {
  const { etat, deconnexion } = useAuth();

  if (etat.statut === "chargement") {
    return (
      <View className="flex-1 items-center justify-center bg-surface-sunken">
        <ActivityIndicator color="#D85314" />
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
          className="rounded-xl bg-brand-600 px-6 py-3 active:opacity-80"
        >
          <Text className="text-base font-medium text-white">Se connecter</Text>
        </Pressable>
      </View>
    );
  }

  const { utilisateur } = etat;

  return (
    <ScrollView className="flex-1 bg-surface-sunken" contentContainerClassName="p-6">
      <View className="mb-6 rounded-2xl border border-line bg-surface p-5">
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

      <Pressable
        onPress={() => deconnexion()}
        className="mt-6 items-center rounded-xl border border-line py-3 active:opacity-70"
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
      <Pressable className="mb-3 flex-row items-center justify-between rounded-xl border border-line bg-surface px-4 py-4 active:opacity-70">
        <View className="flex-row items-center gap-3">
          <Ionicons name={icone} size={20} color="#6B6560" />
          <Text className="text-base text-ink">{titre}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#A19B95" />
      </Pressable>
    </Link>
  );
}
