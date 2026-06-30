import type { RawLocation, LocationIndex } from '../models/location.ts';

export function buildLocationIndex(raw: RawLocation[]): LocationIndex {
  const governoratesSet = new Set<string>();
  const citiesByGovernorate: Record<string, Set<string>> = {};
  const neighborhoodsByCity: Record<string, Set<string>> = {};
  const governorateOfCity: Record<string, string> = {};
  const cityOfNeighborhood: Record<string, string> = {};
  const governorateOfNeighborhood: Record<string, string> = {};

  for (const entry of raw) {
    if (!entry.use) continue;

    const parts = entry.name.split(',').map(s => s.trim()).filter(Boolean);

    if (entry.level === 2 && parts.length >= 2) {
      const [city, governorate] = parts;
      governoratesSet.add(governorate);
      if (!citiesByGovernorate[governorate]) citiesByGovernorate[governorate] = new Set();
      citiesByGovernorate[governorate].add(city);
      governorateOfCity[city] = governorate;
    } else if (entry.level === 3 && parts.length >= 3) {
      const [neighborhood, city, governorate] = parts;
      governoratesSet.add(governorate);
      if (!citiesByGovernorate[governorate]) citiesByGovernorate[governorate] = new Set();
      citiesByGovernorate[governorate].add(city);
      if (!neighborhoodsByCity[city]) neighborhoodsByCity[city] = new Set();
      neighborhoodsByCity[city].add(neighborhood);
      governorateOfCity[city] = governorate;
      cityOfNeighborhood[neighborhood] = city;
      governorateOfNeighborhood[neighborhood] = governorate;
    }
  }

  const sortedArray = (s: Set<string>) => Array.from(s).sort((a, b) => a.localeCompare(b, 'fr'));
  const setRecordToArrayRecord = (rec: Record<string, Set<string>>): Record<string, string[]> => {
    const out: Record<string, string[]> = {};
    for (const k in rec) out[k] = sortedArray(rec[k]);
    return out;
  };

  return {
    governorates: sortedArray(governoratesSet),
    citiesByGovernorate: setRecordToArrayRecord(citiesByGovernorate),
    neighborhoodsByCity: setRecordToArrayRecord(neighborhoodsByCity),
    governorateOfCity,
    cityOfNeighborhood,
    governorateOfNeighborhood
  };
}
