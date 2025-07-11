import { useDispatch } from 'react-redux';
import { getDistance } from '../utils/geofense';
import { targetLocation } from '../utils/target';
import { toast } from 'react-toastify';
import { logActivity } from '../utils/timesheetSlice';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function HeaderBar({
  position,
  address,
  isCheckedIn,
  setIsCheckedIn,
  setCheckInTime,
  setAddress,
  setDistanceFromTarget,
  setShowDialog,
  setShowLogoutWarning,
}) {
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const adminEmail = user?.admin || user?.email;

  const handleCheckInOut = () => {
    if (!position) return toast.error("Unable to get your location!");

    const distance = getDistance(position, [targetLocation.lat, targetLocation.lng]);

    if (!isCheckedIn) {
      if (distance <= 800) {
        const now = new Date();
        const checkInTime = now.toLocaleTimeString();

        setIsCheckedIn(true);
        setCheckInTime(checkInTime);
        toast.success("Checked In Successfully");

        dispatch(
          logActivity({
            adminEmail,
            userEmail: user.email,
            name: user.name,
            event: {
              type: 'check-in',
              time: checkInTime,
              timestamp: now.toISOString(),
              location: position,
              address,
            },
          })
        );
      } else {
        toast.warning("You are not within 700 meters of the office.");
      }
    } else {
      const now = new Date();
      const checkOutTime = now.toLocaleTimeString();

      setIsCheckedIn(false);
      setCheckInTime('');
      setAddress('');
      setDistanceFromTarget(null);
      setShowDialog(false);
      toast.info("Checked Out Successfully");

      dispatch(
        logActivity({
          adminEmail,
          userEmail: user.email,
          name: user.name,
          event: {
            type: 'check-out',
            time: checkOutTime,
            timestamp: now.toISOString(),
            location: position,
            address,
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
