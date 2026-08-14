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
