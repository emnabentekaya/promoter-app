import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft, Plus, Trash2, Edit2, Search, Users, Download, X,
  Save, RefreshCw, RotateCcw,
} from 'lucide-react';
import type { Building } from '../../models/building';
import type { Apartment } from '../../models/apartment';
import type { Client, ClientSelection, SelectionItem } from '../../models/client';
import type { ClientCriteria, PropertyType } from '../../models/clientCriteria';
import { emptyCriteria } from '../../factory/factory';
import { matchApartments } from '../../services/matchAppartmentService';
import { LOCATIONS, TYPOLOGIES } from '../../constants';
import {
  getClients, createClient, updateClient, deleteClient as apiDeleteClient,
  getSelections, createSelection, updateSelection,
} from '../../services/clientsService';

interface Props {
  buildings: Building[];
  onBack: () => void;
  onOpenApartment?: (buildingId: string, apartmentId: string) => void;
}

type ClientView = 'list' | 'detail';

// ── helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtPrice(p: string | number): string {
  const n = typeof p === 'string' ? parseInt(p) : p;
  if (!n || isNaN(n)) return '—';
  return new Intl.NumberFormat('fr-TN').format(n) + ' TND';
}

function autoMatchItems(client: Client, buildings: Building[]): SelectionItem[] {
  if (!client.criteria) return [];
  return matchApartments(buildings, { ...client.criteria, onlyAvailable: true })
    .map(m => ({ buildingId: m.building.id, apartmentId: m.apartment.id, agentNote: '' }));
}

type Resolved = { item: SelectionItem; apt: Apartment; building: Building };

function resolveItems(sel: ClientSelection, buildings: Building[]): Resolved[] {
  return sel.items.flatMap(item => {
    const building = buildings.find(b => b.id === item.buildingId);
    const apt = building?.apartments.find(a => a.id === item.apartmentId);
    if (!building || !apt) return [];
    return [{ item, apt, building }];
  });
}

// ── PDF generation ────────────────────────────────────────────────────────────

