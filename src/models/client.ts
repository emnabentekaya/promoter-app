import type { ClientCriteria } from './clientCriteria';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
  criteria?: ClientCriteria;
}

export interface SelectionItem {
  buildingId: string;
  apartmentId: string;
  agentNote: string;
  eliminated?: boolean;
}

export interface ClientSelection {
  id: string;
  clientId: string;
  label: string;
  createdAt: string;
  items: SelectionItem[];
}
