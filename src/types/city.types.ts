// City data type definitions

export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}
