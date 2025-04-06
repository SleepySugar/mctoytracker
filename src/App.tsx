// src/App.tsx

import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import ToyRoster from './components/ToyRoster';
import { Location } from './data/locations';
import Sidebar from './components/Sidebar';
import 'leaflet/dist/leaflet.css';

const App: React.FC = () => {
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 40.7580, lng: -73.9855 }); // Default: Times Square
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchAddress, setSearchAddress] = useState<string | null>(null);
  const [selectedToy, setSelectedToy] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Fetch initial locations from the server (if you have a backend for toy data)
  useEffect(() => {
    fetch('/api/locations')
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);
        if (data.length > 0) {
          const avgLat = data.reduce((sum, loc) => sum + loc.coordinates.lat, 0) / data.length;
          const avgLng = data.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / data.length;
          setCenter({ lat: avgLat, lng: avgLng });
        }
      })
      .catch((error) => console.error('Error fetching initial locations:', error));
  }, []);

  // Fetch nearby McDonald's using Overpass API
  const fetchNearbyLocations = (lat: number, lng: number) => {
    const overpassQuery = `
      [out:json];
      node["amenity"="fast_food"]["name"~"McDonald's"](around:5000,${lat},${lng});
      out body;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const newLocations: Location[] = data.elements.map((node: any) => ({
          id: node.id.toString(),
          name: node.tags.name || "McDonald's",
          coordinates: {
            lat: node.lat,
            lng: node.lon,
          },
          address: node.tags["addr:street"]
            ? `${node.tags["addr:street"]}, ${node.tags["addr:city"] || ''} ${node.tags["addr:postcode"] || ''}`
            : 'Address not available',
          rating: 0, // Overpass doesn't provide ratings; you could fetch this elsewhere or omit
          placeId: node.id.toString(), // Using OSM node ID as a unique identifier
          toys: [], // Default empty; merge with existing data if available
        }));

        setLocations((prevLocations) => {
          const locationMap = new Map<string, Location>();
          prevLocations.forEach((loc) => locationMap.set(loc.placeId, loc));
          newLocations.forEach((newLoc) => {
            const existingLoc = locationMap.get(newLoc.placeId);
            locationMap.set(newLoc.placeId, existingLoc ? { ...newLoc, toys: existingLoc.toys } : newLoc);
          });
          const updatedLocations = Array.from(locationMap.values());

          // Optionally save to your backend
          fetch('/api/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedLocations),
          }).catch((error) => console.error('Error saving locations:', error));

          return updatedLocations;
        });
      })
      .catch((error) => console.error('Error fetching Overpass data:', error));
  };

  // Handle search with Nominatim geocoding
  useEffect(() => {
    if (!searchAddress) return;

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data[0]) {
          const newCenter = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          setCenter(newCenter);
          fetchNearbyLocations(newCenter.lat, newCenter.lng);
        } else {
          alert('Could not find the address.');
        }
      })
      .catch((error) => console.error('Geocoding error:', error));
  }, [searchAddress]);

  const handleSearch = (address: string) => {
    setSearchAddress(address);
  };

  const updateLocationToys = (placeId: string, toys: string[]) => {
    setLocations((prevLocations) =>
      prevLocations.map((loc) => (loc.placeId === placeId ? { ...loc, toys } : loc))
    );
    fetch(`/api/locations/${placeId}/toys`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toys }),
    }).catch((error) => console.error('Error updating toys:', error));
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-mcWhite-off">
      <header className="bg-mcRed text-mcYellow p-4 flex items-center justify-center relative">
        <h1 className="text-4xl font-bold text-center">McToyTracker</h1>
        <button
          className="absolute md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        >
          {isSidebarOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      <section className="p-4">
        <h2 className="text-center text-xl font-semibold text-mcBlack mb-4">
          Find the toy you want („• ֊ •„)
        </h2>
        <div className="flex justify-center mb-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      <div className="flex-1 p-4 flex flex-col items-center">
        <div className="relative w-full max-w-6xl mb-8">
          <MapComponent
            center={center}
            locations={locations}
            setSelectedLocation={(location) => {
              setSelectedLocation(location);
              setIsSidebarOpen(true);
            }}
            selectedToy={selectedToy}
            isSidebarOpen={isSidebarOpen}
          />
        </div>

        <section className="w-full max-w-6xl">
          <h2 className="text-2xl font-bold mb-4 text-center text-mcBlack">Current Toys</h2>
          <ToyRoster selectedToy={selectedToy} setSelectedToy={setSelectedToy} />
        </section>
      </div>

      {isSidebarOpen && selectedLocation && (
        <Sidebar
          location={selectedLocation}
          onClose={() => {
            setSelectedLocation(null);
            setIsSidebarOpen(false);
          }}
          updateLocationToys={updateLocationToys}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}
    </div>
  );
};

export default App;
