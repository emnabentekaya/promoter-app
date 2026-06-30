import locationsData from './data/locations.json';
import type { RawLocation, LocationIndex } from './models/location.ts';
import { buildLocationIndex } from './services/buildLocationIndexService.ts';

export const TYPOLOGIES = ['s+0', 's+1', 's+2', 's+3', 's+4'] as const;
export const ORIENTATIONS = ['Nord', 'Sud', 'Est', 'Ouest', 'Nord-Est', 'Nord-Ouest', 'Sud-Est', 'Sud-Ouest'] as const;
export const LOCATIONS: LocationIndex = buildLocationIndex(locationsData as RawLocation[]);
