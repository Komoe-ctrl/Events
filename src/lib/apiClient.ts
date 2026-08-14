/**
 * Point de contact HTTP unique avec l'API. Aucun autre fichier ne doit
 * appeler fetch directement (regle CLAUDE.md).
 */

export class ErreurApi extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statutHttp: number,
  ) {
    super(message);
    this.name = "ErreurApi";
  }
}

export class ErreurReseau extends Error {
  constructor(cause: unknown) {
    super("Impossible de contacter le serveur. Verifiez votre connexion.");
    this.name = "ErreurReseau";
    this.cause = cause;
  }
}

/**
 * Le client ne connait pas src/lib/authStorage (qui n'existe pas encore a
 * cette etape). Pour eviter un import du client vers le module de stockage
 * du jeton — et le risque de dependance circulaire si ce module devait un
 * jour importer quelque chose du client — le lecteur de jeton est injecte
 * plutot qu'importe. Voir l'etape 4 pour le branchement reel via SecureStore.
 */
let lireJetonActuel: () => Promise<string | null> = async () => null;

export function definirLecteurJeton(lecteur: () => Promise<string | null>): void {
  lireJetonActuel = lecteur;
}

/**
 * Meme patron que le lecteur de jeton ci-dessus, meme raison : le client ne
 * doit pas dependre d'AuthContext (React). Declenche quand une requete
 * envoyee AVEC un jeton recoit un 401 — un jeton invalide/expire, pas une
 * simple absence de jeton ni un 403 (role insuffisant, pas un probleme de
 * session). Voir l'etape 5 de la conversation pour la justification complete.
 */
let gestionnaireSessionExpiree: (() => void) | null = null;

export function definirGestionnaireSessionExpiree(gestionnaire: () => void): void {
  gestionnaireSessionExpiree = gestionnaire;
}

type MethodeHttp = "GET" | "POST" | "PATCH" | "DELETE";

type OptionsAppel = {
  methode?: MethodeHttp;
  corps?: unknown;
};

function estErreurApplicative(
  valeur: unknown,
): valeur is { erreur: { code: string; message: string } } {
  if (typeof valeur !== "object" || valeur === null || !("erreur" in valeur)) {
    return false;
  }
  const erreur = (valeur as { erreur: unknown }).erreur;
  return (
    typeof erreur === "object" &&
    erreur !== null &&
    "code" in erreur &&
    "message" in erreur
  );
}

export async function appelApi<T>(chemin: string, options: OptionsAppel = {}): Promise<T> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL n'est pas defini.");
  }

  // Une erreur de lecture du jeton (stockage indisponible sur la plateforme,
  // valeur corrompue, etc.) ne doit jamais empecher un appel vers un endpoint
  // public — on degrade vers "pas de jeton" plutot que de faire echouer toute
  // la requete.
  let jeton: string | null;
  try {
    jeton = await lireJetonActuel();
  } catch {
    jeton = null;
  }

  let reponse: Response;
  try {
    reponse = await fetch(`${baseUrl}${chemin}`, {
      method: options.methode ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
      },
      body: options.corps !== undefined ? JSON.stringify(options.corps) : undefined,
    });
  } catch (cause) {
    throw new ErreurReseau(cause);
  }

  const texte = await reponse.text();
  let donnees: unknown;
  try {
    donnees = texte ? JSON.parse(texte) : undefined;
  } catch (cause) {
    throw new ErreurApi("REPONSE_ILLISIBLE", "La reponse du serveur est illisible.", reponse.status);
  }

  if (!reponse.ok) {
    if (reponse.status === 401 && jeton) {
      gestionnaireSessionExpiree?.();
    }
    if (estErreurApplicative(donnees)) {
      throw new ErreurApi(donnees.erreur.code, donnees.erreur.message, reponse.status);
    }
    throw new ErreurApi(
      "ERREUR_INCONNUE",
      "Une erreur inattendue est survenue.",
      reponse.status,
    );
  }

  return donnees as T;
}
