import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { reverseGeocode } from '../utils/reverseGeocode';
import UserMap from '../components/UserMap';

export default function AdminDashboard() {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDate, setActiveDate] = useState('');
  const admin = JSON.parse(localStorage.getItem('loggedInUser'));
  const adminEmail = admin?.email || 'user@gmail.com';
  const [selectedUser, setSelectedUser] = useState(null);
const [selectedEmail, setSelectedEmail] = useState(null);

 
  const [tooltipData, setTooltipData] = useState({}); // { "lat,lng": "Address" }
const [visibleTooltip, setVisibleTooltip] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'timesheets', adminEmail);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
  const fullData = docSnap.data();
  console.log('🔥 Firestore full data:', JSON.stringify(fullData, null, 2));
  const usersData = fullData.users || {};
  setUserData(usersData);
}
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [adminEmail]);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser');
    window.location.href = '/';
  };

  
const fetchAddress = async (lat, lng) => {
  const key = `${lat},${lng}`;
  if (tooltipData[key]) return;

  const address = await reverseGeocode(lat, lng);
  setTooltipData(prev => ({ ...prev, [key]: address }));
};

  const filteredUsers = Object.entries(userData).filter(([email, { name, sessions }]) => {
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!activeDate) return matchesSearch;
    return matchesSearch && sessions?.[activeDate];
  });

  const calculateTotalHours = (sessions) => {
    if (!activeDate) return '--';

    const session = sessions?.[activeDate];
    if (!session) return '--';

    const checkInTime = session.checkIn?.checkIn?.time;
    const checkOutTime = session.checkOut?.checkOut?.time;
    if (!(checkInTime && checkOutTime)) return '--';

    const [inH, inM] = checkInTime.split(':').map(Number);
    const [outH, outM] = checkOutTime.split(':').map(Number);
    const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="admin-dashboard">
      <div className="main-content">
        <header className="top-nav bg-black shadow-sm d-flex justify-content-between align-items-center px-4 py-3">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search employees..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex align-items-center">
            <button className="btn btn-danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </header>

        <div className="content-container p-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading employee data...</p>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="card shadow-sm mb-4 h-100">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Employee Location Tracking</h5>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={activeDate}
                        onChange={(e) => setActiveDate(e.target.value)}
                        style={{ maxWidth: 120 }}
                      />
                      <button className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-download me-2"></i>Export
                      </button>
                    </div>
                  </div>

                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Employee</th>
                            <th>Email</th>
                            <th>Last Session</th>
                            <th>Total Hours</th>
                            <th>Location</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(([email, { name, sessions }]) => {
                            const session = activeDate
                              ? sessions?.[activeDate]
                              : Object.entries(sessions || {}).pop()?.[1];
                            const checkIn = session?.checkIn?.checkIn;
                            const checkOut = session?.checkOut?.checkOut;
                            const location = checkOut?.location || checkIn?.location;
                            const locationKey = location ? `${location[0]},${location[1]}` : '';

                            return (
                              <tr key={email}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div>
                                      <div className="fw-bold">{name}</div>
                                      <div className="text-muted small">
                                        ID: {email.substring(0, 20)}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>{email}</td>
                                <td>
                                  {session ? (
                                    <>
                                      <div>{activeDate || 'Latest'}</div>
                                      <div className="text-muted small">
                                        {checkIn?.time || '--'} - {checkOut?.time || '--'}
                                      </div>
                                    </>
                                  ) : (
                                    'No session'
                                  )}
                                </td>
                                <td>{calculateTotalHours(sessions)}</td>
   <td>
  {location ? (
    <span
      className="badge bg-light text-dark position-relative"
      onClick={async () => {
        const key = `${location[0]},${location[1]}`;
        await fetchAddress(location[0], location[1]);
        setVisibleTooltip(key);
        setTimeout(() => setVisibleTooltip(null), 6000);
      }}
      style={{ cursor: 'pointer' }}
    >
      <i className="bi bi-geo-alt-fill text-primary me-1"></i>
      {location[0]?.toFixed(2)}, {location[1]?.toFixed(2)}
      {visibleTooltip === `${location[0]},${location[1]}` && (
        <div
          className="position-absolute bottom-100 start-50 translate-middle-x bg-white text-dark border shadow-sm p-2 mb-1 rounded"
          style={{ zIndex: 1000, minWidth: '200px', whiteSpace: 'normal' }}
        >
          {tooltipData[`${location[0]},${location[1]}`] || 'Loading...'}
        </div>
      )}
    </span>
  ) : (
    '--'
  )}
</td>

                               
                               <td>
  <button
  className="btn btn-sm btn-outline-primary me-2"
  data-bs-toggle="modal"
  data-bs-target="#checkDetailsModal"
  onClick={() => {
    const session =
      activeDate && sessions?.[activeDate]
        ? sessions[activeDate]
        : Object.entries(sessions || {}).pop()?.[1];
    setSelectedUser(session);
    setSelectedEmail(email);
  }}
>
  <i className="bi bi-eye"></i>
 
</button>
<button
  className="btn btn-sm btn-outline-secondary me-2">
 <i className="bi bi-three-dots-vertical"></i>
  </button>

</td>

 
                                
                               
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                    <div className="text-muted small">
                      Showing 1 to {filteredUsers.length} of {filteredUsers.length} entries
                    </div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className="page-item disabled">
                          <a className="page-link" href="#">Previous</a>
                        </li>
                        <li className="page-item active">
                          <a className="page-link" href="#">1</a>
                        </li>
                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                        <li className="page-item"><a className="page-link" href="#">Next</a></li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Live Employee Locations</h5>
                  </div>
                  <div className="card-body p-0" style={{ height: '100%' }}>
                    <UserMap
                      positions={Object.entries(userData)
                        .map(([email, { name, sessions }]) => {
                          const lastEntry = Object.entries(sessions || {}).pop()?.[1];
                          const checkIn = lastEntry?.checkIn?.checkIn;
                          const checkOut = lastEntry?.checkOut?.checkOut;
                          const location = checkOut?.location || checkIn?.location;

                          return location
                            ? {
                                email,
                                name,
                                position: location,
                                checkInTime: checkIn?.time || null,
                                checkOutTime: checkOut?.time || null,
                              }
                            : null;
                        })
                        .filter(Boolean)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

     {/* Modal */}
<div className="modal fade" id="checkDetailsModal" tabIndex="-1" aria-hidden="true">
  <div className="modal-dialog modal-dialog-scrollable">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">
          {selectedEmail} — Shift Details ({activeDate || 'Not Selected'})
        </h5>
        <button className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
      </div>
      <div className="modal-body">
        {selectedUser ? (
          <div className="small">
            <div className="mb-3">
              <h6 className="text-primary">Check-In</h6>
              {selectedUser.checkIn?.checkIn ? (
                <ul className="list-unstyled mb-0">
                  <li>✅ Time: {selectedUser.checkIn.checkIn.time}</li>
                  <li>
                    📍 Location: {selectedUser.checkIn.checkIn.location?.[0].toFixed(4)},
                    {selectedUser.checkIn.checkIn.location?.[1].toFixed(4)}
                  </li>
                  <li className="text-muted">⏱️ {selectedUser.checkIn.checkIn.timestamp}</li>
                </ul>
              ) : (
                <div className="text-muted">No check-in data</div>
              )}
            </div>

            <div>
              <h6 className="text-danger">Check-Out</h6>
              {selectedUser.checkOut?.checkOut ? (
                <ul className="list-unstyled mb-0">
                  <li>🔴 Time: {selectedUser.checkOut.checkOut.time}</li>
                  <li>
                    📍 Location: {selectedUser.checkOut.checkOut.location?.[0].toFixed(4)},
                    {selectedUser.checkOut.checkOut.location?.[1].toFixed(4)}
                  </li>
                  <li className="text-muted">⏱️ {selectedUser.checkOut.checkOut.timestamp}</li>
                </ul>
              ) : (
                <div className="text-muted">No check-out data</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-muted">No data found for this date.</div>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>


      </div>
    </div>
  );
}
