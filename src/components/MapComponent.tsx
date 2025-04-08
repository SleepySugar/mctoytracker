// src/components/MapComponent.tsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Location } from '../data/locations';
import L from 'leaflet';
import mcLogo from '../assets/mc_logo.png';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapComponentProps {
  center: { lat: number; lng: number };
  locations: Location[];
  setSelectedLocation: React.Dispatch<React.SetStateAction<Location | null>>;
  selectedToy: string | null;
  isSidebarOpen: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  locations,
  setSelectedLocation,
  selectedToy,
  isSidebarOpen,
}) => {
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const mapStyles = {
    height: '100%',
    width: '100%',
  };

  // Filter locations based on selected toy
  const displayedLocations = selectedToy
    ? locations.filter((loc) => loc.toys.includes(selectedToy))
    : locations;

  // Component to adjust map bounds
  const FitBounds: React.FC<{ locations: Location[] }> = ({ locations }) => {
    const map = useMap();
    useEffect(() => {
      if (locations.length > 0) {
        const bounds = L.latLngBounds(
          locations.map((loc) => [loc.coordinates.lat, loc.coordinates.lng])
        );
        map.fitBounds(bounds);
      }
    }, [map, locations]);
    return null;
  };

  const customIcon = new L.Icon({
    iconUrl: mcLogo,
    iconSize: [40, 40],
  });

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative ${isFullscreen ? 'fixed inset-0 z-30' : 'w-full'}`}
      style={{
        height: isFullscreen ? '100%' : '500px',
      }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        style={mapStyles}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FitBounds locations={displayedLocations} />
        {displayedLocations.map((location) => (
          <Marker
            key={location.placeId}
            position={[location.coordinates.lat, location.coordinates.lng]}
            icon={customIcon}
            eventHandlers={{
              mouseover: () => setHoveredLocation(location),
              mouseout: () => setHoveredLocation(null),
              click: () => setSelectedLocation(location),
            }}
          >
            {/* Only show the popup when the sidebar is not open */}
            {!isSidebarOpen && hoveredLocation?.placeId === location.placeId && (
              <Popup offset={[0, -40]}>
                <div className="p-2">
                  <h2 className="text-lg font-semibold text-mcBlack">{location.name}</h2>
                  <p className="mt-1 text-mcBlack">{location.address}</p>
                  <p className="mt-1 text-mcBlack">Rating: {location.rating}</p>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      {/* Fullscreen Button */}
      <button
        className="absolute top-2 right-2 z-10 bg-mcCreme text-mcBlack p-2 rounded shadow hover:bg-mcGray-light transition duration-300"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>
    </div>
  );
};

export default MapComponent;
