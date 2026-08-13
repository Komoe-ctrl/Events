import { appelApi } from "@/lib/apiClient";
import type { CategorieEvenement, Evenement, StatutEvenement } from "@/types/event";

type FiltresEvenements = {
  lat?: number;
  lng?: number;
  rayonKm?: number;
  categorie?: CategorieEvenement;
  dateMin?: string;
  dateMax?: string;
};

function chaineRequete(filtres: FiltresEvenements): string {
  const params = new URLSearchParams();
  if (filtres.lat !== undefined) params.set("lat", String(filtres.lat));
  if (filtres.lng !== undefined) params.set("lng", String(filtres.lng));
  if (filtres.rayonKm !== undefined) params.set("rayonKm", String(filtres.rayonKm));
  if (filtres.categorie !== undefined) params.set("categorie", filtres.categorie);
  if (filtres.dateMin !== undefined) params.set("dateMin", filtres.dateMin);
  if (filtres.dateMax !== undefined) params.set("dateMax", filtres.dateMax);
  const requete = params.toString();
  return requete ? `?${requete}` : "";
}

export function recupererEvenements(filtres: FiltresEvenements = {}): Promise<Evenement[]> {
  return appelApi<Evenement[]>(`/evenements${chaineRequete(filtres)}`);
}

/** Leve ErreurApi (code EVENEMENT_INTROUVABLE ou equivalent) si id inconnu — ne renvoie plus null. */
export function recupererEvenement(id: string): Promise<Evenement> {
  return appelApi<Evenement>(`/evenements/${id}`);
}

export type DonneesEvenement = {
  titre: string;
  description: string;
  image: string;
  categorie: CategorieEvenement;
  dateDebut: string;
  dateFin?: string;
  prix?: number;
  capacite?: number;
  latitude: number;
  longitude: number;
  adresse: string;
  commune: string;
  contactOrganisateur: string;
};

export function creerEvenement(donnees: DonneesEvenement): Promise<Evenement> {
  return appelApi<Evenement>("/evenements", { methode: "POST", corps: donnees });
}

export function modifierEvenement(
  id: string,
  donnees: Partial<DonneesEvenement>,
): Promise<Evenement> {
  return appelApi<Evenement>(`/evenements/${id}`, { methode: "PATCH", corps: donnees });
}

/** Toutes les publications de l'organisateur connecte, tous statuts confondus. */
export function recupererMesEvenements(): Promise<Evenement[]> {
  return appelApi<Evenement[]>("/moi/evenements");
}

/** ADMIN uniquement — file de moderation. */
export function recupererEvenementsAModerer(): Promise<Evenement[]> {
  return appelApi<Evenement[]>("/admin/evenements");
}

/** ADMIN uniquement. */
export function modererEvenement(
  id: string,
  donnees: { statut: Extract<StatutEvenement, "PUBLIE" | "REFUSE">; motifRefus?: string },
): Promise<Evenement> {
  return appelApi<Evenement>(`/admin/evenements/${id}/statut`, {
    methode: "PATCH",
    corps: donnees,
  });
}
