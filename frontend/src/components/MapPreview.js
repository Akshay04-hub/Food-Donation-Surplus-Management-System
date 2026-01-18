import React, { useMemo } from 'react';

const MapPreview = ({ address, city }) => {
  const mapUrl = useMemo(() => {
    const query = [address, city].filter(Boolean).join(', ');
    if (!query) return null;
    const encoded = encodeURIComponent(query);
    return `https://www.google.com/maps?q=${encoded}&output=embed`;
  }, [address, city]);

  if (!mapUrl) return null;

  return (
    <div style={{ width: '100%', height: '260px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.08)' }}>
      <iframe
        title="map-preview"
        src={mapUrl}
        width="100%"
        height="260"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default MapPreview;
