import { appelApi } from "@/lib/apiClient";
import { ecrireJeton, supprimerJeton } from "@/lib/authStorage";
import type { ReponseAuth, RoleUtilisateur, Utilisateur } from "@/types/utilisateur";

export type DonneesConnexion = {
  telephone: string;
  motDePasse: string;
};

export type DonneesInscription = {
  nom: string;
  telephone: string;
  email?: string;
  motDePasse: string;
  role?: Extract<RoleUtilisateur, "PARTICIPANT" | "ORGANISATEUR">;
};

export async function connexion(donnees: DonneesConnexion): Promise<Utilisateur> {
  const reponse = await appelApi<ReponseAuth>("/auth/connexion", {
    methode: "POST",
    corps: donnees,
  });
  await ecrireJeton(reponse.jeton);
  return reponse.utilisateur;
}

export async function inscription(donnees: DonneesInscription): Promise<Utilisateur> {
  const reponse = await appelApi<ReponseAuth>("/auth/inscription", {
    methode: "POST",
    corps: donnees,
  });
  await ecrireJeton(reponse.jeton);
  return reponse.utilisateur;
}

/** Pas d'endpoint de deconnexion dans le contrat API — un JWT se "deconnecte"
 * en supprimant simplement le jeton local. */
export async function deconnexion(): Promise<void> {
  await supprimerJeton();
}
