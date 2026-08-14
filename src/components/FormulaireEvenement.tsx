import { Pressable, Text, View } from "react-native";
import { ChampLieu, type ValeurLieu } from "@/components/ChampLieu";
import { ChampTexte } from "@/components/ChampTexte";
import type { DonneesEvenement } from "@/features/events/api";
import { construireDateIso, decomposerDateIso } from "@/lib/dateSaisie";
import type { CategorieEvenement, Evenement } from "@/types/event";

const CATEGORIES: { valeur: CategorieEvenement; libelle: string }[] = [
  { valeur: "CONCERT", libelle: "Concert" },
  { valeur: "SOIREE", libelle: "Soirée" },
  { valeur: "CONFERENCE", libelle: "Conférence" },
  { valeur: "SPORT", libelle: "Sport" },
  { valeur: "CULTURE", libelle: "Culture" },
  { valeur: "RELIGIEUX", libelle: "Religieux" },
];

export type ValeursFormulaireEvenement = {
  titre: string;
  description: string;
  image: string;
  categorie: CategorieEvenement | null;
  dateDebutJour: string;
  dateDebutHeure: string;
  dateFinJour: string;
  dateFinHeure: string;
  prix: string;
  capacite: string;
  lieu: ValeurLieu;
  contactOrganisateur: string;
};

export function valeursVides(): ValeursFormulaireEvenement {
  return {
    titre: "",
    description: "",
    image: "",
    categorie: null,
    dateDebutJour: "",
    dateDebutHeure: "",
    dateFinJour: "",
    dateFinHeure: "",
    prix: "",
    capacite: "",
    lieu: { latitude: "", longitude: "", adresse: "", commune: "" },
    contactOrganisateur: "",
  };
}

export function valeursDepuisEvenement(evenement: Evenement): ValeursFormulaireEvenement {
  const debut = decomposerDateIso(evenement.dateDebut);
  const fin = evenement.dateFin ? decomposerDateIso(evenement.dateFin) : null;
  return {
    titre: evenement.titre,
    description: evenement.description,
    image: evenement.image,
    categorie: evenement.categorie,
    dateDebutJour: debut.jour,
    dateDebutHeure: debut.heure,
    dateFinJour: fin?.jour ?? "",
    dateFinHeure: fin?.heure ?? "",
    prix: evenement.prix !== null ? String(evenement.prix) : "",
    capacite: evenement.capacite !== null ? String(evenement.capacite) : "",
    lieu: {
      latitude: String(evenement.latitude),
      longitude: String(evenement.longitude),
      adresse: evenement.adresse,
      commune: evenement.commune,
    },
    contactOrganisateur: evenement.contactOrganisateur,
  };
}

export type ErreursFormulaireEvenement = Partial<
  Record<keyof Omit<ValeursFormulaireEvenement, "lieu">, string>
> & {
  lieu?: Partial<Record<keyof ValeurLieu, string>>;
};

/**
 * Reprend exactement ce que CreerEvenementDto valide cote serveur — pas
 * plus (ex. pas de verification de format d'URL sur "image", le serveur ne
 * fait que IsNotEmpty). Seule addition sans equivalent serveur, assumee :
 * la fin doit etre apres le debut (garde-fou de bon sens, verifie qu'aucune
 * validation croisee des dates n'existe cote API).
 */
export function validerFormulaireEvenement(
  v: ValeursFormulaireEvenement,
): { donnees: DonneesEvenement; erreurs: null } | { donnees: null; erreurs: ErreursFormulaireEvenement } {
  const erreurs: ErreursFormulaireEvenement = {};
  const erreursLieu: Partial<Record<keyof ValeurLieu, string>> = {};

  if (v.titre.trim().length === 0) erreurs.titre = "Le titre est requis.";
  if (v.description.trim().length === 0) erreurs.description = "La description est requise.";
  if (v.image.trim().length === 0) erreurs.image = "L'URL de l'image est requise.";
  if (!v.categorie) erreurs.categorie = "Choisis une catégorie.";
  if (v.contactOrganisateur.trim().length === 0) {
    erreurs.contactOrganisateur = "Le contact est requis.";
  }

  const dateDebutIso = construireDateIso(v.dateDebutJour, v.dateDebutHeure);
  if (!dateDebutIso) {
    erreurs.dateDebutJour = "Date et heure de début invalides (JJ/MM/AAAA, HH:mm).";
  }

  let dateFinIso: string | undefined;
  if (v.dateFinJour.trim() || v.dateFinHeure.trim()) {
    const parsed = construireDateIso(v.dateFinJour, v.dateFinHeure);
    if (!parsed) {
      erreurs.dateFinJour = "Date et heure de fin invalides (JJ/MM/AAAA, HH:mm).";
    } else if (dateDebutIso && parsed <= dateDebutIso) {
      erreurs.dateFinJour = "La fin doit être après le début.";
    } else {
      dateFinIso = parsed;
    }
  }

  let prixNombre: number | undefined;
  if (v.prix.trim()) {
    const n = Number(v.prix);
    if (!Number.isInteger(n) || n < 0) {
      erreurs.prix = "Le prix doit être un nombre entier positif ou nul.";
    } else {
      prixNombre = n;
    }
  }

  let capaciteNombre: number | undefined;
  if (v.capacite.trim()) {
    const n = Number(v.capacite);
    if (!Number.isInteger(n) || n < 1) {
      erreurs.capacite = "La capacité doit être un nombre entier d'au moins 1.";
    } else {
      capaciteNombre = n;
    }
  }

  const lat = Number(v.lieu.latitude);
  const lng = Number(v.lieu.longitude);
  if (v.lieu.latitude.trim() === "" || Number.isNaN(lat) || lat < -90 || lat > 90) {
    erreursLieu.latitude = "Latitude invalide (-90 à 90).";
  }
  if (v.lieu.longitude.trim() === "" || Number.isNaN(lng) || lng < -180 || lng > 180) {
    erreursLieu.longitude = "Longitude invalide (-180 à 180).";
  }
  if (v.lieu.adresse.trim().length === 0) erreursLieu.adresse = "L'adresse est requise.";
  if (v.lieu.commune.trim().length === 0) erreursLieu.commune = "La commune est requise.";

  if (Object.keys(erreursLieu).length > 0) erreurs.lieu = erreursLieu;

  if (Object.keys(erreurs).length > 0 || !dateDebutIso || !v.categorie) {
    return { donnees: null, erreurs };
  }

  return {
    donnees: {
      titre: v.titre.trim(),
      description: v.description.trim(),
      image: v.image.trim(),
      categorie: v.categorie,
      dateDebut: dateDebutIso,
      dateFin: dateFinIso,
      prix: prixNombre,
      capacite: capaciteNombre,
      latitude: lat,
      longitude: lng,
      adresse: v.lieu.adresse.trim(),
      commune: v.lieu.commune.trim(),
      contactOrganisateur: v.contactOrganisateur.trim(),
    },
    erreurs: null,
  };
}

