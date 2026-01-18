import React from 'react';

// Simple reusable search input with clearable button
const SearchBar = ({ value, onChange, placeholder = 'Search donations...' }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search donations"
      />
      {value && (
        <button type="button" className="btn-clear" onClick={() => onChange('')} aria-label="Clear search">
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
