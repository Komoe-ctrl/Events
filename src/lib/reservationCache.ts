import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Reservation } from "@/types/reservation";

/**
 * Copie locale des reservations deja vues en ligne, pour que le code (et
 * l'essentiel du contexte) reste consultable a l'entree d'un evenement meme
 * sans reseau. Pas de source d'API pour lire UNE reservation isolement
 * (seul GET /moi/reservations existe) : ce cache est rempli a chaque fetch
 * reussi de cette liste, et immediatement apres la creation d'une
 * reservation, plutot que d'attendre un futur passage par la liste.
 */
const CLE_CACHE = "alentour.reservations.cache";

type CacheReservations = Record<string, Reservation>;

async function lireCache(): Promise<CacheReservations> {
  const brut = await AsyncStorage.getItem(CLE_CACHE);
  return brut ? (JSON.parse(brut) as CacheReservations) : {};
}

export async function cacherReservations(reservations: Reservation[]): Promise<void> {
  const cache = await lireCache();
  for (const reservation of reservations) {
    cache[reservation.id] = reservation;
  }
  await AsyncStorage.setItem(CLE_CACHE, JSON.stringify(cache));
}

export async function lireReservationEnCache(id: string): Promise<Reservation | null> {
  const cache = await lireCache();
  return cache[id] ?? null;
}