export function FormulaireEvenement({
  valeurs,
  onChange,
  erreurs,
}: {
  valeurs: ValeursFormulaireEvenement;
  onChange: (valeurs: ValeursFormulaireEvenement) => void;
  erreurs: ErreursFormulaireEvenement;
}) {
  return (
    <View>
      <ChampTexte
        label="Titre"
        value={valeurs.titre}
        onChangeText={(titre) => onChange({ ...valeurs, titre })}
        erreur={erreurs.titre}
      />
      <ChampTexte
        label="Description"
        value={valeurs.description}
        onChangeText={(description) => onChange({ ...valeurs, description })}
        multiline
        numberOfLines={4}
        erreur={erreurs.description}
      />
      <ChampTexte
        label="URL de l'image de couverture"
        value={valeurs.image}
        onChangeText={(image) => onChange({ ...valeurs, image })}
        autoCapitalize="none"
        keyboardType="url"
        placeholder="https://..."
        erreur={erreurs.image}
      />

      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium text-ink">Catégorie</Text>
        <View className="flex-row flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.valeur}
              onPress={() => onChange({ ...valeurs, categorie: c.valeur })}
              className={`rounded-full border px-4 py-2 ${
                valeurs.categorie === c.valeur ? "border-brand-600 bg-brand-50" : "border-line"
              }`}
            >
              <Text className={valeurs.categorie === c.valeur ? "text-brand-700" : "text-ink"}>
                {c.libelle}
              </Text>
            </Pressable>
          ))}
        </View>
        {erreurs.categorie ? (
          <Text className="mt-1 text-sm text-red-600">{erreurs.categorie}</Text>
        ) : null}
      </View>

      <Text className="mb-1 text-sm font-medium text-ink">Début</Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <ChampTexte
            label="Date"
            value={valeurs.dateDebutJour}
            onChangeText={(dateDebutJour) => onChange({ ...valeurs, dateDebutJour })}
            placeholder="12/09/2026"
            keyboardType="numeric"
            erreur={erreurs.dateDebutJour}
          />
        </View>
        <View className="flex-1">
          <ChampTexte
            label="Heure"
            value={valeurs.dateDebutHeure}
            onChangeText={(dateDebutHeure) => onChange({ ...valeurs, dateDebutHeure })}
            placeholder="20:00"
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text className="mb-1 text-sm font-medium text-ink">Fin (optionnel)</Text>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <ChampTexte
            label="Date"
            value={valeurs.dateFinJour}
            onChangeText={(dateFinJour) => onChange({ ...valeurs, dateFinJour })}
            placeholder="13/09/2026"
            keyboardType="numeric"
            erreur={erreurs.dateFinJour}
          />
        </View>
        <View className="flex-1">
          <ChampTexte
            label="Heure"
            value={valeurs.dateFinHeure}
            onChangeText={(dateFinHeure) => onChange({ ...valeurs, dateFinHeure })}
            placeholder="02:00"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <ChampTexte
            label="Prix (FCFA, vide = gratuit)"
            value={valeurs.prix}
            onChangeText={(prix) => onChange({ ...valeurs, prix })}
            keyboardType="numeric"
            erreur={erreurs.prix}
          />
        </View>
        <View className="flex-1">
          <ChampTexte
            label="Capacité (vide = illimité)"
            value={valeurs.capacite}
            onChangeText={(capacite) => onChange({ ...valeurs, capacite })}
            keyboardType="numeric"
            erreur={erreurs.capacite}
          />
        </View>
      </View>

      <ChampLieu
        valeur={valeurs.lieu}
        onChange={(lieu) => onChange({ ...valeurs, lieu })}
        erreurs={erreurs.lieu}
      />

      <ChampTexte
        label="Contact (affiché aux participants)"
        value={valeurs.contactOrganisateur}
        onChangeText={(contactOrganisateur) => onChange({ ...valeurs, contactOrganisateur })}
        placeholder="07 00 00 00 00"
        erreur={erreurs.contactOrganisateur}
      />
    </View>
  );
}
