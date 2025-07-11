import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode } from '../utils/reverseGeocode';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function LiveMap({ position }) {
  const [address, setAddress] = useState('Loading...');

  useEffect(() => {
    const fetchAddress = async () => {
      if (position) {
        const result = await reverseGeocode(position[0], position[1]);
        setAddress(result);
      }
    };
    fetchAddress();
  }, [position]);

  if (!position) return null;

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <MapContainer
        center={position}
        zoom={16}
        style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          <Popup>
            <div>
              <strong>Current Location</strong><br />
              {address}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
