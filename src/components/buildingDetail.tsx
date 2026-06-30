import /*React,*/ { useState } from 'react';
import { Plus, ArrowLeft, MapPin, Edit2, Trash2, Home,X,Filter } from 'lucide-react';
import type { BuildingDetailProps } from "../models/buildingDetailProps.ts";
import { /*getMonth,*/ formatPrice, computeHappinessIndex, propertyLabel, formatFloor, hasParentalSuite, hasTerrace, getSuites } from "../utils/helpers.ts";

function BuildingDetail({ building, onBack, onEdit, onDelete, onAddApartment, onEditApartment, onDeleteApartment }: BuildingDetailProps) {
  const [filterFloor, setFilterFloor] = useState<number | 'all'>('all');
  const [filterTypology, setFilterTypology] = useState<string>('all');
  /*const filteredApartments = building.apartments.filter(apt => {
    if (filterFloor !== 'all' && apt.floor !== filterFloor) return false;
    if (filterTypology !== 'all' && apt.typology !== filterTypology) return false;
    return true;
  });*/
  const filteredApartments = [];
  // Étages réellement présents dans cet immeuble (pour ne pas afficher d'étages vides)
  //const availableFloors = Array.from(new Set(building.apartments.map(a => a.floor))).sort((a, b) => a - b);
  //const availableTypologies = Array.from(new Set(building.apartments.map(a => a.typology))).sort();
  const availableFloors = [];
  const availableTypologies = [];
  building.apartments= [];

  return (
    <div className="page-pad" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 20 ,fontSize:'20px'}}><ArrowLeft size={16} /> Tous les projets</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', color: '#38a9b8', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>{building.developer || 'Promoteur'}</p>
          <h1 className="serif page-heading" style={{ margin: '6px 0 8px' }}>{building.name}</h1>
          <p style={{ margin: 0, color: '#6B6358', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
            <MapPin size={15} /> {building.governorate} · {building.city} · {building.neighborhood}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={onEdit}><Edit2 size={14} /> Modifier</button>
          <button className="btn-ghost" onClick={onDelete} style={{ color: '#A33' }}><Trash2 size={14} /> Supprimer</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
        {building.immediateHandover ? (
          <div className="stat"><div className="stat-label">Remise des clés</div><div className="stat-value">Immediate</div></div>
        ) : (
          <div className="stat"><div className="stat-label">Remise des clés</div><div className="stat-value">{building.handoverMonth +"  " + building.handoverYear || '—'}</div></div>
        )}
        <div className="stat">
          <div className="stat-label">Étages</div>
          <div className="stat-value">
            {building.floors ? `R+${building.floors - 1}` : '_'}
          </div>
        </div>

        {/*<div className="stat"><div className="stat-label">Biens</div><div className="stat-value">{building.apartments.length}</div></div>*/}
        <div className="stat"><div className="stat-label">Biens</div><div className="stat-value">0</div></div>
        <div className="stat"><div className="stat-label">Parking aérien</div><div className="stat-value" style={{ fontSize: 14 }}>{formatPrice(building.parkingAerialPrice)}</div></div>
        <div className="stat"><div className="stat-label">Parking sous-sol</div><div className="stat-value" style={{ fontSize: 14 }}>{formatPrice(building.parkingBasementPrice)}</div></div>
      </div>
      <div className="stat"><div className="stat-label">Note Libre</div><div className="stat-value" style={{ fontSize: 14 }}>{building.freeNote}</div></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '40px 0 20px', flexWrap: 'wrap', gap: 12 }}>
        <h2 className="serif" style={{ fontSize: 28, margin: 0, fontWeight: 500 }}>
          Biens {filteredApartments.length !== building.apartments.length && (
            <span style={{ fontSize: 16, color: '#6B6358', fontWeight: 400 }}>
              ({filteredApartments.length}/{building.apartments.length})
            </span>
          )}
        </h2>
        <button className="btn-primary" onClick={onAddApartment}><Plus size={16} /> Ajouter un bien</button>
      </div>

      {/* FILTRES */}

      {building.apartments.length > 0 && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16, padding: 16, background: '#FAF8F3', border: '1px solid #E8DFD0', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B6358', fontSize: 13 }}>
            <Filter size={14} /> Filtrer
          </div>
          <div>
            <label className="label">Étage</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className={`chip ${filterFloor === 'all' ? 'active' : ''}`} onClick={() => setFilterFloor('all')} style={{ fontSize: 12, padding: '5px 10px' }}>Tous</button>
              {availableFloors.map(f => (
                <button key={f} className={`chip ${filterFloor === f ? 'active' : ''}`} onClick={() => setFilterFloor(f)} style={{ fontSize: 12, padding: '5px 10px' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Typologie</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className={`chip ${filterTypology === 'all' ? 'active' : ''}`} onClick={() => setFilterTypology('all')} style={{ fontSize: 12, padding: '5px 10px' }}>Toutes</button>
              {availableTypologies.map(t => (
                <button key={t} className={`chip ${filterTypology === t ? 'active' : ''}`} onClick={() => setFilterTypology(t)} style={{ fontSize: 12, padding: '5px 10px' }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {(filterFloor !== 'all' || filterTypology !== 'all') && (
            <button className="btn-ghost" onClick={() => { setFilterFloor('all'); setFilterTypology('all'); }} style={{ marginLeft: 'auto' }}>
              <X size={14} /> Réinitialiser
            </button>
          )}
        </div>
      )}

      {building.apartments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Home size={36} color="#38a9b8" style={{ opacity: 0.5 }} />
          <p style={{ margin: '16px 0 0', color: '#6B6358' }}>Aucun bien enregistré.</p>
        </div>
      ) : filteredApartments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <Filter size={32} color="#38a9b8" style={{ opacity: 0.5 }} />
          <p style={{ margin: '12px 0 0', color: '#6B6358' }}>Aucun bien ne correspond aux filtres.</p>
        </div>
      ) : (
        <div>
          {filteredApartments.map(apt => {
            // ... (rendu de chaque ligne inchangé)
            const happiness = computeHappinessIndex(apt);
            return (
              <div key={apt.id} className="apt-row" onClick={() => onEditApartment(apt.id)}>
                <div style={{ width: 56, height: 56, borderRadius: 8, background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#38a9b8', fontSize: 14 }}>
                  {apt.typology.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className={`type-badge ${apt.propertyType}`}>{propertyLabel(apt.propertyType)}</span>
                    <strong style={{ fontSize: 15 }}>Réf. {apt.reference || '—'}</strong>
                    <span style={{ fontSize: 13, color: '#6B6358' }}>{formatFloor(apt)}</span>
                    <span style={{ fontSize: 13, color: '#6B6358' }}>· {apt.surface || '—'} m²</span>
                    <span className="pill" style={{ background: apt.status === 'disponible' ? '#E1F5EE' : apt.status === 'reserve' ? '#FAEEDA' : '#FCEBEB', color: apt.status === 'disponible' ? '#085041' : apt.status === 'reserve' ? '#633806' : '#791F1F' }}>
                      {apt.status === 'disponible' ? 'Disponible' : apt.status === 'reserve' ? 'Réservé' : 'Vendu'}
                    </span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: '#6B6358', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {hasParentalSuite(apt) && <span>· Suite parentale</span>}
                    {hasTerrace(apt) && <span>· Terrasse</span>}
                    {apt.hasGarden && <span>· Jardin</span>}
                    {apt.hasCellier && <span>· Cellier</span>}
                    <span>· {apt.bathRooms.length + getSuites(apt).length} SDB</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: '#1F1B17' }}>{formatPrice(apt.price)}</div>
                  {happiness > 0 && <div style={{ fontSize: 12, color: '#38a9b8', marginTop: 4, fontWeight: 600 }}>{happiness}/100</div>}
                </div>
                <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); onDeleteApartment(apt.id); }} style={{ color: '#A33' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BuildingDetail