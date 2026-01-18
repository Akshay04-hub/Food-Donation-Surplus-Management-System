import React, { useState, useEffect } from 'react';
import { pointsAPI } from '../services/api';
import './PointsPage.css';

const PointsPage = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pointsInfo, setPointsInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchTransactionHistory();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    } else if (activeTab === 'info') {
      fetchPointsInfo();
    }
  }, [activeTab]);

  const fetchTransactionHistory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await pointsAPI.getTransactionHistory(page);
      if (response.data.success) {
        setTransactionHistory(response.data.history);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await pointsAPI.getLeaderboard();
      if (response.data.success) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchPointsInfo = async () => {
    try {
      setLoading(true);
      const response = await pointsAPI.getPointsInfo();
      if (response.data.success) {
        setPointsInfo(response.data.points_info);
      }
    } catch (err) {
      console.error('Error fetching points info:', err);
      setError('Failed to load points information');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    const icons = {
      DONATION: '💝',
      PICKUP: '🚗',
      VOLUNTEER_ACTIVITY: '🤝',
      REDEMPTION: '🎁',
      BONUS: '⭐'
    };
    return icons[type] || '📊';
  };

  const getTransactionColor = (type) => {
    const colors = {
      DONATION: '#10B981',
      PICKUP: '#3B82F6',
      VOLUNTEER_ACTIVITY: '#8B5CF6',
      REDEMPTION: '#F59E0B',
      BONUS: '#EC4899'
    };
    return colors[type] || '#6B7280';
  };

  return (
    <div className="points-page">
      <div className="points-container">
        <h1>Points System</h1>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 History
          </button>
          <button
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            🏆 Leaderboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            ℹ️ How it Works
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <div className="loading">Loading...</div>}

        {!loading && activeTab === 'history' && (
          <div className="tab-content">
            <h2>Transaction History</h2>
            {transactionHistory.length === 0 ? (
              <div className="empty-state">
                <p>No transactions yet. Start donating or volunteering to earn points!</p>
              </div>
            ) : (
              <>
                <div className="transaction-list">
                  {transactionHistory.map((transaction, index) => (
                    <div
                      key={transaction._id}
                      className="transaction-item"
                      style={{ borderLeftColor: getTransactionColor(transaction.transaction_type) }}
                    >
                      <div className="transaction-icon">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div className="transaction-info">
                        <div className="transaction-type">
                          {transaction.transaction_type.replace(/_/g, ' ')}
                        </div>
                        <div className="transaction-description">
                          {transaction.description}
                        </div>
                        <div className="transaction-date">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="transaction-points">
                        <span
                          className={transaction.points > 0 ? 'positive' : 'negative'}
                        >
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => fetchTransactionHistory(pagination.page - 1)}
                    >
                      ← Previous
                    </button>
                    <span>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => fetchTransactionHistory(pagination.page + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!loading && activeTab === 'leaderboard' && (
          <div className="tab-content">
            <h2>Top Donors & Volunteers</h2>
            {leaderboard.length === 0 ? (
              <div className="empty-state">
                <p>No users yet. Be the first to earn points!</p>
              </div>
            ) : (
              <div className="leaderboard-list">
                {leaderboard.map((user, index) => {
                  let medal = '';
                  if (index === 0) medal = '🥇';
                  else if (index === 1) medal = '🥈';
                  else if (index === 2) medal = '🥉';

                  return (
                    <div key={user.id} className="leaderboard-item">
                      <div className="rank">
                        <span className="medal">{medal || `#${index + 1}`}</span>
                      </div>
                      <div className="user-info">
                        {user.profile_image_url && (
                          <img
                            src={user.profile_image_url}
                            alt={user.name}
                            className="user-avatar"
                          />
                        )}
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-stats">
                            <span>{user.total_points_earned} earned</span>
                          </div>
                        </div>
                      </div>
                      <div className="leaderboard-points">
                        {user.redeemable_points.toLocaleString()} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'info' && pointsInfo && (
          <div className="tab-content">
            <h2>How Points Work</h2>

            <div className="info-section">
              <h3>🎯 Earning Points</h3>
              <div className="rules-grid">
                {Object.entries(pointsInfo.rules).map(([key, rule]) => (
                  <div key={key} className="rule-card">
                    <div className="rule-header">
                      <div className="rule-points">{rule.points} pts</div>
                      <div className="rule-action">{rule.action}</div>
                    </div>
                    <p className="rule-description">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-section">
              <h3>🏅 Achievement Tiers</h3>
              <div className="tiers-grid">
                {Object.entries(pointsInfo.tiers).map(([key, tier]) => (
                  <div key={key} className="tier-card">
                    <div className="tier-emoji">{tier.badge}</div>
                    <div className="tier-info">
                      <div className="tier-title">{tier.name}</div>
                      <div className="tier-requirement">
                        {tier.minPoints}+ points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-section">
              <h3>🎁 Redeem Your Points</h3>
              <div className="rewards-list">
                {pointsInfo.rewards.map((reward, index) => (
                  <div key={index} className="reward-item">
                    <div className="reward-points">{reward.points} pts</div>
                    <div className="reward-info">
                      <div className="reward-name">{reward.name}</div>
                      <div className="reward-description">{reward.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-footer">
              <p>
                Points are awarded when you complete actions that contribute to our community.
                Keep earning and help reduce food waste! 🌍
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsPage;
