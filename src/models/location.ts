export interface RawLocation {
  id: number;
  level: 1 | 2 | 3;
  name: string;
  use: boolean;
}

export interface LocationIndex {
  governorates: string[];                              // niveaux 1
  citiesByGovernorate: Record<string, string[]>;       // gov → villes
  neighborhoodsByCity: Record<string, string[]>;       // ville → quartiers
  // Pour la cohérence inverse
  governorateOfCity: Record<string, string>;
  cityOfNeighborhood: Record<string, string>;
  governorateOfNeighborhood: Record<string, string>;
}