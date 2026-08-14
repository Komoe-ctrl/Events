import { appelApi } from "@/lib/apiClient";
import { cacherReservations, lireReservationEnCache } from "@/lib/reservationCache";
import type { Reservation, ReservationOrganisateur } from "@/types/reservation";

export async function creerReservation(
  evenementId: string,
  nombrePlaces?: number,
): Promise<Reservation> {
  const reservation = await appelApi<Reservation>(`/evenements/${evenementId}/reservations`, {
    methode: "POST",
    corps: nombrePlaces !== undefined ? { nombrePlaces } : undefined,
  });
  await cacherReservations([reservation]);
  return reservation;
}

/** Annulation par le participant lui-meme (proprietaire verifie cote serveur). */
export async function annulerReservation(id: string): Promise<Reservation> {
  const reservation = await appelApi<Reservation>(`/reservations/${id}`, { methode: "DELETE" });
  await cacherReservations([reservation]);
  return reservation;
}

/** Scan a l'entree par l'organisateur : marque la reservation UTILISEE. */
export function validerReservation(code: string): Promise<Reservation> {
  return appelApi<Reservation>("/reservations/valider", {
    methode: "POST",
    corps: { code },
  });
}

export async function recupererMesReservations(): Promise<Reservation[]> {
  const reservations = await appelApi<Reservation[]>("/moi/reservations");
  await cacherReservations(reservations);
  return reservations;
}

/** Lecture locale seule, sans reseau — repli pour l'ecran de detail (etape 4). */
export function recupererReservationEnCache(id: string): Promise<Reservation | null> {
  return lireReservationEnCache(id);
}

/** Liste des inscrits d'un evenement, reservee a son organisateur (ou un admin). */
export function recupererInscrits(evenementId: string): Promise<ReservationOrganisateur[]> {
  return appelApi<ReservationOrganisateur[]>(`/evenements/${evenementId}/reservations`);
}
