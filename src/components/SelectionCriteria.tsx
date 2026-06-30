import { useMemo } from 'react';
import { Check,ArrowLeft,Sparkles,Search } from 'lucide-react';
import type { SelectionCriteriaProps } from '../models/selectionCriteriaProps.ts';
import type { ClientCriteria, PropertyType } from '../models/clientCriteria.ts';
import { matchApartments } from '../services/matchAppartmentService.ts';
import { LOCATIONS, TYPOLOGIES } from '../constants.ts';
import { propertyLabel } from '../utils/helpers.ts';


function SelectionCriteria({ buildings, criteria, setCriteria, onSubmit, onCancel }: SelectionCriteriaProps) {
  const update = <K extends keyof ClientCriteria>(k: K, v: ClientCriteria[K]) => setCriteria(c => ({ ...c, [k]: v }));
  type ArrKey = 'governorates' | 'cities' | 'neighborhoods' | 'typologies' | 'propertyTypes';
  const toggleInArray = (k: ArrKey, value: string) => {
    const arr = criteria[k] as string[];
    update(k, (arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]) as ClientCriteria[ArrKey]);
  };
  const toggleFloor = (floor: number) => {
    update('floors', criteria.floors.includes(floor) ? criteria.floors.filter(f => f !== floor) : [...criteria.floors, floor]);
  };
  const availableFloors = [...new Set(buildings.flatMap(b => b.apartments.map(a => a.floor)))].sort((a, b) => a - b);

  const govs = LOCATIONS.governorates;
  const cities = criteria.governorates.length > 0
    ? criteria.governorates.flatMap(g => LOCATIONS.citiesByGovernorate[g] ?? []).sort((a, b) => a.localeCompare(b, 'fr'))
    : [];
  const hoods = criteria.cities.length > 0
    ? criteria.cities.flatMap(c => LOCATIONS.neighborhoodsByCity[c] ?? []).sort((a, b) => a.localeCompare(b, 'fr'))
    : [];

  const matchCount = useMemo(() => matchApartments(buildings, criteria).length, [buildings, criteria]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
      <button className="btn-ghost" onClick={onCancel} style={{ marginBottom: 20 ,fontSize:'20px'}}>
        <ArrowLeft size={16} /> Retour aux projets
      </button>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#38a9b8', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>
          <Sparkles size={12} style={{ display: 'inline', verticalAlign: -1 }} /> Sélection personnalisée
        </p>
        <h1 className="serif" style={{ fontSize: 40, margin: '8px 0 8px', fontWeight: 500 }}>Critères du client</h1>
      </div>

      <div className="card">
        <h3 className="section-title">Informations client</h3>
        <div className="grid-3">
          <div><label className="label">Nom</label><input className="input" value={criteria.clientName} onChange={e => update('clientName', e.target.value)} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={criteria.clientEmail} onChange={e => update('clientEmail', e.target.value)} /></div>
          <div><label className="label">Contact</label><input className="input" type="tel" value={criteria.clientContact} onChange={e => update('clientContact', e.target.value)} /></div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Type de bien</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['appartement', 'duplex', 'triplex'] as PropertyType[]).map(t => (
            <button key={t} className={`chip ${criteria.propertyTypes.includes(t) ? 'active' : ''}`} onClick={() => toggleInArray('propertyTypes', t)}>
              {criteria.propertyTypes.includes(t) && <Check size={12} />} {propertyLabel(t)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Budget</h3>
        <div className="grid-2">
          <div><label className="label">Min (TND)</label><input className="input" type="number" value={criteria.budgetMin} onChange={e => update('budgetMin', e.target.value)} /></div>
          <div><label className="label">Max (TND)</label><input className="input" type="number" value={criteria.budgetMax} onChange={e => update('budgetMax', e.target.value)} /></div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Localisation</h3>
        <div style={{ marginBottom: 16 }}><label className="label">Gouvernorats</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {govs.map(g => <button key={g} className={`chip ${criteria.governorates.includes(g) ? 'active' : ''}`} onClick={() => toggleInArray('governorates', g)}>{g}</button>)}
          </div></div>
        <div style={{ marginBottom: 16 }}><label className="label">Villes</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cities.length === 0
              ? <span style={{ fontSize: 13, color: '#A09890', fontStyle: 'italic' }}>Sélectionnez un gouvernorat pour afficher les villes</span>
              : cities.map(c => <button key={c} className={`chip ${criteria.cities.includes(c) ? 'active' : ''}`} onClick={() => toggleInArray('cities', c)}>{c}</button>)}
          </div></div>
        <div><label className="label">Quartiers</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {hoods.length === 0
              ? <span style={{ fontSize: 13, color: '#A09890', fontStyle: 'italic' }}>Sélectionnez une ville pour afficher les quartiers</span>
              : hoods.map(n => <button key={n} className={`chip ${criteria.neighborhoods.includes(n) ? 'active' : ''}`} onClick={() => toggleInArray('neighborhoods', n)}>{n}</button>)}
          </div></div>
      </div>

      {availableFloors.length > 0 && (
        <div className="card">
          <h3 className="section-title">Étage</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {availableFloors.map(f => (
              <button key={f} className={`chip ${criteria.floors.includes(f) ? 'active' : ''}`} onClick={() => toggleFloor(f)}>
                {criteria.floors.includes(f) && <Check size={12} />} Étage {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="section-title">Typologie & surface</h3>
        <div style={{ marginBottom: 20 }}><label className="label">Typologies</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPOLOGIES.map(t => <button key={t} className={`chip ${criteria.typologies.includes(t) ? 'active' : ''}`} onClick={() => toggleInArray('typologies', t)}>{t}</button>)}
          </div></div>
        <div className="grid-2">
          <div><label className="label">Surface min (m²)</label><input className="input" type="number" value={criteria.surfaceMin} onChange={e => update('surfaceMin', e.target.value)} /></div>
          <div><label className="label">Surface max (m²)</label><input className="input" type="number" value={criteria.surfaceMax} onChange={e => update('surfaceMax', e.target.value)} /></div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Caractéristiques requises</h3>
        <div className="grid-2">
          <label className="checkbox-row"><input type="checkbox" checked={criteria.needsParentalSuite} onChange={e => update('needsParentalSuite', e.target.checked)} /> Suite parentale</label>
          <label className="checkbox-row"><input type="checkbox" checked={criteria.needsGarden} onChange={e => update('needsGarden', e.target.checked)} /> Jardin</label>
          <label className="checkbox-row"><input type="checkbox" checked={criteria.needsTerrace} onChange={e => update('needsTerrace', e.target.checked)} /> Terrasse</label>
          <label className="checkbox-row"><input type="checkbox" checked={criteria.needsFunctionalTerrace} onChange={e => update('needsFunctionalTerrace', e.target.checked)} /> Terrasse fonctionnelle</label>
          <label className="checkbox-row"><input type="checkbox" checked={criteria.needsDayNightSeparation} onChange={e => update('needsDayNightSeparation', e.target.checked)} /> Séparation jour/nuit</label>
          <label className="checkbox-row"><input type="checkbox" checked={criteria.onlyAvailable} onChange={e => update('onlyAvailable', e.target.checked)} /> Disponibles uniquement</label>
        </div>
        <div className="grid-2" style={{ marginTop: 20 }}>
          <div><label className="label">Cuisine</label>
            <div className="toggle-group" style={{justifyContent: 'center'}}>
              <button className={`toggle-btn ${criteria.kitchenType === 'any' ? 'active' : ''}`} onClick={() => update('kitchenType', 'any')}>Peu importe</button>
              <button className={`toggle-btn ${criteria.kitchenType === 'ouverte' ? 'active' : ''}`} onClick={() => update('kitchenType', 'ouverte')}>Ouverte</button>
              <button className={`toggle-btn ${criteria.kitchenType === 'fermee' ? 'active' : ''}`} onClick={() => update('kitchenType', 'fermee')}>Fermée</button>
            </div></div>
          <div><label className="label">Entrée</label>
            <div className="toggle-group" style={{justifyContent: 'center'}}>
              <button className={`toggle-btn ${criteria.entranceType === 'any' ? 'active' : ''}`} onClick={() => update('entranceType', 'any')}>Peu importe</button>
              <button className={`toggle-btn ${criteria.entranceType === 'hall' ? 'active' : ''}`} onClick={() => update('entranceType', 'hall')}>Hall</button>
              <button className={`toggle-btn ${criteria.entranceType === 'salon' ? 'active' : ''}`} onClick={() => update('entranceType', 'salon')}>Salon</button>
            </div></div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Bonheur min /100</h3>
        <input className="input" type="number" min={0} max={100} value={criteria.minHappinessIndex} onChange={e => update('minHappinessIndex', parseInt(e.target.value) || 0)} placeholder="Ex: 70" />
      </div>

      <div style={{ position: 'sticky', bottom: 16, background: 'rgba(250, 248, 243, 0.95)', backdropFilter: 'blur(8px)', padding: 16, borderRadius: 12, border: '1px solid #E8DFD0', marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, fontSize: 14, color: '#6B6358' }}>Aperçu</p>
          <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, color: matchCount > 0 ? '#1F1B17' : '#A33' }}>
            {matchCount} bien{matchCount > 1 ? 's' : ''} correspondant{matchCount > 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn-primary" onClick={onSubmit} disabled={matchCount === 0}>
            <Search size={16} /> Voir les résultats
          </button>
        </div>
      </div>
    </div>
  );
}
export default SelectionCriteria;

