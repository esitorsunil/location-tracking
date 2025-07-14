import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import UserMap from '../components/UserMap';

export default function AdminDashboard() {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const admin = JSON.parse(localStorage.getItem('loggedInUser'));
  const adminEmail = admin?.email || 'user@gmail.com';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'timesheets', adminEmail);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const usersData = docSnap.data().users || {};
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

  const filteredUsers = Object.entries(userData).filter(([email, { name }]) => 
    name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotalHours = (sessions) => {
    let totalMinutes = 0;
    Object.values(sessions || {}).forEach(session => {
      const checkIn = session.checkIn?.checkIn?.time;
      const checkOut = session.checkOut?.checkOut?.time;
      
      if (checkIn && checkOut) {
        const [inH, inM] = checkIn.split(':').map(Number);
        const [outH, outM] = checkOut.split(':').map(Number);
        totalMinutes += (outH * 60 + outM) - (inH * 60 + inM);
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
 
      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation Bar */}
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

        {/* Dashboard Content */}
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
      {/* Left: Employee Table */}
      <div className="col-lg-7">
        <div className="card shadow-sm mb-4 h-100">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Employee Location Tracking</h5>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-2">
                <i className="bi bi-download me-2"></i>Export
              </button>
              <button className="btn btn-sm btn-primary">
                <i className="bi bi-plus me-2"></i>Add Employee
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
                    const lastSession = sessions ? Object.entries(sessions).pop() : null;
                    const lastLocation =
                      lastSession?.[1].checkIn?.checkIn?.location ||
                      lastSession?.[1].checkOut?.checkOut?.location;

                    return (
                      <tr key={email}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div>
                              <div className="fw-bold">{name}</div>
                              <div className="text-muted small">ID: {email.substring(0, 20)}</div>
                            </div>
                          </div>
                        </td>
                        <td>{email}</td>
                        <td>
                          {lastSession ? (
                            <>
                              <div>{lastSession[0]}</div>
                              <div className="text-muted small">
                                {lastSession[1].checkIn?.checkIn?.time || '--'} -{' '}
                                {lastSession[1].checkOut?.checkOut?.time || '--'}
                              </div>
                            </>
                          ) : (
                            'No sessions'
                          )}
                        </td>
                        <td>{calculateTotalHours(sessions)}</td>
                        <td>
                          {lastLocation ? (
                            <span className="badge bg-light text-dark">
                              <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                              {lastLocation[0]?.toFixed(2)}, {lastLocation[1]?.toFixed(2)}
                            </span>
                          ) : (
                            '--'
                          )}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-secondary">
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

      {/* Right: Map */}
      <div className="col-lg-5">
        <div className="card shadow-sm h-100">
          <div className="card-header bg-white">
            <h5 className="mb-0">Live Employee Locations</h5>
          </div>
          <div className="card-body p-0" style={{ height: '100%' }}>
            <UserMap
              positions={Object.entries(userData).map(([email, { name, sessions }]) => {
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
              }).filter(Boolean)}
            />
          </div>
        </div>
      </div>
    </div>
  )}
</div>

      </div>
    </div>
  );
}