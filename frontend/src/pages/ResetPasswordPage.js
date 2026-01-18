import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import './LoginPage.css';

const ResetPasswordPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = query.get('token') || '';
  const emailFromQuery = query.get('email') || '';

  const [form, setForm] = useState({ email: emailFromQuery, password: '', confirmPassword: '' });
  const [error, setError] = useState(token && emailFromQuery ? '' : t('error'));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token || !form.email) {
      setError(t('error'));
      return;
    }

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
      const res = await authAPI.resetPassword(form.email, token, form.password);
      setMessage(res.data?.message || t('resetPassword'));
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const disableForm = !token || !form.email;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('resetPassword')}</h2>
        <p className="auth-subtitle">{t('setNewPassword')}</p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert" style={{ background: '#ecfdf3', color: '#166534', border: '1px solid #bbf7d0' }}>{message}</div>}

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
              readOnly={Boolean(emailFromQuery)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('newPassword')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t('newPassword')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder={t('confirmPassword')}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading || disableForm}>
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

export default ResetPasswordPage;
