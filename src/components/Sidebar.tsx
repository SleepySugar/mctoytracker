// src/components/Sidebar.tsx

import React, { useState, useEffect } from 'react';
import toysData from '../data/toys.json';
import { Location } from '../data/locations';
import Modal from './Modal';

interface SidebarProps {
  location: Location;
  onClose: () => void;
  updateLocationToys: (locationPlaceId: string, toys: string[]) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  location,
  onClose,
  updateLocationToys,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToys, setSelectedToys] = useState<string[]>(location.toys);

  const availableToys = toysData;

  // Update selectedToys when location changes
  useEffect(() => {
    setSelectedToys(location.toys);
  }, [location]);

  const toggleToySelection = (toyName: string) => {
    if (selectedToys.includes(toyName)) {
      setSelectedToys(selectedToys.filter((name) => name !== toyName));
    } else {
      setSelectedToys([...selectedToys, toyName]);
    }
  };

  const handleSaveToys = () => {
    updateLocationToys(location.placeId, selectedToys);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-mcWhite shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          className="self-end m-4 text-mcBlack hover:text-mcRed"
          onClick={onClose}
          aria-label="Close Sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Sidebar Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Location Details */}
          <h2 className="text-2xl font-bold mb-2 text-mcRed">{location.name}</h2>
          <p className="mb-1 text-mcBlack">{location.address}</p>
          <p className="mb-4 text-mcBlack">Rating: {location.rating}</p>

          {/* Available Toys */}
          <h3 className="text-xl font-semibold mb-2 text-mcBlack">Available Toys:</h3>
          <div className="grid grid-cols-1 gap-4">
            {selectedToys.length > 0 ? (
              selectedToys.map((toyName, index) => {
                const toy = toysData.find((t) => t.name === toyName);
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <img
                      src={toy?.idleUrl}
                      alt={toy?.name}
                      className="w-16 h-16 object-contain"
                      loading="lazy"
                    />
                    <span className="font-medium text-mcBlack">{toy?.name}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-mcGray-dark">No toys reported at this location.</p>
            )}
          </div>

          {/* Add Toy Button */}
          <button
            className="mt-6 w-full px-4 py-2 bg-mcYellow hover:bg-mcYellow-dark text-mcBlack font-semibold rounded"
            onClick={() => setIsModalOpen(true)}
          >
            Add Toy
          </button>
        </div>
      </div>

      {/* Modal for Selecting Toys */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-xl font-semibold mb-4 text-mcBlack">Select Toys</h3>
        <div className="max-h-64 overflow-y-auto">
          {availableToys.map((toy, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedToys.includes(toy.name)}
                onChange={() => toggleToySelection(toy.name)}
                id={`toy-${index}`}
                className="mr-2 h-5 w-5 text-mcRed focus:ring-mcRed"
              />
              <label htmlFor={`toy-${index}`} className="flex items-center">
                <img
                  src={toy.idleUrl}
                  alt={toy.name}
                  className="w-12 h-12 object-contain mr-2"
                />
                <span className="text-mcBlack">{toy.name}</span>
              </label>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-mcGray-light text-mcBlack rounded mr-2 hover:bg-mcGray"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-mcRed hover:bg-mcRed-dark text-mcWhite rounded"
            onClick={handleSaveToys}
          >
            Save
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
