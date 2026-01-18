import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import './LoginPage.css';

const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    if (form.password.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.updatePasswordByEmail(form.email, form.password);
      setMessage(res.data?.message || t('resetPassword'));
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('forgotPassword')}</h2>
        <p className="auth-subtitle">{t('resetPassword')}</p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert" style={{ background: '#e0f2fe', color: '#075985', border: '1px solid #bae6fd' }}>{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('newPassword')}</label>
            <div className="input-with-toggle">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t('newPassword')}
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
            <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
            <div className="input-with-toggle">
              <input
                type={showConfirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder={t('confirmPassword')}
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

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? t('resetPassword') : t('resetPassword')}
          </button>
        </form>

        <div className="auth-footer">
          <button type="button" className="link-button" onClick={() => navigate('/login')}>
            {t('backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
