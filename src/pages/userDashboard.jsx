import { useEffect, useState } from 'react';
import HeaderBar from '../components/HeaderBar';
import LocationButton from '../components/LocationButton';
import AddressInfoModal from '../components/AddressInfoModal';
import LogoutWarningModal from '../components/LogoutWarningModal';
import LiveMap from '../components/LiveMap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserDashboard() {
  const [position, setPosition] = useState(null);
  const [message, setMessage] = useState('');
  const [address, setAddress] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [distanceFromTarget, setDistanceFromTarget] = useState(null);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => setPosition([coords.latitude, coords.longitude]),
      (err) => {
        console.error('Geolocation error:', err);
        setMessage('Failed to fetch location. Please allow access.');
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className='bg-light vh-100 '>
      <HeaderBar
        position={position}
        isCheckedIn={isCheckedIn}
        setIsCheckedIn={setIsCheckedIn}
        setMessage={setMessage}
        setCheckInTime={setCheckInTime}
        setAddress={setAddress}
        setDistanceFromTarget={setDistanceFromTarget}
        setShowDialog={setShowDialog}
        setShowLogoutWarning={setShowLogoutWarning}
      />
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="container-fluid mt-4 bg-light p-4 rounded-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Real-Time Location</h5>
          <LocationButton
            position={position}
            setAddress={setAddress}
            setDistanceFromTarget={setDistanceFromTarget}
            setCheckInTime={setCheckInTime}
            setShowDialog={setShowDialog}
          />
        </div>

        {message && <div className="alert alert-primary text-center fw-semibold">{message}</div>}

       {isCheckedIn && (
  <div className="row">
    <div className="col-md-6 mb-3">
      <LiveMap position={position} />
    </div>

    <div className="col-md-6">
      <div className="card shadow-sm rounded-4 border-0">
        <div className="card-body">
          <h5 className="card-title text-primary fw-bold mb-4 text-center">
            <i className="bi bi-clock-history me-2"></i>Clocked In Details
          </h5>

          <ul className="list-unstyled mb-0">
            <li className="mb-3">
              <i className="bi bi-clock me-2 text-secondary"></i>
              <strong>Clock-In Time:</strong> <span className="text-dark">{checkInTime}</span>
            </li>

            <li className="mb-3">
              <i className="bi bi-geo-alt-fill me-2 text-danger"></i>
              <strong>Address:</strong>
              <div className="ms-4 text-muted small">{address}</div>
            </li>

            <li>
              <i className="bi bi-geo me-2 text-success"></i>
              <strong>Distance from Office:</strong>{' '}
              <span className="text-dark">{distanceFromTarget} meters</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)}
        {showDialog && (
          <AddressInfoModal
            address={address}
            checkInTime={checkInTime}
            distanceFromTarget={distanceFromTarget}
            onClose={() => setShowDialog(false)}
          />
        )}

        {showLogoutWarning && (
          <LogoutWarningModal onClose={() => setShowLogoutWarning(false)} />
        )}
      </div>
    </div>
  );
}
