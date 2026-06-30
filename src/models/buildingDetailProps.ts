import type { Building } from './building.ts';

export interface BuildingDetailProps {
  building: Building;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddApartment: () => void;
  onEditApartment: (id: string) => void;
  onDeleteApartment: (id: string) => void;
}
