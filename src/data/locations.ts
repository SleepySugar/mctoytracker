export interface Location {
  id: string;          
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  placeId: string;
  toys: string[];      
}
