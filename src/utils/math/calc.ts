type Coords = {
  latitude: number;
  longitude: number;
};

const PI = Math.PI;
const EARTH_RADIUS_KM = 6371;

const degreesToRadians = (deg: number): number => deg * (PI / 180);

export function calculateDistance<T extends Coords>({ from, to }: { from: T; to: T }): number {
  const fromRad = {
    latitude: degreesToRadians(from.latitude),
    longitude: degreesToRadians(from.longitude),
  };
  const toRad = {
    latitude: degreesToRadians(to.latitude),
    longitude: degreesToRadians(to.longitude),
  };

  const deltaLat = toRad.latitude - fromRad.latitude;
  const deltaLng = toRad.longitude - fromRad.longitude;

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromRad.latitude) * Math.cos(toRad.latitude) * Math.sin(deltaLng / 2) ** 2;

  const distance = 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return distance;
}

export function isInRadius({
  center,
  point,
  radiusKm,
}: {
  center: Coords;
  point: Coords;
  radiusKm: number;
}): boolean {
  return calculateDistance({ from: center, to: point }) <= radiusKm;
}
