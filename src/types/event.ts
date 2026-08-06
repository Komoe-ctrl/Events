export type CategorieEvenement =
  | "concert"
  | "soiree"
  | "conference"
  | "sport"
  | "culture"
  | "religieux";

export type Evenement = {
  id: string;
  titre: string;
  description: string;
  image: string;
  categorie: CategorieEvenement;
  dateDebut: string;
  dateFin: string | null;
  prix: number | null;
  latitude: number;
  longitude: number;
  adresse: string;
  commune: string;
  contactOrganisateur: string;
};

export type EvenementAvecDistance = Evenement & { distanceKm: number | null };
