import { useDispatch } from 'react-redux';
import { getDistance } from '../utils/geofense';
import { targetLocation } from '../utils/target';
import { toast } from 'react-toastify';
import { logActivity } from '../utils/timesheetSlice';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function HeaderBar({
  position,
  isCheckedIn,
  setIsCheckedIn,
  setCheckInTime,
  setDistanceFromTarget,
  setShowDialog,
  setShowLogoutWarning,
}) {
  const dispatch = useDispatch();
  const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  const adminEmail = user?.admin || user?.email;

  const handleCheckInOut = () => {
    if (!position) return toast.error("Unable to get your location!");

    const distance = getDistance(position, [targetLocation.lat, targetLocation.lng]);
    setDistanceFromTarget(distance);

    const now = new Date();
    const time = now.toLocaleTimeString();
    const timestamp = now.toISOString();

    const sessionKey = now.toISOString().split('T')[0]; // YYYY-MM-DD key for session

    if (!isCheckedIn) {
      if (distance <= 3800) {
        setIsCheckedIn(true);
        setCheckInTime(time);
        toast.success("Checked In Successfully");

        dispatch(
          logActivity({
            adminEmail,
            userEmail: user.email,
            name: user.name,
            sessionKey,
            type: 'check-in',
            data: {
              checkIn: { time, timestamp, location: position },
            },
          })
        );
      } else {
        toast.warning("You are not within 700 meters of the office.");
      }
    } else {
      setIsCheckedIn(false);
      setCheckInTime('');
      setDistanceFromTarget(null);
      setShowDialog(false);
      toast.info("Checked Out Successfully");

      dispatch(
        logActivity({
          adminEmail,
          userEmail: user.email,
          name: user.name,
          sessionKey,
          type: 'check-out',
          data: {
            checkOut: { time, timestamp, location: position },
          },
        })
      );
    }
  };

  const handleLogout = () => {
    if (isCheckedIn) {
      setShowLogoutWarning(true);
    } else {
      localStorage.removeItem('loggedInUser');
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-dark text-white d-flex justify-content-between align-items-center px-4 py-3">
      <h4 className="mb-0">Welcome, {user?.name || 'User'}</h4>
      <div>
        <button className="btn btn-secondary me-2" onClick={handleCheckInOut}>
          <i className={`bi ${isCheckedIn ? 'bi-box-arrow-left' : 'bi-box-arrow-in-right'} me-1`}></i>
          {isCheckedIn ? 'Check-Out' : 'Check-In'}
        </button>
        <button className="btn btn-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i>Logout
        </button>
      </div>
    </header>
  );
}
