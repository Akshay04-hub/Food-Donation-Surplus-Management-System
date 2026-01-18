import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import './RegisterPage.css';

const RequiredStar = () => <span className="required-star">*</span>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const preselectedRole = location.state?.role || null;
  const preselectedDonorType = location.state?.donor_type || null;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '', 
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
    role: preselectedRole,
    donor_type: preselectedDonorType,
    ngo_name: '',
    ngo_address: '',
    // Donor-specific fields
    hostel_name: '',
    warden_name: '',
    restaurant_name: '',
    owner_name: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Force phone to stay numeric and capped at 10 digits
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        phone: digitsOnly,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form fields
    if (formData.role !== 'DONOR' && formData.role !== 'NGO') {
      if (!formData.first_name.trim()) {
        setError(t('firstNameRequired'));
        return;
      }
    }

    if (!formData.email.trim()) {
      setError(t('emailRequired'));
      return;
    }

    const phoneDigits = (formData.phone || '').replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError(t('phone10Digits'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    if (!formData.terms) {
      setError(t('acceptTerms'));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: phoneDigits,
        password: formData.password,
      };

      if (formData.role) {
        payload.role = formData.role;
      }

      if (formData.role === 'DONOR' && formData.donor_type) {
        payload.donor_type = formData.donor_type;
        
        // Add donor type-specific fields
        if (formData.donor_type === 'HOSTELS') {
          payload.hostel_name = formData.hostel_name;
          payload.owner_name = formData.owner_name;
          payload.address = formData.address;
        } else if (formData.donor_type === 'RESTAURANTS') {
          payload.restaurant_name = formData.restaurant_name;
          payload.owner_name = formData.owner_name;
          payload.address = formData.address;
        } else if (formData.donor_type === 'HOME') {
          payload.owner_name = formData.owner_name;
          payload.address = formData.address;
        }
      }

      if (formData.role === 'NGO') {
        if (formData.ngo_name) payload.ngo_name = formData.ngo_name;
        if (formData.ngo_address) payload.ngo_address = formData.ngo_address;
      }

      const response = await authAPI.register(payload);

      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Navigate to role selection
      // If we already had a role selected, go straight to dashboard
      if (formData.role) {
        navigate('/dashboard');
      } else {
        navigate('/select-role');
      }
    } catch (err) {
      console.error('Full error response:', err);
      console.error('Error data:', err.response?.data);
      
      const responseData = err.response?.data || {};
      let displayError = responseData.message || 'Registration failed';
      const errors = responseData.errors;
      
      // If we have an errors array, use the first meaningful one
      if (errors && Array.isArray(errors) && errors.length > 0) {
        const firstError = errors[0];
        if (typeof firstError === 'string' && firstError.trim()) {
          displayError = firstError;
        }
      }
      
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('createAccount')}</h2>
        <p className="auth-subtitle">{t('joinUs')}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Only show first_name for non-donor and non-NGO roles */}
          {formData.role !== 'DONOR' && formData.role !== 'NGO' && (
            <div className="form-group">
              <label htmlFor="first_name">{t('firstName')} <RequiredStar /></label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </div>
          )}

          {/* Only show last_name for non-donor and non-NGO roles */}
          {formData.role !== 'DONOR' && formData.role !== 'NGO' && (
            <div className="form-group">
              <label htmlFor="last_name">{t('lastName')} <RequiredStar /></label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">{t('email')} <RequiredStar /></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">{t('phone')} <RequiredStar /></label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0123456789"
              inputMode="numeric"
              maxLength={10}
              required
            />
            <small className="field-hint">Enter exactly 10 digits</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password')} <RequiredStar /></label>
            <div className="input-with-toggle">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('atLeast6Characters')}
                required
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('confirmPassword')} <RequiredStar /></label>
            <div className="input-with-toggle">
              <input
                type={showConfirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('reenterPassword')}
                required
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? t('hidePassword') : t('showPassword')}
              >
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Donor-specific fields based on donor_type */}
          {formData.role === 'DONOR' && formData.donor_type === 'HOSTELS' && (
            <>
              <div className="form-group">
                <label htmlFor="hostel_name">Hostel Name <RequiredStar /></label>
                <input
                  type="text"
                  id="hostel_name"
                  name="hostel_name"
                  value={formData.hostel_name}
                  onChange={handleChange}
                  placeholder="Enter hostel name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="owner_name">Owner Name <RequiredStar /></label>
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  placeholder="Enter owner name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address <RequiredStar /></label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter hostel address"
                  required
                />
              </div>
            </>
          )}

          {formData.role === 'DONOR' && formData.donor_type === 'RESTAURANTS' && (
            <>
              <div className="form-group">
                <label htmlFor="restaurant_name">Restaurant Name <RequiredStar /></label>
                <input
                  type="text"
                  id="restaurant_name"
                  name="restaurant_name"
                  value={formData.restaurant_name}
                  onChange={handleChange}
                  placeholder="Enter restaurant name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="owner_name">Owner Name <RequiredStar /></label>
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  placeholder="Enter owner name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address <RequiredStar /></label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter restaurant address"
                  required
                />
              </div>
            </>
          )}

          {formData.role === 'DONOR' && formData.donor_type === 'HOME' && (
            <>
              <div className="form-group">
                <label htmlFor="owner_name">Owner Name <RequiredStar /></label>
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address <RequiredStar /></label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your home address"
                  required
                />
              </div>
            </>
          )}

          {formData.role === 'NGO' && (
            <>
              <div className="form-group">
                <label htmlFor="ngo_name">{t('ngoName')} <RequiredStar /></label>
                <input
                  type="text"
                  id="ngo_name"
                  name="ngo_name"
                  value={formData.ngo_name}
                  onChange={handleChange}
                  placeholder={t('organizationName')}
                  required={formData.role === 'NGO'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ngo_address">{t('ngoAddress')} <RequiredStar /></label>
                <input
                  type="text"
                  id="ngo_address"
                  name="ngo_address"
                  value={formData.ngo_address}
                  onChange={handleChange}
                  placeholder={t('streetAddress')}
                  required={formData.role === 'NGO'}
                />
              </div>
            </>
          )}

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
            />
            <label htmlFor="terms">
              {t('agreeTerms')} <RequiredStar />
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? t('creatingAccount') : t('signUp')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('alreadyHaveAccount')}{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="link-button"
            >
              {t('signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
