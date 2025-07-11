export default function AddressInfoModal({ address, checkInTime, distanceFromTarget, onClose }) {
  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Address Info</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><i className="bi bi-geo-alt me-2"></i>{address}</p>
            <p><i className="bi bi-clock me-2"></i>{checkInTime}</p>
            <p><i className="bi bi-geo me-2"></i>{distanceFromTarget} meters from office</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
