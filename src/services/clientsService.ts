import type { Client, ClientSelection } from '../models/client';
import {
  apiGetClients, apiCreateClient, apiUpdateClient, apiDeleteClient,
  apiGetSelections, apiCreateSelection, apiUpdateSelection, apiDeleteSelection,
} from '../api/buildingApi';

export const getClients        = ()                  => apiGetClients();
export const createClient      = (c: Client)         => apiCreateClient(c);
export const updateClient      = (c: Client)         => apiUpdateClient(c);
export const deleteClient      = (id: string)        => apiDeleteClient(id);

export const getSelections     = ()                      => apiGetSelections();
export const createSelection   = (s: ClientSelection)   => apiCreateSelection(s);
export const updateSelection   = (s: ClientSelection)   => apiUpdateSelection(s);
export const deleteSelection   = (id: string)           => apiDeleteSelection(id);
