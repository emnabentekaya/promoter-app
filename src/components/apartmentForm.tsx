import React, { useState, useEffect, useRef } from 'react';
import { Home, Bath, Utensils,TreePine, DoorOpen,ImageIcon, Save,Upload, Copy,Sofa,FileText, Bed,ArrowLeft,Layers, Check, Loader } from 'lucide-react';
import type { ApartmentFormProps } from '../models/apartmentFormProps.ts';
import type { RoomEditorProps } from '../models/roomEditorProps.ts';
import type { Apartment, Kitchen, Piece, Room, SalleDeBain } from '../models/apartment.ts';
//import { emptyApartment,emptyRoom,emptySalleDeBain } from '../factory/factory.ts';
//import {Factory} from '../factory/factory.ts';
import { TYPOLOGIES, ORIENTATIONS } from '../constants.ts';
import {_factory} from '../factory/factory.ts';
import {emptyApartment} from '../factory/factory.ts';
import { calculatePriceFromGrid, computeHappinessIndex, formatPrice, isRoomFilled, nbChambres, propertyLabel } from '../utils/helpers.ts';

function ApartmentForm({ building, initial, onSave, onCancel, onAutoSave }: ApartmentFormProps) {
  const [data, setData] = useState<Apartment>(initial || emptyApartment());
  const [replicateFloors, setReplicateFloors] = useState<number[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isFirstRender = useRef(true);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!onAutoSave) return;
    setSaveStatus('saving');
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      onAutoSave(data);
      setSaveStatus('saved');
    }, 800);
    return () => clearTimeout(autoSaveTimer.current);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Mises à jour génériques ===
  const update = <K extends keyof Apartment>(k: K, v: Apartment[K]) =>
    setData(d => ({ ...d, [k]: v }));

  const updateKitchen = (patch: Partial<Kitchen>) =>
    setData(d => ({ ...d, kitchen: { ...d.kitchen, ...patch } }));

  const updateSalon = (patch: Partial<Piece>) =>
    setData(d => ({ ...d, salon: { ...d.salon, ...patch } }));

  const updateRoom = (i: number, patch: Partial<Room>) =>
    setData(d => ({
      ...d,
      rooms: d.rooms.map((r, idx) => idx === i ? { ...r, ...patch } : r)
    }));

  const updateRoomSdb = (i: number, patch: Partial<SalleDeBain>) =>
    setData(d => ({
      ...d,
      rooms: d.rooms.map((r, idx) => idx === i ? { ...r, sdb: { ...r.sdb, ...patch } } : r)
    }));

  const updateBathRoom = (i: number, patch: Partial<SalleDeBain>) =>
    setData(d => ({
      ...d,
      bathRooms: d.bathRooms.map((b, idx) => idx === i ? { ...b, ...patch } : b)
    }));

  // === Synchronisation automatique nb chambres selon typologie ===
  // Quand la typologie change, on ajuste rooms[] :
  // - si plus de chambres nécessaires → on en ajoute (vides)
  // - si moins de chambres nécessaires → on enlève les dernières,
  //   mais on demande confirmation si elles sont remplies
  useEffect(() => {
    const target = nbChambres(data.typology);
    const current = data.rooms.length;
    if (target === current) return;

    if (target > current) {
      // ajouter des chambres vides
      const toAdd: Room[] = [];
      for (let i = current; i < target; i++) toAdd.push(_factory.emptyRoom(i));
      setData(d => ({ ...d, rooms: [...d.rooms, ...toAdd] }));
    } else {
      // tronquer : vérifier qu'on ne perd pas de données
      const toRemove = data.rooms.slice(target);
      const hasFilledData = toRemove.some(isRoomFilled);
      if (hasFilledData) {
        const ok = confirm(
          `La typologie ${data.typology.toUpperCase()} ne contient que ${target} chambre${target > 1 ? 's' : ''}.\n` +
          `${toRemove.length} chambre${toRemove.length > 1 ? 's' : ''} avec des données saisies sera${toRemove.length > 1 ? 'ont' : ''} supprimée${toRemove.length > 1 ? 's' : ''}.\n\n` +
          `Continuer ?`
        );
        if (!ok) {
          // revenir à la typologie précédente
          const previousTypo = TYPOLOGIES.find(t => nbChambres(t) === current);
          if (previousTypo) setData(d => ({ ...d, typology: previousTypo }));
          return;
        }
      }
      setData(d => ({ ...d, rooms: d.rooms.slice(0, target) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.typology]);

  // === Synchronisation automatique du nombre de SDB hors suites ===
  // bathRooms.length = waterPoints (l'architecte saisit "X SDB hors suites")
  useEffect(() => {
    const target = Math.max(0, data.waterPoints);
    const current = data.bathRooms.length;
    if (target === current) return;
    if (target > current) {
      const toAdd: SalleDeBain[] = [];
      for (let i = current; i < target; i++) toAdd.push(_factory.emptySalleDeBain(`SDB ${i + 1}`));
      setData(d => ({ ...d, bathRooms: [...d.bathRooms, ...toAdd] }));
    } else {
      setData(d => ({ ...d, bathRooms: d.bathRooms.slice(0, target) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.waterPoints]);

  const toggleReplicate = (floor: number) =>
    setReplicateFloors(prev => prev.includes(floor) ? prev.filter(f => f !== floor) : [...prev, floor]);

  const happiness = computeHappinessIndex(data);
  const estimatedPrice = calculatePriceFromGrid(data, building);
  const isDuplexOrTriplex = data.propertyType === 'duplex' || data.propertyType === 'triplex';

  return (
    <div className="page-pad" style={{ maxWidth: 900, margin: '0 auto' }}>
      <button className="btn-ghost" onClick={onCancel} style={{ marginBottom: 20 ,fontSize:'20px'}}>
        <ArrowLeft size={16} /> Retour à {building.name}
      </button>
      <h1 className="serif" style={{ fontSize: 36, margin: '0 0 32px', fontWeight: 500 }}>
        {initial ? `Modifier ${propertyLabel(data.propertyType).toLowerCase()}` : 'Nouveau bien'}
      </h1>

      {/* TYPE */}
      <div className="card">
        <h3 className="section-title">Type de bien</h3>
        <div className="toggle-group" style={{justifyContent: 'center'}}>
          <button className={`toggle-btn ${data.propertyType === 'appartement' ? 'active' : ''}`} onClick={() => update('propertyType', 'appartement')} style={{ padding: '12px 20px' }}>
            <Home size={16} style={{ display: 'inline', verticalAlign: -3, marginRight: 6 }} /> Appartement
          </button>
          <button className={`toggle-btn ${data.propertyType === 'duplex' ? 'active' : ''}`} onClick={() => update('propertyType', 'duplex')} style={{ padding: '12px 20px' }}>
            <Layers size={16} style={{ display: 'inline', verticalAlign: -3, marginRight: 6 }} /> Duplex
          </button>
          <button className={`toggle-btn ${data.propertyType === 'triplex' ? 'active' : ''}`} onClick={() => update('propertyType', 'triplex')} style={{ padding: '12px 20px' }}>
            <Layers size={16} style={{ display: 'inline', verticalAlign: -3, marginRight: 6 }} /> Triplex
          </button>
        </div>
      </div>
      <div className="card">
        <label className="label">Note libre</label>
        <textarea className="textarea" rows={4} value={data.freeNote} onChange={e => update('freeNote', e.target.value)} style={{ resize: 'vertical', minHeight: 100 }} />
      </div>

      {/* IDENTIFICATION */}
      <div className="card">
        <h3 className="section-title">Identification</h3>
        <div className="grid-6">
          <div><label className="label">Référence</label>
            <input className="input" value={data.reference} onChange={e => update('reference', e.target.value)} /></div>
          <div>
            <label className="label">Typologie</label>
            <select className="select" value={data.typology} onChange={e => update('typology', e.target.value)}>
              {TYPOLOGIES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
            {/*<p style={{ fontSize: 11, color: '#6B6358', margin: '6px 0 0' }}>
              {nbChambres(data.typology)} chambre{nbChambres(data.typology) !== 1 ? 's' : ''} à renseigner
            </p>*/}
          </div>
          <div>
            <label className="label">{isDuplexOrTriplex ? 'Étage du bas' : 'Étage'}</label>
            <input className="input" type="number" value={data.floor} onChange={e => update('floor', parseInt(e.target.value) || 0)} min={0} max={building.floors} />
          </div>
          <div>
            <label className="label">Prix (TND)</label>
            <input className="input" type="number" value={data.price} onChange={e => update('price', e.target.value)} placeholder="420000" />
            {estimatedPrice > 0 && estimatedPrice !== parseInt(data.price) && (
              <p style={{ fontSize: 11, color: '#38a9b8', margin: '4px 0 0', cursor: 'pointer' }} onClick={() => update('price', String(estimatedPrice))}>
                💡 Estimation : {formatPrice(estimatedPrice)} (cliquer)
              </p>
            )}
          </div>
          <div><label className="label">Surface (m²)</label>
            <input className="input" type="number" value={data.surface} onChange={e => update('surface', e.target.value)} /></div>
          <div><label className="label">Statut</label>
            <select className="select" value={data.status} onChange={e => update('status', e.target.value as Status)}>
              <option value="disponible">Disponible</option><option value="reserve">Réservé</option><option value="vendu">Vendu</option>
            </select></div>
        </div>
        </div>

        
      {/* MÉDIAS */}
      <div className="card">
        <h3 className="section-title">Plans & photos</h3>
        <div className="grid-2">
          <div><label className="label"><FileText size={13} style={{ display: 'inline', verticalAlign: -2 }} /> Plans</label>
            <div className="upload-zone"><Upload size={24} color="#38a9b8" /><p style={{ margin: '8px 0 0', fontSize: 13 }}>PDF, JPG, PNG</p></div></div>
          <div><label className="label"><ImageIcon size={13} style={{ display: 'inline', verticalAlign: -2 }} /> Photos</label>
            <div className="upload-zone"><Upload size={24} color="#38a9b8" /><p style={{ margin: '8px 0 0', fontSize: 13 }}>JPG, PNG</p></div></div>
        </div>
      </div>
      {/* CARACTÉRISTIQUES GLOBALES */}
      <div className="card">
        <h3 className="section-title">Caractéristiques générales</h3>
        <div className="grid-3">
          <div>
            <label className="label"><DoorOpen size={13} style={{ display: 'inline', verticalAlign: -2 }} /> Type d'entrée</label>
            <div className="toggle-group" style={{justifyContent: 'center'}}>
              <select className="select" value={data.gardenOrientation} onChange={e => update('gardenOrientation', e.target.value)}>
                  <option value="salon">salon</option>
                  <option value="hall">hall</option>
                </select>
            </div>
          </div>
          <div>
            <label className="label">Nombre de SDB hors suites</label>
            <input className="input" type="number" min={0} value={data.waterPoints} onChange={e => update('waterPoints', parseInt(e.target.value) || 0)} />
            {/*<p style={{ fontSize: 11, color: '#6B6358', margin: '4px 0 0' }}>Les SDB des suites parentales sont ajoutées automatiquement</p>*/}
          </div>
        <label className="checkbox-row" style={{ marginTop: 30}}>
          <input type="checkbox" checked={data.dayNightSeparation} onChange={e => update('dayNightSeparation', e.target.checked)} />
          <Layers size={16} color="#38a9b8" /> Séparation jour / nuit</label>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
          <label className="checkbox-row">
            <input type="checkbox" checked={data.hasGarden} onChange={e => update('hasGarden', e.target.checked)} />
            <TreePine size={16} color="#38a9b8" /> Jardin
          </label>
        </div>
        {data.hasGarden && (
          <div className="sub-box">
            <h4 className="subsection-title"><TreePine size={14} /> Jardin</h4>
            <div className="grid-3">
              <div><label className="label">Surface (m²)</label>
                <input className="input" type="number" value={data.gardenSurface} onChange={e => update('gardenSurface', e.target.value)} /></div>
              <div>
                <label className="label">Orientation</label>
                <select className="select" value={data.gardenOrientation} onChange={e => update('gardenOrientation', e.target.value)}>
                  <option value="">—</option>{ORIENTATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Fonctionnel ?</label>
                <div className="toggle-group" style={{justifyContent: 'center'}}>
                  <button className={`toggle-btn ${data.gardenFunctional ? 'active' : ''}`} onClick={() => update('gardenFunctional', true)}>Oui</button>
                  <button className={`toggle-btn ${!data.gardenFunctional ? 'active' : ''}`} onClick={() => update('gardenFunctional', false)}>Non</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CUISINE */}
      <div className="card">
        <h3 className="section-title"><Utensils size={14} style={{ display: 'inline', verticalAlign: -2 }} /> Cuisine</h3>
        <div className="grid-5">
          <div>
            <label className="label">Surface (m²)</label>
            <input className="input" type="number" value={data.kitchen.surface} onChange={e => updateKitchen({ surface: e.target.value })} />
          </div>
          <div>
            <label className="label">Orientation</label>
            <select className="select" value={data.kitchen.orientation} onChange={e => updateKitchen({ orientation: e.target.value })}>
              <option value="">—</option>{ORIENTATIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="select" value={data.kitchen.kitchenType} onChange={e => updateKitchen({ kitchenType: e.target.value })}>
              <option value="">—</option>
              <option value="ouverte">Ouverte</option>
              <option value="fermee">Fermée</option>
            </select>
          </div>
          <div>
            <label className="label">Luminosité /10</label>
            <input className="input" type="number" min={0} max={10} value={data.kitchen.luminosite} onChange={e => updateKitchen({ luminosite: e.target.value })} />
            </div>
          <div>
            <label className="label">Ensoleillement /10</label>
            <input className="input" type="number" min={0} max={10} value={data.kitchen.ensoleiment} onChange={e => updateKitchen({ ensoleiment: e.target.value })} />
            </div>
        </div>
        
        <label className="checkbox-row" style={{ marginTop: 12 }}>
          <input type="checkbox" checked={data.kitchen.hasBalcony} onChange={e => updateKitchen({ hasBalcony: e.target.checked })} /> Balcon depuis la cuisine
        </label>
        {data.kitchen.hasBalcony && (
          <div className="sub-box">
            <BalconyFields
              surface={data.kitchen.balconySurface} orientation={data.kitchen.balconyOrientation} functional={data.kitchen.balconyFunctional}
              onSurface={v => updateKitchen({ balconySurface: v })}
              onOrientation={v => updateKitchen({ balconyOrientation: v })}
              onFunctional={v => updateKitchen({ balconyFunctional: v })}
            />
          </div>
        )}
      </div>

      {/* SALON */}
      <div className="card">
        <h3 className="section-title"><Sofa size={14} style={{ display: 'inline', verticalAlign: -2 }} /> Salon</h3>
        <div className="grid-4">
          <div><label className="label">Surface (m²)</label>
            <input className="input" type="number" value={data.salon.surface} onChange={e => updateSalon({ surface: e.target.value })} /></div>
          <div>
            <label className="label">Orientation</label>
            <select className="select" value={data.salon.orientation} onChange={e => updateSalon({ orientation: e.target.value })}>
              <option value="">—</option>{ORIENTATIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div><label className="label">Luminosité /10</label>
            <input className="input" type="number" min={0} max={10} value={data.salon.luminosite} onChange={e => updateSalon({ luminosite: e.target.value })} /></div>
          <div><label className="label">Ensoleillement /10</label>
            <input className="input" type="number" min={0} max={10} value={data.salon.ensoleiment} onChange={e => updateSalon({ ensoleiment: e.target.value })} /></div>
        </div>
        
        <div className="grid-2" style={{ marginTop: 12 }}> 
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
          <label className="checkbox-row">
            <input type="checkbox" checked={data.salon.hasBalcony} onChange={e => updateSalon({ hasBalcony: e.target.checked })} /> Balcon
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={data.salon.hasTerrace} onChange={e => updateSalon({ hasTerrace: e.target.checked })} /> Terrasse
          </label>
        </div>
        </div>
        {data.salon.hasBalcony && (
          <div className="sub-box">
            <BalconyFields
              surface={data.salon.balconySurface} orientation={data.salon.balconyOrientation} functional={data.salon.balconyFunctional}
              onSurface={v => updateSalon({ balconySurface: v })}
              onOrientation={v => updateSalon({ balconyOrientation: v })}
              onFunctional={v => updateSalon({ balconyFunctional: v })}
            />
          </div>
        )}
        {data.salon.hasTerrace && (
          <div className="sub-box">
            <TerraceFields
              surface={data.salon.terraceSurface} orientation={data.salon.terraceOrientation} functional={data.salon.terraceFunctional}
              onSurface={v => updateSalon({ terraceSurface: v })}
              onOrientation={v => updateSalon({ terraceOrientation: v })}
              onFunctional={v => updateSalon({ terraceFunctional: v })}
            />
          </div>
        )}
      </div>

      {/* CHAMBRES (générées dynamiquement) */}
      {data.rooms.length > 0 && (
        <div className="card">
          <h3 className="section-title"><Bed size={14} style={{ display: 'inline', verticalAlign: -2 }} /> Chambres ({data.rooms.length})</h3>
          {data.rooms.map((room, i) => (
            <RoomEditor key={i} room={room} index={i}
              onChange={(patch) => updateRoom(i, patch)}
              onSdbChange={(patch) => updateRoomSdb(i, patch)} />
          ))}
        </div>
      )}

      {/* SDB HORS SUITES */}
      {data.bathRooms.length > 0 && (
        <div className="card">
          <h3 className="section-title"><Bath size={14} style={{ display: 'inline', verticalAlign: -2 }} /> Salles de bain ({data.bathRooms.length})</h3>
          {data.bathRooms.map((sdb, i) => (
            <div key={i} className="piece-box">
              <h4 className="subsection-title"><Bath size={14} /> {sdb.name || `SDB ${i + 1}`}</h4>
              <SdbFields sdb={sdb} onChange={(patch) => updateBathRoom(i, patch)} />
            </div>
          ))}
        </div>
      )}
      {/* ÉVALUATION */}
      <div className="card">
        <h3 className="section-title">Évaluation de l'architecte</h3>
        <p style={{ fontSize: 12, color: '#6B6358', margin: '0 0 16px' }}>Notes sur 10. L'indice de bonheur global (/100) est calculé automatiquement.</p>
        <div className="grid-4">
          <div><label className="label">Circulation</label>
            <input className="input" type="number" min={0} max={10} value={data.noteCirculation} onChange={e => update('noteCirculation', e.target.value)} placeholder="/10" /></div>
          <div><label className="label">Ensoleillement</label>
            <input className="input" type="number" min={0} max={10} value={data.noteEnsoleillement} onChange={e => update('noteEnsoleillement', e.target.value)} placeholder="/10" /></div>
          <div><label className="label">Lumière</label>
            <input className="input" type="number" min={0} max={10} value={data.noteLumiere} onChange={e => update('noteLumiere', e.target.value)} placeholder="/10" /></div>
          <div><label className="label">Dimensions</label>
            <input className="input" type="number" min={0} max={10} value={data.noteDimensions} onChange={e => update('noteDimensions', e.target.value)} placeholder="/10" /></div>
        </div>
        <div style={{ marginTop: 16, padding: 16, background: '#FAF8F3', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#6B6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Indice de bonheur</p>
          <p style={{ margin: '6px 0 0', fontSize: 32, fontWeight: 600, color: '#38a9b8' }}>
            {happiness > 0 ? `${happiness} / 100` : 'Non noté'}
          </p>
        </div>
        
      </div>

      

      {/* DUPLICATION */}
      {!initial && !isDuplexOrTriplex && building.floors > 1 && (
        <div className="card" style={{ background: '#F5EFE3', borderColor: '#E2D5BD' }}>
          <h3 className="section-title" style={{ color: '#1F1B17' }}><Copy size={14} style={{ display: 'inline', verticalAlign: -2 }} /> Dupliquer sur d'autres étages</h3>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6B6358' }}>Si ce bien est un "type" répété sur plusieurs étages, cochez les étages identiques.</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Array.from({ length: building.floors }, (_, i) => i + 1).filter(f => f !== data.floor).map(f => (
              <button key={f} className={`toggle-btn ${replicateFloors.includes(f) ? 'active' : ''}`} onClick={() => toggleReplicate(f)}>Étage {f}</button>
            ))}
          </div>
          {replicateFloors.length > 0 && (
            <p style={{ margin: '12px 0 0', fontSize: 13, color: '#38a9b8' }}>+ {replicateFloors.length} bien{replicateFloors.length > 1 ? 's' : ''} sera créé{replicateFloors.length > 1 ? 's' : ''}</p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        {onAutoSave ? (
          <span style={{ fontSize: 13, color: saveStatus === 'saved' ? '#059669' : saveStatus === 'saving' ? '#38a9b8' : '#6B6358', display: 'flex', alignItems: 'center', gap: 6 }}>
            {saveStatus === 'saving' && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
            {saveStatus === 'saved'  && <Check size={13} />}
            {saveStatus === 'saving' ? 'Sauvegarde…' : saveStatus === 'saved' ? 'Sauvegardé' : ''}
          </span>
        ) : <span />}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" onClick={onCancel}>{onAutoSave ? 'Fermer' : 'Annuler'}</button>
          {!onAutoSave && (
            <button className="btn-primary" onClick={() => onSave(data, replicateFloors)}>
              <Save size={16} /> {initial ? 'Enregistrer' : 'Créer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


function RoomEditor({ room, index, onChange, onSdbChange }: RoomEditorProps) {
  return (
    <div className="piece-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 className="subsection-title" style={{ margin: 0 }}>
          <Bed size={14} /> {room.isSuite ? 'Suite parentale' : `Chambre ${index + 1}`}
        </h4>
        <label className="checkbox-row" style={{ padding: 0 }}>
          <input type="checkbox" checked={room.isSuite} onChange={e => onChange({ isSuite: e.target.checked })} />
          Suite parentale ?
        </label>
      </div>

      <div className="grid-5">
        <div>
          <label className="label">Libellé</label>
          <input className="input" value={room.name} onChange={e => onChange({ name: e.target.value })} placeholder={room.isSuite ? 'Suite parentale' : `Chambre ${index + 1}`} />
        </div>
        <div>
          <label className="label">Surface (m²)</label>
          <input className="input" type="number" value={room.surface} onChange={e => onChange({ surface: e.target.value })} />
        </div>
        <div>
          <label className="label">Orientation</label>
          <select className="select" value={room.orientation} onChange={e => onChange({ orientation: e.target.value })}>
            <option value="">—</option>{ORIENTATIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div><label className="label">Luminosité </label>
          <input className="input" type="number" min={0} max={10} value={room.luminosite} onChange={e => onChange({ luminosite: e.target.value })} /></div>
        <div><label className="label">Ensoleillement </label>
          <input className="input" type="number" min={0} max={10} value={room.ensoleiment} onChange={e => onChange({ ensoleiment: e.target.value })} /></div>
      </div>

      <div className="grid-2" style={{ marginTop: 12 }}>
        
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
        <label className="checkbox-row">
          <input type="checkbox" checked={room.hasDressing} onChange={e => onChange({ hasDressing: e.target.checked })} /> Dressing
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={room.hasBalcony} onChange={e => onChange({ hasBalcony: e.target.checked })} /> Balcon
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={room.hasTerrace} onChange={e => onChange({ hasTerrace: e.target.checked })} /> Terrasse
        </label>
      </div>

      {room.hasBalcony && (
        <div className="sub-box">
          <BalconyFields
            surface={room.balconySurface} orientation={room.balconyOrientation} functional={room.balconyFunctional}
            onSurface={v => onChange({ balconySurface: v })}
            onOrientation={v => onChange({ balconyOrientation: v })}
            onFunctional={v => onChange({ balconyFunctional: v })}
          />
        </div>
      )}

      {room.hasTerrace && (
        <div className="sub-box">
          <TerraceFields
            surface={room.terraceSurface} orientation={room.terraceOrientation} functional={room.terraceFunctional}
            onSurface={v => onChange({ terraceSurface: v })}
            onOrientation={v => onChange({ terraceOrientation: v })}
            onFunctional={v => onChange({ terraceFunctional: v })}
          />
        </div>
      )}

      {room.isSuite && (
        <div className="sub-box">
          <h4 className="subsection-title"><Bath size={14} /> Salle de bain de la suite</h4>
          <SdbFields sdb={room.sdb} onChange={onSdbChange} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS (fields réutilisables)
// ============================================================================

interface BalconyFieldsProps {
  surface: string; orientation: string; functional: boolean;
  onSurface: (v: string) => void;
  onOrientation: (v: string) => void;
  onFunctional: (v: boolean) => void;
}

function BalconyFields({ surface, orientation, functional, onSurface, onOrientation, onFunctional }: BalconyFieldsProps) {
  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#38a9b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Balcon</p>
      <div className="grid-3">
        <div><label className="label">Surface (m²)</label>
          <input className="input" type="number" value={surface} onChange={e => onSurface(e.target.value)} /></div>
        <div>
          <label className="label">Orientation</label>
          <select className="select" value={orientation} onChange={e => onOrientation(e.target.value)}>
            <option value="">—</option>{ORIENTATIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Fonctionnel ?</label>
          <div className="toggle-group" style={{justifyContent: 'center'}}>
            <button className={`toggle-btn ${functional ? 'active' : ''}`} onClick={() => onFunctional(true)}>Oui</button>
            <button className={`toggle-btn ${!functional ? 'active' : ''}`} onClick={() => onFunctional(false)}>Non</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerraceFields({ surface, orientation, functional, onSurface, onOrientation, onFunctional }: BalconyFieldsProps) {
  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#38a9b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Terrasse</p>
      <div className="grid-3">
        <div><label className="label">Surface (m²)</label>
          <input className="input" type="number" value={surface} onChange={e => onSurface(e.target.value)} /></div>
        <div>
          <label className="label">Orientation</label>
          <select className="select" value={orientation} onChange={e => onOrientation(e.target.value)}>
            <option value="">—</option>{ORIENTATIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Fonctionnelle ?</label>
          <div className="toggle-group" style={{justifyContent: 'center'}}>
            <button className={`toggle-btn ${functional ? 'active' : ''}`} onClick={() => onFunctional(true)}>Oui</button>
            <button className={`toggle-btn ${!functional ? 'active' : ''}`} onClick={() => onFunctional(false)}>Non</button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SdbFieldsProps {
  sdb: SalleDeBain;
  onChange: (patch: Partial<SalleDeBain>) => void;
}

function SdbFields({ sdb, onChange }: SdbFieldsProps) {
  return (
    <div>
      <div className="grid-5">
        <div>
          <label className="label">Libellé</label>
          <input className="input" value={sdb.name} onChange={e => onChange({ name: e.target.value })} />
          </div>
        <div><label className="label">Surface (m²)</label>
          <input className="input" type="number" value={sdb.surface} onChange={e => onChange({ surface: e.target.value })} />
          </div>
          <div>
          <label className="label">Aération</label>
          <select className="select" value={sdb.aerationType} onChange={e => onChange({ aerationType: e.target.value })}>
            <option value="naturelle">Naturelle</option>
            <option value="mecanique">Mécanique</option>
          </select>
        </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 30 }}>
          <label className="checkbox-row">
          <input type="checkbox" checked={sdb.hasBathtub} onChange={e => onChange({ hasBathtub: e.target.checked })} /> Baignoire
        </label>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 30 }}>
        <label className="checkbox-row">
          <input type="checkbox" checked={sdb.hasShower} onChange={e => onChange({ hasShower: e.target.checked })} /> Douche
        </label>
        </div>
        
      </div>
    </div>
  );
}
export default ApartmentForm

