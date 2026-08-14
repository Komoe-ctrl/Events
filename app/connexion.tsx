import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text } from "react-native";
import { Link } from "expo-router";
import { ChampTexte } from "@/components/ChampTexte";
import { useAuth } from "@/features/auth/AuthContext";
import { ErreurApi, ErreurReseau } from "@/lib/apiClient";
import { revenirOuAller } from "@/lib/navigation";
import { normaliserTelephoneIvoirien } from "@/lib/telephone";

export default function Connexion() {
  const { connexion } = useAuth();
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurTelephone, setErreurTelephone] = useState<string | undefined>();
  const [erreurGenerale, setErreurGenerale] = useState<string | undefined>();
  const [enCours, setEnCours] = useState(false);

  const soumettre = async () => {
    setErreurTelephone(undefined);
    setErreurGenerale(undefined);

    const telephoneNormalise = normaliserTelephoneIvoirien(telephone);
    if (!telephoneNormalise) {
      setErreurTelephone(
        "Numéro invalide. Format attendu : 07 00 00 00 00 ou +225 07 00 00 00 00.",
      );
      return;
    }

    setEnCours(true);
    try {
      await connexion({ telephone: telephoneNormalise, motDePasse });
      revenirOuAller("/(tabs)");
    } catch (erreur) {
      if (erreur instanceof ErreurApi) {
        // IDENTIFIANTS_INVALIDES ne precise jamais si c'est le numero ou le
        // mot de passe qui est incorrect (l'API le fait expres, pour ne pas
        // reveler si un numero est enregistre) : bandeau general, pas une
        // erreur attachee a un champ precis.
        setErreurGenerale(
          erreur.code === "IDENTIFIANTS_INVALIDES"
            ? "Numéro de téléphone ou mot de passe incorrect."
            : erreur.message,
        );
      } else if (erreur instanceof ErreurReseau) {
        setErreurGenerale("Impossible de se connecter. Vérifie ta connexion.");
      } else {
        setErreurGenerale("Une erreur inattendue est survenue.");
      }
    } finally {
      setEnCours(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="p-6">
      <Text className="mb-6 text-2xl font-medium text-ink">Connexion</Text>

      <ChampTexte
        label="Numéro de téléphone"
        value={telephone}
        onChangeText={setTelephone}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="07 00 00 00 00"
        erreur={erreurTelephone}
      />
      <ChampTexte
        label="Mot de passe"
        value={motDePasse}
        onChangeText={setMotDePasse}
        secureTextEntry
        autoComplete="password"
      />

      {erreurGenerale ? <Text className="mb-4 text-sm text-red-600">{erreurGenerale}</Text> : null}

      <Pressable
        onPress={soumettre}
        disabled={enCours}
        className="items-center rounded-xl bg-brand-600 py-3 active:opacity-80 disabled:opacity-50"
      >
        {enCours ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-base font-medium text-white">Se connecter</Text>
        )}
      </Pressable>

      <Link href="/inscription" replace className="mt-4 text-center text-sm text-brand-600">
        Pas encore de compte ? Crée-en un
      </Link>
    </ScrollView>
  );
}
