export type RoleUtilisateur = "PARTICIPANT" | "ORGANISATEUR" | "ADMIN";

export type Utilisateur = {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  role: RoleUtilisateur;
  createdAt: string;
};

/** Reponse de POST /auth/inscription et POST /auth/connexion. */
export type ReponseAuth = {
  jeton: string;
  utilisateur: Utilisateur;
};
