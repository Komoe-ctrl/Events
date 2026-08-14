import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text } from "react-native";
import { Link } from "expo-router";
import { ChampTexte } from "@/components/ChampTexte";
import { useAuth } from "@/features/auth/AuthContext";
import { ErreurApi, ErreurReseau } from "@/lib/apiClient";
import { revenirOuAller } from "@/lib/navigation";
import { normaliserTelephoneIvoirien } from "@/lib/telephone";

export default function Inscription() {
  const { inscription } = useAuth();
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  const [erreurNom, setErreurNom] = useState<string | undefined>();
  const [erreurTelephone, setErreurTelephone] = useState<string | undefined>();
  const [erreurMotDePasse, setErreurMotDePasse] = useState<string | undefined>();
  const [erreurGenerale, setErreurGenerale] = useState<string | undefined>();
  const [enCours, setEnCours] = useState(false);

  const soumettre = async () => {
    setErreurNom(undefined);
    setErreurTelephone(undefined);
    setErreurMotDePasse(undefined);
    setErreurGenerale(undefined);

    let valide = true;
    if (nom.trim().length === 0) {
      setErreurNom("Le nom est requis.");
      valide = false;
    }
    const telephoneNormalise = normaliserTelephoneIvoirien(telephone);
    if (!telephoneNormalise) {
      setErreurTelephone(
        "Numéro invalide. Format attendu : 07 00 00 00 00 ou +225 07 00 00 00 00.",
      );
      valide = false;
    }
    if (motDePasse.length < 8) {
      setErreurMotDePasse("Le mot de passe doit contenir au moins 8 caractères.");
      valide = false;
    }
    if (!valide || !telephoneNormalise) return;

    setEnCours(true);
    try {
      await inscription({
        nom: nom.trim(),
        telephone: telephoneNormalise,
        email: email.trim() || undefined,
        motDePasse,
      });
      revenirOuAller("/(tabs)");
    } catch (erreur) {
      if (erreur instanceof ErreurApi) {
        // TELEPHONE_DEJA_UTILISE / EMAIL_DEJA_UTILISE sont attaches au champ
        // concerne (pas un bandeau general) : contrairement a l'echec de
        // connexion, on sait exactement quel champ pose probleme, et le
        // dire clairement evite a l'utilisateur de re-essayer a l'aveugle.
        if (erreur.code === "TELEPHONE_DEJA_UTILISE") {
          setErreurTelephone("Ce numéro est déjà associé à un compte.");
        } else if (erreur.code === "EMAIL_DEJA_UTILISE") {
          setErreurGenerale("Cette adresse email est déjà utilisée.");
        } else {
          setErreurGenerale(erreur.message);
        }
      } else if (erreur instanceof ErreurReseau) {
        setErreurGenerale("Impossible de créer le compte. Vérifie ta connexion.");
      } else {
        setErreurGenerale("Une erreur inattendue est survenue.");
      }
    } finally {
      setEnCours(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="p-6">
      <Text className="mb-6 font-display text-display text-ink">Créer un compte</Text>

      <ChampTexte label="Nom" value={nom} onChangeText={setNom} autoComplete="name" erreur={erreurNom} />
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
        label="Email (optionnel)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <ChampTexte
        label="Mot de passe"
        value={motDePasse}
        onChangeText={setMotDePasse}
        secureTextEntry
        autoComplete="password-new"
        erreur={erreurMotDePasse}
      />

      {erreurGenerale ? <Text className="mb-4 text-sm text-red-600">{erreurGenerale}</Text> : null}

      <Pressable
        onPress={soumettre}
        disabled={enCours}
        className="items-center rounded-card bg-brand-500 py-3 active:opacity-80 disabled:opacity-50"
      >
        {enCours ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-base font-medium text-white">Créer mon compte</Text>
        )}
      </Pressable>

      <Link href="/connexion" replace className="mt-4 text-center text-sm text-brand-600">
        Déjà un compte ? Se connecter
      </Link>
    </ScrollView>
  );
}
