import type {Kitchen,SalleDeBain,Piece,Room,Apartment} from "../models/apartment.ts";
import type {ClientCriteria} from "../models/clientCriteria";

export class Factory{
public emptyKitchen = (): Kitchen => ({
  surface: '', orientation: '', hasBalcony: false, balconyFunctional: false,
  balconyOrientation: '', balconySurface: '', luminosite: '', ensoleiment: '',
  kitchenType: 'ouverte'
})

public emptySalon = (): Piece => ({
  name: 'Salon', surface: '', orientation: '',
  hasBalcony: false, hasTerrace: false,
  terraceOrientation: '', terraceSurface: '', terraceFunctional: false,
  balconyFunctional: false, balconyOrientation: '', balconySurface: '',
  luminosite: '', ensoleiment: ''
})

public emptySalleDeBain = (label = ''): SalleDeBain => ({
  name: label, surface: '', hasBathtub: false, hasShower: true,
  aerationType: 'naturelle'
})

public emptyRoom = (index: number): Room => ({
  name: `Chambre ${index + 1}`, surface: '', orientation: '',
  hasBalcony: false, hasTerrace: false,
  terraceOrientation: '', terraceSurface: '', terraceFunctional: false,
  balconyFunctional: false, balconyOrientation: '', balconySurface: '',
  luminosite: '', ensoleiment: '',
  hasDressing: false,
  isSuite: false,
  sdb: this.emptySalleDeBain('SDB suite')
})

public emptyApartment = (): Apartment => ({
  id: 'a' + Math.random().toString(36).slice(2, 9),
  propertyType: 'appartement', reference: '', typology: 's+2', floor: '',
  price: '', surface: '', status: 'disponible',
  hasGarden: false, gardenFunctional: true, gardenSurface: '', gardenOrientation: '',
  hasCellier: false, cellierSurface: '',
  waterPoints: 1,
  kitchen: this.emptyKitchen(),
  salon: this.emptySalon(),
  rooms: [this.emptyRoom(0), this.emptyRoom(1)],  // s+2 par défaut → 2 chambres
  bathRooms: [this.emptySalleDeBain('SDB')],
  dayNightSeparation: false, entranceType: 'hall',
  freeNote: '',
  noteCirculation: '', noteEnsoleillement: '', noteLumiere: '', noteDimensions: '',
  plans: [], photos: []
})

public emptyCriteria = (): ClientCriteria => ({
  clientName: '', clientEmail: '', clientContact: '', propertyTypes: [],
  budgetMin: '', budgetMax: '',
  governorates: [], cities: [], neighborhoods: [], typologies: [],
  surfaceMin: '', surfaceMax: '',
  needsParentalSuite: false, needsTerrace: false, needsFunctionalTerrace: false,
  needsGarden: false, needsDayNightSeparation: false,
  kitchenType: 'any', entranceType: 'any',
  floors: [], minHappinessIndex: 0, onlyAvailable: true
})}

export const _factory = new Factory();
export const emptyCriteria = () => _factory.emptyCriteria();
export const emptyApartment = () => _factory.emptyApartment();


