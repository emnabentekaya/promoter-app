import React, { useState, useMemo, useEffect } from 'react';
import { Building2, Plus, ArrowLeft, MapPin, Layers, Globe, Image as ImageIcon, FileText, Edit2, Trash2, Home, Bath, Utensils, Wind, TreePine, DoorOpen, Save, X, Upload, Copy, Filter, Search, Download, Sparkles, Check, Sofa, Bed, Package } from 'lucide-react';

// ============================================================================
// LOCATIONS (chargées depuis locations.json)
// ============================================================================




// ============================================================================
// TYPES
// ============================================================================

type PropertyType = 'appartement' | 'duplex' | 'triplex';
type Status = 'disponible' | 'reserve' | 'vendu';

interface Piece {
  name: string;
  surface: string;
  orientation: string;
  hasBalcony: boolean;
  hasTerrace: boolean;
  terraceOrientation: string;
  terraceSurface: string;
  terraceFunctional: boolean;
  balconyFunctional: boolean;
  balconyOrientation: string;
  balconySurface: string;
  luminosite: string;
  ensoleiment: string;
}

interface Room extends Piece {
  hasDressing: boolean;
  // Suite : si true, la SDB intégrée est renseignée
  isSuite: boolean;
  sdb: SalleDeBain;
}

interface SalleDeBain {
  name: string;
  surface: string;
  hasBathtub: boolean;
  hasShower: boolean;
  aerationType: 'naturelle' | 'mecanique';
}

interface Kitchen {
  surface: string;
  orientation: string;
  hasBalcony: boolean;
  balconyFunctional: boolean;
  balconyOrientation: string;
  balconySurface: string;
  luminosite: string;
  ensoleiment: string;
  kitchenType: 'ouverte' | 'fermee';
}

interface Apartment {
  id: string;
  propertyType: PropertyType;
  reference: string;
  typology: string;
  floor: number;
  price: string;
  surface: string;
  status: Status;
  hasGarden: boolean;
  gardenFunctional: boolean;
  gardenSurface: string;
  gardenOrientation: string;
  hasCellier: boolean;
  cellierSurface: string;
  waterPoints: number;
  kitchen: Kitchen;
  salon: Piece;
  rooms: Room[];          // toutes les chambres ; suites = celles avec isSuite=true
  bathRooms: SalleDeBain[]; // SDB hors suites
  dayNightSeparation: boolean;
  entranceType: 'hall' | 'salon';
  freeNote: string;
  // Notes sur 10 (indice de bonheur = moyenne × 10)
  noteCirculation: string;
  noteEnsoleillement: string;
  noteLumiere: string;
  noteDimensions: string;
  plans: string[];
  photos: string[];
}

interface Building {
  id: string;
  name: string;
  immediateHandover: boolean;
  handoverMonth?: string;
  handoverYear?: string;
  contact:string;
  governorate: string;
  city: string;
  neighborhood: string;
  mapsLink: string;
  developer: string;
  floors: number;
  websiteLink: string;
  facebookLink: string;
  instagramLink: string;
  parkingAerialPrice: string;
  parkingBasementPrice: string;
  meterPriceS0: string;
  meterPriceS1: string;
  meterPriceS2: string;
  meterPriceS3: string;
  meterPriceS4: string;
  meterPriceTerrace: string;
  meterPriceGarden: string;
  meterPriceCellier: string;
  projectPhotos: string[];
  apartments: Apartment[];
}

interface ClientCriteria {
  clientName: string;
  clientEmail: string;
  propertyTypes: PropertyType[];
  budgetMin: string;
  budgetMax: string;
  governorates: string[];
  cities: string[];
  neighborhoods: string[];
  typologies: string[];
  surfaceMin: string;
  surfaceMax: string;
  needsParentalSuite: boolean;
  needsTerrace: boolean;
  needsFunctionalTerrace: boolean;
  needsGarden: boolean;
  needsDayNightSeparation: boolean;
  kitchenType: 'any' | 'ouverte' | 'fermee';
  entranceType: 'any' | 'hall' | 'salon';
  minHappinessIndex: number;
  onlyAvailable: boolean;
}

// ============================================================================
// FACTORIES (objets vides par défaut)
// ============================================================================

const emptyKitchen = (): Kitchen => ({
  surface: '', orientation: '', hasBalcony: false, balconyFunctional: true,
  balconyOrientation: '', balconySurface: '', luminosite: '', ensoleiment: '',
  kitchenType: 'ouverte'
});

const emptySalon = (): Piece => ({
  name: 'Salon', surface: '', orientation: '',
  hasBalcony: false, hasTerrace: false,
  terraceOrientation: '', terraceSurface: '', terraceFunctional: true,
  balconyFunctional: true, balconyOrientation: '', balconySurface: '',
  luminosite: '', ensoleiment: ''
});

const emptySalleDeBain = (label = ''): SalleDeBain => ({
  name: label, surface: '', hasBathtub: false, hasShower: true,
  aerationType: 'naturelle'
});

const emptyRoom = (index: number): Room => ({
  name: `Chambre ${index + 1}`, surface: '', orientation: '',
  hasBalcony: false, hasTerrace: false,
  terraceOrientation: '', terraceSurface: '', terraceFunctional: true,
  balconyFunctional: true, balconyOrientation: '', balconySurface: '',
  luminosite: '', ensoleiment: '',
  hasDressing: false,
  isSuite: false,
  sdb: emptySalleDeBain('SDB suite')
});

const emptyApartment = (): Apartment => ({
  id: 'a' + Math.random().toString(36).slice(2, 9),
  propertyType: 'appartement', reference: '', typology: 's+2', floor: 1,
  price: '', surface: '', status: 'disponible',
  hasGarden: false, gardenFunctional: true, gardenSurface: '', gardenOrientation: '',
  hasCellier: false, cellierSurface: '',
  waterPoints: 1,
  kitchen: emptyKitchen(),
  salon: emptySalon(),
  rooms: [emptyRoom(0), emptyRoom(1)],  // s+2 par défaut → 2 chambres
  bathRooms: [emptySalleDeBain('SDB')],
  dayNightSeparation: false, entranceType: 'hall',
  freeNote: '',
  noteCirculation: '', noteEnsoleillement: '', noteLumiere: '', noteDimensions: '',
  plans: [], photos: []
});

