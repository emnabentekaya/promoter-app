import type { Apartment, Room, PropertyType } from '../models/apartment.ts';
import type { Building } from '../models/building.ts';

export function nbChambres(typology: string): number {
  switch (typology) {
    case 's+0': return 0;
    case 's+1': return 1;
    case 's+2': return 2;
    case 's+3': return 3;
    case 's+4': return 4;
    default: return 0;
  }
}

export const getSuites = (a: Apartment): Room[] => a.rooms.filter(r => r.isSuite);
export const getSimpleRooms = (a: Apartment): Room[] => a.rooms.filter(r => !r.isSuite);
export const hasParentalSuite = (a: Apartment): boolean => a.rooms.some(r => r.isSuite);

export const hasTerrace = (a: Apartment): boolean =>
  a.salon.hasTerrace || a.rooms.some(r => r.hasTerrace);

export const hasFunctionalTerrace = (a: Apartment): boolean =>
  (a.salon.hasTerrace && a.salon.terraceFunctional) ||
  a.rooms.some(r => r.hasTerrace && r.terraceFunctional);

export const hasGarden = (a: Apartment): boolean => a.hasGarden;

export const isRoomFilled = (r: Room): boolean =>
  !!(r.surface || r.orientation || r.luminosite || r.ensoleiment ||
     r.hasBalcony || r.hasTerrace || r.hasDressing || r.isSuite);

export const computeHappinessIndex = (a: Apartment): number => {
  const notes = [a.noteCirculation, a.noteEnsoleillement, a.noteLumiere, a.noteDimensions]
    .map(n => parseFloat(n)).filter(n => !isNaN(n) && n >= 0 && n <= 10);
  if (notes.length === 0) return 0;
  return Math.round((notes.reduce((s, n) => s + n, 0) / notes.length) * 10);
};

export const calculatePriceFromGrid = (a: Apartment, b: Building): number => {
  const m: Record<string, string> = {
    's+0': b.meterPriceS0, 's+1': b.meterPriceS1, 's+2': b.meterPriceS2,
    's+3': b.meterPriceS3, 's+4': b.meterPriceS4
  };
  const prixM2 = parseFloat(m[a.typology] || '0');
  if (!prixM2) return 0;
  let total = (parseFloat(a.surface) || 0) * prixM2;
  const terrasseTotal = (a.salon.hasTerrace ? parseFloat(a.salon.terraceSurface) || 0 : 0)
    + a.rooms.reduce((s, r) => s + (r.hasTerrace ? parseFloat(r.terraceSurface) || 0 : 0), 0);
  if (b.meterPriceTerrace && terrasseTotal > 0) total += terrasseTotal * parseFloat(b.meterPriceTerrace);
  if (b.meterPriceGarden && a.hasGarden) total += (parseFloat(a.gardenSurface) || 0) * parseFloat(b.meterPriceGarden);
  if (b.meterPriceCellier && a.hasCellier) total += (parseFloat(a.cellierSurface) || 0) * parseFloat(b.meterPriceCellier);
  return Math.round(total);
};

export const formatPrice = (p: string | number): string => {
  const n = typeof p === 'string' ? parseInt(p) : p;
  if (!n || isNaN(n)) return '—';
  return new Intl.NumberFormat('fr-TN').format(n) + ' TND';
};

export const formatFloor = (a: Apartment): string => `Étage ${a.floor}`;

export const propertyLabel = (t: PropertyType): string =>
  t === 'duplex' ? 'Duplex' : t === 'triplex' ? 'Triplex' : 'Appartement';

export function getMonth(m: string): string {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const idx = parseInt(m) - 1;
  return months[idx] || '';
}

export function nbWaterPoints(apt: Apartment): number {
  let nb = apt.waterPoints;
  apt.rooms.forEach(r => { if (r.isSuite) nb += 1; });
  return nb;
}

export function nbSuites(apt: Apartment): number {
  let nb = 0;
  apt.rooms.forEach(r => { if (r.isSuite) nb += 1; });
  return nb;
}
