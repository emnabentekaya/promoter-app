export type PropertyType = 'appartement' | 'duplex' | 'triplex';
export type Status = 'disponible' | 'reserve' | 'vendu';
export interface ClientCriteria {
  clientName: string;
  clientEmail: string;
  clientContact: string;
  propertyTypes: PropertyType[];
  budgetMin: string;
  budgetMax: string;
  governorates: string[];
  cities: string[];
  neighborhoods: string[];
  typologies: string[];
  surfaceMin: string;
  surfaceMax: string;
  needsParentalSuite: boolean;
  needsTerrace: boolean;
  needsFunctionalTerrace: boolean;
  needsGarden: boolean;
  needsDayNightSeparation: boolean;
  kitchenType: 'any' | 'ouverte' | 'fermee';
  entranceType: 'any' | 'hall' | 'salon';
  floors: number[];
  minHappinessIndex: number;
  onlyAvailable: boolean;
}
