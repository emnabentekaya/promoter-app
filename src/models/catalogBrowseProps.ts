import type { Dispatch, SetStateAction } from 'react';
import type { Building } from './building.ts';
import type { ClientCriteria } from './clientCriteria.ts';

export interface CatalogBrowseProps {
  buildings: Building[];
  criteria: ClientCriteria;
  setCriteria: Dispatch<SetStateAction<ClientCriteria>>;
  onBack: () => void;
  onEditApartment: (buildingId: string, aptId: string) => void;
  onConvertToClientSelection: () => void;
  onAddToClient: (buildingId: string, aptId: string) => void;
}
