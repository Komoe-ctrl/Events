import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ChampTexte } from "@/components/ChampTexte";
import { useObtenirPositionActuelle } from "@/lib/useObtenirPositionActuelle";

export type ValeurLieu = {
  latitude: string;
  longitude: string;
  adresse: string;
  commune: string;
};

type Props = {
  valeur: ValeurLieu;
  onChange: (valeur: ValeurLieu) => void;
  erreurs?: Partial<Record<keyof ValeurLieu, string>>;
};

/**
 * L'API attend latitude/longitude en plus d'adresse/commune en texte libre,
 * mais n'offre aucun moyen de les deriver l'un de l'autre cote client :
 * expo-location.geocodeAsync/reverseGeocodeAsync ne fonctionnent pas sur
 * web (verifie dans node_modules), et react-native-maps n'y rend rien
 * (MapView.web.ts = UnimplementedView). Le bouton ne fait que proposer les
 * coordonnees du moment ; l'organisateur reste libre de les corriger ou de
 * les saisir a la main s'il n'est pas sur place.
 */
export function ChampLieu({ valeur, onChange, erreurs }: Props) {
  const { obtenir, etat } = useObtenirPositionActuelle();

  const utiliserPositionActuelle = async () => {
    const position = await obtenir();
    if (position) {
      onChange({
        ...valeur,
        latitude: String(position.latitude),
        longitude: String(position.longitude),
      });
    }
  };

  return (
    <View>
      <Pressable
        onPress={utiliserPositionActuelle}
        disabled={etat.statut === "chargement"}
        className="mb-4 items-center rounded-card border border-line py-3 active:opacity-70 disabled:opacity-50"
      >
        {etat.statut === "chargement" ? (
          <ActivityIndicator color="#5C5248" />
        ) : (
          <Text className="text-base font-medium text-ink">Utiliser ma position actuelle</Text>
        )}
      </Pressable>
      {etat.statut === "erreur" ? (
        <Text className="-mt-2 mb-4 text-sm text-red-600">{etat.message}</Text>
      ) : null}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <ChampTexte
            label="Latitude"
            value={valeur.latitude}
            onChangeText={(texte) => onChange({ ...valeur, latitude: texte })}
            keyboardType="numeric"
            placeholder="5.3167"
            erreur={erreurs?.latitude}
          />
        </View>
        <View className="flex-1">
          <ChampTexte
            label="Longitude"
            value={valeur.longitude}
            onChangeText={(texte) => onChange({ ...valeur, longitude: texte })}
            keyboardType="numeric"
            placeholder="-4.0333"
            erreur={erreurs?.longitude}
          />
        </View>
      </View>

      <ChampTexte
        label="Adresse"
        value={valeur.adresse}
        onChangeText={(texte) => onChange({ ...valeur, adresse: texte })}
        placeholder="Palais de la Culture"
        erreur={erreurs?.adresse}
      />
      <ChampTexte
        label="Commune"
        value={valeur.commune}
        onChangeText={(texte) => onChange({ ...valeur, commune: texte })}
        placeholder="Cocody"
        erreur={erreurs?.commune}
      />
    </View>
  );
}
