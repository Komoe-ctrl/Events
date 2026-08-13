import { appelApi } from "@/lib/apiClient";
import {
  ecrireJeton,
  ecrireUtilisateur,
  lireJeton,
  lireUtilisateur,
  supprimerJeton,
  supprimerUtilisateur,
} from "@/lib/authStorage";
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
  await Promise.all([ecrireJeton(reponse.jeton), ecrireUtilisateur(reponse.utilisateur)]);
  return reponse.utilisateur;
}

export async function inscription(donnees: DonneesInscription): Promise<Utilisateur> {
  const reponse = await appelApi<ReponseAuth>("/auth/inscription", {
    methode: "POST",
    corps: donnees,
  });
  await Promise.all([ecrireJeton(reponse.jeton), ecrireUtilisateur(reponse.utilisateur)]);
  return reponse.utilisateur;
}

/** Pas d'endpoint de deconnexion dans le contrat API — un JWT se "deconnecte"
 * en supprimant simplement le jeton et le profil locaux. */
export async function deconnexion(): Promise<void> {
  await Promise.all([supprimerJeton(), supprimerUtilisateur()]);
}

/**
 * Restaure la session au demarrage depuis le stockage local, sans appel
 * reseau (aucun endpoint pour ca). Si l'un des deux seulement est present
 * (etat incoherent — stockage corrompu, ecriture partielle interrompue...),
 * on efface tout et on repart d'un etat deconnecte propre plutot que
 * d'exposer un utilisateur avec un jeton absent ou invalide.
 */
export async function restaurerSession(): Promise<Utilisateur | null> {
  const [jeton, utilisateur] = await Promise.all([lireJeton(), lireUtilisateur()]);
  if (!jeton || !utilisateur) {
    await Promise.all([supprimerJeton(), supprimerUtilisateur()]);
    return null;
  }
  return utilisateur;
}
