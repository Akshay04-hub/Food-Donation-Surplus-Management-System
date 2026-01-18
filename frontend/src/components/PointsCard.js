import React, { useState, useEffect } from 'react';
import { pointsAPI } from '../services/api';
import './PointsCard.css';

const PointsCard = () => {
  const [points, setPoints] = useState({
    redeemable_points: 0,
    total_earned: 0,
    total_redeemed: 0,
    last_updated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchUserPoints();
  }, []);

  const fetchUserPoints = async () => {
    try {
      setLoading(true);
      const response = await pointsAPI.getUserPoints();
      if (response.data.success) {
        setPoints(response.data.points);
      }
    } catch (err) {
      console.error('Error fetching points:', err);
      setError('Failed to load points');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (points) => {
    if (points >= 500) return { name: 'Platinum', badge: '💎', color: '#E5B8F4' };
    if (points >= 250) return { name: 'Gold', badge: '🥇', color: '#FFD700' };
    if (points >= 100) return { name: 'Silver', badge: '🥈', color: '#C0C0C0' };
    return { name: 'Bronze', badge: '🥉', color: '#CD7F32' };
  };

  const tier = getTierBadge(points.redeemable_points);

  if (loading) {
    return (
      <div className="points-card loading">
        <p>Loading points...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="points-card error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="points-card">
      <div className="points-header">
        <h3>Redeemable Points 🎁</h3>
        <button 
          className="details-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▼' : '▶'}
        </button>
      </div>

      <div className="points-main">
        <div className="points-display">
          <div className="large-points">{points.redeemable_points.toLocaleString()}</div>
          <div className="points-label">Points</div>
        </div>

        <div className="tier-badge">
          <span className="tier-emoji">{tier.badge}</span>
          <span className="tier-name">{tier.name}</span>
        </div>
      </div>

      {showDetails && (
        <div className="points-details">
          <div className="detail-row">
            <span className="label">Total Earned:</span>
            <span className="value">+{points.total_earned}</span>
          </div>
          <div className="detail-row">
            <span className="label">Total Redeemed:</span>
            <span className="value">-{points.total_redeemed}</span>
          </div>
          <div className="detail-row">
            <span className="label">Last Updated:</span>
            <span className="value">
              {points.last_updated 
                ? new Date(points.last_updated).toLocaleDateString()
                : 'N/A'
              }
            </span>
          </div>

          <div className="points-info">
            <h4>How to earn points:</h4>
            <ul>
              <li>💝 Donation: <strong>+10 points</strong></li>
              <li>🚗 Pickup: <strong>+5 points</strong></li>
              <li>🤝 Volunteer: <strong>+3 points</strong></li>
            </ul>
          </div>

          <button 
            className="view-history-btn"
            onClick={() => window.location.href = '/#/points-history'}
          >
            View Full History →
          </button>
        </div>
      )}
    </div>
  );
};

export default PointsCard;