const emptyCriteria = (): ClientCriteria => ({
  clientName: '', clientEmail: '', propertyTypes: [],
  budgetMin: '', budgetMax: '',
  governorates: [], cities: [], neighborhoods: [], typologies: [],
  surfaceMin: '', surfaceMax: '',
  needsParentalSuite: false, needsTerrace: false, needsFunctionalTerrace: false,
  needsGarden: false, needsDayNightSeparation: false,
  kitchenType: 'any', entranceType: 'any',
  minHappinessIndex: 0, onlyAvailable: true
});

// ============================================================================
// HELPERS DÉRIVÉS
// ============================================================================

function nbChambres(typology: string): number {
  switch (typology) {
    case 's+0': return 0;
    case 's+1': return 1;
    case 's+2': return 2;
    case 's+3': return 3;
    case 's+4': return 4;
    default: return 0;
  }
}

const getSuites = (a: Apartment): Room[] => a.rooms.filter(r => r.isSuite);
const getSimpleRooms = (a: Apartment): Room[] => a.rooms.filter(r => !r.isSuite);
const hasParentalSuite = (a: Apartment): boolean => a.rooms.some(r => r.isSuite);

const hasTerrace = (a: Apartment): boolean =>
  a.salon.hasTerrace || a.rooms.some(r => r.hasTerrace);

const hasFunctionalTerrace = (a: Apartment): boolean =>
  (a.salon.hasTerrace && a.salon.terraceFunctional) ||
  a.rooms.some(r => r.hasTerrace && r.terraceFunctional);

const hasGarden = (a: Apartment): boolean => a.hasGarden;

// Vérifie si une chambre a au moins un champ saisi (pour confirm)
const isRoomFilled = (r: Room): boolean =>
  !!(r.surface || r.orientation || r.luminosite || r.ensoleiment ||
     r.hasBalcony || r.hasTerrace || r.hasDressing || r.isSuite);

// Indice de bonheur = moyenne des 4 notes /10 ramenée /100
const computeHappinessIndex = (a: Apartment): number => {
  const notes = [a.noteCirculation, a.noteEnsoleillement, a.noteLumiere, a.noteDimensions]
    .map(n => parseFloat(n)).filter(n => !isNaN(n) && n >= 0 && n <= 10);
  if (notes.length === 0) return 0;
  return Math.round((notes.reduce((s, n) => s + n, 0) / notes.length) * 10);
};

// Calcul indicatif du prix depuis la grille
const calculatePriceFromGrid = (a: Apartment, b: Building): number => {
  const m: Record<string, string> = {
    's+0': b.meterPriceS0, 's+1': b.meterPriceS1, 's+2': b.meterPriceS2,
    's+3': b.meterPriceS3, 's+4': b.meterPriceS4
  };
  const prixM2 = parseFloat(m[a.typology] || '0');
  if (!prixM2) return 0;
  let total = (parseFloat(a.surface) || 0) * prixM2;
  // Terrasse : salon + chambres
  const terrasseTotal = (a.salon.hasTerrace ? parseFloat(a.salon.terraceSurface) || 0 : 0)
    + a.rooms.reduce((s, r) => s + (r.hasTerrace ? parseFloat(r.terraceSurface) || 0 : 0), 0);
  if (b.meterPriceTerrace && terrasseTotal > 0) total += terrasseTotal * parseFloat(b.meterPriceTerrace);
  if (b.meterPriceGarden && a.hasGarden) total += (parseFloat(a.gardenSurface) || 0) * parseFloat(b.meterPriceGarden);
  if (b.meterPriceCellier && a.hasCellier) total += (parseFloat(a.cellierSurface) || 0) * parseFloat(b.meterPriceCellier);
  return Math.round(total);
};

const formatPrice = (p: string | number): string => {
  const n = typeof p === 'string' ? parseInt(p) : p;
  if (!n || isNaN(n)) return '—';
  return new Intl.NumberFormat('fr-TN').format(n) + ' TND';
};

const formatFloor = (a: Apartment): string => `Étage ${a.floor}`;

const propertyLabel = (t: PropertyType): string =>
  t === 'duplex' ? 'Duplex' : t === 'triplex' ? 'Triplex' : 'Appartement';

const TYPOLOGIES = ['s+0', 's+1', 's+2', 's+3', 's+4'];
const ORIENTATIONS = ['Nord', 'Sud', 'Est', 'Ouest', 'Nord-Est', 'Nord-Ouest', 'Sud-Est', 'Sud-Ouest'];
const GOVERNORATES = ['Tunis', 'Ariana', 'Ben Arous', 'La Manouba', 'Nabeul', 'Bizerte', 'Béja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili', 'Zaghouan'];

// ============================================================================
// MOCK DATA
// ============================================================================

const mockApt1 = (): Apartment => ({
  ...emptyApartment(),
  id: 'a1', reference: 'A3-2', typology: 's+2', floor: 3,
  price: '420000', surface: '120', waterPoints: 1,
  kitchen: { ...emptyKitchen(), surface: '14', orientation: 'Est', kitchenType: 'ouverte', luminosite: '7', ensoleiment: '6' },
  salon: { ...emptySalon(), surface: '35', orientation: 'Sud', hasTerrace: true, terraceSurface: '12', terraceOrientation: 'Sud', terraceFunctional: true, luminosite: '9', ensoleiment: '9' },
  rooms: [
    { ...emptyRoom(0), name: 'Chambre parentale', surface: '20', orientation: 'Est', luminosite: '8', ensoleiment: '7', isSuite: true, hasDressing: true, sdb: { name: 'SDB suite', surface: '8', hasBathtub: true, hasShower: true, aerationType: 'naturelle' } },
    { ...emptyRoom(1), name: 'Chambre 2', surface: '14', orientation: 'Nord', luminosite: '6', ensoleiment: '5' }
  ],
  bathRooms: [{ name: 'SDB commune', surface: '5', hasBathtub: false, hasShower: true, aerationType: 'mecanique' }],
  dayNightSeparation: true,
  noteCirculation: '8', noteEnsoleillement: '9', noteLumiere: '8', noteDimensions: '7',
  freeNote: 'Très bel ensoleillement, vue dégagée.'
});

