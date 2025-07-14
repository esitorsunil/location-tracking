// components/UserMap.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function UserMap({ position }) {
  if (!position) return <div></div>;

  return (
    <MapContainer center={position} zoom={16} scrollWheelZoom={false} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          User location: {position[0]}, {position[1]}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
