type Coords = {
  longitude: number;
  latitude: number;
};
const PI = Math.PI;
const EARTH_R = 6371;

const getRad = (deg: number): number => {
  return deg * (PI / 180);
};

export function calculateDistance<T extends Coords>({ a, b }: { a: T; b: T }): number {
  const radA: Coords = {
    longitude: getRad(a.longitude),
    latitude: getRad(a.latitude),
  };
  const radB = {
    longitude: getRad(b.longitude),
    latitude: getRad(b.latitude),
  };

  const dLat = radB.latitude - radA.latitude;

  const dLong = radB.longitude - radA.longitude;

  const first =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.cos(radA.latitude) * Math.cos(radB.latitude) * Math.pow(Math.sin(dLong / 2), 2);
  const second = 2 * Math.atan2(Math.sqrt(first), Math.sqrt(1 - first));
  const distance = EARTH_R * second;

  return distance;
}

export function isInArea({ a, b, R }: { a: Coords; b: Coords; R: number }): boolean {
  const d = calculateDistance({ a, b });
  return R >= d;
}