function buildPDF(client: Client, items: Resolved[]): string {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const aptsHtml = items.map(({ apt, building: b, item }) => {
    const ppm2 = apt.price && apt.surface
      ? Math.round(parseInt(apt.price) / parseInt(apt.surface)) : 0;
    const hasTerrace = apt.salon.hasTerrace || apt.rooms.some(r => r.hasTerrace);
    const hasSuite   = apt.rooms.some(r => r.isSuite);
    return `
<div class="card">
  <div class="header">
    <div>
      <span class="tag ${apt.propertyType}">${apt.propertyType === 'duplex' ? 'Duplex' : apt.propertyType === 'triplex' ? 'Triplex' : 'Appartement'}</span>
      <h2 class="serif title">${b.name} — Réf. ${apt.reference}</h2>
      <p class="meta">${b.city}, ${b.neighborhood} · Étage ${apt.floor} · ${apt.typology.toUpperCase()}</p>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <div class="price">${fmtPrice(apt.price)}</div>
      <div class="price-sub">${apt.surface} m²${ppm2 ? ` · ${ppm2.toLocaleString('fr-FR')} TND/m²` : ''}</div>
    </div>
  </div>
  <div class="feats">
    ${hasSuite   ? '<span class="feat">✓ Suite parentale</span>' : ''}
    ${hasTerrace ? '<span class="feat">✓ Terrasse</span>' : ''}
    ${apt.hasGarden ? '<span class="feat">✓ Jardin</span>' : ''}
    ${apt.hasCellier ? '<span class="feat">✓ Cellier</span>' : ''}
    ${apt.dayNightSeparation ? '<span class="feat">✓ Sép. jour/nuit</span>' : ''}
    <span class="feat">Cuisine <strong>${apt.kitchen.kitchenType}</strong></span>
    <span class="feat">Promoteur <strong>${b.developer}</strong></span>
  </div>
  ${apt.freeNote   ? `<p class="note">${apt.freeNote}</p>` : ''}
  ${item.agentNote ? `<p class="note note-agent">Note : ${item.agentNote}</p>` : ''}
</div>`;
  }).join('');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Sélection — ${client.name}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; color: #1F1B17; margin: 0; font-size: 12pt; line-height: 1.5; }
  .serif { font-family: Georgia, serif; }
  .cover { padding: 36px 0 28px; border-bottom: 2px solid #E8DFD0; margin-bottom: 28px; }
  .cover-label { font-size: 9pt; letter-spacing:.2em; color:#38a9b8; text-transform:uppercase; font-weight:600; }
  .cover-title { font-size: 30pt; margin: 10px 0 6px; font-weight: 500; }
  .cover-meta { color: #6B6358; font-size: 11pt; }
  .card { border: 1px solid #E8DFD0; border-radius: 10px; padding: 18px 20px; margin-bottom: 14px; page-break-inside: avoid; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #E8DFD0; }
  .title { font-size: 15pt; margin: 6px 0 0; font-weight: 500; }
  .meta { font-size: 10pt; color: #6B6358; margin: 4px 0 0; }
  .price { font-size: 15pt; font-weight: 600; }
  .price-sub { font-size: 9pt; color: #6B6358; }
  .feats { display: flex; flex-wrap: wrap; gap: 6px 20px; font-size: 10pt; }
  .feat { color: #6B6358; }
  .feat strong { color: #1F1B17; font-weight: 500; }
  .note { background:#FAF8F3; padding:8px 12px; border-left:3px solid #38a9b8; border-radius:4px; font-size:10pt; font-style:italic; margin-top:10px; }
  .note-agent { border-left-color:#aa3bff; }
  .tag { display:inline-block; padding:2px 8px; border-radius:5px; font-size:9pt; font-weight:600; text-transform:uppercase; margin-right:8px; }
  .tag.appartement { background:#EDE6D6; color:#6B5634; }
  .tag.duplex { background:#D8DCE5; color:#2D3E5C; }
  .tag.triplex { background:#E5D8E0; color:#5C2D4E; }
  .print-btn { position:fixed; top:16px; right:16px; background:#38a9b8; color:white; border:none; padding:10px 18px; border-radius:8px; font-size:13px; cursor:pointer; }
  @media print { .print-btn { display:none; } body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style></head><body>
<button class="print-btn" onclick="window.print()">📄 Imprimer / PDF</button>
<div class="cover">
  <div class="cover-label">Sélection immobilière</div>
  <h1 class="serif cover-title">Pour ${client.name}</h1>
  <p class="cover-meta">${items.length} bien${items.length > 1 ? 's' : ''} · Établie le ${today}</p>
</div>
${aptsHtml}
</body></html>`;
}

// ── Criteria summary chips ────────────────────────────────────────────────────

function CriteriaChips({ c }: { c: ClientCriteria }) {
  const chips: string[] = [];
  if (c.budgetMax) chips.push(`≤ ${fmtPrice(c.budgetMax)}`);
  else if (c.budgetMin) chips.push(`≥ ${fmtPrice(c.budgetMin)}`);
  if (c.typologies.length) chips.push(c.typologies.map(t => t.toUpperCase()).join(' / '));
  if (c.propertyTypes.length) chips.push(c.propertyTypes.join(', '));
  if (c.surfaceMin || c.surfaceMax) chips.push(`${c.surfaceMin || '?'}–${c.surfaceMax || '?'} m²`);
  if (c.cities.length) chips.push(c.cities.join(', '));
  else if (c.governorates.length) chips.push(c.governorates.join(', '));
  if (c.needsTerrace) chips.push('Terrasse');
  if (c.needsGarden) chips.push('Jardin');
  if (c.needsParentalSuite) chips.push('Suite parentale');
  if (c.needsDayNightSeparation) chips.push('Sép. j/n');

  if (!chips.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {chips.map(chip => (
        <span key={chip} style={{
          background: 'rgba(56,169,184,0.1)', color: '#1d7a87',
          border: '1px solid rgba(56,169,184,0.25)',
          borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 500,
        }}>{chip}</span>
      ))}
    </div>
  );
}

// ── Apartment card (flex-row item) ────────────────────────────────────────────

function AptCard({ apt, building: b, eliminated, onToggleEliminate, onOpen }: {
  apt: Apartment; building: Building; eliminated: boolean;
  onToggleEliminate: () => void; onOpen?: () => void;
}) {
  const hasTerrace = apt.salon.hasTerrace || apt.rooms.some(r => r.hasTerrace);
  const hasSuite   = apt.rooms.some(r => r.isSuite);

  const typeBadgeColors: Record<string, { bg: string; color: string }> = {
    appartement: { bg: '#EDE6D6', color: '#6B5634' },
    duplex:      { bg: '#D8DCE5', color: '#2D3E5C' },
    triplex:     { bg: '#E5D8E0', color: '#5C2D4E' },
  };
  const badge = typeBadgeColors[apt.propertyType] ?? typeBadgeColors.appartement;

  return (
    <div
      onClick={onOpen}
      style={{
        width: 260, maxWidth: '100%', background: eliminated ? '#fafafa' : 'white',
        border: `1px solid ${eliminated ? '#e0b4b4' : '#E8DFD0'}`,
        borderRadius: 12, padding: '16px 18px', position: 'relative', flexShrink: 0,
        opacity: eliminated ? 0.65 : 1,
        transition: 'opacity 0.15s, border-color 0.15s',
        cursor: onOpen ? 'pointer' : 'default',
      }}
    >
      {/* Eliminated banner */}
      {eliminated && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          background: '#dc2626', borderRadius: '11px 11px 0 0',
          textAlign: 'center', padding: '3px 0',
          fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          Éliminé
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={e => { e.stopPropagation(); onToggleEliminate(); }}
        title={eliminated ? 'Restaurer dans la sélection' : 'Éliminer de la sélection'}
        style={{
          position: 'absolute', top: eliminated ? 28 : 10, right: 10,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: eliminated ? '#6B6358' : '#bbb', padding: 2, lineHeight: 1,
          borderRadius: 4, transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = eliminated ? '#38a9b8' : '#dc2626')}
        onMouseLeave={e => (e.currentTarget.style.color = eliminated ? '#6B6358' : '#bbb')}
      >
        {eliminated ? <RotateCcw size={14} /> : <X size={15} />}
      </button>

      {/* Building name */}
      <p style={{
        margin: `${eliminated ? '18px' : '0'} 20px 6px 0`,
        fontSize: 11, color: eliminated ? '#999' : '#38a9b8',
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {b.name}
      </p>

      {/* Type badge + reference */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          background: eliminated ? '#eee' : badge.bg,
          color: eliminated ? '#999' : badge.color,
          borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        }}>
          {apt.propertyType === 'appartement' ? 'Appt' : apt.propertyType === 'duplex' ? 'Dup.' : 'Trip.'}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, textDecoration: eliminated ? 'line-through' : 'none', color: eliminated ? '#999' : undefined }}>
          Réf. {apt.reference || apt.id.slice(0, 6)}
        </span>
      </div>

      {/* Typology · floor · surface */}
      <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6B6358' }}>
        {apt.typology.toUpperCase()} · Étage {apt.floor} · {apt.surface ? `${apt.surface} m²` : '—'}
      </p>

      {/* Price */}
      <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: eliminated ? '#999' : '#1F1B17' }}>
        {fmtPrice(apt.price)}
      </p>

      {/* Feature tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', fontSize: 11, color: '#6B6358' }}>
        {hasSuite   && <span>✓ Suite</span>}
        {hasTerrace && <span>✓ Terrasse</span>}
        {apt.hasGarden && <span>✓ Jardin</span>}
        {apt.dayNightSeparation && <span>✓ J/N</span>}
        <span style={{ marginLeft: 'auto', color: eliminated ? '#999' : '#38a9b8', fontWeight: 500 }}>
          {b.city}
        </span>
      </div>
    </div>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ClientsPage({ buildings, onBack, onOpenApartment }: Props) {
  const [view, setView]                     = useState<ClientView>('list');
  const [clients, setClients]               = useState<Client[]>([]);
  const [selections, setSelections]         = useState<ClientSelection[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [search, setSearch]                 = useState('');
  const [showForm, setShowForm]             = useState(false);
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [selFilter, setSelFilter]           = useState<'all' | 'selected' | 'eliminated'>('all');

  // Basic client fields
  const [fName,  setFName]  = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fNotes, setFNotes] = useState('');

  // Criteria (single state object)
  const [fCriteria, setFCriteria] = useState<ClientCriteria>(emptyCriteria());

  // Refs so the buildings-change effect always sees the latest state without re-subscribing
  const clientsRef   = useRef<Client[]>([]);
  const selectionsRef = useRef<ClientSelection[]>([]);
  useEffect(() => { clientsRef.current = clients; },    [clients]);
  useEffect(() => { selectionsRef.current = selections; }, [selections]);

  // Incrementally add any new matching apartments to each client's selection (non-destructive)
  const syncNew = useCallback(async (
    cls: Client[], sels: ClientSelection[], blds: Building[],
  ) => {
    for (const client of cls) {
      if (!client.criteria) continue;
      const sel = sels.find(s => s.clientId === client.id);
      if (!sel) continue;
      const matches = matchApartments(blds, { ...client.criteria, onlyAvailable: true });
      const existing = new Set(sel.items.map(i => `${i.buildingId}:${i.apartmentId}`));
      const newItems = matches
        .filter(m => !existing.has(`${m.building.id}:${m.apartment.id}`))
        .map(m => ({ buildingId: m.building.id, apartmentId: m.apartment.id, agentNote: '' }));
      if (newItems.length === 0) continue;
      const next = { ...sel, items: [...sel.items, ...newItems] };
      await updateSelection(next);
      setSelections(prev => prev.map(s => s.clientId === client.id ? next : s));
      // Keep ref in sync immediately so subsequent iterations in this loop see the update
      selectionsRef.current = selectionsRef.current.map(s => s.clientId === client.id ? next : s);
    }
  }, []);

  const isBuildingsFirstRender = useRef(true);

  useEffect(() => {
    Promise.all([getClients(), getSelections()]).then(([cls, sels]) => {
      setClients(cls);
      setSelections(sels);
      clientsRef.current   = cls;
      selectionsRef.current = sels;
      syncNew(cls, sels, buildings);
    });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-sync when buildings are updated (polling / focus reload)
  useEffect(() => {
    if (isBuildingsFirstRender.current) { isBuildingsFirstRender.current = false; return; }
    syncNew(clientsRef.current, selectionsRef.current, buildings);
  }, [buildings]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeClient    = clients.find(c => c.id === activeClientId) ?? null;
  const activeClientSel = selections.find(s => s.clientId === activeClientId) ?? null;

  const resolved = useMemo(
    () => activeClientSel ? resolveItems(activeClientSel, buildings) : [],
    [activeClientSel, buildings],
  );

  const selectedItems  = useMemo(() => resolved.filter(r => !r.item.eliminated), [resolved]);
  const eliminatedItems = useMemo(() => resolved.filter(r => r.item.eliminated),  [resolved]);
  const visibleItems   = selFilter === 'selected'  ? selectedItems
                       : selFilter === 'eliminated' ? eliminatedItems
                       : resolved;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [clients, search]);

  // Cascading location helpers for form
  const availableCities = fCriteria.governorates.length > 0
    ? fCriteria.governorates.flatMap(g => LOCATIONS.citiesByGovernorate[g] ?? []).sort((a, b) => a.localeCompare(b, 'fr'))
    : [];
  const availableHoods = fCriteria.cities.length > 0
    ? fCriteria.cities.flatMap(c => LOCATIONS.neighborhoodsByCity[c] ?? []).sort((a, b) => a.localeCompare(b, 'fr'))
    : [];
  const availableFloors = [...new Set(buildings.flatMap(b => b.apartments.map(a => a.floor)))].sort((a, b) => a - b);

  const updateCrit = <K extends keyof ClientCriteria>(k: K, v: ClientCriteria[K]) =>
    setFCriteria(c => ({ ...c, [k]: v }));

  const toggleCritArr = (k: 'governorates' | 'cities' | 'neighborhoods' | 'typologies' | 'propertyTypes', val: string) => {
    const arr = fCriteria[k] as string[];
    updateCrit(k, (arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]) as ClientCriteria[typeof k]);
  };

  // ── CRUD ──

  const openCreate = () => {
    setEditingId(null);
    setFName(''); setFEmail(''); setFPhone(''); setFNotes('');
    setFCriteria(emptyCriteria());
    setShowForm(true);
  };

  const openEdit = (c: Client) => {
    setEditingId(c.id);
    setFName(c.name); setFEmail(c.email); setFPhone(c.phone); setFNotes(c.notes);
    setFCriteria(c.criteria ? { ...c.criteria } : emptyCriteria());
    setShowForm(true);
  };

  const submitForm = async () => {
    if (!fName.trim()) return;
    const criteria: ClientCriteria = { ...fCriteria, clientName: fName, clientEmail: fEmail, clientContact: fPhone };
    if (editingId) {
      const existing = clients.find(c => c.id === editingId);
      if (!existing) return;
      const next: Client = { ...existing, name: fName, email: fEmail, phone: fPhone, notes: fNotes, criteria };
      await updateClient(next);
      setClients(p => p.map(c => c.id === editingId ? next : c));
      // Refresh selection with new criteria
      await _refreshSelection(next, selections);
    } else {
      const c: Client = {
        id: uid(), name: fName, email: fEmail, phone: fPhone, notes: fNotes,
        createdAt: new Date().toISOString(), criteria,
      };
      await createClient(c);
      setClients(p => [...p, c]);
      // Auto-create selection
      const sel = _buildAutoSel(c);
      await createSelection(sel);
      setSelections(p => [...p, sel]);
    }
    setShowForm(false);
  };

  function _buildAutoSel(client: Client): ClientSelection {
    return {
      id: uid(), clientId: client.id, label: 'Sélection',
      createdAt: new Date().toISOString(),
      items: autoMatchItems(client, buildings),
    };
  }

  async function _refreshSelection(client: Client, currentSels: ClientSelection[]) {
    const existing = currentSels.find(s => s.clientId === client.id);
    const items = autoMatchItems(client, buildings);
    if (existing) {
      const next = { ...existing, items };
      await updateSelection(next);
      setSelections(p => p.map(s => s.clientId === client.id ? next : s));
    } else {
      const sel = { id: uid(), clientId: client.id, label: 'Sélection', createdAt: new Date().toISOString(), items };
      await createSelection(sel);
      setSelections(p => [...p, sel]);
    }
  }

  const refreshSelection = () => {
    if (!activeClient) return;
    _refreshSelection(activeClient, selections);
  };

  const toggleEliminate = async (buildingId: string, apartmentId: string) => {
    if (!activeClientSel) return;
    const next = {
      ...activeClientSel,
      items: activeClientSel.items.map(i =>
        i.buildingId === buildingId && i.apartmentId === apartmentId
          ? { ...i, eliminated: !i.eliminated }
          : i
      ),
    };
    await updateSelection(next);
    setSelections(p => p.map(s => s.clientId === activeClientId ? next : s));
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Supprimer ce client et sa sélection ?')) return;
    await apiDeleteClient(id);
    setClients(p => p.filter(c => c.id !== id));
    setSelections(p => p.filter(s => s.clientId !== id));
    setView('list');
    setActiveClientId(null);
  };

  const exportPDF = () => {
    if (!activeClient) return;
    const html = buildPDF(activeClient, selectedItems);
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  // ── shared styles ──

  const chipToggle = (active: boolean): React.CSSProperties => ({
    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: active ? '1.5px solid #38a9b8' : '1.5px solid #D9CFC0',
    background: active ? 'rgba(56,169,184,0.12)' : 'white',
    color: active ? '#1d7a87' : '#6B6358', userSelect: 'none', display: 'inline-block',
  });

  const chkLabel: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 13, color: '#1F1B17', cursor: 'pointer',
  };

  // ── Form ──────────────────────────────────────────────────────────────────────

  const ClientForm = (
    <div className="card" style={{ marginBottom: 24, borderColor: '#38a9b8' }}>
      <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600 }}>
        {editingId ? 'Modifier le client' : 'Nouveau client'}
      </h3>

      {/* ── Basic info ── */}
      <div className="grid-2">
        <div>
          <label className="label">Nom *</label>
          <input className="input" value={fName} onChange={e => setFName(e.target.value)} placeholder="Nom complet" autoFocus />
        </div>
        <div>
          <label className="label">E-mail</label>
          <input className="input" type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="email@exemple.com" />
        </div>
        <div>
          <label className="label">Téléphone</label>
          <input className="input" value={fPhone} onChange={e => setFPhone(e.target.value)} placeholder="+216 XX XXX XXX" />
        </div>
        <div>
          <label className="label">Notes</label>
          <input className="input" value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Remarques libres…" />
        </div>
      </div>

      {/* ── Criteria ── */}
      <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #E8DFD0' }}>
        <p style={{ margin: '0 0 18px', fontSize: 12, fontWeight: 700, color: '#38a9b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Critères de recherche
        </p>

        {/* Budget */}
        <div className="grid-2" style={{ marginBottom: 18 }}>
          <div>
            <label className="label">Budget min (TND)</label>
            <input className="input" type="number" value={fCriteria.budgetMin}
              onChange={e => updateCrit('budgetMin', e.target.value)} placeholder="ex. 200 000" />
          </div>
          <div>
            <label className="label">Budget max (TND)</label>
            <input className="input" type="number" value={fCriteria.budgetMax}
              onChange={e => updateCrit('budgetMax', e.target.value)} placeholder="ex. 500 000" />
          </div>
        </div>

        {/* Surface */}
        <div className="grid-2" style={{ marginBottom: 18 }}>
          <div>
            <label className="label">Surface min (m²)</label>
            <input className="input" type="number" value={fCriteria.surfaceMin}
              onChange={e => updateCrit('surfaceMin', e.target.value)} placeholder="ex. 80" />
          </div>
          <div>
            <label className="label">Surface max (m²)</label>
            <input className="input" type="number" value={fCriteria.surfaceMax}
              onChange={e => updateCrit('surfaceMax', e.target.value)} placeholder="ex. 160" />
          </div>
        </div>

        {/* Typologies */}
        <div style={{ marginBottom: 18 }}>
          <label className="label">Typologies souhaitées</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {TYPOLOGIES.map(t => (
              <span key={t} style={chipToggle(fCriteria.typologies.includes(t))}
                onClick={() => toggleCritArr('typologies', t)}>
                {t.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Property types */}
        <div style={{ marginBottom: 18 }}>
          <label className="label">Type de bien</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {(['appartement', 'duplex', 'triplex'] as PropertyType[]).map(t => (
              <span key={t} style={chipToggle(fCriteria.propertyTypes.includes(t))}
                onClick={() => toggleCritArr('propertyTypes', t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {/* Gouvernorats */}
        {LOCATIONS.governorates.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <label className="label">Gouvernorat</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {LOCATIONS.governorates.map(g => (
                <span key={g} style={chipToggle(fCriteria.governorates.includes(g))}
                  onClick={() => {
                    toggleCritArr('governorates', g);
                    // Clear cities that belong only to deselected governorate
                    updateCrit('cities', []);
                    updateCrit('neighborhoods', []);
                  }}>
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cities (cascading from governorates) */}
        {availableCities.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <label className="label">Ville</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {availableCities.map(c => (
                <span key={c} style={chipToggle(fCriteria.cities.includes(c))}
                  onClick={() => { toggleCritArr('cities', c); updateCrit('neighborhoods', []); }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Neighborhoods (cascading from cities) */}
        {availableHoods.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <label className="label">Quartier</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {availableHoods.map(h => (
                <span key={h} style={chipToggle(fCriteria.neighborhoods.includes(h))}
                  onClick={() => toggleCritArr('neighborhoods', h)}>
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Floors */}
        {availableFloors.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <label className="label">Étage</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {availableFloors.map(f => (
                <span key={f} style={chipToggle(fCriteria.floors.includes(f))}
                  onClick={() => updateCrit('floors', fCriteria.floors.includes(f)
                    ? fCriteria.floors.filter(x => x !== f)
                    : [...fCriteria.floors, f])}>
                  Étage {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Besoins */}
        <div style={{ marginBottom: 18 }}>
          <label className="label">Besoins</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px', marginTop: 8 }}>
            <label style={chkLabel}>
              <input type="checkbox" checked={fCriteria.needsParentalSuite}
                onChange={e => updateCrit('needsParentalSuite', e.target.checked)}
                style={{ accentColor: '#38a9b8' }} />
              Suite parentale
            </label>
            <label style={chkLabel}>
              <input type="checkbox" checked={fCriteria.needsTerrace}
                onChange={e => updateCrit('needsTerrace', e.target.checked)}
                style={{ accentColor: '#38a9b8' }} />
              Terrasse
            </label>
            {fCriteria.needsTerrace && (
              <label style={{ ...chkLabel, marginLeft: 16, color: '#6B6358' }}>
                <input type="checkbox" checked={fCriteria.needsFunctionalTerrace}
                  onChange={e => updateCrit('needsFunctionalTerrace', e.target.checked)}
                  style={{ accentColor: '#38a9b8' }} />
                Terrasse fonctionnelle
              </label>
            )}
            <label style={chkLabel}>
              <input type="checkbox" checked={fCriteria.needsGarden}
                onChange={e => updateCrit('needsGarden', e.target.checked)}
                style={{ accentColor: '#38a9b8' }} />
              Jardin
            </label>
            <label style={chkLabel}>
              <input type="checkbox" checked={fCriteria.needsDayNightSeparation}
                onChange={e => updateCrit('needsDayNightSeparation', e.target.checked)}
                style={{ accentColor: '#38a9b8' }} />
              Séparation jour / nuit
            </label>
          </div>
        </div>

        {/* Cuisine + Entrée */}
        <div className="grid-2" style={{ marginBottom: 18 }}>
          <div>
            <label className="label">Cuisine</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {(['any', 'ouverte', 'fermee'] as const).map(v => (
                <span key={v} style={chipToggle(fCriteria.kitchenType === v)}
                  onClick={() => updateCrit('kitchenType', v)}>
                  {v === 'any' ? 'Toutes' : v.charAt(0).toUpperCase() + v.slice(1)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Entrée</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {(['any', 'hall', 'salon'] as const).map(v => (
                <span key={v} style={chipToggle(fCriteria.entranceType === v)}
                  onClick={() => updateCrit('entranceType', v)}>
                  {v === 'any' ? 'Toutes' : v.charAt(0).toUpperCase() + v.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Happiness index + Only available */}
        <div className="grid-2">
          <div>
            <label className="label">Index bonheur min ({fCriteria.minHappinessIndex})</label>
            <input type="range" min={0} max={100} step={5} value={fCriteria.minHappinessIndex}
              onChange={e => updateCrit('minHappinessIndex', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#38a9b8', marginTop: 8 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
            <label style={chkLabel}>
              <input type="checkbox" checked={fCriteria.onlyAvailable}
                onChange={e => updateCrit('onlyAvailable', e.target.checked)}
                style={{ accentColor: '#38a9b8' }} />
              Uniquement disponibles
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button className="btn-primary" onClick={submitForm}>
          <Save size={14} /> {editingId ? 'Enregistrer' : 'Créer'}
        </button>
        <button className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: LIST
  // ═══════════════════════════════════════════════════════════════════════

  if (view === 'list') return (
    <div className="page-pad" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 32}}>
        <ArrowLeft size={16} /> Retour aux projets
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#38a9b8', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Gestion</p>
          <h1 className="serif page-heading">Clients</h1>
          <p style={{ color: '#6B6358', margin: '8px 0 0', fontSize: 15 }}>
            {clients.length} client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nouveau client</button>
      </div>

      <div style={{ position: 'relative', marginBottom: 28, maxWidth: 360 }}>
        <Search size={14} color="#6B6358" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input className="input" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un client…" style={{ paddingLeft: 36, width: '100%' }} />
      </div>

      {showForm && ClientForm}

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 56 }}>
          <Users size={40} color="#38a9b8" style={{ opacity: 0.3 }} />
          <p style={{ margin: '16px 0 0', color: '#6B6358' }}>
            {search ? 'Aucun client trouvé.' : "Aucun client pour l'instant."}
          </p>
          {!search && (
            <button className="btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>
              <Plus size={14} /> Créer le premier client
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(c => {
            const sel = selections.find(s => s.clientId === c.id);
            const nb  = sel?.items.filter(i => !i.eliminated).length ?? 0;
            return (
              <div key={c.id} className="card"
                style={{ cursor: 'pointer', marginBottom: 0, padding: '20px 22px' }}
                onClick={() => { setActiveClientId(c.id); setView('detail'); }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</h3>
                    {c.email && <p style={{ margin: 0, fontSize: 13, color: '#6B6358', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>}
                    {c.phone && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6B6358' }}>{c.phone}</p>}
                  </div>
                  <button className="btn-ghost" style={{ padding: 4, flexShrink: 0 }}
                    onClick={e => { e.stopPropagation(); openEdit(c); }}>
                    <Edit2 size={14} />
                  </button>
                </div>
                {c.criteria && <CriteriaChips c={c.criteria} />}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #E8DFD0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#38a9b8', fontWeight: 500 }}>
                    {nb} bien{nb !== 1 ? 's' : ''} sélectionné{nb !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 12, color: '#6B6358' }}>{fmtDate(c.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: DETAIL
  // ═══════════════════════════════════════════════════════════════════════

  if (view === 'detail' && activeClient) return (
    <div className="page-pad" style={{ maxWidth: 1300, margin: '0 auto' }}>
      <button className="btn-ghost" onClick={() => { setView('list'); setShowForm(false); }}
        style={{ marginBottom: 24, fontSize: 16 }}>
        <ArrowLeft size={16} /> Clients
      </button>


      {/* Client info card */}
      <div className="card" style={{ marginBottom: 36 }}>
        {showForm ? ClientForm : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#38a9b8', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Client</p>
              <h2 className="serif" style={{ fontSize: 34, margin: '6px 0 10px', fontWeight: 500 }}>{activeClient.name}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: 14, color: '#6B6358' }}>
                {activeClient.email && <span>{activeClient.email}</span>}
                {activeClient.phone && <span>{activeClient.phone}</span>}
                {activeClient.notes && <span style={{ fontStyle: 'italic' }}>— {activeClient.notes}</span>}
              </div>
              {activeClient.criteria && (
                <div style={{ marginTop: 12 }}>
                  <CriteriaChips c={activeClient.criteria} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => openEdit(activeClient)}><Edit2 size={14} /> Modifier</button>
              <button className="btn-secondary" style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => deleteClient(activeClient.id)}>
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selection header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 600 }}>Sélection</h3>
          <p style={{ margin: 0, fontSize: 14, color: '#6B6358' }}>
            {selectedItems.length} sélectionné{selectedItems.length !== 1 ? 's' : ''}
            {eliminatedItems.length > 0 && ` · ${eliminatedItems.length} éliminé${eliminatedItems.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* <button className="btn-secondary" onClick={refreshSelection} title="Relancer la correspondance">
            <RefreshCw size={14} /> Rafraîchir
          </button> */}
          <button className="btn-primary" onClick={exportPDF} disabled={selectedItems.length === 0}>
            <Download size={14} /> Exporter PDF
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      {resolved.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            ['all',       `Tous (${resolved.length})`],
            ['selected',  `Sélectionnés (${selectedItems.length})`],
            ['eliminated',`Éliminés (${eliminatedItems.length})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelFilter(key)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', border: 'none',
                background: selFilter === key ? '#1F1B17' : '#F0EBE0',
                color: selFilter === key ? 'white' : '#6B6358',
                transition: 'background 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Apartments — flex row */}
      {resolved.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ margin: 0, color: '#6B6358', fontSize: 15 }}>
            {activeClient.criteria
              ? 'Aucun bien disponible ne correspond aux critères.'
              : 'Ce client n\'a pas encore de critères de recherche.'}
          </p>
          {!activeClient.criteria && (
            <button className="btn-primary" onClick={() => openEdit(activeClient)} style={{ marginTop: 16 }}>
              <Plus size={14} /> Ajouter des critères
            </button>
          )}
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 36 }}>
          <p style={{ margin: 0, color: '#6B6358', fontSize: 14 }}>
            {selFilter === 'eliminated' ? 'Aucun bien éliminé.' : 'Tous les biens ont été éliminés.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {visibleItems.map(({ apt, building: b, item }) => (
            <AptCard
              key={apt.id}
              apt={apt}
              building={b}
              eliminated={!!item.eliminated}
              onToggleEliminate={() => toggleEliminate(item.buildingId, apt.id)}
              onOpen={onOpenApartment ? () => onOpenApartment(item.buildingId, apt.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );

  return null;
}
