import React from 'react';

// Reusable filters for category, city, ngo
const FiltersPanel = ({
  category,
  city,
  ngo,
  categories = [],
  cities = [],
  ngos = [],
  onCategoryChange,
  onCityChange,
  onNgoChange,
}) => {
  return (
    <div className="filters-panel">
      <div className="filter-group">
        <label htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-city">City</label>
        <select
          id="filter-city"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
        >
          <option value="">All</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-ngo">NGO</label>
        <select
          id="filter-ngo"
          value={ngo}
          onChange={(e) => onNgoChange(e.target.value)}
        >
          <option value="">All</option>
          {ngos.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FiltersPanel;
