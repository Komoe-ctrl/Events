import { useEffect, useState } from "react";
import * as Location from "expo-location";

export type EtatPosition =
  | { statut: "chargement" }
  | { statut: "refuse" }
  | { statut: "erreur" }
  | { statut: "ok"; latitude: number; longitude: number };

export function usePosition(): EtatPosition {
  const [etat, setEtat] = useState<EtatPosition>({ statut: "chargement" });

  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (annule) return;
        if (status !== "granted") {
          setEtat({ statut: "refuse" });
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (annule) return;
        setEtat({
          statut: "ok",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch {
        if (!annule) setEtat({ statut: "erreur" });
      }
    })();

    return () => {
      annule = true;
    };
  }, []);

  return etat;
}
