import type { Building } from './building.ts';

export interface BuildingListProps {
  buildings: Building[];
  onAdd: () => void;
  //addBuilding(building: Building): void;
  onSelect: (id: string) => void;
  onStartSelection: () => void;
  onBrowseCatalog: () => void;
  onGoToClients: () => void;
}
