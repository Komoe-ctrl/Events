import { useState } from "react";
import * as Location from "expo-location";

type EtatObtention =
  | { statut: "repos" }
  | { statut: "chargement" }
  | { statut: "erreur"; message: string };

/**
 * Declenchement manuel (bouton), contrairement a usePosition() qui demarre
 * automatiquement au montage — usage different : ici l'utilisateur decide
 * explicitement du moment (formulaire de publication), pas un affichage qui
 * a besoin de la position des l'ouverture de l'ecran.
 */
export function useObtenirPositionActuelle() {
  const [etat, setEtat] = useState<EtatObtention>({ statut: "repos" });

  const obtenir = async (): Promise<{ latitude: number; longitude: number } | null> => {
    setEtat({ statut: "chargement" });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setEtat({
          statut: "erreur",
          message: "Localisation refusée. Renseigne les coordonnées manuellement.",
        });
        return null;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setEtat({ statut: "repos" });
      return { latitude: position.coords.latitude, longitude: position.coords.longitude };
    } catch {
      setEtat({
        statut: "erreur",
        message: "Impossible d'obtenir ta position. Renseigne les coordonnées manuellement.",
      });
      return null;
    }
  };

  return { obtenir, etat };
}
