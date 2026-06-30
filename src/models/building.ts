import type { Apartment } from './apartment.ts';

export interface Building {
  id?: string;
  name: string;
  //sold:boolean;
  //approved:trueboolean;
  immediateHandover?: boolean;
  handoverMonth?: string;
  handoverYear?: string;
  contacts: string[];
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
  freeNote: string;
  projectPhotos: string[];
  apartments: Apartment[];
  
}