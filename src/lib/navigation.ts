import { router, type Href } from "expo-router";

/**
 * router.back() echoue (erreur dev-only en console, "GO_BACK was not
 * handled") si l'ecran courant n'a rien en dessous dans la pile — arrivee
 * directe par URL/deep link, ou rechargement de la page sur cet ecran.
 * Repli explicite vers une destination connue plutot que de laisser
 * l'utilisateur bloque sur l'ecran courant.
 */
export function revenirOuAller(destinationRepli: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(destinationRepli);
  }
}
