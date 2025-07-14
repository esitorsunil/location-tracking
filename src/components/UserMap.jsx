import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 🔄 Reverse Geocoding (Nominatim API)
const getAddressFromCoords = async ([lat, lng]) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await res.json();
    return data.display_name || 'Unknown';
  } catch {
    return 'Address not found';
  }
};

export default function UserMap({ positions }) {
  const [addresses, setAddresses] = useState({});

  useEffect(() => {
    const fetchAddresses = async () => {
      const newAddresses = {};
      for (const user of positions) {
        const key = user.email;
        if (!addresses[key]) {
          newAddresses[key] = await getAddressFromCoords(user.position);
        }
      }
      setAddresses((prev) => ({ ...prev, ...newAddresses }));
    };

    if (positions?.length) fetchAddresses();
  }, [positions]);

  const defaultCenter = positions?.[0]?.position || [17.4196, 78.4631];

  return (
   <MapContainer
  center={defaultCenter}
  zoom={35}
  scrollWheelZoom={true}
  style={{
    height: '100%',
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  }}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

  {positions?.map((user, idx) => (
    <Marker key={idx} position={user.position}>
      <Tooltip
        direction="top"
        offset={[0, -10]}
        permanent
        className="leaflet-tooltip"
      >
        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
          <strong>{user.name}</strong>
          <br />
          🕒 In: <span style={{ color: 'green' }}>{user.checkInTime || '--'}</span>
          <br />
          🕔 Out: <span style={{ color: 'red' }}>{user.checkOutTime || '--'}</span>
          <br />
        </div>
      </Tooltip>
    </Marker>
  ))}
</MapContainer>

  );
}
