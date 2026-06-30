import type { Building } from './building.ts';
import type { Apartment } from './apartment.ts';

export interface ApartmentFormProps {
  building: Building;
  initial?: Apartment;
  onSave: (a: Apartment, replicate: number[]) => void;
  onCancel: () => void;
  onAutoSave?: (a: Apartment) => void;
}
