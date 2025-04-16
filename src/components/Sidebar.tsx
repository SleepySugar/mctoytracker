import React, { useState, useEffect } from 'react';
import toysData from '../data/toys.json';
import { Location } from '../data/locations';
import Modal from './Modal';

interface SidebarProps {
  location: Location;
  onClose: () => void;
  updateLocationToys: (placeId: string, toys: string[]) => void;
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

  useEffect(() => setSelectedToys(location.toys), [location]);

  const toggleToy = (toyName: string) =>
    setSelectedToys((prev) =>
      prev.includes(toyName) ? prev.filter((t) => t !== toyName) : [...prev, toyName]
    );

  const saveToys = () => {
    updateLocationToys(location.placeId, selectedToys);
    setIsModalOpen(false);
  };

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[900]" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-mcCreme shadow-lg z-[1000] transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button className="m-4 text-mcBlack hover:text-mcRed" onClick={onClose}>
          ✕
        </button>

        <div className="p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2 text-mcRed">{location.name}</h2>
          <p className="mb-4 text-mcBlack">{location.address}</p>

          <h3 className="text-xl font-semibold mb-2 text-mcBlack">Available Toys</h3>
          <div className="grid gap-4">
            {selectedToys.length ? (
              selectedToys.map((toy) => {
                const t = toysData.find((x) => x.name === toy);
                return (
                  <div key={toy} className="flex items-center space-x-4">
                    <img src={t?.idleUrl} alt={t?.name} className="w-16 h-16" />
                    <span className="font-medium text-mcBlack">{t?.name}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-mcGray-dark">No toys reported.</p>
            )}
          </div>

          <button
            className="mt-6 w-full px-4 py-2 bg-mcYellow hover:bg-mcYellow-dark text-mcBlack font-semibold rounded"
            onClick={() => setIsModalOpen(true)}
          >
            Add Toy
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-xl font-semibold mb-4 text-mcBlack">Select Toys</h3>
        <div className="max-h-64 overflow-y-auto">
          {toysData.map((toy) => (
            <label key={toy.name} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedToys.includes(toy.name)}
                onChange={() => toggleToy(toy.name)}
                className="mr-2 h-5 w-5 text-mcRed"
              />
              <img src={toy.idleUrl} alt={toy.name} className="w-12 h-12 mr-2" />
              <span className="text-mcBlack">{toy.name}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-mcGray-light rounded mr-2" onClick={() => setIsModalOpen(false)}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-mcRed text-mcCreme rounded" onClick={saveToys}>
            Save
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
