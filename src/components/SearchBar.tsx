// src/components/SearchBar.tsx

import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (address: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(address);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md flex">
      <input
        type="text"
        className="flex-1 p-2 border border-mcGray rounded-l focus:outline-none focus:ring-2 focus:ring-mcRed"
        placeholder="Enter an address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-mcRed hover:bg-mcRed-dark text-mcWhite font-semibold rounded-r transition"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
