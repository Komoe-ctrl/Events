const RAYON_TERRE_KM = 6371;

const versRadians = (deg: number) => (deg * Math.PI) / 180;

export function distanceKm(
  depuis: { latitude: number; longitude: number },
  vers: { latitude: number; longitude: number },
): number {
  const dLat = versRadians(vers.latitude - depuis.latitude);
  const dLon = versRadians(vers.longitude - depuis.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(versRadians(depuis.latitude)) *
      Math.cos(versRadians(vers.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return RAYON_TERRE_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formaterDistance(km: number | null): string {
  if (km === null) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
