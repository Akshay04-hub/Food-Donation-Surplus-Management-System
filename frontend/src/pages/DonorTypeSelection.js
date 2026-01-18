import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DonorTypeSelection.css';

const DonorTypeSelection = () => {
  const navigate = useNavigate();

  const handleSelectType = (type) => {
    navigate('/register', { state: { role: 'DONOR', donor_type: type } });
  };

  return (
    <div className="donor-type-container">
      <div className="donor-type-card">
        <h1>Choose Your Donor Type</h1>
        <p className="subtitle">Select where you're donating leftover food from</p>

        <div className="donor-types-grid">
          {/* Home Option */}
          <div className="donor-type-option" onClick={() => handleSelectType('HOME')}>
            <div className="type-icon">🏠</div>
            <h3>Home</h3>
            <p>Donate leftover food from your home</p>
            <button className="btn btn-primary">Select Home</button>
          </div>

          {/* Hostels Option */}
          <div className="donor-type-option" onClick={() => handleSelectType('HOSTELS')}>
            <div className="type-icon">🏢</div>
            <h3>Hostels</h3>
            <p>Donate surplus food from your hostel</p>
            <button className="btn btn-primary">Select Hostels</button>
          </div>

          {/* Restaurants Option */}
          <div className="donor-type-option" onClick={() => handleSelectType('RESTAURANTS')}>
            <div className="type-icon">🍽️</div>
            <h3>Restaurants</h3>
            <p>Donate leftover food from your restaurant</p>
            <button className="btn btn-primary">Select Restaurants</button>
          </div>
        </div>

        <div className="type-footer">
          <button className="link-button" onClick={() => navigate('/select-role')}>
            ← Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorTypeSelection;
