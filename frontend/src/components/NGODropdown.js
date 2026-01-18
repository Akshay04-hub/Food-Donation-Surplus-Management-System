import React from 'react';

const NGODropdown = ({ ngos, ngosLoading, value, onChange, selectedNGO }) => {
  return (
    <div className="form-group">
      <label htmlFor="organization_uuid">Choose NGO (optional)</label>
      <select
        id="organization_uuid"
        name="organization_uuid"
        value={value}
        onChange={onChange}
      >
        <option value="">-- Select NGO (optional) --</option>
        {ngosLoading ? (
          <option>Loading...</option>
        ) : (
          ngos.map(o => {
            const ratingValue =
              o.acceptance_score !== undefined && o.acceptance_score !== null
                ? o.acceptance_score
                : o.average_rating !== undefined && o.average_rating !== null
                  ? o.average_rating
                  : 0;
            const ratingCount = o.decision_count || o.rating_count || 0;
            const status = o.verification_status === 'APPROVED' ? '' : ` [${o.verification_status}]`;
            return (
              <option key={o._id || o.uuid} value={o.uuid}>
                {o.name} — {o.address}, {o.city}{status}
              </option>
            );
          })
        )}
      </select>
      {selectedNGO && (
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f4ff', borderRadius: '6px', fontSize: '13px', color: '#333', border: '1px solid #d0dcff' }}>
          <strong style={{ fontSize: '14px', color: '#667eea' }}>📍 Selected NGO Details:</strong><br/>
          <div style={{ marginTop: '8px' }}>
            <div style={{ marginBottom: '6px' }}>
              <strong>Name:</strong> {selectedNGO.name}
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong>Full Address:</strong> {selectedNGO.address}, {selectedNGO.city} {selectedNGO.state && `, ${selectedNGO.state}`} {selectedNGO.zip_code && `- ${selectedNGO.zip_code}`}
            </div>
            {selectedNGO.phone && (
              <div style={{ marginBottom: '6px' }}>
                <strong>Phone:</strong> {selectedNGO.phone}
              </div>
            )}
            {selectedNGO.email && (
              <div style={{ marginBottom: '6px' }}>
                <strong>Email:</strong> {selectedNGO.email}
              </div>
            )}
            <div style={{ marginBottom: '6px' }}>
              <strong>Status:</strong> <span style={{ color: selectedNGO.verification_status === 'APPROVED' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{selectedNGO.verification_status}</span>
            </div>
            <div>
              <strong>Rating:</strong> {Number((selectedNGO.acceptance_score ?? selectedNGO.average_rating ?? 0)).toFixed(1)}★ ({selectedNGO.decision_count || selectedNGO.rating_count || 0} reviews)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGODropdown;
