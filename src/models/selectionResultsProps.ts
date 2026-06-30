import type { Building } from './building.ts';
import type { ClientCriteria } from './clientCriteria.ts';

export interface SelectionResultsProps {
  buildings: Building[];
  criteria: ClientCriteria;
  onBack: () => void;
}
