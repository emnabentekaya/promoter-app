import type { Building } from './building.ts';

export interface BuildingFormProps {
  initial?: Building;
  onSave: (b: Building) => void;
  //addBuilding: (building: Building) => void;
  onCancel: () => void;
  onAutoSave?: (b: Building) => void;
}
