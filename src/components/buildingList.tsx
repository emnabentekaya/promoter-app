//import React from 'react';
import { Building2, Plus, MapPin} from 'lucide-react';
import type { BuildingListProps } from '../models/buildingListProp.ts';

function BuildingList({ buildings, onAdd, onSelect/*, onStartSelection, onBrowseCatalog, onGoToClients */}: BuildingListProps) {
  //const totalApts = buildings.reduce((a, b) => a + b.apartments.length, 0);
    const totalApts =0;
    return (
    <div className="page-pad" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          {/*<p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#38a9b8', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Espace architecte</p>*/}
          <h1 className="serif page-heading">Mes projets immobiliers</h1>
          <p style={{ color: '#6B6358', margin: '8px 0 0', fontSize: 15 }}>{buildings.length} projet {buildings.length > 1 ? 's' : ''} · {totalApts} bien{totalApts > 1 ? 's' : ''}</p>
        </div>
        {/*<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={onBrowseCatalog}><Search size={16} /> Explorer le catalogue</button>
          <button className="btn-secondary" onClick={onStartSelection}><Sparkles size={16} /> Sélection client</button>
          <button className="btn-secondary" onClick={onGoToClients}><Users size={16} /> Clients</button>
          <button className="btn-primary" onClick={onAdd}><Plus size={18} /> Nouvel immeuble</button>
        </div>*/}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {buildings.map(b => {
          //const nbApt = b.apartments.filter(a => a.propertyType === 'appartement').length;
          //const nbDuplex = b.apartments.filter(a => a.propertyType === 'duplex').length;
          //const nbTriplex = b.apartments.filter(a => a.propertyType === 'triplex').length;
          const nbApt = 0;
          const nbDuplex = 0;
          const nbTriplex = 0;
          return (
            <div key={b.id} className="card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden', marginBottom: 0 }} onClick={() => onSelect(b.id)}>
              <div style={{ height: 160, background: 'linear-gradient(135deg, #E8DFD0 0%, #D9CFC0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={48} color="#38a9b8" strokeWidth={1.2} />
              </div>
              <div style={{ padding: 20 }}>
                <h3 className="serif" style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 500 }}>{b.name}</h3>
                <p style={{ margin: 0, color: '#6B6358', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} /> {b.city}, {b.neighborhood}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, fontSize: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {nbApt > 0 && <span className="type-badge appartement">{nbApt} appart.</span>}
                  {nbDuplex > 0 && <span className="type-badge duplex">{nbDuplex} duplex</span>}
                  {nbTriplex > 0 && <span className="type-badge triplex">{nbTriplex} triplex</span>}
                  <span style={{ marginLeft: 'auto', color: '#6B6358', fontSize: 13 }}>
                    {b.immediateHandover ? 'Livraison immédiate' : ''}
                    {b.handoverMonth && b.handoverYear
                      ? `${b.handoverMonth}/${b.handoverYear}`
                      : ''}
                    
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', minHeight: 280, border: '2px dashed #D9CFC0', background: 'transparent', marginBottom: 0 }} /*onClick={onAdd}*/ onClick={onAdd}>
          <Plus size={32} color="#38a9b8" />
          <p style={{ margin: '12px 0 0', color: '#6B6358', fontSize: 14 }}>Ajouter un nouveau projet</p>
        </div>
      </div>
    </div>
  );
}
export default BuildingList