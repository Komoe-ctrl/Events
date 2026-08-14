import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { Utilisateur } from "@/types/utilisateur";

/**
 * Le jeton JWT va dans SecureStore (chiffre, natif), jamais AsyncStorage —
 * regle CLAUDE.md. Cle privee au module pour eviter les collisions avec
 * d'autres cles SecureStore ajoutees plus tard.
 *
 * Exception ciblee pour le web : expo-secure-store n'a pas d'implementation
 * web (module vide, tout appel leve une TypeError) et il n'existe de toute
 * facon pas d'equivalent Keychain/Keystore natif dans un navigateur. Repli
 * sur localStorage uniquement sur cette plateforme, decision validee le
 * 13/08/2026 — le web etant la cible de dev principale (emulateur Android
 * non supporte sur ce poste).
 */
const CLE_JETON = "alentour.jeton";

export async function lireJeton(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(CLE_JETON);
  }
  return SecureStore.getItemAsync(CLE_JETON);
}

export async function ecrireJeton(jeton: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(CLE_JETON, jeton);
    return;
  }
  await SecureStore.setItemAsync(CLE_JETON, jeton);
}

export async function supprimerJeton(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(CLE_JETON);
    return;
  }
  await SecureStore.deleteItemAsync(CLE_JETON);
}

/**
 * L'API n'expose aucun endpoint pour retrouver l'utilisateur courant a
 * partir du seul jeton (le payload JWT ne porte que sub/telephone/role, pas
 * le nom — voir alentour-api/src/auth/strategies/jwt.strategy.ts). Pour
 * restaurer la session au demarrage sans appel reseau, on persiste donc
 * aussi le profil utilisateur recu a la connexion/inscription. Donnee non
 * sensible (deja visible par l'utilisateur lui-meme) : AsyncStorage, pas
 * SecureStore.
 */
const CLE_UTILISATEUR = "alentour.utilisateur";

export async function lireUtilisateur(): Promise<Utilisateur | null> {
  const brut = await AsyncStorage.getItem(CLE_UTILISATEUR);
  return brut ? (JSON.parse(brut) as Utilisateur) : null;
}

export async function ecrireUtilisateur(utilisateur: Utilisateur): Promise<void> {
  await AsyncStorage.setItem(CLE_UTILISATEUR, JSON.stringify(utilisateur));
}

export async function supprimerUtilisateur(): Promise<void> {
  await AsyncStorage.removeItem(CLE_UTILISATEUR);
}
