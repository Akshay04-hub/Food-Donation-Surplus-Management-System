import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalNGOs: 0,
    totalVolunteers: 0,
    totalDonations: 0, 
    totalPickups: 0,
    totalPoints: 0
  });
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [donors, setDonors] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [ngoFilter, setNgoFilter] = useState('all'); // 'all', 'pending', 'approved'

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      // Fetch donations
      const donationsRes = await fetch('http://localhost:5000/api/admin/donations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const donationsData = await donationsRes.json();
      // Fetch pickups
      const pickupsRes = await fetch('http://localhost:5000/api/admin/pickups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pickupsData = await pickupsRes.json();
      // Fetch NGO activity
      const ngosRes = await fetch('http://localhost:5000/api/admin/ngos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ngosData = await ngosRes.json();
      // Fetch donor activity
      const donorsRes = await fetch('http://localhost:5000/api/admin/donors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const donorsData = await donorsRes.json();
      // Fetch volunteer activity
      const volunteersRes = await fetch('http://localhost:5000/api/admin/volunteers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const volunteersData = await volunteersRes.json();

      setUsers(usersData.users || []);
      setDonations(donationsData.donations || []);
      setPickups(pickupsData.pickups || []);
      setNgos(ngosData.ngos || []);
      setDonors(donorsData.donors || []);
      setVolunteers(volunteersData.volunteers || []);

      // Calculate stats
      const donors = usersData.users?.filter(u => u.role === 'DONOR').length || 0;
      const ngos = usersData.users?.filter(u => u.role === 'NGO').length || 0;
      const volunteers = usersData.users?.filter(u => u.role === 'VOLUNTEER').length || 0;
      const totalPoints = usersData.users?.reduce((sum, u) => sum + (u.points || 0), 0) || 0;

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalDonors: donors,
        totalNGOs: ngos,
        totalVolunteers: volunteers,
        totalDonations: donationsData.donations?.length || 0,
        totalPickups: pickupsData.pickups?.length || 0,
        totalPoints: totalPoints
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleApproveNGO = async (ngoId) => {
    setActionLoading(ngoId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/organizations/${ngoId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve NGO');
      }

      setNgos(ngos.map(ngo => (ngo._id === ngoId || ngo.uuid === ngoId) ? { ...ngo, verification_status: 'APPROVED' } : ngo));
      alert('NGO approved');
    } catch (err) {
      console.error('Error approving NGO:', err);
      alert(err.message || 'Failed to approve NGO');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectNGO = async (ngoId) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return;

    setActionLoading(ngoId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/organizations/${ngoId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason: reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject NGO');
      }

      setNgos(ngos.map(ngo => (ngo._id === ngoId || ngo.uuid === ngoId) ? { ...ngo, verification_status: 'REJECTED' } : ngo));
      alert('NGO rejected');
    } catch (err) {
      console.error('Error rejecting NGO:', err);
      alert(err.message || 'Failed to reject NGO');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>👨‍💼 Admin Dashboard</h1>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">🍽️</div>
          <div className="stat-info">
            <h3>Donors</h3>
            <p className="stat-number">{stats.totalDonors}</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">🤝</div>
          <div className="stat-info">
            <h3>NGOs</h3>
            <p className="stat-number">{stats.totalNGOs}</p>
          </div>
        </div>

        <div className="stat-card pink">
          <div className="stat-icon">🙎‍♂️</div>
          <div className="stat-info">
            <h3>Volunteers</h3>
            <p className="stat-number">{stats.totalVolunteers}</p>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Donations</h3>
            <p className="stat-number">{stats.totalDonations}</p>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <h3>Total Pickups</h3>
            <p className="stat-number">{stats.totalPickups}</p>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Total Points</h3>
            <p className="stat-number">{stats.totalPoints}</p>
            <p className="stat-subtext">Sum of all user points</p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 All Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'donors' ? 'active' : ''}`}
          onClick={() => setActiveTab('donors')}
        >
          🍽️ Donors
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ngos' ? 'active' : ''}`}
          onClick={() => setActiveTab('ngos')}
        >
          🏢 NGOs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'volunteers' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteers')}
        >
          🙎‍♂️ Volunteers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          ⭐ Points
        </button>
        <button 
          className={`tab-btn ${activeTab === 'donations' ? 'active' : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          📦 Donations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pickups' ? 'active' : ''}`}
          onClick={() => setActiveTab('pickups')}
        >
          🚚 Pickups
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {error && <div className="error-message">{error}</div>}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Platform Overview</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <h3>User Distribution</h3>
                <div className="distribution-list">
                  <div className="dist-item">
                    <span className="dist-label">Donors</span>
                    <span className="dist-value">{stats.totalDonors} ({((stats.totalDonors/stats.totalUsers)*100).toFixed(1)}%)</span>
                  </div>
                  <div className="dist-item">
                    <span className="dist-label">NGOs</span>
                    <span className="dist-value">{stats.totalNGOs} ({((stats.totalNGOs/stats.totalUsers)*100).toFixed(1)}%)</span>
                  </div>
                  <div className="dist-item">
                    <span className="dist-label">Volunteers</span>
                    <span className="dist-value">{stats.totalVolunteers} ({((stats.totalVolunteers/stats.totalUsers)*100).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>Activity Summary</h3>
                <div className="activity-summary">
                  <p>Total platform activities: <strong>{stats.totalDonations + stats.totalPickups}</strong></p>
                  <p>Average points per user: <strong>{stats.totalUsers > 0 ? (stats.totalPoints / stats.totalUsers).toFixed(1) : 0}</strong></p>
                  <p>Completion rate: <strong>{stats.totalDonations > 0 ? ((stats.totalPickups / stats.totalDonations) * 100).toFixed(1) : 0}%</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-section">
            <h2>All Users ({users.length})</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Points</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td>#{user.user_id}</td>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.phone || 'N/A'}</td>
                      <td className="points-cell">{user.points || 0} pts</td>
                      <td>{formatDate(user.createdAt || user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donors Tab */}
        {activeTab === 'donors' && (
          <div className="donors-section">
            <h2>Donor Activity ({donors.length})</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Activity</th>
                    <th>Completed / Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((donor) => (
                    <tr key={donor.id}>
                      <td>{donor.name || 'Unnamed Donor'}</td>
                      <td>{donor.email}</td>
                      <td>{donor.city || '—'}{donor.state ? `, ${donor.state}` : ''}</td>
                      <td>
                        <div className="activity-cell">
                          <div className="activity-bar">
                            <div 
                              className="activity-bar-fill"
                              style={{ width: `${Math.min(donor.activityPercentage || 0, 100)}%` }}
                            />
                          </div>
                          <span className="activity-text">{donor.activityPercentage || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="count-chip">{donor.completedDonations || 0} / {donor.totalDonations || 0}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${donor.is_active ? 'completed' : 'pending'}`}>
                          {donor.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NGOs Tab */}
        {activeTab === 'ngos' && (
          <div className="ngos-section">
            <div className="ngos-header">
              <h2>NGO Management ({ngos.length})</h2>
              <div className="ngo-filter-buttons">
                <button 
                  className={`filter-btn ${ngoFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setNgoFilter('all')}
                >
                  All NGOs ({ngos.length})
                </button>
                <button 
                  className={`filter-btn ${ngoFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setNgoFilter('pending')}
                  style={ngos.filter(n => (n.verification_status || 'PENDING').toUpperCase() === 'PENDING').length > 0 ? { backgroundColor: '#fbbf24' } : {}}
                >
                  ⏳ Pending ({ngos.filter(n => (n.verification_status || 'PENDING').toUpperCase() === 'PENDING').length})
                </button>
                <button 
                  className={`filter-btn ${ngoFilter === 'approved' ? 'active' : ''}`}
                  onClick={() => setNgoFilter('approved')}
                >
                  ✓ Approved ({ngos.filter(n => (n.verification_status || 'PENDING').toUpperCase() === 'APPROVED').length})
                </button>
              </div>
            </div>

            {/* Pending Approvals Alert */}
            {ngos.filter(n => (n.verification_status || 'PENDING').toUpperCase() === 'PENDING').length > 0 && (
              <div className="pending-alert" style={{
                backgroundColor: '#fef3c7',
                border: '2px solid #fbbf24',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
                <div>
                  <strong style={{ fontSize: '16px' }}>Pending NGO Approvals!</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#92400e', fontSize: '14px' }}>
                    You have {ngos.filter(n => (n.verification_status || 'PENDING').toUpperCase() === 'PENDING').length} NGO registration(s) awaiting your approval.
                  </p>
                </div>
              </div>
            )}

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Registration Date</th>
                    <th>Verification Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos
                    .filter(ngo => {
                      const status = (ngo.verification_status || 'PENDING').toUpperCase();
                      if (ngoFilter === 'pending') return status === 'PENDING';
                      if (ngoFilter === 'approved') return status === 'APPROVED';
                      return true;
                    })
                    .map((ngo) => {
                      const key = ngo._id || ngo.uuid || ngo.id;
                      const verificationStatus = (ngo.verification_status || 'PENDING').toUpperCase();
                      const isPending = verificationStatus === 'PENDING';

                      return (
                        <tr key={key} style={isPending ? { backgroundColor: '#fef3c7', borderLeft: '4px solid #fbbf24' } : {}}>
                          <td>
                            <div className="ngo-cell">
                              <div className="ngo-name">{ngo.name}</div>
                              <div className="ngo-type" style={{ fontSize: '12px', color: '#666' }}>{ngo.organization_type || 'Not specified'}</div>
                            </div>
                          </td>
                          <td>{ngo.email}</td>
                          <td>{ngo.city || '—'}{ngo.state ? `, ${ngo.state}` : ''}</td>
                          <td>{ngo.organization_type || 'N/A'}</td>
                          <td>{ngo.createdAt ? formatDate(ngo.createdAt) : 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${verificationStatus.toLowerCase()}`}>
                              {verificationStatus}
                            </span>
                          </td>
                          <td>
                            {isPending ? (
                              <div className="action-buttons" style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => handleApproveNGO(key)}
                                  disabled={actionLoading === key}
                                  title="Approve this NGO registration"
                                  style={{ 
                                    padding: '6px 12px', 
                                    backgroundColor: '#10b981', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: actionLoading === key ? 'not-allowed' : 'pointer', 
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    opacity: actionLoading === key ? 0.6 : 1,
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {actionLoading === key ? '⏳ Processing...' : '✓ Approve'}
                                </button>
                                <button
                                  onClick={() => handleRejectNGO(key)}
                                  disabled={actionLoading === key}
                                  title="Reject this NGO registration"
                                  style={{ 
                                    padding: '6px 12px', 
                                    backgroundColor: '#ef4444', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: actionLoading === key ? 'not-allowed' : 'pointer', 
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    opacity: actionLoading === key ? 0.6 : 1,
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {actionLoading === key ? '⏳ Processing...' : '✕ Reject'}
                                </button>
                              </div>
                            ) : (
                              <span className="status-badge completed">✓ Verified</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Volunteers Tab */}
        {activeTab === 'volunteers' && (
          <div className="volunteers-section">
            <h2>Volunteer Activity ({volunteers.length})</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Activity</th>
                    <th>Completed / Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((volunteer) => (
                    <tr key={volunteer.id}>
                      <td>{volunteer.name || 'Unnamed Volunteer'}</td>
                      <td>{volunteer.email}</td>
                      <td>{volunteer.city || '—'}{volunteer.state ? `, ${volunteer.state}` : ''}</td>
                      <td>
                        <div className="activity-cell">
                          <div className="activity-bar">
                            <div 
                              className="activity-bar-fill"
                              style={{ width: `${Math.min(volunteer.activityPercentage || 0, 100)}%` }}
                            />
                          </div>
                          <span className="activity-text">{volunteer.activityPercentage || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="count-chip">{volunteer.completedPickups || 0} / {volunteer.totalPickups || 0}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${volunteer.is_active ? 'completed' : 'pending'}`}>
                          {volunteer.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Points Tab */}
        {activeTab === 'points' && (
          <div className="points-section">
            <h2>Points by Role</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Redeemable</th>
                    <th>Total Earned</th>
                    <th>Total Redeemed</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id || u.user_id}>
                      <td>{`${u.first_name || ''} ${u.last_name || ''}`.trim() || 'User'}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role?.toLowerCase() || ''}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="points-cell">{u.redeemable_points ?? u.points ?? 0} pts</td>
                      <td className="points-cell">{u.total_points_earned ?? 0} pts</td>
                      <td className="points-cell">{u.total_points_redeemed ?? 0} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="donations-section">
            <h2>All Donations ({donations.length})</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Food Type</th>
                    <th>Quantity</th>
                    <th>Donor</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation.donation_id}>
                      <td>#{donation.donation_id}</td>
                      <td>{donation.food_type}</td>
                      <td>{donation.quantity} {donation.unit}</td>
                      <td>{donation.donor_name}</td>
                      <td>
                        <span className={`status-badge ${donation.status.toLowerCase()}`}>
                          {donation.status}
                        </span>
                      </td>
                      <td>{donation.pickup_address}</td>
                      <td>{formatDate(donation.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pickups Tab */}
        {activeTab === 'pickups' && (
          <div className="pickups-section">
            <h2>All Pickups ({pickups.length})</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Donation ID</th>
                    <th>Requester</th>
                    <th>Volunteer</th>
                    <th>Status</th>
                    <th>Scheduled Date</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {pickups.map((pickup) => (
                    <tr key={pickup.pickup_id || pickup.uuid || pickup._id}>
                      <td>#{pickup.pickup_id || pickup.uuid || pickup._id?.slice(-6)}</td>
                      <td>#{pickup.donation_id || pickup.donation?.uuid || pickup.donation?._id?.slice(-6) || '—'}</td>
                      <td>{pickup.requester_name || pickup.receiver?.organization_name || `${pickup.receiver?.first_name || ''} ${pickup.receiver?.last_name || ''}`.trim()}</td>
                      <td>
                        {pickup.volunteer?.first_name || pickup.volunteer?.last_name ? (
                          <div className="volunteer-cell">
                            <div className="volunteer-name">{`${pickup.volunteer?.first_name || ''} ${pickup.volunteer?.last_name || ''}`.trim() || 'Volunteer'}</div>
                            <div className="volunteer-email">{pickup.volunteer?.email || ''}</div>
                          </div>
                        ) : (
                          <span className="status-badge pending">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${pickup.status.toLowerCase()}`}>
                          {pickup.status}
                        </span>
                      </td>
                      <td>{pickup.scheduled_date ? formatDate(pickup.scheduled_date) : 'Not scheduled'}</td>
                      <td>{formatDate(pickup.createdAt || pickup.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
