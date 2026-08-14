import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "./api";
import type { DonneesConnexion, DonneesInscription } from "./api";
import { definirGestionnaireSessionExpiree } from "@/lib/apiClient";
import type { Utilisateur } from "@/types/utilisateur";

type EtatAuth =
  | { statut: "chargement" }
  | { statut: "deconnecte" }
  | { statut: "connecte"; utilisateur: Utilisateur };

type ContexteAuth = {
  etat: EtatAuth;
  connexion: (donnees: DonneesConnexion) => Promise<void>;
  inscription: (donnees: DonneesInscription) => Promise<void>;
  deconnexion: () => Promise<void>;
};

const ContexteAuthReact = createContext<ContexteAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<EtatAuth>({ statut: "chargement" });
  const queryClient = useQueryClient();

  useEffect(() => {
    let annule = false;
    authApi.restaurerSession().then((utilisateur) => {
      if (annule) return;
      setEtat(utilisateur ? { statut: "connecte", utilisateur } : { statut: "deconnecte" });
    });
    return () => {
      annule = true;
    };
  }, []);

  // Efface la session locale (jeton + profil), repasse l'etat a deconnecte,
  // et vide le cache TanStack Query pour ne pas laisser les donnees d'un
  // utilisateur (ses reservations, par exemple) visibles apres coup — que ce
  // soit une deconnexion volontaire ou forcee par un jeton expire/invalide.
  const terminerSession = useMemo(
    () => async () => {
      await authApi.deconnexion();
      setEtat({ statut: "deconnecte" });
      queryClient.clear();
    },
    [queryClient],
  );

  useEffect(() => {
    // reponse.status === 401 avec un jeton envoye = session invalide/expiree
    // (voir apiClient.ts). Un 401 sur /auth/connexion (mauvais mot de passe)
    // ou un 403 (role insuffisant) ne declenchent jamais ceci.
    definirGestionnaireSessionExpiree(() => {
      void terminerSession();
    });
  }, [terminerSession]);

  const valeur = useMemo<ContexteAuth>(
    () => ({
      etat,
      connexion: async (donnees) => {
        const utilisateur = await authApi.connexion(donnees);
        setEtat({ statut: "connecte", utilisateur });
      },
      inscription: async (donnees) => {
        const utilisateur = await authApi.inscription(donnees);
        setEtat({ statut: "connecte", utilisateur });
      },
      deconnexion: terminerSession,
    }),
    [etat, terminerSession],
  );

  return <ContexteAuthReact.Provider value={valeur}>{children}</ContexteAuthReact.Provider>;
}

export function useAuth(): ContexteAuth {
  const contexte = useContext(ContexteAuthReact);
  if (!contexte) {
    throw new Error("useAuth() doit etre appele a l'interieur de <AuthProvider>.");
  }
  return contexte;
}