const mockApt2 = (): Apartment => ({
  ...emptyApartment(),
  id: 'a2', reference: 'D5-6', typology: 's+3', propertyType: 'duplex', floor: 5,
  price: '720000', surface: '195', waterPoints: 2,
  kitchen: { ...emptyKitchen(), surface: '18', orientation: 'Est', kitchenType: 'fermee', luminosite: '7', ensoleiment: '6' },
  salon: { ...emptySalon(), surface: '50', orientation: 'Sud-Ouest', hasTerrace: true, terraceSurface: '40', terraceFunctional: true, luminosite: '10', ensoleiment: '10' },
  rooms: [
    { ...emptyRoom(0), name: 'Suite parentale', surface: '30', orientation: 'Sud', luminosite: '9', ensoleiment: '9', isSuite: true, hasDressing: true, sdb: { name: 'SDB suite', surface: '10', hasBathtub: true, hasShower: true, aerationType: 'naturelle' } },
    { ...emptyRoom(1), name: 'Chambre 2', surface: '15' },
    { ...emptyRoom(2), name: 'Chambre 3', surface: '14' }
  ],
  bathRooms: [
    { name: 'SDB 1', surface: '6', hasBathtub: false, hasShower: true, aerationType: 'naturelle' },
    { name: 'SDB 2', surface: '4', hasBathtub: false, hasShower: true, aerationType: 'mecanique' }
  ],
  dayNightSeparation: true,
  noteCirculation: '9', noteEnsoleillement: '10', noteLumiere: '10', noteDimensions: '9',
  freeNote: 'Duplex penthouse avec terrasse panoramique.'
});

const initialBuildings: Building[] = [
  {
    id: 'b1', name: 'Résidence Les Jasmins', handoverDate: '2026-09-30',
    governorate: 'Tunis', city: 'La Marsa', neighborhood: 'Marsa Plage',
    mapsLink: 'https://maps.google.com/?q=La+Marsa', developer: 'Groupe Tarrak',
    floors: 6, websiteLink: 'https://example.com',
    facebookLink: 'https://facebook.com/example', instagramLink: 'https://instagram.com/example',
    parkingAerialPrice: '15000', parkingBasementPrice: '25000',
    meterPriceS0: '3500', meterPriceS1: '3200', meterPriceS2: '3000', meterPriceS3: '2800', meterPriceS4: '2600',
    meterPriceTerrace: '1600', meterPriceGarden: '1600', meterPriceCellier: '1000',
    projectPhotos: [],
    apartments: [mockApt1(), mockApt2()]
  }
];

// ============================================================================
// MATCHING ENGINE
// ============================================================================

interface MatchedApartment {
  apartment: Apartment;
  building: Building;
  score: number;
  reasons: string[];
  happiness: number;
}

function matchApartments(buildings: Building[], criteria: ClientCriteria): MatchedApartment[] {
  const results: MatchedApartment[] = [];

  buildings.forEach(building => {
    if (criteria.governorates.length > 0 && !criteria.governorates.includes(building.governorate)) return;
    if (criteria.cities.length > 0 && !criteria.cities.includes(building.city)) return;
    if (criteria.neighborhoods.length > 0 && !criteria.neighborhoods.includes(building.neighborhood)) return;

    building.apartments.forEach(apt => {
      const happiness = computeHappinessIndex(apt);

      if (criteria.onlyAvailable && apt.status !== 'disponible') return;
      if (criteria.propertyTypes.length > 0 && !criteria.propertyTypes.includes(apt.propertyType)) return;
      if (criteria.typologies.length > 0 && !criteria.typologies.includes(apt.typology)) return;

      const price = parseInt(apt.price) || 0;
      if (criteria.budgetMin && price < parseInt(criteria.budgetMin)) return;
      if (criteria.budgetMax && price > parseInt(criteria.budgetMax)) return;

      const surface = parseInt(apt.surface) || 0;
      if (criteria.surfaceMin && surface < parseInt(criteria.surfaceMin)) return;
      if (criteria.surfaceMax && surface > parseInt(criteria.surfaceMax)) return;

      if (criteria.needsParentalSuite && !hasParentalSuite(apt)) return;
      if (criteria.needsTerrace && !hasTerrace(apt)) return;
      if (criteria.needsFunctionalTerrace && !hasFunctionalTerrace(apt)) return;
      if (criteria.needsGarden && !hasGarden(apt)) return;
      if (criteria.needsDayNightSeparation && !apt.dayNightSeparation) return;
      if (criteria.kitchenType !== 'any' && apt.kitchen.kitchenType !== criteria.kitchenType) return;
      if (criteria.entranceType !== 'any' && apt.entranceType !== criteria.entranceType) return;
      if (happiness < criteria.minHappinessIndex) return;

      let score = 50;
      const reasons: string[] = [];
      if (happiness >= 80) { score += 20; reasons.push(`Bonheur ${happiness}/100`); }
      else if (happiness >= 60) { score += 10; reasons.push(`Bonheur ${happiness}/100`); }
      if (criteria.needsParentalSuite && hasParentalSuite(apt)) { score += 10; reasons.push('Suite parentale'); }
      if (criteria.needsTerrace && hasFunctionalTerrace(apt)) { score += 10; reasons.push('Terrasse fonctionnelle'); }
      if (criteria.needsGarden && hasGarden(apt)) { score += 10; reasons.push('Jardin'); }
      if (criteria.needsDayNightSeparation && apt.dayNightSeparation) { score += 5; reasons.push('Séparation jour/nuit'); }
      if (criteria.budgetMax) {
        const maxBudget = parseInt(criteria.budgetMax);
        if (price < maxBudget * 0.9) { score += 5; reasons.push('Sous le budget max'); }
      }

      results.push({ apartment: apt, building, score, reasons, happiness });
    });
  });

  return results.sort((a, b) => b.score - a.score);
}

// ============================================================================
// ROOT APP
// ============================================================================

type View = 'list' | 'building-form' | 'building-detail' | 'apartment-form' | 'selection-criteria' | 'selection-results' | 'catalog-browse';

