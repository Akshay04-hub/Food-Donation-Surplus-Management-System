import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './RoleSelectionPage.css';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      id: 'DONOR',
      title: 'Donor',
      icon: '🍽️',
      description: 'Share surplus food from your home or business',
    },
    {
      id: 'NGO',
      title: 'NGO',
      icon: '🤝',
      description: 'Manage food requests and organize pickups',
    },
    {
      id: 'VOLUNTEER',
      title: 'Volunteer',
      icon: '❤️',
      description: 'Help coordinate donations and assist communities',
    },
  ];

  const handleRoleSelect = async (roleId) => {
    setError('');

    // If DONOR selected, navigate directly to donor type selection page
    if (roleId === 'DONOR') {
      navigate('/donor-type-selection');
      return;
    }

    setSelectedRole(roleId);
    setLoading(true);
    try {
      const response = await authAPI.updateProfile({ role: roleId });
      
      // Update localStorage with the new user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Navigate to dashboard after successful role selection
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set role');
      setSelectedRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-content">
        <h1>What's your role?</h1>
        <p className="role-subtitle">Choose how you'd like to participate</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="roles-grid">
          {roles.map((role) => (
            <button
              key={role.id}
              className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
              onClick={() => handleRoleSelect(role.id)}
              disabled={loading}
            >
              <div className="role-icon">{role.icon}</div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              {selectedRole === role.id && loading && (
                <div className="role-loading">Setting role...</div>
              )}
            </button>
          ))}
        </div>

        <div className="role-footer">
          <button
            type="button"
            className="btn-logout"
            onClick={() => {
              authAPI.logout();
              navigate('/');
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
