import * as SecureStore from "expo-secure-store";

/**
 * Le jeton JWT va dans SecureStore (chiffre, natif), jamais AsyncStorage —
 * regle CLAUDE.md. Cle privee au module pour eviter les collisions avec
 * d'autres cles SecureStore ajoutees plus tard.
 */
const CLE_JETON = "alentour.jeton";

export function lireJeton(): Promise<string | null> {
  return SecureStore.getItemAsync(CLE_JETON);
}

export function ecrireJeton(jeton: string): Promise<void> {
  return SecureStore.setItemAsync(CLE_JETON, jeton);
}

export function supprimerJeton(): Promise<void> {
  return SecureStore.deleteItemAsync(CLE_JETON);
}
