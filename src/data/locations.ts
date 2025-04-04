// src/data/locations.ts

export interface Location {
  id: string; // Use placeId as id
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  rating: number;
  placeId: string;
  toys: string[];
}

// No default locations exported
