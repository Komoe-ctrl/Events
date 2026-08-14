import type { EvenementResume } from "./event";

export type StatutReservation = "CONFIRMEE" | "ANNULEE" | "UTILISEE";

export type Reservation = {
  id: string;
  evenementId: string;
  utilisateurId: string;
  nombrePlaces: number;
  code: string;
  statut: StatutReservation;
  createdAt: string;
  utiliseeLe: string | null;
  /** Absent selon l'endpoint (non renvoye partout) — jamais null. */
  evenement?: EvenementResume;
};

export type Participant = {
  nom: string;
  telephone: string;
};

/** Vue d'une reservation cote organisateur (GET /evenements/:id/reservations) : identite du participant, pas l'evenement (deja connu par le contexte). */
export type ReservationOrganisateur = {
  id: string;
  evenementId: string;
  utilisateurId: string;
  nombrePlaces: number;
  code: string;
  statut: StatutReservation;
  createdAt: string;
  utiliseeLe: string | null;
  utilisateur: Participant;
};
