export type PropertyType = 'appartement' | 'duplex' | 'triplex';
export type Status = 'disponible' | 'reserve' | 'vendu';
export type Typology = 's+0' | 's+1' | 's+2' | 's+3' | 's+4';

export interface Apartment {
    apartmentId?: string;
    buildingId?: string;
    propertyType: PropertyType;
    reference: string;
    typology: Typology;
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
    rooms: Room[];
    bathRooms: SalleDeBain[];
    dayNightSeparation: boolean;
    entranceType: 'hall' | 'salon';
    freeNote: string;
    noteCirculation: string;
    noteEnsoleillement: string;
    noteLumiere: string;
    noteDimensions: string;
    plans: string[];
    photos: string[];
}

export interface Piece {
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

export interface SalleDeBain {
    name: string;
    surface: string;
    hasBathtub: boolean;
    hasShower: boolean;
    aerationType: 'naturelle' | 'mecanique';
}

export interface Room extends Piece {
    hasDressing: boolean;
    isSuite: boolean;
    sdb: SalleDeBain;
}

export interface Kitchen {
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





