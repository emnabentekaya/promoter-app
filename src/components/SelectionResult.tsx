
import { useState, useMemo } from 'react';
import { Home, Layers, MapPin, Download, Check,ArrowLeft,Filter } from 'lucide-react';
import type { SelectionResultsProps } from '../models/selectionResultsProps.ts';
import { matchApartments } from '../services/matchAppartmentService.ts';
import { propertyLabel, formatPrice, formatFloor, nbWaterPoints, nbSuites } from '../utils/helpers.ts';
import generateSynthesisHTML from './generatePdf.tsx';

function SelectionResults({ buildings, criteria, onBack }: SelectionResultsProps) {
  const matches = useMemo(() => matchApartments(buildings, criteria), [buildings, criteria]);
  const [selectedIds, setSelectedIds] = useState<string[]>(matches.slice(0, Math.min(5, matches.length)).map(m => m.apartment.id));
  const toggle = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectedMatches = matches.filter(m => selectedIds.includes(m.apartment.id));

  const generatePDF = () => {
    const html = generateSynthesisHTML(criteria, selectedMatches);
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 20, fontSize: 20 }}><ArrowLeft size={20} /> Modifier les critères</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#38a9b8', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Résultats</p>
          <h1 className="serif" style={{ fontSize: 40, margin: '8px 0 8px', fontWeight: 500 }}>
            {matches.length} bien{matches.length > 1 ? 's' : ''} trouvé{matches.length > 1 ? 's' : ''}
          </h1>
          {criteria.clientName && <p style={{ color: '#6B6358', margin: 0, fontSize: 15 }}>Pour {criteria.clientName} · {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}</p>}
        </div>
        <button className="btn-primary" onClick={generatePDF} disabled={selectedIds.length === 0}>
          <Download size={16} /> Générer la synthèse PDF
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Filter size={36} color="#38a9b8" style={{ opacity: 0.5 }} />
          <p style={{ margin: '16px 0 0', color: '#6B6358' }}>Aucun bien ne correspond.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {matches.map(m => {
            const selected = selectedIds.includes(m.apartment.id);
            return (
              <div key={m.apartment.id} className="result-card" style={{ position: 'relative', border: selected ? '2px solid #38a9b8' : '1px solid #E8DFD0' }}>
                <div style={{ height: 140, background: 'linear-gradient(135deg, #FAF8F3 0%, #E8DFD0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {m.apartment.propertyType !== 'appartement' ? <Layers size={40} color="#38a9b8" strokeWidth={1.2} /> : <Home size={40} color="#38a9b8" strokeWidth={1.2} />}
                  <div className="score-badge">{m.score}% match</div>
                  <span className={`type-badge ${m.apartment.propertyType}`} style={{ position: 'absolute', top: 12, left: 12 }}>{propertyLabel(m.apartment.propertyType)}</span>
                </div>
                <div style={{ padding: 20 }}>
                  <div className="grid-3" style={{ margin: 0, fontSize: 11, color: '#38a9b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  <div >{m.apartment.typology}</div>
                  <div>{nbWaterPoints(m.apartment)} points d'eau</div>
                  <div>{nbSuites(m.apartment)} suite(s)</div>
                  </div>
                  <h3 className="serif" style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 500 }}>{m.building.name}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B6358' }}>Réf. {m.apartment.reference} · {formatFloor(m.apartment)}</p>
                  <p style={{ margin: '12px 0', fontSize: 13, color: '#6B6358', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} /> {m.building.city}, {m.building.neighborhood}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #E8DFD0' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{formatPrice(m.apartment.price)}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#6B6358' }}>{m.apartment.surface} m²</p>
                    </div>
                    {m.happiness > 0 && <div style={{ fontSize: 13, color: '#38a9b8', fontWeight: 600 }}>{m.happiness}/100</div>}
                  </div>
                  {m.reasons.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {m.reasons.slice(0, 3).map((r, i) => <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: '#FAF8F3', color: '#38a9b8', borderRadius: 10 }}>{r}</span>)}
                    </div>
                  )}
                  <button className={selected ? 'btn-primary' : 'btn-secondary'} onClick={() => toggle(m.apartment.id)} style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>
                    {selected ? <><Check size={16} /> Dans la synthèse</> : <>+ Ajouter</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default SelectionResults;

