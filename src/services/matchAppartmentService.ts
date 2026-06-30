import type { Apartment } from '../models/apartment.ts';
import type { Building } from '../models/building.ts';
import type { ClientCriteria } from '../models/clientCriteria.ts';
import { computeHappinessIndex, hasParentalSuite, hasTerrace, hasFunctionalTerrace, hasGarden } from '../utils/helpers.ts';

export interface MatchedApartment {
  apartment: Apartment;
  building: Building;
  score: number;
  reasons: string[];
  happiness: number;
}

export function matchApartments(buildings: Building[], criteria: ClientCriteria): MatchedApartment[] {
  const results: MatchedApartment[] = [];

  buildings.forEach(building => {
    if (criteria.governorates.length > 0 && !criteria.governorates.includes(building.governorate)) return;
    if (criteria.cities.length > 0 && !criteria.cities.includes(building.city)) return;
    if (criteria.neighborhoods.length > 0 && !criteria.neighborhoods.includes(building.neighborhood)) return;

    building.apartments.forEach(apt => {
      const happiness = computeHappinessIndex(apt);

      if (criteria.onlyAvailable && apt.status !== 'disponible') return;
      if (criteria.propertyTypes.length > 0 && !criteria.propertyTypes.includes(apt.propertyType)) return;
      if (criteria.typologies.length > 0 && !criteria.typologies.includes(apt.typology)) return;
      if (criteria.floors.length > 0 && !criteria.floors.includes(apt.floor)) return;

      const price = parseInt(apt.price) || 0;
      if (criteria.budgetMin && price < parseInt(criteria.budgetMin)) return;
      if (criteria.budgetMax && price > parseInt(criteria.budgetMax)) return;

      const surface = parseInt(apt.surface) || 0;
      if (criteria.surfaceMin && surface < parseInt(criteria.surfaceMin)) return;
      if (criteria.surfaceMax && surface > parseInt(criteria.surfaceMax)) return;

      if (criteria.needsParentalSuite && !hasParentalSuite(apt)) return;
      if (criteria.needsTerrace && !hasTerrace(apt)) return;
      if (criteria.needsFunctionalTerrace && !hasFunctionalTerrace(apt)) return;
      if (criteria.needsGarden && !hasGarden(apt)) return;
      if (criteria.needsDayNightSeparation && !apt.dayNightSeparation) return;
      if (criteria.kitchenType !== 'any' && apt.kitchen.kitchenType !== criteria.kitchenType) return;
      if (criteria.entranceType !== 'any' && apt.entranceType !== criteria.entranceType) return;
      if (happiness < criteria.minHappinessIndex) return;

      let score = 50;
      const reasons: string[] = [];
      if (happiness >= 80) { score += 20; reasons.push(`Bonheur ${happiness}/100`); }
      else if (happiness >= 60) { score += 10; reasons.push(`Bonheur ${happiness}/100`); }
      if (criteria.needsParentalSuite && hasParentalSuite(apt)) { score += 10; reasons.push('Suite parentale'); }
      if (criteria.needsTerrace && hasFunctionalTerrace(apt)) { score += 10; reasons.push('Terrasse fonctionnelle'); }
      if (criteria.needsGarden && hasGarden(apt)) { score += 10; reasons.push('Jardin'); }
      if (criteria.needsDayNightSeparation && apt.dayNightSeparation) { score += 5; reasons.push('Séparation jour/nuit'); }
      if (criteria.budgetMax) {
        const maxBudget = parseInt(criteria.budgetMax);
        if (price < maxBudget * 0.9) { score += 5; reasons.push('Sous le budget max'); }
      }

      results.push({ apartment: apt, building, score, reasons, happiness });
    });
  });

  return results.sort((a, b) => b.score - a.score);
}
