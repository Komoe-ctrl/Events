import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { ChampLieu, type ValeurLieu } from "@/components/ChampLieu";
import { ChampTexte } from "@/components/ChampTexte";
import { creerEvenement, type DonneesEvenement } from "@/features/events/api";
import { ErreurApi, ErreurReseau } from "@/lib/apiClient";
import { construireDateIso } from "@/lib/dateSaisie";
import type { CategorieEvenement } from "@/types/event";

const CATEGORIES: { valeur: CategorieEvenement; libelle: string }[] = [
  { valeur: "CONCERT", libelle: "Concert" },
  { valeur: "SOIREE", libelle: "Soirée" },
  { valeur: "CONFERENCE", libelle: "Conférence" },
  { valeur: "SPORT", libelle: "Sport" },
  { valeur: "CULTURE", libelle: "Culture" },
  { valeur: "RELIGIEUX", libelle: "Religieux" },
];

export default function Publier() {
  const queryClient = useQueryClient();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [categorie, setCategorie] = useState<CategorieEvenement | null>(null);
  const [dateDebutJour, setDateDebutJour] = useState("");
  const [dateDebutHeure, setDateDebutHeure] = useState("");
  const [dateFinJour, setDateFinJour] = useState("");
  const [dateFinHeure, setDateFinHeure] = useState("");
  const [prix, setPrix] = useState("");
  const [capacite, setCapacite] = useState("");
  const [lieu, setLieu] = useState<ValeurLieu>({
    latitude: "",
    longitude: "",
    adresse: "",
    commune: "",
  });
  const [contactOrganisateur, setContactOrganisateur] = useState("");

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreursLieu, setErreursLieu] = useState<Partial<Record<keyof ValeurLieu, string>>>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | undefined>();
  const [succes, setSucces] = useState(false);

  const mutation = useMutation({
    mutationFn: (donnees: DonneesEvenement) => creerEvenement(donnees),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evenements", "moi"] });
      setSucces(true);
    },
    onError: (erreur) => {
      setErreurGenerale(
        erreur instanceof ErreurApi
          ? erreur.message
          : erreur instanceof ErreurReseau
            ? erreur.message
            : "Une erreur inattendue est survenue.",
      );
    },
  });

  // Reprend exactement ce que CreerEvenementDto valide cote serveur — pas
  // plus (ex. pas de verification de format d'URL sur "image", le serveur
  // ne fait que IsNotEmpty). Seule addition sans equivalent serveur : la fin
  // doit etre apres le debut, garde-fou de bon sens, pas une regle metier
  // dupliquee (verifie : aucune validation croisee des dates cote API).
  const valider = (): DonneesEvenement | null => {
    const nouvellesErreurs: Record<string, string> = {};

    if (titre.trim().length === 0) nouvellesErreurs.titre = "Le titre est requis.";
    if (description.trim().length === 0) nouvellesErreurs.description = "La description est requise.";
    if (image.trim().length === 0) nouvellesErreurs.image = "L'URL de l'image est requise.";
    if (!categorie) nouvellesErreurs.categorie = "Choisis une catégorie.";
    if (contactOrganisateur.trim().length === 0) {
      nouvellesErreurs.contactOrganisateur = "Le contact est requis.";
    }

    const dateDebutIso = construireDateIso(dateDebutJour, dateDebutHeure);
    if (!dateDebutIso) {
      nouvellesErreurs.dateDebut = "Date et heure de début invalides (JJ/MM/AAAA, HH:mm).";
    }

    let dateFinIso: string | undefined;
    if (dateFinJour.trim() || dateFinHeure.trim()) {
      const parsed = construireDateIso(dateFinJour, dateFinHeure);
      if (!parsed) {
        nouvellesErreurs.dateFin = "Date et heure de fin invalides (JJ/MM/AAAA, HH:mm).";
      } else if (dateDebutIso && parsed <= dateDebutIso) {
        nouvellesErreurs.dateFin = "La fin doit être après le début.";
      } else {
        dateFinIso = parsed;
      }
    }

    let prixNombre: number | undefined;
    if (prix.trim()) {
      const n = Number(prix);
      if (!Number.isInteger(n) || n < 0) {
        nouvellesErreurs.prix = "Le prix doit être un nombre entier positif ou nul.";
      } else {
        prixNombre = n;
      }
    }

    let capaciteNombre: number | undefined;
    if (capacite.trim()) {
      const n = Number(capacite);
      if (!Number.isInteger(n) || n < 1) {
        nouvellesErreurs.capacite = "La capacité doit être un nombre entier d'au moins 1.";
      } else {
        capaciteNombre = n;
      }
    }

    const lat = Number(lieu.latitude);
    const lng = Number(lieu.longitude);
    const nouvellesErreursLieu: Partial<Record<keyof ValeurLieu, string>> = {};
    if (lieu.latitude.trim() === "" || Number.isNaN(lat) || lat < -90 || lat > 90) {
      nouvellesErreursLieu.latitude = "Latitude invalide (-90 à 90).";
    }
    if (lieu.longitude.trim() === "" || Number.isNaN(lng) || lng < -180 || lng > 180) {
      nouvellesErreursLieu.longitude = "Longitude invalide (-180 à 180).";
    }
    if (lieu.adresse.trim().length === 0) nouvellesErreursLieu.adresse = "L'adresse est requise.";
    if (lieu.commune.trim().length === 0) nouvellesErreursLieu.commune = "La commune est requise.";

    setErreurs(nouvellesErreurs);
    setErreursLieu(nouvellesErreursLieu);

    if (
      Object.keys(nouvellesErreurs).length > 0 ||
      Object.keys(nouvellesErreursLieu).length > 0 ||
      !dateDebutIso ||
      !categorie
    ) {
      return null;
    }

    return {
      titre: titre.trim(),
      description: description.trim(),
      image: image.trim(),
      categorie,
      dateDebut: dateDebutIso,
      dateFin: dateFinIso,
      prix: prixNombre,
      capacite: capaciteNombre,
      latitude: lat,
      longitude: lng,
      adresse: lieu.adresse.trim(),
      commune: lieu.commune.trim(),
      contactOrganisateur: contactOrganisateur.trim(),
    };
  };

  const soumettre = () => {
    setErreurGenerale(undefined);
    const donnees = valider();
    if (!donnees) return;
    mutation.mutate(donnees);
  };

  if (succes) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <Ionicons name="time-outline" size={48} color="#D85314" />
        <Text className="mt-4 text-center text-lg font-medium text-ink">Événement soumis</Text>
        <Text className="mt-2 text-center text-sm text-ink-muted">
          Il est en attente de modération et ne sera visible publiquement qu'après validation
          par un administrateur.
        </Text>
        <Pressable
          onPress={() => router.push("/mes-evenements")}
          className="mt-6 rounded-xl bg-brand-600 px-6 py-3 active:opacity-80"
        >
          <Text className="text-base font-medium text-white">Voir mes événements</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="p-6">
      <ChampTexte label="Titre" value={titre} onChangeText={setTitre} erreur={erreurs.titre} />
      <ChampTexte
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        erreur={erreurs.description}
      />
      <ChampTexte
        label="URL de l'image de couverture"
        value={image}
        onChangeText={setImage}
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
              onPress={() => setCategorie(c.valeur)}
              className={`rounded-full border px-4 py-2 ${
                categorie === c.valeur ? "border-brand-600 bg-brand-50" : "border-line"
              }`}
            >
              <Text className={categorie === c.valeur ? "text-brand-700" : "text-ink"}>
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
            value={dateDebutJour}
            onChangeText={setDateDebutJour}
            placeholder="12/09/2026"
            keyboardType="numeric"
            erreur={erreurs.dateDebut}
          />
        </View>
        <View className="flex-1">
          <ChampTexte
            label="Heure"
            value={dateDebutHeure}
            onChangeText={setDateDebutHeure}
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
            value={dateFinJour}
            onChangeText={setDateFinJour}
            placeholder="13/09/2026"
            keyboardType="numeric"
            erreur={erreurs.dateFin}
          />
        </View>
        <View className="flex-1">
          <ChampTexte
            label="Heure"
            value={dateFinHeure}
            onChangeText={setDateFinHeure}
            placeholder="02:00"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <ChampTexte
            label="Prix (FCFA, vide = gratuit)"
            value={prix}
            onChangeText={setPrix}
            keyboardType="numeric"
            erreur={erreurs.prix}
          />
        </View>
        <View className="flex-1">
          <ChampTexte
            label="Capacité (vide = illimité)"
            value={capacite}
            onChangeText={setCapacite}
            keyboardType="numeric"
            erreur={erreurs.capacite}
          />
        </View>
      </View>

      <ChampLieu valeur={lieu} onChange={setLieu} erreurs={erreursLieu} />

      <ChampTexte
        label="Contact (affiché aux participants)"
        value={contactOrganisateur}
        onChangeText={setContactOrganisateur}
        placeholder="07 00 00 00 00"
        erreur={erreurs.contactOrganisateur}
      />

      {erreurGenerale ? (
        <Text className="mb-4 text-sm text-red-600">{erreurGenerale}</Text>
      ) : null}

      <Pressable
        onPress={soumettre}
        disabled={mutation.isPending}
        className="items-center rounded-xl bg-brand-600 py-3 active:opacity-80 disabled:opacity-50"
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-base font-medium text-white">Publier</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
