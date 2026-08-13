import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "./api";
import type { DonneesConnexion, DonneesInscription } from "./api";
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
      deconnexion: async () => {
        await authApi.deconnexion();
        setEtat({ statut: "deconnecte" });
      },
    }),
    [etat],
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
