import { reverseGeocode } from '../utils/reverseGeocode';
import { getDistance } from '../utils/geofense';
import { targetLocation } from '../utils/target';

export default function LocationButton({ position, setAddress, setDistanceFromTarget, setCheckInTime, setShowDialog }) {
  const handleGetAddress = async () => {
    if (!position) return;
    const result = await reverseGeocode(...position);
    const distance = getDistance(position, [targetLocation.lat, targetLocation.lng]);
    setAddress(result);
    setDistanceFromTarget(distance.toFixed(2));
    setCheckInTime(prev => prev || new Date().toLocaleTimeString());
    setShowDialog(true);
  };

  return (
    <button className="btn btn-primary text-white" onClick={handleGetAddress}>
      <i className="bi bi-geo-alt-fill me-1"></i> Get My Address
    </button>
  );
}
