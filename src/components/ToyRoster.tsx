// src/components/ToyRoster.tsx

import React from 'react';
import toysData from '../data/toys.json';

interface ToyRosterProps {
  selectedToy: string | null;
  setSelectedToy: React.Dispatch<React.SetStateAction<string | null>>;
}

const ToyRoster: React.FC<ToyRosterProps> = ({ selectedToy, setSelectedToy }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {toysData.map((toy, index) => (
        <button
          key={index}
          onClick={() =>
            setSelectedToy(selectedToy === toy.name ? null : toy.name)
          }
          className={`flex flex-col items-center p-4 border rounded hover:shadow-lg transition ${
            selectedToy === toy.name ? 'border-mcRed' : 'border-mcGray'
          }`}
        >
          <img
            src={toy.idleUrl}
            alt={toy.name}
            className="w-20 h-20 object-contain mb-2"
            loading="lazy"
          />
          <span className="text-center text-sm text-mcBlack">{toy.name}</span>
        </button>
      ))}
    </div>
  );
};

export default ToyRoster;