export default function ArchitectApp() {
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [view, setView] = useState<View>('list');
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);
  const [editingApartmentId, setEditingApartmentId] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<ClientCriteria>(emptyCriteria());

  const activeBuilding = buildings.find(b => b.id === activeBuildingId);

  /*const saveBuilding = (b: Building) => {
    setBuildings(prev => {
      const exists = prev.find(p => p.id === b.id);
      if (exists) return prev.map(p => p.id === b.id ? b : p);
      return [...prev, b];
    });
    setActiveBuildingId(b.id);
    setView('building-detail');
  };*/
  const [isSaving, setIsSaving] = useState(false);

  const saveBuilding = async (b: Building) => {
    setIsSaving(true);
    try {
      const isNew = !buildings.find(p => p.id === b.id);
      const response = isNew
          ? await buildingsApi.create(b)
          : await buildingsApi.update(b.id, b);

      // Use the building returned by the backend (it may have a real DB-generated id)
      const savedBuilding = response.data;

      setBuildings(prev => {
        const exists = prev.find(p => p.id === savedBuilding.id);
        if (exists) return prev.map(p => p.id === savedBuilding.id ? savedBuilding : p);
        return [...prev, savedBuilding];
      });
      setActiveBuildingId(savedBuilding.id);
      setView('building-detail');
    } catch (error) {
      console.error('Erreur sauvegarde immeuble:', error);
      alert('Erreur lors de la sauvegarde. Vérifiez votre connexion ou réessayez.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBuilding = (id: string) => {
    if (!confirm('Supprimer cet immeuble ?')) return;
    setBuildings(prev => prev.filter(b => b.id !== id));
    setView('list');
  };

  const saveApartment = (apt: Apartment, replicateFloors: number[] = []) => {
    if (!activeBuilding) return;
    const updatedApts = [...activeBuilding.apartments];
    const idx = updatedApts.findIndex(a => a.id === apt.id);
    if (idx >= 0) updatedApts[idx] = apt;
    else updatedApts.push(apt);
    replicateFloors.forEach(floor => {
      if (floor !== apt.floor) {
        updatedApts.push({
          ...apt, id: 'a' + Math.random().toString(36).slice(2, 9),
          floor, reference: apt.reference.replace(/\d+/, String(floor))
        });
      }
    });
    setBuildings(prev => prev.map(b => b.id === activeBuilding.id ? { ...b, apartments: updatedApts } : b));
    setView('building-detail');
    setEditingApartmentId(null);
  };

  const deleteApartment = (aptId: string) => {
    if (!activeBuilding) return;
    if (!confirm('Supprimer ce bien ?')) return;
    setBuildings(prev => prev.map(b => b.id === activeBuilding.id
      ? { ...b, apartments: b.apartments.filter(a => a.id !== aptId) } : b
    ));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', fontFamily: '"Inter", system-ui, sans-serif', color: '#1F1B17' }}>
      <GlobalStyles />
      {view === 'list' && (
        <BuildingList buildings={buildings}
          onAdd={() => { setActiveBuildingId(null); setView('building-form'); }}
          onSelect={(id) => { setActiveBuildingId(id); setView('building-detail'); }}
          onStartSelection={() => { setCriteria(emptyCriteria()); setView('selection-criteria'); }}
          onBrowseCatalog={() => { setCriteria(emptyCriteria()); setView('catalog-browse'); }} />
      )}
      {view === 'catalog-browse' && (
        <CatalogBrowse buildings={buildings} criteria={criteria} setCriteria={setCriteria}
          onBack={() => setView('list')}
          onEditApartment={(buildingId, aptId) => { setActiveBuildingId(buildingId); setEditingApartmentId(aptId); setView('apartment-form'); }}
          onConvertToClientSelection={() => setView('selection-criteria')} />
      )}
      {view === 'building-form' && (
        <BuildingForm initial={activeBuilding} onSave={saveBuilding}
          onCancel={() => setView(activeBuildingId ? 'building-detail' : 'list')} />
      )}
      {view === 'building-detail' && activeBuilding && (
        <BuildingDetail building={activeBuilding}
          onBack={() => setView('list')} onEdit={() => setView('building-form')}
          onDelete={() => deleteBuilding(activeBuilding.id)}
          onAddApartment={() => { setEditingApartmentId(null); setView('apartment-form'); }}
          onEditApartment={(id) => { setEditingApartmentId(id); setView('apartment-form'); }}
          onDeleteApartment={deleteApartment} />
      )}
      {view === 'apartment-form' && activeBuilding && (
        <ApartmentForm building={activeBuilding}
          initial={activeBuilding.apartments.find(a => a.id === editingApartmentId)}
          onSave={saveApartment} onCancel={() => setView('building-detail')} />
      )}
      {view === 'selection-criteria' && (
        <SelectionCriteria buildings={buildings} criteria={criteria} setCriteria={setCriteria}
          onSubmit={() => setView('selection-results')} onCancel={() => setView('list')} />
      )}
      {view === 'selection-results' && (
        <SelectionResults buildings={buildings} criteria={criteria} onBack={() => setView('selection-criteria')} />
      )}
    </div>
  );
}

// ============================================================================
// GLOBAL STYLES
// ============================================================================

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      .serif { font-family: 'Fraunces', Georgia, serif; }
      .btn-primary { background: #38a9b8; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.15s; font-family: inherit; }
      .btn-primary:hover { background: #2d8a98; }
      .btn-primary:disabled { background: #D9CFC0; cursor: not-allowed; }
      .btn-secondary { background: transparent; color: #1F1B17; border: 1px solid #D9CFC0; padding: 9px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: inherit; transition: all 0.15s; }
      .btn-secondary:hover { background: #F0EBE0; }
      .btn-ghost { background: transparent; color: #6B6358; border: none; padding: 6px 10px; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-family: inherit; border-radius: 6px; }
      .btn-ghost:hover { background: #F0EBE0; color: #1F1B17; }
      .input, .select, .textarea { width: 100%; padding: 10px 12px; border: 1px solid #D9CFC0; background: white; border-radius: 8px; font-size: 14px; font-family: inherit; color: #1F1B17; transition: border 0.15s; }
      .input:focus, .select:focus, .textarea:focus { outline: none; border-color: #38a9b8; }
      .label { font-size: 12px; font-weight: 500; color: #2e2c29; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; display: block; }
      .card { background: white; border: 1px solid #E8DFD0; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
      .section-title { font-size: 13px; font-weight: 600; color: #38a9b8; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid #E8DFD0; }
      .subsection-title { font-size: 14px; font-weight: 600; color: #1F1B17; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
      .pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
      .toggle-group { display: flex; gap: 8px; flex-wrap: wrap; }
      .toggle-btn { padding: 8px 14px; border: 1px solid #D9CFC0; background: white; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: inherit; color: #1F1B17; transition: all 0.15s; }
      .toggle-btn.active { background: #1F1B17; color: white; border-color: #1F1B17; }
      .toggle-btn:hover:not(.active) { border-color: #38a9b8; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
      .grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
      @media (max-width: 700px) { .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; } }
      .upload-zone { border: 2px dashed #D9CFC0; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.15s; background: #FAF8F3; }
      .upload-zone:hover { border-color: #38a9b8; background: white; }
      .stat { background: #FAF8F3; padding: 14px 16px; border-radius: 10px; border: 1px solid #E8DFD0; }
      .stat-label { font-size: 11px; color: #6B6358; text-transform: uppercase; letter-spacing: 0.06em; }
      .stat-value { font-size: 18px; font-weight: 600; margin-top: 4px; }
      .apt-row { padding: 16px; background: white; border: 1px solid #E8DFD0; border-radius: 10px; display: flex; align-items: center; gap: 16px; margin-bottom: 8px; cursor: pointer; transition: all 0.15s; }
      .apt-row:hover { border-color: #38a9b8; transform: translateY(-1px); }
      .checkbox-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 14px; cursor: pointer; }
      .checkbox-row input { width: 18px; height: 18px; accent-color: #38a9b8; cursor: pointer; }
      .chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 13px; background: white; border: 1px solid #D9CFC0; cursor: pointer; transition: all 0.15s; font-family: inherit; color: #1F1B17; }
      .chip.active { background: #1F1B17; color: white; border-color: #1F1B17; }
      .chip:hover:not(.active) { border-color: #38a9b8; }
      .result-card { background: white; border-radius: 14px; overflow: hidden; transition: all 0.2s; }
      .result-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(56, 169, 184, 0.08); }
      .score-badge { position: absolute; top: 12px; right: 12px; background: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #38a9b8; border: 1px solid #E8DFD0; }
      .type-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
      .type-badge.appartement { background: #EDE6D6; color: #6B5634; }
      .type-badge.duplex { background: #D8DCE5; color: #2D3E5C; }
      .type-badge.triplex { background: #E5D8E0; color: #5C2D4E; }
      .piece-box { background: #FAF8F3; border: 1px solid #E8DFD0; border-radius: 10px; padding: 18px; margin-bottom: 14px; }
      .sub-box { background: white; border: 1px dashed #D9CFC0; border-radius: 8px; padding: 14px; margin-top: 12px; }
    `}</style>
  );
}

// ============================================================================
// BUILDING LIST
// ============================================================================

interface BuildingListProps {
  buildings: Building[];
  onAdd: () => void;
  onSelect: (id: string) => void;
  onStartSelection: () => void;
  onBrowseCatalog: () => void;
}

function BuildingList({ buildings, onAdd, onSelect, onStartSelection, onBrowseCatalog }: BuildingListProps) {
  const totalApts = buildings.reduce((a, b) => a + b.apartments.length, 0);
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#38a9b8', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Espace architecte</p>
          <h1 className="serif" style={{ fontSize: 44, margin: '8px 0 0', fontWeight: 500, letterSpacing: '-0.02em' }}>Mes projets immobiliers</h1>
          <p style={{ color: '#6B6358', margin: '8px 0 0', fontSize: 15 }}>{buildings.length} immeuble{buildings.length > 1 ? 's' : ''} · {totalApts} bien{totalApts > 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={onBrowseCatalog}><Search size={16} /> Explorer le catalogue</button>
          <button className="btn-secondary" onClick={onStartSelection}><Sparkles size={16} /> Sélection client</button>
          <button className="btn-primary" onClick={onAdd}><Plus size={18} /> Nouvel immeuble</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {buildings.map(b => {
          const nbApt = b.apartments.filter(a => a.propertyType === 'appartement').length;
          const nbDuplex = b.apartments.filter(a => a.propertyType === 'duplex').length;
          const nbTriplex = b.apartments.filter(a => a.propertyType === 'triplex').length;
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
                  <span style={{ marginLeft: 'auto', color: '#6B6358', fontSize: 13 }}>{b.handoverDate ? new Date(b.handoverDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '—'}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', minHeight: 280, border: '2px dashed #D9CFC0', background: 'transparent', marginBottom: 0 }} onClick={onAdd}>
          <Plus size={32} color="#38a9b8" />
          <p style={{ margin: '12px 0 0', color: '#6B6358', fontSize: 14 }}>Ajouter un nouvel immeuble</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BUILDING FORM
// ============================================================================

interface BuildingFormProps { initial?: Building; onSave: (b: Building) => void; onCancel: () => void; }

function BuildingForm({ initial, onSave, onCancel }: BuildingFormProps) {
  const [data, setData] = useState<Building>(initial || {
    id: 'b' + Math.random().toString(36).slice(2, 9),
    name: '', handoverMonth: '',handoverYear: '',immediateHandover: false, governorate: '', city: '', neighborhood: '',
    mapsLink: '', developer: '', floors: 0, websiteLink: '', facebookLink: '', instagramLink: '',
    parkingAerialPrice: '', parkingBasementPrice: '',
    meterPriceS0: '', meterPriceS1: '', meterPriceS2: '', meterPriceS3: '', meterPriceS4: '',
    meterPriceTerrace: '', meterPriceGarden: '', meterPriceCellier: '',contact: '',
    projectPhotos: [], apartments: []
  });
  const update = <K extends keyof Building>(k: K, v: Building[K]) => setData(d => ({ ...d, [k]: v }));
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
      <button className="btn-ghost" onClick={onCancel} style={{ marginBottom: 20 ,fontSize:'20px'}}><ArrowLeft size={16} /> Retour</button>
      <h1 className="serif" style={{ fontSize: 36, margin: '0 0 32px', fontWeight: 500 }}>{initial ? 'Modifier l\'immeuble' : 'Nouvel immeuble'}</h1>
      <div className="card">

        <h3 className="section-title">Identification</h3>
        <div className="grid-4">
        <div style={{ marginBottom: 16 }}>
          <label className="label">Nom du projet *</label>
          <input className="input" value={data.name} onChange={e => update('name', e.target.value)} placeholder="Ex: Résidence Les Jasmins" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="label">Promoteur</label>
          <input className="input" value={data.developer} onChange={e => update('developer', e.target.value)} />
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
            <option value="9">R+9</option>
            <option value="10">R+10</option>
          </select>
        </div>
        <div>
          <label className="label">Contact</label>
          <input className="input" type="string" value={data.contact} onChange={e => update('contact', e.target.value)} />
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
      </div>
      <div className="card">
        <h3 className="section-title">Localisation</h3>
        <div className="grid-3">
          <div><label className="label">Gouvernorat</label>
            <select className="select" value={data.governorate} onChange={e => update('governorate', e.target.value)}>
              <option value="">— Choisir —</option>{GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
            </select></div>
          <div><label className="label">Ville</label>
            <input className="input" value={data.city} onChange={e => update('city', e.target.value)} /></div>
          <div><label className="label">Quartier</label>
            <input className="input" value={data.neighborhood} onChange={e => update('neighborhood', e.target.value)} /></div>
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
          <div><label className="label">Cellier</label><input className="input" type="number" value={data.meterPriceCellier} onChange={e => update('meterPriceCellier', e.target.value)} /></div>
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


      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
        <button className="btn-secondary" onClick={onCancel}>Annuler</button>
        <button className="btn-primary" onClick={() => onSave(data)} disabled={!data.name}>
          <Save size={16} /> {initial ? 'Enregistrer' : 'Créer'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// BUILDING DETAIL
// ============================================================================

interface BuildingDetailProps {
  building: Building;
  onBack: () => void; onEdit: () => void; onDelete: () => void;
  onAddApartment: () => void;
  onEditApartment: (id: string) => void;
  onDeleteApartment: (id: string) => void;
}

function BuildingDetail({ building, onBack, onEdit, onDelete, onAddApartment, onEditApartment, onDeleteApartment }: BuildingDetailProps) {
  const [filterFloor, setFilterFloor] = useState<number | 'all'>('all');
  const [filterTypology, setFilterTypology] = useState<string>('all');
  const filteredApartments = building.apartments.filter(apt => {
    if (filterFloor !== 'all' && apt.floor !== filterFloor) return false;
    if (filterTypology !== 'all' && apt.typology !== filterTypology) return false;
    return true;
  });
  // Étages réellement présents dans cet immeuble (pour ne pas afficher d'étages vides)
  const availableFloors = Array.from(new Set(building.apartments.map(a => a.floor))).sort((a, b) => a - b);
  const availableTypologies = Array.from(new Set(building.apartments.map(a => a.typology))).sort();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 20 ,fontSize:'20px'}}><ArrowLeft size={16} /> Tous les projets</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', color: '#38a9b8', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>{building.developer || 'Promoteur'}</p>
          <h1 className="serif" style={{ fontSize: 40, margin: '6px 0 8px', fontWeight: 500 }}>{building.name}</h1>
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
        <div className="stat"><div className="stat-label">Remise des clés</div><div className="stat-value">{building.handoverDate ? new Date(building.handoverDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '—'}</div></div>
        <div className="stat"><div className="stat-label">Étages</div><div className="stat-value">{'R+' + (building.floors - 1) || '—'}</div></div>
        <div className="stat"><div className="stat-label">Biens</div><div className="stat-value">{building.apartments.length}</div></div>
        <div className="stat"><div className="stat-label">Parking aérien</div><div className="stat-value" style={{ fontSize: 14 }}>{formatPrice(building.parkingAerialPrice)}</div></div>
        <div className="stat"><div className="stat-label">Parking sous-sol</div><div className="stat-value" style={{ fontSize: 14 }}>{formatPrice(building.parkingBasementPrice)}</div></div>
      </div>
      {/*<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '40px 0 20px' }}>
        <h2 className="serif" style={{ fontSize: 28, margin: 0, fontWeight: 500 }}>Biens</h2>
        <button className="btn-primary" onClick={onAddApartment}><Plus size={16} /> Ajouter un bien</button>
      </div>
      */}
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

// ============================================================================
// APARTMENT FORM
// ============================================================================

interface ApartmentFormProps {
  building: Building;
  initial?: Apartment;
  onSave: (a: Apartment, replicate: number[]) => void;
  onCancel: () => void;
}

function ApartmentForm({ building, initial, onSave, onCancel }: ApartmentFormProps) {
  const [data, setData] = useState<Apartment>(initial || emptyApartment());
  const [replicateFloors, setReplicateFloors] = useState<number[]>([]);

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
      for (let i = current; i < target; i++) toAdd.push(emptyRoom(i));
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
      for (let i = current; i < target; i++) toAdd.push(emptySalleDeBain(`SDB ${i + 1}`));
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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
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

      {/* JARDIN & CELLIER 
      <div className="card">
        <h3 className="section-title">Annexes</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
          <label className="checkbox-row">
            <input type="checkbox" checked={data.hasGarden} onChange={e => update('hasGarden', e.target.checked)} />
            <TreePine size={16} color="#38a9b8" /> Jardin
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={data.hasCellier} onChange={e => update('hasCellier', e.target.checked)} />
            <Package size={16} color="#38a9b8" /> Cellier
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
        {data.hasCellier && (
          <div className="sub-box">
            <h4 className="subsection-title"><Package size={14} /> Cellier</h4>
            <div>
              <label className="label">Surface (m²)</label>
              <input className="input" type="number" value={data.cellierSurface} onChange={e => update('cellierSurface', e.target.value)} />
            </div>
          </div>
        )}
      </div>
*/}
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
        <div style={{ marginTop: 16 }}>
          <label className="label">Note libre</label>
          <textarea className="textarea" rows={4} value={data.freeNote} onChange={e => update('freeNote', e.target.value)} style={{ resize: 'vertical', minHeight: 100 }} />
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

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
        <button className="btn-secondary" onClick={onCancel}>Annuler</button>
        <button className="btn-primary" onClick={() => onSave(data, replicateFloors)}>
          <Save size={16} /> {initial ? 'Enregistrer' : 'Créer'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ROOM EDITOR (avec isSuite)
// ============================================================================

interface RoomEditorProps {
  room: Room;
  index: number;
  onChange: (patch: Partial<Room>) => void;
  onSdbChange: (patch: Partial<SalleDeBain>) => void;
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

// ============================================================================
// SELECTION CRITERIA
// ============================================================================

interface SelectionCriteriaProps {
  buildings: Building[];
  criteria: ClientCriteria;
  setCriteria: React.Dispatch<React.SetStateAction<ClientCriteria>>;
  onSubmit: () => void;
  onCancel: () => void;
}

function SelectionCriteria({ buildings, criteria, setCriteria, onSubmit, onCancel }: SelectionCriteriaProps) {
  const update = <K extends keyof ClientCriteria>(k: K, v: ClientCriteria[K]) => setCriteria(c => ({ ...c, [k]: v }));
  type ArrKey = 'governorates' | 'cities' | 'neighborhoods' | 'typologies' | 'propertyTypes';
  const toggleInArray = (k: ArrKey, value: string) => {
    const arr = criteria[k] as string[];
    update(k, (arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]) as ClientCriteria[ArrKey]);
  };

  const govs = Array.from(new Set(buildings.map(b => b.governorate).filter(Boolean)));
  const cities = Array.from(new Set(buildings
    .filter(b => criteria.governorates.length === 0 || criteria.governorates.includes(b.governorate))
    .map(b => b.city).filter(Boolean)));
  const hoods = Array.from(new Set(buildings
    .filter(b => criteria.governorates.length === 0 || criteria.governorates.includes(b.governorate))
    .filter(b => criteria.cities.length === 0 || criteria.cities.includes(b.city))
    .map(b => b.neighborhood).filter(Boolean)));

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
        <div className="grid-2">
          <div><label className="label">Nom</label><input className="input" value={criteria.clientName} onChange={e => update('clientName', e.target.value)} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={criteria.clientEmail} onChange={e => update('clientEmail', e.target.value)} /></div>
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
            {cities.map(c => <button key={c} className={`chip ${criteria.cities.includes(c) ? 'active' : ''}`} onClick={() => toggleInArray('cities', c)}>{c}</button>)}
          </div></div>
        <div><label className="label">Quartiers</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {hoods.map(n => <button key={n} className={`chip ${criteria.neighborhoods.includes(n) ? 'active' : ''}`} onClick={() => toggleInArray('neighborhoods', n)}>{n}</button>)}
          </div></div>
      </div>

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

// ============================================================================
// SELECTION RESULTS
// ============================================================================

interface SelectionResultsProps { buildings: Building[]; criteria: ClientCriteria; onBack: () => void; }

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
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 20 }}><ArrowLeft size={16} /> Modifier les critères</button>
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
                  <p style={{ margin: 0, fontSize: 11, color: '#38a9b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{m.apartment.typology}</p>
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

// ============================================================================
// CATALOG BROWSE
// ============================================================================

interface CatalogBrowseProps {
  buildings: Building[];
  criteria: ClientCriteria;
  setCriteria: React.Dispatch<React.SetStateAction<ClientCriteria>>;
  onBack: () => void;
  onEditApartment: (buildingId: string, aptId: string) => void;
  onConvertToClientSelection: () => void;
}

function CatalogBrowse({ buildings, criteria, setCriteria, onBack, onEditApartment, onConvertToClientSelection }: CatalogBrowseProps) {
  const update = <K extends keyof ClientCriteria>(k: K, v: ClientCriteria[K]) => setCriteria(c => ({ ...c, [k]: v }));
  type ArrKey = 'governorates' | 'cities' | 'neighborhoods' | 'typologies' | 'propertyTypes';
  const toggleInArray = (k: ArrKey, value: string) => {
    const arr = criteria[k] as string[];
    update(k, (arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]) as ClientCriteria[ArrKey]);
  };
  const govs = Array.from(new Set(buildings.map(b => b.governorate).filter(Boolean)));
  const cities = Array.from(new Set(buildings.filter(b => criteria.governorates.length === 0 || criteria.governorates.includes(b.governorate)).map(b => b.city).filter(Boolean)));
  const hoods = Array.from(new Set(buildings.filter(b => criteria.governorates.length === 0 || criteria.governorates.includes(b.governorate)).filter(b => criteria.cities.length === 0 || criteria.cities.includes(b.city)).map(b => b.neighborhood).filter(Boolean)));
  const matches = useMemo(() => matchApartments(buildings, criteria), [buildings, criteria]);
  const activeFilters = [criteria.propertyTypes.length, criteria.budgetMin ? 1 : 0, criteria.budgetMax ? 1 : 0, criteria.governorates.length, criteria.cities.length, criteria.neighborhoods.length, criteria.typologies.length, criteria.surfaceMin ? 1 : 0, criteria.surfaceMax ? 1 : 0, criteria.needsParentalSuite ? 1 : 0, criteria.needsTerrace ? 1 : 0, criteria.needsFunctionalTerrace ? 1 : 0, criteria.needsGarden ? 1 : 0, criteria.needsDayNightSeparation ? 1 : 0, criteria.kitchenType !== 'any' ? 1 : 0, criteria.entranceType !== 'any' ? 1 : 0, criteria.minHappinessIndex > 0 ? 1 : 0].reduce((a, b) => a + b, 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 20 ,fontSize:'20px'}}><ArrowLeft size={16} /> Retour aux projets</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', color: '#38a9b8', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}><Search size={12} style={{ display: 'inline', verticalAlign: -1 }} /> Exploration</p>
          <h1 className="serif" style={{ fontSize: 40, margin: '8px 0 8px', fontWeight: 500 }}>
            {matches.length} bien{matches.length > 1 ? 's' : ''} {activeFilters > 0 ? `(${activeFilters} filtre${activeFilters > 1 ? 's' : ''})` : 'au total'}
          </h1>
        </div>
        {matches.length > 0 && <button className="btn-primary" onClick={onConvertToClientSelection}><Sparkles size={16} /> Convertir en sélection client</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'flex-start' }} className="catalog-layout">
        <style>{`@media (max-width: 900px) { .catalog-layout { grid-template-columns: 1fr !important; } }`}</style>
        <div style={{ position: 'sticky', top: 20 }}>
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
                    <p style={{ margin: 0, fontSize: 10, color: '#38a9b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{m.apartment.typology}</p>
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
                      {m.happiness > 0 && <div style={{ fontSize: 12, color: '#38a9b8', fontWeight: 600 }}>{m.happiness}/100</div>}
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

// ============================================================================
// PDF SYNTHESIS
// ============================================================================

function generateSynthesisHTML(criteria: ClientCriteria, matches: MatchedApartment[]): string {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const aptsHtml = matches.map(m => {
    const pricePerM2 = m.apartment.price && m.apartment.surface ? Math.round(parseInt(m.apartment.price) / parseInt(m.apartment.surface)) : 0;
    const roomsList = m.apartment.rooms.map(r => `${r.name || (r.isSuite ? 'Suite' : 'Chambre')}${r.surface ? ` (${r.surface}m²)` : ''}${r.orientation ? ` · ${r.orientation}` : ''}`).join(' · ');
    return `<div class="apt-card">
      <div class="apt-header">
        <div>
          <span class="type-tag ${m.apartment.propertyType}">${propertyLabel(m.apartment.propertyType)}</span>
          <span class="apt-typo">${m.apartment.typology} · ${m.building.city}</span>
          <h2 class="serif apt-title">${m.building.name} — Réf. ${m.apartment.reference}</h2>
          <div class="apt-meta">${m.building.neighborhood} · ${formatFloor(m.apartment)} · Livraison ${m.building.handoverDate ? new Date(m.building.handoverDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—'}</div>
        </div>
        <div style="text-align:right;">
          <div class="apt-price">${formatPrice(m.apartment.price)}</div>
          <div class="apt-price-sub">${m.apartment.surface} m² · ${pricePerM2.toLocaleString('fr-FR')} TND/m²</div>
          ${m.happiness > 0 ? `<div class="happiness">${m.happiness}/100</div>` : ''}
        </div>
      </div>
      <div class="apt-feats">
        ${hasParentalSuite(m.apartment) ? '<div class="apt-feat">✓ <strong>Suite parentale</strong></div>' : ''}
        ${hasTerrace(m.apartment) ? `<div class="apt-feat">✓ <strong>Terrasse</strong>${hasFunctionalTerrace(m.apartment) ? ' (fonctionnelle)' : ''}</div>` : ''}
        ${m.apartment.hasGarden ? '<div class="apt-feat">✓ <strong>Jardin</strong></div>' : ''}
        ${m.apartment.hasCellier ? '<div class="apt-feat">✓ <strong>Cellier</strong></div>' : ''}
        ${m.apartment.dayNightSeparation ? '<div class="apt-feat">✓ <strong>Sép. jour/nuit</strong></div>' : ''}
        <div class="apt-feat"><strong>Cuisine</strong> ${m.apartment.kitchen.kitchenType}</div>
        <div class="apt-feat"><strong>Entrée</strong> ${m.apartment.entranceType}</div>
        <div class="apt-feat"><strong>Promoteur</strong> ${m.building.developer}</div>
      </div>
      ${roomsList ? `<div class="rooms-detail"><strong>Composition :</strong> ${roomsList}</div>` : ''}
      ${m.apartment.freeNote ? `<div class="apt-note">« ${m.apartment.freeNote} »</div>` : ''}
      ${m.reasons.length > 0 ? `<div style="margin-top:10px;">${m.reasons.map(r => `<span class="pill">${r}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Synthèse - ${criteria.clientName || 'Client'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; color: #1F1B17; margin: 0; line-height: 1.5; font-size: 12pt; }
  .serif { font-family: 'Playfair Display', Georgia, serif; }
  .cover { padding: 40px 0; border-bottom: 1px solid #E8DFD0; margin-bottom: 30px; }
  .cover-label { font-size: 10pt; letter-spacing: 0.2em; color: #38a9b8; text-transform: uppercase; font-weight: 600; }
  .cover-title { font-size: 36pt; margin: 12px 0 8px; font-weight: 500; line-height: 1.1; }
  .cover-meta { color: #413e39; font-size: 11pt; }
  .section-label { font-size: 9pt; letter-spacing: 0.15em; color: #38a9b8; text-transform: uppercase; font-weight: 600; margin: 24px 0 12px; }
  .apt-card { border: 1px solid #E8DFD0; border-radius: 10px; padding: 20px; margin-bottom: 16px; page-break-inside: avoid; }
  .apt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #E8DFD0; gap: 16px; }
  .apt-title { font-size: 18pt; font-weight: 500; margin: 6px 0 0; }
  .apt-typo { font-size: 9pt; letter-spacing: 0.1em; color: #38a9b8; text-transform: uppercase; font-weight: 600; }
  .apt-meta { margin-top: 6px; font-size: 10pt; color: #6B6358; }
  .apt-price { font-size: 16pt; font-weight: 600; }
  .apt-price-sub { font-size: 9pt; color: #6B6358; }
  .happiness { font-size: 11pt; color: #38a9b8; font-weight: 600; margin-top: 6px; }
  .apt-feats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 16px; font-size: 10pt; margin-bottom: 10px; }
  .apt-feat { color: #6B6358; }
  .apt-feat strong { color: #1F1B17; font-weight: 500; }
  .apt-note { background: #FAF8F3; padding: 10px 12px; border-left: 3px solid #38a9b8; border-radius: 4px; font-size: 10pt; font-style: italic; margin-top: 8px; }
  .rooms-detail { font-size: 10pt; color: #6B6358; margin-top: 8px; }
  .rooms-detail strong { color: #1F1B17; }
  .pill { display: inline-block; padding: 2px 8px; background: #FAF8F3; color: #38a9b8; border-radius: 10px; font-size: 9pt; margin: 2px; }
  .type-tag { display: inline-block; padding: 3px 9px; border-radius: 6px; font-size: 9pt; font-weight: 600; text-transform: uppercase; margin-right: 8px; }
  .type-tag.appartement { background: #EDE6D6; color: #6B5634; }
  .type-tag.duplex { background: #D8DCE5; color: #2D3E5C; }
  .type-tag.triplex { background: #E5D8E0; color: #5C2D4E; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8DFD0; font-size: 9pt; color: #6B6358; text-align: center; }
  .footer-brand { font-size: 11pt; color: #38a9b8; font-weight: 600; margin-bottom: 4px; }
  @media print { .no-print { display: none; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
  <div class="no-print" style="position:fixed;top:16px;right:16px;z-index:99;">
    <button onclick="window.print()" style="background:#38a9b8;color:white;border:none;padding:12px 20px;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;font-weight:500;">📄 Télécharger / Imprimer PDF</button>
  </div>
  <div class="cover">
    <div class="cover-label">Synthèse de sélection immobilière</div>
    <h1 class="serif cover-title">${criteria.clientName ? `Pour ${criteria.clientName}` : 'Votre sélection'}</h1>
    <p class="cover-meta">Établie le ${today} · ${matches.length} bien${matches.length > 1 ? 's' : ''}</p>
  </div>
  <div class="section-label">Notre sélection</div>
  ${aptsHtml}
  <div class="footer">
    <div class="footer-brand">Accompagnement immobilier Ahlem</div>
    <div>Chaque bien a été visité par notre architecte. Document confidentiel.</div>
    <div style="margin-top:8px;">Généré le ${today}</div>
  </div>
</body></html>`;
}