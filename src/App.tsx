import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import ToyRoster from './components/ToyRoster';
import Sidebar from './components/Sidebar';
import { Location } from './data/locations';
import 'leaflet/dist/leaflet.css';

const App: React.FC = () => {
  const [center, setCenter] = useState({ lat: 40.758, lng: -73.9855 });
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchAddress, setSearchAddress] = useState<string | null>(null);
  const [selectedToy, setSelectedToy] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Real‑time Firestore listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'locations'), (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), placeId: d.id })) as Location[];
      setLocations(list);
      if (list.length) {
        const avgLat = list.reduce((s, l) => s + l.coordinates.lat, 0) / list.length;
        const avgLng = list.reduce((s, l) => s + l.coordinates.lng, 0) / list.length;
        setCenter({ lat: avgLat, lng: avgLng });
      }
    });
    return () => unsub();
  }, []);

  const updateLocationToys = async (placeId: string, toys: string[]) => {
    await updateDoc(doc(db, 'locations', placeId), { toys });
  };

  const addOrUpdateLocation = async (loc: Location) => {
    await setDoc(doc(db, 'locations', loc.placeId), loc, { merge: true });
  };

  // Geocode + Overpass
  useEffect(() => {
    if (!searchAddress) return;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1`)
      .then((r) => r.json())
      .then(async (d) => {
        if (!d[0]) return alert('Address not found');
        const newCenter = { lat: +d[0].lat, lng: +d[0].lon };
        setCenter(newCenter);

        const query = `[out:json];node["amenity"="fast_food"]["name"~"McDonald's"](around:5000,${newCenter.lat},${newCenter.lng});out body;`;
        const url   = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const data  = await fetch(url).then((x) => x.json());

        data.elements.forEach((n: any) => {
          const loc: Location = {
            id: n.id.toString(),
            name: n.tags.name || "McDonald's",
            coordinates: { lat: n.lat, lng: n.lon },
            address: n.tags['addr:street']
              ? `${n.tags['addr:street']}, ${n.tags['addr:city'] || ''} ${n.tags['addr:postcode'] || ''}`
              : 'Address not available',
            placeId: n.id.toString(),
            toys: [],
          };
          addOrUpdateLocation(loc);
        });
      })
      .catch(console.error);
  }, [searchAddress]);

  return (
    <div className="relative flex flex-col min-h-screen bg-mcCreme-off">
      <header className="bg-mcRed text-mcYellow p-4 flex items-center justify-center relative">
        <h1 className="text-4xl font-bold">McToyTracker</h1>
        <button className="absolute md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </header>

      <section className="p-4">
        <h2 className="text-center text-xl font-semibold text-mcBlack mb-4">
          Find the toy you want („• ֊ •„)
        </h2>
        <div className="flex justify-center mb-4">
          <SearchBar onSearch={setSearchAddress} />
        </div>
      </section>

      <div className="flex-1 p-4 flex flex-col items-center">
        <div className="relative w-full max-w-6xl mb-8">
          <MapComponent
            center={center}
            locations={locations}
            setSelectedLocation={(l) => { setSelectedLocation(l); setIsSidebarOpen(true); }}
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
          onClose={() => { setSelectedLocation(null); setIsSidebarOpen(false); }}
          updateLocationToys={updateLocationToys}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}
    </div>
  );
};

export default App;
