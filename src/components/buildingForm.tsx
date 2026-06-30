import /*React, */{ useState, useMemo, useEffect, useRef } from 'react';
import type { Building } from '../models/building.ts';
import type { RawPromoteur } from '../models/promoteur.ts';
import type { BuildingFormProps } from '../models/buildingFormProps.ts';
import { PROMOTEURS } from '../services/promoteurService.ts';
import { LOCATIONS } from '../constants.ts';
import { ArrowLeft, FileText, Save, Upload} from 'lucide-react';

function BuildingForm({ initial, onSave, onCancel, onAutoSave/*,addBuilding*/ }: BuildingFormProps) {
  const [data, setData] = useState<Building>(initial ? { ...initial, contacts: initial.contacts ?? [] } : {
    //id: 'b' + Math.random().toString(36).slice(2, 9),
    name: '', handoverMonth: '',handoverYear: '',immediateHandover: false, governorate: '', city: '', neighborhood: '',
    mapsLink: '', developer: '', floors: 0, websiteLink: '', facebookLink: '', instagramLink: '',
    parkingAerialPrice: '', parkingBasementPrice: '',
    meterPriceS0: '', meterPriceS1: '', meterPriceS2: '', meterPriceS3: '', meterPriceS4: '',
    meterPriceTerrace: '', meterPriceGarden: '', contacts: [],freeNote:'',
    projectPhotos: [], apartments: []
  });
  const update = <K extends keyof Building>(k: K, v: Building[K]) => setData(d => ({ ...d, [k]: v }));

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

  const [showDevDropdown, setShowDevDropdown] = useState(false);
  const devFiltered = useMemo(() => {
    const q = (data.developer ?? "").toLowerCase();
    if (!q) return PROMOTEURS;
    return PROMOTEURS.filter(p => p["Nom de société"].toLowerCase().includes(q));
  }, [data.developer]);

  const selectPromoter = (p: RawPromoteur) => {
    const phone = p["Téléphone"]?.trim();
    setData(d => ({
      ...d,
      developer: p["Nom de société"],
      contacts: phone && !d.contacts.includes(phone) ? [...d.contacts, phone] : d.contacts
    }));
    setShowDevDropdown(false);
  };
  return (

    <div className="page-pad" style={{ maxWidth: 900, margin: '0 auto' }}>
      <button className="btn-ghost" onClick={onCancel} style={{ marginBottom: 20 ,fontSize:'20px'}}><ArrowLeft size={16} /> Retour</button>
      <h1 className="serif page-heading" style={{ margin: '0 0 32px' }}>{initial ? 'Modifier Projet' : 'Nouveau Projet'}</h1>

      <div className="card">
        <h3 className="section-title">Identification</h3>
        <div className="grid-3">
        <div style={{ marginBottom: 16 }}>
          <label className="label">Nom du projet *</label>
          <input className="input" value={data.name} onChange={e => update('name', e.target.value)} placeholder="Ex: Résidence Les Jasmins" />
        </div>
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <label className="label">Promoteur</label>
          <input
            className="input"
            value={data.developer}
            onChange={e => { update('developer', e.target.value); setShowDevDropdown(true); }}
            onFocus={() => setShowDevDropdown(true)}
            onBlur={() => setTimeout(() => setShowDevDropdown(false), 150)}
            placeholder="Rechercher ou saisir un promoteur…"
            autoComplete="off"
          />
          {showDevDropdown && devFiltered.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #D9CFC0', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.1)', zIndex: 200, maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
              {devFiltered.map(p => (
                <div
                  key={p.id}
                  onMouseDown={() => selectPromoter(p)}
                  style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #F0EBE0' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAF8F3')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1F1B17' }}>{p["Nom de société"]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="label">Nombre d'étages</label>
          <select className="select" value={data.floors} onChange={e => update('floors', parseInt(e.target.value) || 0)}>
            <option value="">— Choisir —</option>
            <option value="3">R+2</option>
            <option value="4">R+3</option>
            <option value="5">R+4</option>
            <option value="6">R+5</option>
            <option value="7">R+6</option>
            <option value="8">R+7</option>
            <option value="9">R+8</option>
            <option value="10">R+9</option>
            <option value="11">R+10</option>
          </select>
        </div>
  
        </div> 

        <div className="grid-3">
        <div style={{ marginTop: '30px' }}>
        <label className="checkbox-row">
          <input type="checkbox" checked={data.immediateHandover} onChange={e => update('immediateHandover', e.target.checked)} />
          Remise des clés immédiate</label>
        </div>
        {!(data.immediateHandover) && (
        <>
          <div>
            <label className="label">Mois remise des clés</label>
            <select className="select" value={data.handoverMonth} onChange={e => update('handoverMonth', e.target.value)}>
              <option value="">— Choisir —</option>
              <option value="1">Janvier</option>
              <option value="2">Février</option>
              <option value="3">Mars</option>
              <option value="4">Avril</option>
              <option value="5">Mai</option>
              <option value="6">Juin</option>
              <option value="7">Juillet</option>
              <option value="8">Août</option>
              <option value="9">Septembre</option>
              <option value="10">Octobre</option>
              <option value="11">Novembre</option>
              <option value="12">Décembre</option>
            </select>
          </div>
          <div>
            <label className="label">Année de remise des clés</label>
            <select className="select" value={data.handoverYear} onChange={e => update('handoverYear', e.target.value)}>
              <option value="">— Choisir —</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
            </select>
          </div>  
          </>    
      )}
      </div>
            <div className="contact-field-full">
          <label className="label">Contacts</label>
          {data.contacts.map((c, i) => (
            <div key={i} className="contact-row">
              <input
                className="input"
                type="tel"
                value={c}
                placeholder="Ex: +216 20 000 000"
                onChange={e => {
                  const next = [...data.contacts];
                  next[i] = e.target.value;
                  update('contacts', next);
                }}
              />
              <button
                type="button"
                className="contact-remove-btn"
                onClick={() => update('contacts', data.contacts.filter((_, j) => j !== i))}
              >×</button>
            </div>
          ))}
          <button
            type="button"
            className="contact-add-btn"
            onClick={() => update('contacts', [...data.contacts, ''])}
          >+ Ajouter un contact</button>
        </div>

      </div>
      <div className="card">
        <div style={{ marginTop: 16 }}>
          <label className="label">Note libre</label>
          <textarea className="textarea" rows={4} value={data.freeNote} onChange={e => update('freeNote', e.target.value)} style={{ resize: 'vertical', minHeight: 100 }} />
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Localisation</h3>
        <div className="grid-3">
  <div>
    <label className="label">Gouvernorat</label>
    <select className="select" value={data.governorate} onChange={e => {
      const newGov = e.target.value;
      setData(d => ({...d,governorate: newGov,
        // Réinitialise ville et quartier si incohérents 
        city: newGov && d.city && LOCATIONS.governorateOfCity[d.city] !== newGov ? '' : d.city,
        neighborhood: newGov && d.neighborhood && LOCATIONS.governorateOfNeighborhood[d.neighborhood] !== newGov ? '' : d.neighborhood
      }));
    }}>
      <option value="">— Choisir —</option>
      {LOCATIONS.governorates.map(g => <option key={g} value={g}>{g}</option>)}
    </select>
  </div>
  <div>
    <label className="label">Ville</label>
    <select className="select" value={data.city} onChange={e => {
      const newCity = e.target.value;
      setData(d => ({
        ...d,
        city: newCity,
        // Si la ville fixe un gouvernorat, l'auto-remplir
        governorate: newCity ? LOCATIONS.governorateOfCity[newCity] || d.governorate : d.governorate,
        // Réinitialise quartier si incohérent
        neighborhood: newCity && d.neighborhood && LOCATIONS.cityOfNeighborhood[d.neighborhood] !== newCity ? '' : d.neighborhood
      }));
    }}>
      <option value="">— Choisir —</option>
      {(data.governorate
        ? LOCATIONS.citiesByGovernorate[data.governorate] || []
        : Object.values(LOCATIONS.citiesByGovernorate).flat()
      ).map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  </div>
  <div>
    <label className="label">Quartier</label>
    <select className="select" value={data.neighborhood} onChange={e => {
      const newHood = e.target.value;
      setData(d => ({
        ...d,
        neighborhood: newHood,
        // Auto-remplir ville et gouvernorat depuis le quartier
        city: newHood ? LOCATIONS.cityOfNeighborhood[newHood] || d.city : d.city,
        governorate: newHood ? LOCATIONS.governorateOfNeighborhood[newHood] || d.governorate : d.governorate
      }));
    }}>
      <option value="">— Choisir —</option>
      {(data.city
        ? LOCATIONS.neighborhoodsByCity[data.city] || []
        : data.governorate
          ? (LOCATIONS.citiesByGovernorate[data.governorate] || []).flatMap(c => LOCATIONS.neighborhoodsByCity[c] || [])
          : Object.values(LOCATIONS.neighborhoodsByCity).flat()
      ).map(n => <option key={n} value={n}>{n}</option>)}
    </select>
  </div>
</div>
        <div style={{ marginTop: 16 }}>
          <label className="label">Lien Google Maps</label>
          <input className="input" value={data.mapsLink} onChange={e => update('mapsLink', e.target.value)} />
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Liens & réseaux</h3>
        <div className="grid-3">
        <div style={{ marginBottom: 16 }}>
          <label className="label">Site web</label>
          <input className="input" value={data.websiteLink} onChange={e => update('websiteLink', e.target.value)} />
        </div>
        <div>
          <label className="label">Facebook</label>
          <input className="input" value={data.facebookLink} onChange={e => update('facebookLink', e.target.value)} /></div>
        <div>
          <label className="label">Instagram</label>
          <input className="input" value={data.instagramLink} onChange={e => update('instagramLink', e.target.value)} /></div>  
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Grille tarifaire au m² (TND)</h3>
        <p style={{ fontSize: 12, color: '#6B6358', margin: '0 0 16px' }}>Informative. Permet d'estimer un prix par défaut quand on saisit un appartement.</p>
        <div className="grid-4">
          <div><label className="label">S+0</label><input className="input" type="number" value={data.meterPriceS0} onChange={e => update('meterPriceS0', e.target.value)} /></div>
          <div><label className="label">S+1</label><input className="input" type="number" value={data.meterPriceS1} onChange={e => update('meterPriceS1', e.target.value)} /></div>
          <div><label className="label">S+2</label><input className="input" type="number" value={data.meterPriceS2} onChange={e => update('meterPriceS2', e.target.value)} /></div>
          <div><label className="label">S+3</label><input className="input" type="number" value={data.meterPriceS3} onChange={e => update('meterPriceS3', e.target.value)} /></div>
          <div><label className="label">S+4</label><input className="input" type="number" value={data.meterPriceS4} onChange={e => update('meterPriceS4', e.target.value)} /></div>
          <div><label className="label">Terrasse</label><input className="input" type="number" value={data.meterPriceTerrace} onChange={e => update('meterPriceTerrace', e.target.value)} /></div>
          <div><label className="label">Jardin</label><input className="input" type="number" value={data.meterPriceGarden} onChange={e => update('meterPriceGarden', e.target.value)} /></div>

        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Parking</h3>
        <div className="grid-2">
          <div><label className="label">Aérien (TND)</label><input className="input" type="number" value={data.parkingAerialPrice} onChange={e => update('parkingAerialPrice', e.target.value)} /></div>
          <div><label className="label">Sous-sol (TND)</label><input className="input" type="number" value={data.parkingBasementPrice} onChange={e => update('parkingBasementPrice', e.target.value)} /></div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Plans Photos du projet</h3>
        <div className="grid-2">
        <div>
          <label className="label"><FileText size={13} style={{ display: 'inline', verticalAlign: -2 }} /> Plans</label>
          <div className="upload-zone"><Upload size={24} color="#38a9b8" /><p style={{ margin: '8px 0 0', fontSize: 13 }}>PDF, JPG, PNG</p>
          </div>
        </div>
        <div>
          <label className="label"><FileText size={13} style={{ display: 'inline', verticalAlign: -2 }} /> Photos</label>
          <div className="upload-zone">
          <Upload size={28} color="#38a9b8" />
          {/*<p style={{ margin: '12px 0 4px', fontSize: 14, fontWeight: 500 }}>Glisser des photos ici</p> */}
          <p style={{ margin: 0, fontSize: 12, color: '#6B6358' }}>JPG, PNG · plusieurs fichiers</p>
        </div>
      </div>
      </div>
      </div>
      

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        {onAutoSave ? (
          <span style={{ fontSize: 13, color: saveStatus === 'saved' ? '#059669' : saveStatus === 'saving' ? '#38a9b8' : '#6B6358', display: 'flex', alignItems: 'center', gap: 6 }}>
            {saveStatus === 'saving' ? 'Sauvegarde…' : saveStatus === 'saved' ? '✓ Sauvegardé' : ''}
          </span>
        ) : <span />}
        <div style={{ display: 'flex', gap: 12 }}>
          {/*<button className="btn-secondary" onClick={onCancel}>{onAutoSave ? 'Fermer' : 'Annuler'}</button>*/}
          {!onAutoSave && (
            <button className="btn-primary" onClick={() => onSave(data)} disabled={!data.name}>
              <Save size={16} /> {initial ? 'Enregistrer' : 'Créer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default BuildingForm