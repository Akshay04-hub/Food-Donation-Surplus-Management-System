import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const preselectedRole = location.state?.role || null;
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login(formData.email, formData.password);
      const user = response.data.user;
      
      // Validate role if user clicked a specific role button
      if (preselectedRole && user.role !== preselectedRole) {
        setError(`This account is registered as ${user.role}. Please use the correct login page.`);
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to appropriate dashboard based on actual role
      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('signIn')}</h2>
        <p className="auth-subtitle">{t('welcomeBack')}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('email')}</label>
            <input type="email" id="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="you@email.com" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <div className="input-with-toggle">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('enterPassword')}
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

          <div className="form-helper-row">
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/forgot-password')}
            >
              {t('forgotPassword')}
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('noAccount')}{' '}
            <button type="button" onClick={() => navigate('/register', { state: { role: preselectedRole } })}
              className="link-button">
              {t('signUp')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
