import { appelApi } from "@/lib/apiClient";
import type { Reservation } from "@/types/reservation";

export function creerReservation(
  evenementId: string,
  nombrePlaces?: number,
): Promise<Reservation> {
  return appelApi<Reservation>(`/evenements/${evenementId}/reservations`, {
    methode: "POST",
    corps: nombrePlaces !== undefined ? { nombrePlaces } : undefined,
  });
}

/** Annulation par le participant lui-meme (proprietaire verifie cote serveur). */
export function annulerReservation(id: string): Promise<Reservation> {
  return appelApi<Reservation>(`/reservations/${id}`, { methode: "DELETE" });
}

/** Scan a l'entree par l'organisateur : marque la reservation UTILISEE. */
export function validerReservation(code: string): Promise<Reservation> {
  return appelApi<Reservation>("/reservations/valider", {
    methode: "POST",
    corps: { code },
  });
}

export function recupererMesReservations(): Promise<Reservation[]> {
  return appelApi<Reservation[]>("/moi/reservations");
}
