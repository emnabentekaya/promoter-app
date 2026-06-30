import promoteursData from '../data/promoteurs.json';
import type { RawPromoteur } from '../models/promoteur.ts';

export const PROMOTEURS: RawPromoteur[] = (promoteursData as RawPromoteur[])
  .filter(p => p["Nom de société"]?.trim())
  .map(p => ({ ...p, "Nom de société": p["Nom de société"].replace(/\n/g, ' ').trim() }))
  .sort((a, b) => a["Nom de société"].localeCompare(b["Nom de société"], 'fr'));
