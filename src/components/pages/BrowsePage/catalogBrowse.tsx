import { useMemo } from 'react';
import { Home, Layers, MapPin, ArrowLeft, Filter, Search, Sparkles, UserPlus } from 'lucide-react';
import type { CatalogBrowseProps } from '../../../models/catalogBrowseProps.ts';
import type { ClientCriteria, PropertyType } from '../../../models/clientCriteria.ts';
import { matchApartments } from '../../../services/matchAppartmentService.ts';
import { propertyLabel, formatPrice, formatFloor, nbWaterPoints, nbSuites } from '../../../utils/helpers.ts';
import { LOCATIONS, TYPOLOGIES } from '../../../constants.ts';
import { emptyCriteria } from '../../../factory/factory.ts';
import '../../../App.css';

import "./BrowsePage.css";
function CatalogBrowse({ buildings, criteria, setCriteria, onBack, onEditApartment, onConvertToClientSelection, onAddToClient }: CatalogBrowseProps) {
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
  const matches = useMemo(() => matchApartments(buildings, criteria), [buildings, criteria]);
  const activeFilters = [criteria.propertyTypes.length, criteria.budgetMin ? 1 : 0, criteria.budgetMax ? 1 : 0, criteria.governorates.length, criteria.cities.length, criteria.neighborhoods.length, criteria.typologies.length, criteria.floors.length, criteria.surfaceMin ? 1 : 0, criteria.surfaceMax ? 1 : 0, criteria.needsParentalSuite ? 1 : 0, criteria.needsTerrace ? 1 : 0, criteria.needsFunctionalTerrace ? 1 : 0, criteria.needsGarden ? 1 : 0, criteria.needsDayNightSeparation ? 1 : 0, criteria.kitchenType !== 'any' ? 1 : 0, criteria.entranceType !== 'any' ? 1 : 0, criteria.minHappinessIndex > 0 ? 1 : 0].reduce((a, b) => a + b, 0);

  return (
    <div className="page-pad" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 20 ,fontSize:'20px'}}><ArrowLeft size={16} /> Retour aux projets</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#38a9b8', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}><Search size={12} style={{ display: 'inline', verticalAlign: -1 }} /> Exploration</p>
          <h1 className="serif page-heading" style={{ margin: '8px 0 8px' }}>
            {matches.length} bien{matches.length > 1 ? 's' : ''} {activeFilters > 0 ? `(${activeFilters} filtre${activeFilters > 1 ? 's' : ''})` : 'au total'}
          </h1>
        </div>
        {matches.length > 0 && <button className="btn-primary" onClick={onConvertToClientSelection}><Sparkles size={16} /> Convertir en sélection client</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'flex-start' }} className="catalog-layout">
        <style>{`@media (max-width: 900px) { .catalog-layout { grid-template-columns: 1fr !important; } } @media (max-width: 900px) { .catalog-filter-sticky { position: static !important; } }`}</style>
        <div className="catalog-filter-sticky" style={{ position: 'sticky', top: 20 }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Filter size={15} /> Filtres</h3>
              {activeFilters > 0 && <button className="btn-ghost" onClick={() => setCriteria(emptyCriteria())} style={{ fontSize: 12 }}>Réinitialiser</button>}
            </div>
            <div style={{ marginBottom: 16 }}><label className="label">Type</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['appartement', 'duplex', 'triplex'] as PropertyType[]).map(t => <button key={t} className={`chip ${criteria.propertyTypes.includes(t) ? 'active' : ''}`} onClick={() => toggleInArray('propertyTypes', t)} style={{ fontSize: 12, padding: '5px 10px' }}>{propertyLabel(t)}</button>)}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}><label className="label">Budget</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="input" type="number" value={criteria.budgetMin} onChange={e => update('budgetMin', e.target.value)} placeholder="Min" style={{ padding: '8px 10px', fontSize: 13 }} />
                <input className="input" type="number" value={criteria.budgetMax} onChange={e => update('budgetMax', e.target.value)} placeholder="Max" style={{ padding: '8px 10px', fontSize: 13 }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}><label className="label">Surface</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="input" type="number" value={criteria.surfaceMin} onChange={e => update('surfaceMin', e.target.value)} placeholder="Min" style={{ padding: '8px 10px', fontSize: 13 }} />
                <input className="input" type="number" value={criteria.surfaceMax} onChange={e => update('surfaceMax', e.target.value)} placeholder="Max" style={{ padding: '8px 10px', fontSize: 13 }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}><label className="label">Typologie</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TYPOLOGIES.map(t => <button key={t} className={`chip ${criteria.typologies.includes(t) ? 'active' : ''}`} onClick={() => toggleInArray('typologies', t)} style={{ fontSize: 12, padding: '5px 10px' }}>{t}</button>)}
              </div>
            </div>
            {govs.length > 0 && <div style={{ marginBottom: 16 }}><label className="label">Gouvernorats</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {govs.map(g => <button key={g} className={`chip ${criteria.governorates.includes(g) ? 'active' : ''}`} onClick={() => toggleInArray('governorates', g)} style={{ fontSize: 12, padding: '5px 10px' }}>{g}</button>)}
              </div>
            </div>}
            {cities.length > 0 && <div style={{ marginBottom: 16 }}><label className="label">Villes</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {cities.map(c => <button key={c} className={`chip ${criteria.cities.includes(c) ? 'active' : ''}`} onClick={() => toggleInArray('cities', c)} style={{ fontSize: 12, padding: '5px 10px' }}>{c}</button>)}
              </div>
            </div>}
            {hoods.length > 0 && <div style={{ marginBottom: 16 }}><label className="label">Quartiers</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {hoods.map(n => <button key={n} className={`chip ${criteria.neighborhoods.includes(n) ? 'active' : ''}`} onClick={() => toggleInArray('neighborhoods', n)} style={{ fontSize: 12, padding: '5px 10px' }}>{n}</button>)}
              </div>
            </div>}
            {availableFloors.length > 0 && <div style={{ marginBottom: 16 }}><label className="label">Étage</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {availableFloors.map(f => (
                  <button key={f} className={`chip ${criteria.floors.includes(f) ? 'active' : ''}`} onClick={() => toggleFloor(f)} style={{ fontSize: 12, padding: '5px 10px' }}>
                    Étage {f}
                  </button>
                ))}
              </div>
            </div>}
            <div style={{ marginBottom: 16, paddingTop: 12, borderTop: '1px solid #E8DFD0' }}>
              <label className="label">Caractéristiques</label>
              <label className="checkbox-row" style={{ padding: '4px 0', fontSize: 13 }}><input type="checkbox" checked={criteria.needsParentalSuite} onChange={e => update('needsParentalSuite', e.target.checked)} /> Suite parentale</label>
              <label className="checkbox-row" style={{ padding: '4px 0', fontSize: 13 }}><input type="checkbox" checked={criteria.needsTerrace} onChange={e => update('needsTerrace', e.target.checked)} /> Terrasse</label>
              <label className="checkbox-row" style={{ padding: '4px 0', fontSize: 13 }}><input type="checkbox" checked={criteria.needsFunctionalTerrace} onChange={e => update('needsFunctionalTerrace', e.target.checked)} /> Terrasse fonctionnelle</label>
              <label className="checkbox-row" style={{ padding: '4px 0', fontSize: 13 }}><input type="checkbox" checked={criteria.needsGarden} onChange={e => update('needsGarden', e.target.checked)} /> Jardin</label>
              <label className="checkbox-row" style={{ padding: '4px 0', fontSize: 13 }}><input type="checkbox" checked={criteria.needsDayNightSeparation} onChange={e => update('needsDayNightSeparation', e.target.checked)} /> Sép. jour/nuit</label>
              <label className="checkbox-row" style={{ padding: '4px 0', fontSize: 13 }}><input type="checkbox" checked={criteria.onlyAvailable} onChange={e => update('onlyAvailable', e.target.checked)} /> Disponibles</label>
            </div>
            <div style={{ marginBottom: 12 }}><label className="label">Cuisine</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className={`toggle-btn ${criteria.kitchenType === 'any' ? 'active' : ''}`} onClick={() => update('kitchenType', 'any')} style={{ padding: '6px 10px', fontSize: 12, flex: 1 }}>Toute</button>
                <button className={`toggle-btn ${criteria.kitchenType === 'ouverte' ? 'active' : ''}`} onClick={() => update('kitchenType', 'ouverte')} style={{ padding: '6px 10px', fontSize: 12, flex: 1 }}>Ouverte</button>
                <button className={`toggle-btn ${criteria.kitchenType === 'fermee' ? 'active' : ''}`} onClick={() => update('kitchenType', 'fermee')} style={{ padding: '6px 10px', fontSize: 12, flex: 1 }}>Fermée</button>
              </div>
            </div>
            <div><label className="label">Bonheur min /100</label>
              <input className="input" type="number" min={0} max={100} value={criteria.minHappinessIndex} onChange={e => update('minHappinessIndex', parseInt(e.target.value) || 0)} placeholder="70" style={{ padding: '8px 10px', fontSize: 13 }} />
            </div>
          </div>
        </div>
        <div>
          {matches.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <Filter size={36} color="#38a9b8" style={{ opacity: 0.5 }} />
              <p style={{ margin: '16px 0 0', color: '#6B6358' }}>Aucun bien ne correspond.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {matches.map(m => (
                <div key={m.apartment.id} className="result-card" style={{ position: 'relative', border: '1px solid #E8DFD0', cursor: 'pointer' }} onClick={() => onEditApartment(m.building.id, m.apartment.id)}>
                  <div style={{ height: 120, background: 'linear-gradient(135deg, #FAF8F3 0%, #E8DFD0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {m.apartment.propertyType !== 'appartement' ? <Layers size={36} color="#38a9b8" strokeWidth={1.2} /> : <Home size={36} color="#38a9b8" strokeWidth={1.2} />}
                    <span className={`type-badge ${m.apartment.propertyType}`} style={{ position: 'absolute', top: 10, left: 10 }}>{propertyLabel(m.apartment.propertyType)}</span>
                    <span className="pill" style={{ position: 'absolute', top: 10, right: 10, background: m.apartment.status === 'disponible' ? '#E1F5EE' : m.apartment.status === 'reserve' ? '#FAEEDA' : '#FCEBEB', color: m.apartment.status === 'disponible' ? '#085041' : m.apartment.status === 'reserve' ? '#633806' : '#791F1F', fontSize: 11 }}>
                      {m.apartment.status === 'disponible' ? 'Dispo.' : m.apartment.status === 'reserve' ? 'Réservé' : 'Vendu'}
                    </span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div className="grid-3" style={{ margin: 0, fontSize: 11, color: '#38a9b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  <div >{m.apartment.typology}</div>
                  <div>{nbWaterPoints(m.apartment)} pts d'eau</div>
                  <div>{nbSuites(m.apartment)} suite(s)</div>
                  </div>
                    <h3 className="serif" style={{ margin: '3px 0 0', fontSize: 17, fontWeight: 500 }}>{m.building.name}</h3>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6B6358' }}>Réf. {m.apartment.reference} · {formatFloor(m.apartment)}</p>
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6B6358', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={11} /> {m.building.city}, {m.building.neighborhood}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #E8DFD0' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{formatPrice(m.apartment.price)}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#6B6358' }}>{m.apartment.surface} m²</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {m.happiness > 0 && <div style={{ fontSize: 12, color: '#38a9b8', fontWeight: 600 }}>{m.happiness}/100</div>}
                        <button
                          onClick={e => { e.stopPropagation(); onAddToClient(m.building.id, m.apartment.id); }}
                          title="Ajouter à la sélection d'un client"
                          style={{ background: '#F0EBE0', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6B6358', fontWeight: 500 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#38a9b8'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#F0EBE0'; e.currentTarget.style.color = '#6B6358'; }}
                        >
                          <UserPlus size={12} /> Client
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default CatalogBrowse