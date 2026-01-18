import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, donationAPI, notificationAPI, pickupAPI } from '../services/api';
import MapPreview from '../components/MapPreview';
import SearchBar from '../components/SearchBar';
import FiltersPanel from '../components/FiltersPanel';
import PointsCard from '../components/PointsCard';
import './DashboardPage.css';

const RequiredStar = () => <span className="required-star">*</span>;

const telanganaDistricts = [
  'Adilabad', 'Bhadrádri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon',
  'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar',
  'Khammam', 'Mahabubabad', 'Mahbubnagar', 'Mancherial', 'Medak', 'Medchal–Malkajgiri',
  'Miryalaguda', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad',
  'Peddapalli', 'Rajanna–Sircilla', 'Ranga Reddy', 'Sangareddy', 'Siddipet',
  'Suryapet', 'Tandur', 'Vikarabad', 'Wanaparthy', 'Warangal Rural', 'Warangal Urban',
  'Yadadri Bhuvanagiri'
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donations, setDonations] = useState([]);
  const [donationLoading, setDonationLoading] = useState(false);
  const [respondingDonation, setRespondingDonation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [formData, setFormData] = useState({
    food_name: '',
    description: '',
    quantity: '',
    quantity_unit: 'kg',
    address: '',
    city: '',
    contact_name: '',
    contact_phone: '',
    expiry_time: '',
    food_type: 'COOKED',
    organization_uuid: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [ngos, setNgos] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [ngosLoading, setNgosLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterNgo, setFilterNgo] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(donations.map((d) => d.food_category || d.food_type).filter(Boolean)));
  }, [donations]);

  const cityOptions = useMemo(() => {
    const dynamicCities = Array.from(new Set(donations.map((d) => d.city).filter(Boolean)));
    return Array.from(new Set([...telanganaDistricts, ...dynamicCities])).sort();
  }, [donations]);

  const ngoOptions = useMemo(() => {
    return Array.from(new Set(
      donations
        .map((d) => d.organization?.name || d.organization?.org_name || d.organization?.legal_name)
        .filter(Boolean)
    ));
  }, [donations]);

  const loadOrganizations = async () => {
    // NGO dropdown removed from form; this function kept for potential future use
    console.log('Organization loading disabled (NGO dropdown removed)');
  };

  const loadDonations = useCallback(async () => {
    if (!user) return;
    try {
      setDonationLoading(true);
      // Build params for backend search/filter
      let params = {
        search: searchTerm || undefined,
        category: filterCategory || undefined,
        city: filterCity || undefined,
        ngo: filterNgo || undefined,
      };
      if (user.role === 'NGO') {
        params.status = 'AVAILABLE';
      }

      const response = await donationAPI.getDonations(params);
      let filtered = response.data.donations || [];

      // For NGOs: only show AVAILABLE donations and exclude ones they already rejected
      if (user.role === 'NGO') {
        filtered = filtered
          .filter(d => d.status === 'AVAILABLE')
          .filter(d => {
            const rejected = d?.accepted_by?.rejected;
            const rejector = d?.accepted_by?.user;
            const uid = user.id || user._id;
            return !(rejected && rejector && (String(rejector) === String(uid) || rejector?._id === uid));
          });
      }
      // For Donors: show only their own donations
      if (user.role === 'DONOR') {
        const uid = String(user.id || user._id || '').toString();
        filtered = filtered.filter(d => {
          const donorVal = d.donor;
          if (!donorVal) return false;
          const donorId = donorVal._id || donorVal.id || donorVal.uuid || donorVal; // handle populated doc or raw id
          return donorId && String(donorId) === uid;
        });
      }
      // For Volunteers: ONLY show donations rejected by NGO (not newly created ones)
      if (user.role === 'VOLUNTEER') {
        console.log('Volunteer donations before filter:', filtered.length);
        filtered = filtered.filter(d => {
          const isRejected = d?.accepted_by?.rejected === true;
          console.log('Donation:', d.food_type, 'rejected:', isRejected, 'accepted_by:', d.accepted_by);
          return isRejected;
        });
        console.log('Volunteer donations after filter (rejected only):', filtered.length);
      }

      // Apply client-side sort
      const sorted = [...filtered].sort((a, b) => {
        const qa = Number(a.quantity) || 0;
        const qb = Number(b.quantity) || 0;
        const da = new Date(a.createdAt || a.updatedAt || a._id).getTime();
        const db = new Date(b.createdAt || b.updatedAt || b._id).getTime();
        switch (sortOption) {
          case 'oldest':
            return da - db;
          case 'qty-desc':
            return qb - qa;
          case 'qty-asc':
            return qa - qb;
          case 'newest':
          default:
            return db - da;
        }
      });

      setDonations(sorted);
    } catch (err) {
      console.error('Failed to load donations:', err);
      setError('Failed to load donations');
    } finally {
      setDonationLoading(false);
    }
  }, [user, searchTerm, filterCategory, filterCity, filterNgo, sortOption]);

  useEffect(() => {
    const loadUser = async () => {
      // Check if token exists before making API call
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        // API returns { success: true, user: { ... } }
        const userData = response.data.user || response.data;
        if (!userData || !userData.role) {
          throw new Error('Invalid user data received');
        }
        
        // Redirect ADMIN users to admin dashboard
        if (userData.role === 'ADMIN') {
          navigate('/admin-dashboard');
          return;
        }
        
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]); 

  useEffect(() => {
    if (activeTab === 'donations') {
      loadDonations();
    }
    if (activeTab === 'donate') {
      loadOrganizations();
    }
    if (activeTab === 'history') {
      loadHistory();
    }
    if (activeTab === 'notifications') {
      loadNotifications();
    }
  }, [activeTab, loadDonations]);

  const loadNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data.notifications || res.data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setNotifLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await donationAPI.getMyHistory();
      setHistory(res.data.history || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAcceptRejectedDonation = async (notification) => {
    // Volunteer accepts a rejected donation from notifications
    try {
      const donationId = notification.related_entity_id;
      if (!donationId) {
        alert('This notification is missing the donation reference. Please refresh notifications.');
        return;
      }
      setRespondingDonation(donationId);

      // Fetch donation details to determine available quantity
      let qty = 1;
      try {
        const dRes = await donationAPI.getDonationById(donationId);
        const donationObj = dRes?.data?.donation || dRes?.data;
        qty = donationObj?.availability_count || donationObj?.quantity || 1;
      } catch (fetchErr) {
        // fallback to 1 if fetch fails
        console.warn('Could not fetch donation details, defaulting requested quantity to 1', fetchErr);
        qty = 1;
      }

      // Create a pickup request (this will persist the request and update donation status)
      await pickupAPI.createPickupRequest({ donation_id: donationId, requested_quantity: qty });

      // Remove notification after successful request
      setNotifications(notifications.filter(n => n._id !== notification._id));
      
      // Reload history to show the acceptance
      await loadHistory();
      
      alert('✓ Accepted. Pickup request created. Check History tab to view details.');
    } catch (err) {
      console.error('Error accepting rejected donation:', err);
      const msg = err.response?.data?.message || err.message || 'Error accepting donation';
      alert(`Error: ${msg}`);
    } finally {
      setRespondingDonation(null);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (name === 'contact_phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        contact_phone: digitsOnly,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAcceptDonation = async (donationId) => {
    setRespondingDonation(donationId);
    try {
      await donationAPI.acceptDonation(donationId);
      // Remove from available donations list
      setDonations(donations.filter(d => d._id !== donationId && d.uuid !== donationId));
      setError('');
      alert('✓ Donation accepted successfully! Check Notifications/History for details.');
      // Reload notifications/history to show the acceptance
      await Promise.all([loadNotifications(), loadHistory?.()]);
    } catch (err) {
      console.error('Accept donation error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to accept donation';
      setError(msg);
      alert(`Error: ${msg}`);
    } finally {
      setRespondingDonation(null);
    }
  };

  const handleRejectDonation = async (donationId) => {
    setRespondingDonation(donationId);
    try {
      await donationAPI.rejectDonation(donationId);
      // Remove from available donations list
      setDonations(donations.filter(d => d._id !== donationId && d.uuid !== donationId));
      setError('');
      alert('✓ Donation rejected (volunteers notified)!');
      // Reload notifications
      loadNotifications();
    } catch (err) {
      console.error('Reject donation error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to reject donation';
      setError(msg);
      alert(`Error: ${msg}`);
    } finally {
      setRespondingDonation(null);
    }
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const contactPhoneDigits = (formData.contact_phone || '').replace(/\D/g, '');
      if (contactPhoneDigits.length !== 10) {
        setError('Contact phone must be exactly 10 digits');
        return;
      }

      // normalize unit and quantity (support grams -> kilograms)
      let qty = parseFloat(formData.quantity) || 0;
      let unit = 'KG';
      const uq = (formData.quantity_unit || '').toLowerCase();
      if (uq === 'kg') unit = 'KG';
      else if (uq === 'g') {
        unit = 'KG';
        qty = qty / 1000; // convert grams to kg
      } else if (uq === 'liters' || uq === 'liter') unit = 'LITER';
      else if (uq === 'pieces') unit = 'PIECES';
      else unit = (formData.quantity_unit || 'KG').toUpperCase();

      // Use FormData to support file upload
      const formDataObj = new FormData();
      formDataObj.append('food_type', formData.food_name);
      formDataObj.append('food_category', formData.food_type);
      formDataObj.append('quantity', qty);
      formDataObj.append('unit', unit);
      formDataObj.append('description', formData.description);
      formDataObj.append('preparation_date', new Date().toISOString());
      formDataObj.append('expiry_date', formData.expiry_time ? new Date(formData.expiry_time).toISOString() : '');
      formDataObj.append('address', formData.address);
      formDataObj.append('city', formData.city);
      formDataObj.append('contact_name', formData.contact_name);
      formDataObj.append('contact_phone', contactPhoneDigits);
      if (formData.image) {
        formDataObj.append('image', formData.image);
      }

      await donationAPI.createDonation(formDataObj);

      // Reset form and hide it
      setFormData({
        food_name: '',
        description: '',
        quantity: '',
        quantity_unit: 'kg',
        address: '',
        city: '',
        contact_name: '',
        contact_phone: '',
        expiry_time: '',
        food_type: 'COOKED',
        organization_uuid: '',
        image: null
      });
      setImagePreview(null);

      // Show the newly created donation in the donor's available list
      await loadDonations();
      setActiveTab('donations');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create donation');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Food Donation System</h1>
        </div>
        <div className="header-right">
          <span className="user-role">{user.role || 'Unknown'}</span>
          <div className="user-menu">
            <span className="user-name">
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user.name || user.email}
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="dashboard-content">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-menu">
            <button
              className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            {user.role === 'DONOR' && (
              <button
                className={`menu-item ${activeTab === 'donate' ? 'active' : ''}`}
                onClick={() => setActiveTab('donate')}
              >
                + Create Donation
              </button>
            )}
            <button
              className={`menu-item ${activeTab === 'donations' ? 'active' : ''}`}
              onClick={() => setActiveTab('donations')}
            >
              Available Donations
            </button>
            <button
              className={`menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => { setActiveTab('notifications'); loadNotifications(); }}
            >
              Notifications
            </button>
            <button
              className={`menu-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => { setActiveTab('history'); loadHistory(); }}
            >
              History
            </button>
            <button
              className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              My Profile
            </button>
          </nav>
        </aside>

        {/* Main Section */}
        <main className="dashboard-main">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <section className="tab-content">
              <h2>Welcome, {user.first_name || 'User'}!</h2>
              <div className="welcome-card">
                <p>
                  You are logged in as a <strong>{user.role}</strong>.
                </p>
                {user.role === 'DONOR' && (
                  <p>
                    Start by creating a food donation to share surplus food with
                    those in need.
                  </p>
                )}
                {user.role === 'NGO' && (
                  <p>
                    Browse available donations and accept or reject requests to help your
                    community.
                  </p>
                )}
                {user.role === 'VOLUNTEER' && (
                  <p>
                    Help coordinate donations and connect donors with NGOs.
                  </p> 
                )}
              </div>
            </section>
          )}

          {/* Create Donation Tab */}
          {activeTab === 'donate' && (
            <section className="tab-content">
              <h2>Create Food Donation</h2>
              {error && <div className="alert alert-error">{error}</div>}

              <form className="donation-form" onSubmit={handleCreateDonation}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="food_name">Food Name <RequiredStar /></label>
                    <input
                      type="text"
                      id="food_name"
                      name="food_name"
                      value={formData.food_name}
                      onChange={handleFormChange}
                      placeholder="e.g., Rice, Vegetables, Cooked Meals"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="food_type">Food Type <RequiredStar /></label>
                    <select
                      id="food_type"
                      name="food_type"
                      value={formData.food_type}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="COOKED">Cooked</option>
                      <option value="RAW">Raw</option>
                      <option value="PACKAGED">Packaged</option>
                      <option value="BEVERAGES">Beverages</option>
                      <option value="DAIRY">Dairy</option>
                      <option value="BAKERY">Bakery</option>
                      <option value="FRUITS">Fruits</option>
                      <option value="VEGETABLES">Vegetables</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Describe the food item..."
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity <RequiredStar /></label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleFormChange}
                      placeholder="5"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="quantity_unit">Unit <RequiredStar /></label>
                    <select
                      id="quantity_unit"
                      name="quantity_unit"
                      value={formData.quantity_unit}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="liters">liters</option>
                      <option value="pieces">pieces</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address">Address <RequiredStar /></label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      placeholder="Street address, building, landmark"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City <RequiredStar /></label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      placeholder="City"
                      required
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginTop: '8px' }}>
                  <MapPreview address={formData.address} city={formData.city} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact_name">Contact Name <RequiredStar /></label>
                    <input
                      type="text"
                      id="contact_name"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleFormChange}
                      placeholder="Person to contact"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact_phone">Contact Phone <RequiredStar /></label>
                    <input
                      type="tel"
                      id="contact_phone"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleFormChange}
                      placeholder="10-digit phone"
                      inputMode="numeric"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="expiry_time">Expiry Time</label>
                  <input
                    type="datetime-local"
                    id="expiry_time"
                    name="expiry_time"
                    value={formData.expiry_time}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image">Upload Food Image</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFormChange}
                  />
                  {imagePreview && (
                    <div className="image-preview" style={{ marginTop: '10px' }}>
                      <img src={imagePreview} alt="Food preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Create Donation
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Available Donations Tab */}
          {activeTab === 'donations' && (
            <section className="tab-content">
              <h2>Available Donations</h2>
              <div className="donations-toolbar">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by food name, type, or category"
                />
                <FiltersPanel
                  category={filterCategory}
                  city={filterCity}
                  ngo={filterNgo}
                  categories={categoryOptions}
                  cities={cityOptions}
                  ngos={ngoOptions}
                  onCategoryChange={setFilterCategory}
                  onCityChange={setFilterCity}
                  onNgoChange={setFilterNgo}
                />
                <div className="sort-group">
                  <label htmlFor="sort-donations">Sort</label>
                  <select
                    id="sort-donations"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="qty-desc">Quantity: high → low</option>
                    <option value="qty-asc">Quantity: low → high</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('');
                      setFilterCity('');
                      setFilterNgo('');
                      setSortOption('newest');
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="donations-list">
                {donationLoading ? (
                  <p>Loading donations...</p>
                ) : donations.length === 0 ? (
                  <p>No donations available at the moment.</p>
                ) : (
                  donations.map((d) => (
                    <div key={d._id || d.uuid} className="donation-card" style={d.image_url ? { backgroundImage: `url(${d.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                      <div className="donation-card-overlay"></div>
                      <div className="donation-head">
                        <h3>{d.food_type || d.food_category || d.food_name}</h3>
                        <div className="donation-meta">Qty: {d.quantity} {d.unit}</div>
                      </div>
                      <div className="donation-body">
                        <p>{d.description}</p>
                        <p><strong>Address:</strong> {d.address}, {d.city}</p>
                        <p><strong>Donor:</strong> {d.donor?.first_name ? `${d.donor.first_name} ${d.donor.last_name || ''}` : d.donor?.email || 'Unknown'}</p>
                      </div> 
                      {user.role === 'NGO' && (() => {
                        const donationId = d.uuid || d._id;
                        return (
                          <div className="donation-actions">
                            <button className="btn btn-primary" disabled={respondingDonation === donationId} onClick={() => handleAcceptDonation(donationId)}>
                              {respondingDonation === donationId ? 'Accepting...' : 'Accept'}
                            </button>
                            <button className="btn btn-secondary" disabled={respondingDonation === donationId} onClick={() => handleRejectDonation(donationId)}>
                              {respondingDonation === donationId ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        );
                      })()}
                      {user.role === 'VOLUNTEER' && (() => {
                        const donationId = d.uuid || d._id;
                        return (
                          <div className="donation-actions">
                            <button className="btn btn-primary" disabled={respondingDonation === donationId} onClick={() => handleAcceptDonation(donationId)}>
                              {respondingDonation === donationId ? 'Accepting...' : 'Accept'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <section className="tab-content">
              <h2>Notifications</h2>
              {notifLoading ? (
                <p>Loading...</p>
              ) : notifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                <div className="notifications-list">
                  {notifications
                    // Hide NGO rejection notifications from volunteers (they already see these in Available)
                    .filter((n) => !(user.role === 'VOLUNTEER' && n.type === 'DONATION_REJECTED'))
                    .map((n) => (
                      <div key={n._id || n.uuid} className="notification-card">
                        <div className="notif-head">
                          <strong>{n.title}</strong>
                          <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="notif-body">
                          <p>{n.message}</p>
                        </div>
                        {user.role === 'VOLUNTEER' && n.type === 'DONATION_REJECTED' && n.related_entity_id && (
                          <div className="notif-actions">
                            <button className="btn btn-primary" disabled={respondingDonation === n.related_entity_id} onClick={() => handleAcceptRejectedDonation(n)}>
                              {respondingDonation === n.related_entity_id ? 'Accepting...' : 'Accept Donation'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </section>
          )}

          {/* Profile Tab */}
          {/* History Tab */}
          {activeTab === 'history' && (
            <section className="tab-content">
              <h2>Donation History</h2>
              {historyLoading ? (
                <p>Loading history...</p>
              ) : history.length === 0 ? (
                <p>No history available yet.</p>
              ) : (
                <div className="donations-list">
                  {history.map((item) => {
                    const d = item.isPickupRequest ? item : item;
                    const displayStatus = d?.accepted_by?.rejected ? 'REJECTED' : (d.status || 'UNKNOWN');
                    return (
                      <div key={d._id || d.uuid} className="donation-card history-card">
                        <div className="donation-head">
                          <h3>{d.food_type}</h3>
                          <span className={`status-badge status-${displayStatus.toLowerCase()}`}>
                            {displayStatus}
                          </span>
                        </div>
                        <p><strong>Description:</strong> {d.description || 'N/A'}</p>
                        <p><strong>Quantity:</strong> {d.quantity} {d.unit}</p>
                        <p><strong>Category:</strong> {d.food_category}</p>
                        <p><strong>Location:</strong> {d.address}, {d.city}</p>
                        <p><strong>Contact:</strong> {d.contact_name} ({d.contact_phone})</p>
                        
                        {/* Show donor info for NGOs */}
                        {user.role === 'NGO' && d.donor && (
                          <p><strong>Donor:</strong> {d.donor.first_name} {d.donor.last_name} ({d.donor.email})</p>
                        )}
                        
                        {/* Show accepted/rejected info for Donors */}
                        {user.role === 'DONOR' && d.accepted_by && (
                          <div className="ngo-info-box">
                            {d.accepted_by.rejected ? (
                              <p><strong>Rejected by:</strong> {d.accepted_by.organization ? 'NGO' : (d.accepted_by.user?.role || 'User')}</p>
                            ) : (
                              <p><strong>Accepted by:</strong> {d.accepted_by.organization ? 'NGO' : (d.accepted_by.user?.role || 'User')}</p>
                            )}

                            {/* If NGO involved */}
                            {d.accepted_by.organization && (
                              <>
                                <p className="ngo-name">🏢 {d.accepted_by.organization.name}</p>
                                {d.accepted_by.organization.address && (
                                  <p className="ngo-location">📍 {d.accepted_by.organization.address}, {d.accepted_by.organization.city}, {d.accepted_by.organization.state}</p>
                                )}
                                {d.accepted_by.organization.phone && (
                                  <p className="ngo-contact">📞 {d.accepted_by.organization.phone}</p>
                                )}
                                {d.accepted_by.organization.email && (
                                  <p className="ngo-contact">✉️ {d.accepted_by.organization.email}</p>
                                )}
                                {(() => {
                                  const ratingVal = (d.accepted_by.organization.acceptance_score ?? d.accepted_by.organization.average_rating ?? 0);
                                  const ratingCnt = (d.accepted_by.organization.decision_count ?? d.accepted_by.organization.rating_count ?? 0);
                                  return (
                                    <p className="ngo-contact">⭐ {Number(ratingVal).toFixed(1)} ({ratingCnt})</p>
                                  );
                                })()}
                              </>
                            )}

                            {/* Volunteer or user without org */}
                            {!d.accepted_by.organization && d.accepted_by.name && (
                              <p className="ngo-name">🙋 {d.accepted_by.name}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Show pickup info for Volunteers */}
                        {item.isPickupRequest && (
                          <>
                            <p><strong>Pickup Status:</strong> {item.pickup_status}</p>
                            <p><strong>Requested Quantity:</strong> {item.requested_quantity}</p>
                          </>
                        )}
                        
                        {d.image_url && (
                          <div className="donation-image">
                            <img src={d.image_url} alt={d.food_type} style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '10px' }} />
                          </div>
                        )}
                        
                        <p className="donation-date">
                          <small>Created: {new Date(d.createdAt).toLocaleString()}</small>
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <section className="tab-content">
              <h2>My Profile</h2>
              <PointsCard />
              <div className="profile-card">
                <div className="profile-field">
                  <label>First Name</label>
                  <p>{user.first_name}</p>
                </div>
                <div className="profile-field">
                  <label>Last Name</label>
                  <p>{user.last_name || 'Not provided'}</p>
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="profile-field">
                  <label>Phone</label>
                  <p>{user.phone || 'Not provided'}</p>
                </div>
                <div className="profile-field">
                  <label>Role</label>
                  <p>{user.role}</p>
                </div>
                <div className="profile-field">
                  <label>Member Since</label>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
export default DashboardPage;
