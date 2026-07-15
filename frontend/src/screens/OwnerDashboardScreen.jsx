import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsApi, roomsApi } from '../api/client';
import Loader from '../components/Loader';
import Error from '../components/Error';

export default function OwnerDashboardScreen() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return navigate('/owner-login');
    if (user.role !== 'owner' && user.role !== 'admin' && !user.is_admin) return navigate('/dashboard');
    Promise.all([roomsApi.listMine(), bookingsApi.listForOwner()]).then(([rooms, stays]) => {
      setProperties(rooms); setBookings(stays);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [authLoading, user, navigate]);

  if (authLoading || loading) return <Loader />;
  if (error) return <Error message={error} />;
  const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled');
  const earnings = activeBookings.reduce((total, booking) => total + Number(booking.totalamount || 0), 0);

  return (
    <div className="page-screen bg-light" style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container pb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <p className="text-uppercase small fw-bold text-primary mb-1">Owner Workspace</p>
            <h2 className="display-6 fw-bold mb-0">Dashboard Overview</h2>
          </div>
          <Link className="btn btn-primary" to="/list-property">
            <i className="fa fa-plus me-2"></i> Add Property
          </Link>
        </div>

        <div className="row g-4 mb-4">
          <Metric icon="fa-building" value={properties.length} label="Live Properties" color="primary" />
          <Metric icon="fa-calendar-check-o" value={activeBookings.length} label="Active Bookings" color="success" />
          <Metric icon="fa-inr" value={`₹${earnings.toLocaleString()}`} label="Booking Revenue" color="warning" />
        </div>

        <div className="row g-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center rounded-top-4">
                <h5 className="mb-0 fw-bold"><i className="fa fa-list-alt me-2 text-primary"></i> Recent Reservations</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 dashboard-table">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3 border-0 rounded-start">Property</th>
                        <th className="px-4 py-3 border-0">Dates</th>
                        <th className="px-4 py-3 border-0">Amount</th>
                        <th className="px-4 py-3 border-0">Status</th>
                        <th className="px-4 py-3 border-0 rounded-end">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length > 0 ? (
                        bookings.slice(0, 6).map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-4 py-3"><strong>{booking.rooms?.name || 'Property'}</strong></td>
                            <td className="px-4 py-3 text-muted">{booking.fromdate} <i className="fa fa-long-arrow-right mx-1"></i> {booking.todate}</td>
                            <td className="px-4 py-3 fw-bold">₹{booking.totalamount}</td>
                            <td className="px-4 py-3">
                              <span className={`badge bg-${booking.status === 'booked' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'primary'}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted small">{booking.transactionId || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" className="text-center text-muted py-4">No recent reservations found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center rounded-top-4">
                <h5 className="mb-0 fw-bold"><i className="fa fa-building-o me-2 text-primary"></i> Property Performance</h5>
                <Link to="/list-property" className="btn btn-sm btn-outline-primary">Manage All</Link>
              </div>
              <div className="card-body px-4 pb-4">
                <div className="row g-4">
                  {properties.length > 0 ? (
                    properties.slice(0, 4).map((property) => (
                      <div className="col-md-6 col-lg-3" key={property.id}>
                        <div className="border rounded-3 p-3 h-100 position-relative bg-light border-0">
                          <span className="position-absolute top-0 end-0 mt-3 me-3 badge bg-success">Live</span>
                          <h6 className="mb-1 text-truncate pe-4 fw-bold">{property.name}</h6>
                          <div className="small text-muted mb-3">{property.type} · ₹{property.rentperday}/night</div>
                          <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-3">
                            <span className="text-muted small"><i className="fa fa-users me-1"></i> Max {property.maxcount}</span>
                            <button className="btn btn-sm btn-white border shadow-sm"><i className="fa fa-pencil text-muted"></i></button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center text-muted py-5">
                      <div className="mb-3"><i className="fa fa-building-o fa-3x text-light"></i></div>
                      <p>You haven't listed any properties yet.</p>
                      <Link className="btn btn-primary" to="/list-property">Publish Your First Property</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, value, label, color }) { 
  return (
    <div className="col-md-4">
      <div className="card border-0 shadow-sm rounded-4 h-100">
        <div className="card-body p-4 d-flex align-items-center">
          <div className={`rounded-circle bg-opacity-10 bg-${color} text-${color} d-flex align-items-center justify-content-center me-3 shadow-sm`} style={{ width: '64px', height: '64px', fontSize: '28px', backgroundColor: 'var(--bs-light)' }}>
            <i className={`fa ${icon}`}></i>
          </div>
          <div>
            <h3 className="mb-1 fw-bold">{value}</h3>
            <span className="text-muted small text-uppercase fw-bold letter-spacing-1">{label}</span>
          </div>
        </div>
      </div>
    </div>
  ); 
}
