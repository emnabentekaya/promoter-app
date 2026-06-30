import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, UserPlus } from 'lucide-react';
import { loadBuildings } from '../../../services/buildingsService.ts';
import { emptyCriteria } from '../../../factory/factory.ts';
import { matchApartments } from '../../../services/matchAppartmentService.ts';
import type { ClientCriteria } from '../../../models/clientCriteria.ts';
import type { Building } from '../../../models/building.ts';
import type { Client, ClientSelection } from '../../../models/client.ts';
import {
  getClients, createClient, getSelections, createSelection, updateSelection,
} from '../../../services/clientsService.ts';
import CatalogBrowse from './catalogBrowse.tsx';
import { NavBar } from '../../NavBarComponent/NavBarComponent.tsx';

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function BrowsePage() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [criteria, setCriteria] = useState<ClientCriteria>(emptyCriteria());
  const [activeView, setActiveView] = useState<'buildings' | 'catalog' | 'clients'>('catalog');

  // Clients data (needed for both modals)
  const [clients, setClients] = useState<Client[]>([]);
  const [selections, setSelections] = useState<ClientSelection[]>([]);

  // Modal: convert current search → new client
  const [showConvert, setShowConvert] = useState(false);
  const [convertName, setConvertName] = useState('');
  const [convertEmail, setConvertEmail] = useState('');
  const [convertSaving, setConvertSaving] = useState(false);

  // Modal: add a specific apartment to an existing client
  const [addTarget, setAddTarget] = useState<{ buildingId: string; aptId: string } | null>(null);
  const [addFeedback, setAddFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadBuildings().then(setBuildings);
    getClients().then(setClients);
    getSelections().then(setSelections);
  }, []);

  // ── Convert criteria → client ──────────────────────────────────────────────

  const openConvert = () => {
    setConvertName('');
    setConvertEmail('');
    setShowConvert(true);
  };

  const handleConvert = async () => {
    if (!convertName.trim()) return;
    setConvertSaving(true);
    const clientCriteria: ClientCriteria = { ...criteria, clientName: convertName, clientEmail: convertEmail, clientContact: '' };
    const client: Client = {
      id: uid(), name: convertName, email: convertEmail, phone: '', notes: '',
      createdAt: new Date().toISOString(), criteria: clientCriteria,
    };
    const items = matchApartments(buildings, { ...clientCriteria, onlyAvailable: true })
      .map(m => ({ buildingId: m.building.id, apartmentId: m.apartment.id, agentNote: '' }));
    const sel: ClientSelection = {
      id: uid(), clientId: client.id, label: 'Sélection',
      createdAt: new Date().toISOString(), items,
    };
    await createClient(client);
    await createSelection(sel);
    setConvertSaving(false);
    setShowConvert(false);
    navigate('/clients');
  };

  // ── Add apartment to existing client ──────────────────────────────────────

  const handleAddToClient = async (clientId: string) => {
    if (!addTarget) return;
    const { buildingId, aptId } = addTarget;
    const sel = selections.find(s => s.clientId === clientId);
    const newItem = { buildingId, apartmentId: aptId, agentNote: '' };

    if (sel) {
      const already = sel.items.some(i => i.buildingId === buildingId && i.apartmentId === aptId);
      if (already) {
        setAddFeedback('Déjà dans la sélection');
        setTimeout(() => setAddFeedback(null), 2000);
        return;
      }
      const next = { ...sel, items: [...sel.items, newItem] };
      await updateSelection(next);
      setSelections(p => p.map(s => s.clientId === clientId ? next : s));
    } else {
      const newSel: ClientSelection = {
        id: uid(), clientId, label: 'Sélection',
        createdAt: new Date().toISOString(), items: [newItem],
      };
      await createSelection(newSel);
      setSelections(p => [...p, newSel]);
    }
    setAddFeedback('Bien ajouté à la sélection');
    setTimeout(() => { setAddFeedback(null); setAddTarget(null); }, 1200);
  };

  // ── Modal backdrop ─────────────────────────────────────────────────────────

  const Overlay = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, padding: 32, width: 420, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {children}
      </div>
    </div>
  );

  return (
    <>
      <NavBar
        onConsultBuildings={() => setActiveView('buildings')}
        onBrowseCatalog={() => setActiveView('catalog')}
        onConsultClients={() => setActiveView('clients')}
        onStartSelection={() => navigate('/')}
        activeView={activeView}
      />

      <CatalogBrowse
        buildings={buildings}
        criteria={criteria}
        setCriteria={setCriteria}
        onBack={() => navigate('/')}
        onEditApartment={(bId, aId) => navigate('/', { state: { buildingId: bId, apartmentId: aId } })}
        onConvertToClientSelection={openConvert}
        onAddToClient={(bId, aId) => { setAddFeedback(null); setAddTarget({ buildingId: bId, aptId: aId }); }}
      />

      {/* ── Modal: convert search → client ── */}
      {showConvert && (
        <Overlay onClose={() => setShowConvert(false)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Créer un client</h2>
            <button aria-label="Fermer" onClick={() => setShowConvert(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6358', padding: 4 }}><X size={18} /></button>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6B6358' }}>
            Les critères actuels et les biens correspondants seront enregistrés dans la sélection du client.
          </p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6358', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nom *</label>
            <input
              autoFocus
              className="input"
              value={convertName}
              onChange={e => setConvertName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConvert()}
              placeholder="Nom complet du client"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6358', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>E-mail</label>
            <input
              className="input"
              type="email"
              value={convertEmail}
              onChange={e => setConvertEmail(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={handleConvert} disabled={!convertName.trim() || convertSaving}>
              <Save size={14} /> {convertSaving ? 'Création…' : 'Créer le client'}
            </button>
            <button className="btn-secondary" onClick={() => setShowConvert(false)}>Annuler</button>
          </div>
        </Overlay>
      )}

      {/* ── Modal: add apartment to existing client ── */}
      {addTarget && (
        <Overlay onClose={() => setAddTarget(null)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserPlus size={18} color="#38a9b8" />
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Ajouter à un client</h2>
            </div>
            <button aria-label="Fermer" onClick={() => setAddTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6358', padding: 4 }}><X size={18} /></button>
          </div>

          {addFeedback && (
            <div style={{ background: addFeedback.startsWith('Déjà') ? '#FEF3C7' : '#D1FAE5', color: addFeedback.startsWith('Déjà') ? '#92400E' : '#065F46', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
              {addFeedback}
            </div>
          )}

          {clients.length === 0 ? (
            <p style={{ color: '#6B6358', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              Aucun client. Créez d'abord un client depuis la page Clients.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {clients.map(c => {
                const sel = selections.find(s => s.clientId === c.id);
                const count = sel?.items.filter(i => !i.eliminated).length ?? 0;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleAddToClient(c.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F3', border: '1px solid #E8DFD0', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,169,184,0.08)'; e.currentTarget.style.borderColor = '#38a9b8'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FAF8F3'; e.currentTarget.style.borderColor = '#E8DFD0'; }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1F1B17' }}>{c.name}</div>
                      {c.email && <div style={{ fontSize: 12, color: '#6B6358', marginTop: 2 }}>{c.email}</div>}
                    </div>
                    <span style={{ fontSize: 12, color: '#38a9b8', fontWeight: 500, flexShrink: 0, marginLeft: 12 }}>
                      {count} bien{count !== 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Overlay>
      )}
    </>
  );
}
