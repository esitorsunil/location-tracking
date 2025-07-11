import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LiveMap from '../components/LiveMap';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [mapLocation, setMapLocation] = useState(null);
  const [mapAddress, setMapAddress] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);

  const currentAdmin = JSON.parse(localStorage.getItem('loggedInUser'));
  const adminEmail = currentAdmin?.admin || currentAdmin?.email;

  useEffect(() => {
    if (!currentAdmin || currentAdmin.role !== 'admin') {
      navigate('/');
    }
  }, []);

  const userRecords = useSelector(state => state.timesheet.logs[adminEmail] || {});

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  const openMap = (location, address) => {
    setMapLocation(location);
    setMapAddress(address);
    setShowMapModal(true);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>👨‍💼 Admin Dashboard</h3>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Time</th>
              <th>Address</th>
              <th>View on Map</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(userRecords).map(([email, { name, events }]) =>
              events.map((event, index) => (
                <tr key={`${email}-${index}`}>
                  <td>{name}</td>
                  <td>{event.type === 'check-in' ? '🟢 Check-In' : '🔴 Check-Out'}</td>
                  <td>{event.time}</td>
                  <td>{event.address || 'Unknown'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openMap(event.location, event.address)}
                    >
                      View Map
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showMapModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📍 Location</h5>
                <button className="btn-close" onClick={() => setShowMapModal(false)}></button>
              </div>
              <div className="modal-body">
                <LiveMap position={mapLocation} />
                <p className="mt-3 text-muted">📌 {mapAddress}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowMapModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
