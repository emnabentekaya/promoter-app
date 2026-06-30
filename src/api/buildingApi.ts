import type { Building } from '../models/building';
import type { Client, ClientSelection } from '../models/client';
import {apiClient} from "../services/apiClientService.ts";
//import mockBuildings from '../data/mockBuildings';

// ---------------------------------------------------------------------------
// In-memory store — replaces localStorage, mirrors what a real REST API holds
// ---------------------------------------------------------------------------
export class BuildingApi {
    //private _buildings: Building[] = structuredClone(mockBuildings);
    //private _buildings: Building[]
    private _clients: Client[] = [];
    private _selections: ClientSelection[] = [];

    constructor() {
        //this._buildings = structuredClone(mockBuildings);
        //this._buildings = [];
    }

// Each function returns a Promise so call-sites are already written for async/await.
// Swap this file out (or redirect to axios calls) when the real backend is ready.

  

// ── Buildings ────────────────────────────────────────────────────────────────

    public async apiGetBuildings(): Promise<Building[]> {
        // const response = await axios.get(
        //     "http://127.0.0.1:8000/api/buildings"
        // );
        // return response.data;
        return apiClient.get("/buildings");
    }
    public async apiGetBuilding(id:string): Promise<Building[]> {
        return apiClient.get(`/buildings/${id}`);
    }

public async addBuilding(building: Building): Promise<Building> {

    // const res = await axios.post(
    //     "http://127.0.0.1:8000/api/buildings",
    //     building
    // );
    // return res.data;
    return apiClient.post("/buildings", building);
}
public async destroyBuilding(id: string): Promise<void> {
    return apiClient.delete<void>(`/buildings/${id}`);


        // const res = await axios.delete(
        //     "http://127.0.0.1:8000/api/buildings/"+id,
        // );


        //return res.data;
    }
  /*public async addBuilding(buildings: Building[]): Promise<void> {
      this._buildings = structuredClone(buildings);
*/
    public async updateBuilding(building: Building): Promise<void> {
        // const res = await axios.patch(
        //     "http://127.0.0.1:8000/api/buildings/"+building.id,building
        // );
        // return res.data;
        return apiClient.patch(`/buildings/${building.id}`, building);
    }
// ── Clients ──────────────────────────────────────────────────────────────────

public async apiGetClients(): Promise<Client[]> {
  const ok = <T>(value: T): Promise<T> => Promise.resolve(structuredClone(value));
  return ok(this._clients);
}

public async apiCreateClient(client: Client): Promise<Client> {
  const ok = <T>(value: T): Promise<T> => Promise.resolve(structuredClone(value));
  this._clients = [...this._clients, structuredClone(client)];
  return ok(client);
}

public async apiUpdateClient(client: Client): Promise<Client> {
  const ok = <T>(value: T): Promise<T> => Promise.resolve(structuredClone(value));
  this._clients = this._clients.map(c => (c.id === client.id ? structuredClone(client) : c));
  return ok(client);
}

public async apiDeleteClient(id: string): Promise<void> {
  this._clients = this._clients.filter(c => c.id !== id);
  // Cascade — backend would handle this via FK constraint
  this._selections = this._selections.filter(s => s.clientId !== id);
}

// ── Selections ───────────────────────────────────────────────────────────────

public async apiGetSelections(): Promise<ClientSelection[]> {
  const ok = <T>(value: T): Promise<T> => Promise.resolve(structuredClone(value));
  return ok(this._selections);
}

public async apiCreateSelection(sel: ClientSelection): Promise<ClientSelection> {
  const ok = <T>(value: T): Promise<T> => Promise.resolve(structuredClone(value));
  this._selections = [...this._selections, structuredClone(sel)];
  return ok(sel);
}

public async apiUpdateSelection(sel: ClientSelection): Promise<ClientSelection> {
  const ok = <T>(value: T): Promise<T> => Promise.resolve(structuredClone(value));
  this._selections = this._selections.map(s => (s.id === sel.id ? structuredClone(sel) : s));
  return ok(sel);
}

public async apiDeleteSelection(id: string): Promise<void> {
  this._selections = this._selections.filter(s => s.id !== id);
}
}

const _api = new BuildingApi();
export const apiGetBuildings = () => _api.apiGetBuildings();
export const apiGetBuilding=(id: string) => _api.apiGetBuilding(id);
export const addBuilding = (building: Building) => _api.addBuilding(building);
export const destroyBuilding = (id: string) => _api.destroyBuilding(id);
export const updateBuilding = (building: Building) => _api.updateBuilding(building);

export const apiGetClients = () => _api.apiGetClients();
export const apiCreateClient = (client: Client) => _api.apiCreateClient(client);
export const apiUpdateClient = (client: Client) => _api.apiUpdateClient(client);
export const apiDeleteClient = (id: string) => _api.apiDeleteClient(id);

export const apiGetSelections = () => _api.apiGetSelections();
export const apiCreateSelection = (sel: ClientSelection) => _api.apiCreateSelection(sel);
export const apiUpdateSelection = (sel: ClientSelection) => _api.apiUpdateSelection(sel);
export const apiDeleteSelection = (id: string) => _api.apiDeleteSelection(id);
