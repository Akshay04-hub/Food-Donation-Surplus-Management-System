import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import './LandingPage.css';
import donationHero from '../assets/Donation1.webp';

function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState(null);
  const panelRef = useRef(null);

  const roles = [
    { id: 'DONOR', title: t('donor'), icon: '🍽️', description: t('donorDesc'), color: 'donor' },
    { id: 'NGO', title: t('ngo'), icon: '🤝', description: t('ngoDesc'), color: 'ngo' },
    { id: 'VOLUNTEER', title: t('volunteer'), icon: '🙎‍♂️', description: t('volunteerDesc'), color: 'volunteer' },
    { id: 'ADMIN', title: t('admin'), icon: '👨‍💼', description: t('adminDesc'), color: 'admin' },
  ];

  // choose role and scroll to auth panel nicely
  const handleChoose = (roleId) => {
    setSelectedRole(roleId);
  };

  // when role changes, focus the auth panel for accessibility and smooth scroll
  useEffect(() => {
    if (selectedRole && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      panelRef.current.querySelector('button')?.focus();
    }
  }, [selectedRole]);

  const selectedRoleLabel = roles.find((r) => r.id === selectedRole)?.title || selectedRole;

  // keyboard support: allow Enter/Space on role "cards"
  const onRoleKeyDown = (e, roleId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChoose(roleId);
    }
  };

  return (
    <main className="landing-container" aria-labelledby="landing-heading">
      <header className="landing-header">
        <div className="language-selector-container">
          <LanguageSelector />
        </div>
      </header>

      <div className="landing-content">

        <p className="above-title big-highlight" aria-hidden="false"><strong>
          {t('pathToSecurity')}
        </strong></p>

        <section className="title-box no-deco" aria-label={t('foodDonation')}>
          <div className="title-inner">
            <h1 id="landing-heading">{t('foodDonation')}</h1>
            <p className="subtitle">{t('connect')}</p>
          </div>
        </section>

        <section className="hero-visual" aria-label="Illustration of food donation in action">
          <div className="hero-image-card">
            <img src={donationHero} alt="Volunteers sharing food donations" loading="lazy" />
            <div className="hero-pill">{t('communityPowered')}</div>
          </div>
        </section>

        <h2 className="section-intro">{t('getStarted')}</h2>

        {/* roles */}
        {!selectedRole && (
          <div className="roles-row" role="list">
            {roles.map((r) => (
              <div
                key={r.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${r.title} — ${r.description}`}
                className={`role-card ${r.color}`}
                onClick={() => handleChoose(r.id)}
                onKeyDown={(e) => onRoleKeyDown(e, r.id)}
              >
                <div className="role-icon" aria-hidden>{r.icon}</div>
                <h3 className="role-title">{r.title}</h3>
                <p className="role-desc">{r.description}</p>
                <button
                  className="choose-btn"
                  onClick={(e) => { e.stopPropagation(); handleChoose(r.id); } }
                  aria-pressed="false"
                >
                  {t('chooseRole')}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* auth choices */}
        {selectedRole && (
          <div className="auth-choice-panel" ref={panelRef} aria-live="polite">
            <p className="selected-text">
              {t('youSelected')} <strong>{selectedRoleLabel}</strong>.
            </p>

            <div className="auth-buttons">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/login', { state: { role: selectedRole } })}
              >
                {t('signIn')}
              </button>

              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  if (selectedRole === 'DONOR') {
                    navigate('/donor-type-selection');
                  } else {
                    navigate('/register', { state: { role: selectedRole } });
                  }
                }}
              >
                {t('signUp')}
              </button>
            </div>

            <button
              className="btn-link"
              onClick={() => setSelectedRole(null)}
              aria-label={t('changeRole')}
            >
              <strong>{t('changeRole')}</strong>
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

export default LandingPage;
