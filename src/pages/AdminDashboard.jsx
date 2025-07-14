import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import UserMap from '../components/UserMap';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function AdminDashboard() {
  const [userData, setUserData] = useState({});
  const admin = JSON.parse(localStorage.getItem('loggedInUser'));
  const adminEmail = admin?.email || 'user@gmail.com';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'timesheets', adminEmail);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const usersData = docSnap.data().users || {};
          console.log("🔥 Firestore users JSON data:", JSON.stringify(usersData, null, 2));
          setUserData(usersData);
        }
      } catch (err) {
        console.error("🔥 Failed to fetch admin data:", err);
      }
    };

    fetchData();
  }, [adminEmail]);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser');
    window.location.href = '/';
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      {/* Header */}
      <header className="bg-dark text-white d-flex justify-content-between align-items-center px-4 py-3">
        <h4 className="mb-0">Welcome Admin</h4>
        <button className="btn btn-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </header>

      {/* Body */}
      <div className="container-fluid py-4">
        {Object.entries(userData).map(([email, { name, sessions }]) => {
          const sessionRows = Object.entries(sessions || {}).map(([date, sessionData]) => {
            const checkIn = sessionData.checkIn?.checkIn;
            const checkOut = sessionData.checkOut?.checkOut;

            return {
              date,
              name,
              checkInTime: checkIn?.time || '—',
              checkOutTime: checkOut?.time || '—',
              location: checkIn?.location || checkOut?.location || null,
            };
          });

          const lastLocation = sessionRows.at(-1)?.location;

          return (
            <div key={email} className="row mb-5">
              <div className="col-md-7">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Check-In Time</th>
                      <th>Check-Out Time</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionRows.map((row, i) => (
                      <tr key={i}>
                        <td>{row.name}</td>
                        <td>{row.date}</td>
                        <td>{row.checkInTime}</td>
                        <td>{row.checkOutTime}</td>
                        <td>
                          {row.location?.[0] ?? '--'}, {row.location?.[1] ?? '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="col-md-5">
                <UserMap position={lastLocation} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
