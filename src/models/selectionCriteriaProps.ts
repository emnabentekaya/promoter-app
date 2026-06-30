import type { Dispatch, SetStateAction } from 'react';
import type { Building } from './building.ts';
import type { ClientCriteria } from './clientCriteria.ts';

export interface SelectionCriteriaProps {
  buildings: Building[];
  criteria: ClientCriteria;
  setCriteria: Dispatch<SetStateAction<ClientCriteria>>;
  onSubmit: () => void;
  onCancel: () => void;
}
