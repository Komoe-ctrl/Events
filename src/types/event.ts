export type CategorieEvenement =
  | "CONCERT"
  | "SOIREE"
  | "CONFERENCE"
  | "SPORT"
  | "CULTURE"
  | "RELIGIEUX";

export type StatutEvenement = "BROUILLON" | "EN_ATTENTE" | "PUBLIE" | "REFUSE";

export type Evenement = {
  id: string;
  titre: string;
  slug: string;
  description: string;
  image: string;
  categorie: CategorieEvenement;
  dateDebut: string;
  dateFin: string | null;
  prix: number | null;
  capacite: number | null;
  /** capacite moins les places deja reservees (CONFIRMEE + UTILISEE). null = illimite, comme capacite. */
  placesRestantes: number | null;
  latitude: number;
  longitude: number;
  adresse: string;
  commune: string;
  statut: StatutEvenement;
  motifRefus: string | null;
  organisateurId: string;
  contactOrganisateur: string;
  createdAt: string;
  updatedAt: string;
  /** Absent si la recherche n'a pas fourni lat/lng — jamais null. */
  distanceKm?: number;
};

/** Sous-ensemble d'Evenement renvoye imbrique dans une Reservation. */
export type EvenementResume = {
  titre: string;
  slug: string;
  image: string;
  dateDebut: string;
  commune: string;
  adresse: string;
};
