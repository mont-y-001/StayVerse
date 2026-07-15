import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsApi } from '../api/client';
import Loader from '../components/Loader';
import Error from '../components/Error';

export default function UserDashboardScreen() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return navigate('/login');
    if (user.role === 'owner') return navigate('/owner/dashboard');
    bookingsApi.listMine().then(setBookings).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [authLoading, user, navigate]);

  if (authLoading || loading) return <Loader />;
  if (error) return <Error message={error} />;

  const active = bookings.filter((booking) => ['booked', 'confirmed'].includes(booking.status));
  const past = bookings.filter((booking) => !['booked', 'confirmed', 'cancelled'].includes(booking.status));
  const spent = bookings.filter((booking) => booking.status !== 'cancelled')
    .reduce((total, booking) => total + Number(booking.totalamount || 0), 0);
  const upcoming = active.slice(0, 3);
  const recentPast = past.slice(0, 3);

  return (
    <div className="page-screen bg-light" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <section className="bg-white border-bottom pt-5 pb-4 mb-5">
        <div className="container d-flex justify-content-between align-items-end flex-wrap gap-3">
          <div>
            <h1 className="display-5 fw-bold mb-2">Welcome back, <span className="text-primary">{user.name}</span>!</h1>
            <p className="text-muted fs-5 mb-0">Ready for your next adventure?</p>
          </div>
          <Link className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm" to="/home">
            <i className="fa fa-search me-2"></i> Explore Places
          </Link>
        </div>
      </section>

      <section className="container">
        <div className="row g-4 mb-5">
          <div className="col-12">
            <h3 className="fw-bold mb-4">Upcoming Trips</h3>
            {upcoming.length ? (
              <div className="row g-4">
                {upcoming.map((booking) => (
                  <div className="col-md-6 col-lg-4" key={booking.id}>
                    <div className="card h-100 border-0 shadow-sm overflow-hidden rounded-4">
                      <div style={{ height: '200px', backgroundColor: '#e9ecef', backgroundImage: `url(${booking.rooms?.imageurls?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      <div className="card-body p-4">
                        <span className="badge bg-success-subtle text-success mb-3 px-2 py-1 border border-success-subtle rounded-pill">Confirmed</span>
                        <h5 className="card-title fw-bold text-truncate">{booking.rooms?.name || 'Beautiful Stay'}</h5>
                        <p className="card-text text-muted mb-4"><i className="fa fa-calendar-o me-2"></i> {booking.fromdate} to {booking.todate}</p>
                        <Link to="/bookings" className="btn btn-outline-primary w-100 rounded-pill fw-semibold">View Details</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                <div className="mb-3"><i className="fa fa-plane fa-3x text-muted opacity-25"></i></div>
                <h5 className="fw-bold">No upcoming trips</h5>
                <p className="text-muted mb-4">It's time to dust off your bags and start planning.</p>
                <div>
                  <Link className="btn btn-primary rounded-pill px-4 fw-semibold" to="/home">Find your next stay</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">Past Experiences</h3>
              <Link to="/bookings" className="text-decoration-none fw-semibold">View All History <i className="fa fa-angle-right ms-1"></i></Link>
            </div>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              {recentPast.length ? (
                <div className="d-flex flex-column gap-3">
                  {recentPast.map((booking) => (
                    <div className="d-flex align-items-center p-3 border rounded-4 bg-white" key={booking.id}>
                      <div className="rounded-3 bg-light me-3 flex-shrink-0" style={{ width: '80px', height: '80px', backgroundImage: `url(${booking.rooms?.imageurls?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      <div className="flex-grow-1 min-w-0">
                        <h6 className="fw-bold text-truncate mb-1">{booking.rooms?.name || 'Property'}</h6>
                        <div className="text-muted small mb-1">{booking.fromdate} &bull; {booking.todate}</div>
                        <div className="fw-semibold">₹{booking.totalamount}</div>
                      </div>
                      <Link to={`/book/${booking.roomid || booking.rooms?._id}`} className="btn btn-sm btn-outline-secondary rounded-pill px-3 ms-2 flex-shrink-0 d-none d-sm-block">Book Again</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 my-auto">
                  <i className="fa fa-history fa-2x text-muted opacity-25 mb-3"></i>
                  <p className="text-muted mb-0">Your past stays will appear here.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="col-lg-4">
            <h3 className="fw-bold mb-4">Your Travel Stats</h3>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center mb-4 p-3 bg-primary bg-opacity-10 rounded-4">
                <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '56px', height: '56px', fontSize: '24px' }}>
                  <i className="fa fa-suitcase"></i>
                </div>
                <div>
                  <h3 className="fw-bold mb-0 text-primary">{bookings.length}</h3>
                  <span className="text-muted small text-uppercase fw-bold letter-spacing-1">Total Bookings</span>
                </div>
              </div>
              <div className="d-flex align-items-center p-3 bg-success bg-opacity-10 rounded-4">
                <div className="rounded-circle bg-white text-success d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '56px', height: '56px', fontSize: '24px' }}>
                  <i className="fa fa-inr"></i>
                </div>
                <div>
                  <h3 className="fw-bold mb-0 text-success">₹{spent.toLocaleString()}</h3>
                  <span className="text-muted small text-uppercase fw-bold letter-spacing-1">Total Spent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
