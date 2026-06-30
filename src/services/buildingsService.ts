import { apiGetBuildings, addBuilding } from '../api/buildingApi.ts';
import type { Building } from '../models/building.ts';

export const loadBuildings = (): Promise<Building[]> => apiGetBuildings();
export const saveBuildings = (building: Building): Promise<void> => addBuilding(building);
