import type { StudySite } from '@/lib/supabase/types';

const EARTH_RADIUS_KM = 6371;

/** Haversine distance between two GPS coordinates in kilometres. */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Find the nearest study site (that has coordinates) to a GPS position. */
export function findNearestSite(
  lat: number,
  lng: number,
  sites: StudySite[],
): { site: StudySite; distanceKm: number } | null {
  let best: { site: StudySite; distanceKm: number } | null = null;

  for (const site of sites) {
    if (site.latitude == null || site.longitude == null) continue;
    const d = haversineDistance(lat, lng, site.latitude, site.longitude);
    if (!best || d < best.distanceKm) {
      best = { site, distanceKm: d };
    }
  }

  return best;
}
