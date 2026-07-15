import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsApi } from '../api/client';
import Loader from '../components/Loader';
import Error from '../components/Error';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const STATUS_OPTIONS = ['all', 'booked', 'confirmed', 'cancelled'];

function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    let cancelled = false;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await bookingsApi.listMine();

        if (!cancelled) {
          setBookings(data || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBookings();

    return () => { cancelled = true; };
  }, [user?.id, navigate, authLoading]);

  const confirmCancel = useCallback(async () => {
    if (!cancelTarget || !user?.id) return;

    setCancelling(true);
    try {
      await bookingsApi.cancel(cancelTarget);

      setBookings(prev =>
        prev.map(b => b.id === cancelTarget ? { ...b, status: 'cancelled' } : b)
      );
      setCancelTarget(null);
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Failed to cancel booking: ' + err.message);
    } finally {
      setCancelling(false);
    }
  }, [cancelTarget, user?.id]);

  const isActive = (status) => status === 'confirmed' || status === 'booked';

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  const stats = {
    all: bookings.length,
    booked: bookings.filter(b => isActive(b.status)).length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="page-screen">
      <section className="page-hero text-center">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">
            <i className="fa fa-calendar-check me-2"></i>
            My <span className="accent">Bookings</span>
          </h1>
          <p className="lead">View and manage your upcoming stays</p>
        </div>
      </section>

      <section className="page-content">
        <div className="container">
          {authLoading || loading ? (
            <Loader />
          ) : error ? (
            <Error message={error} />
          ) : bookings.length === 0 ? (
            <div className="empty-state glass-card-static">
              <i className="fa fa-calendar"></i>
              <h4 className="text-muted">No bookings yet</h4>
              <p className="text-muted" style={{ maxWidth: 400, margin: '0 auto' }}>
                Start exploring our rooms and book your first stay!
              </p>
              <button className="btn btn-dark mt-3 px-4" onClick={() => navigate('/home')}>
                <i className="fa fa-search me-2"></i> Browse Rooms
              </button>
            </div>
          ) : (
            <>
              <div className="row g-2 mb-4">
                {STATUS_OPTIONS.map(s => (
                  <div className="col-6 col-md-3" key={s}>
                    <button
                      className={`stat-card w-100 py-3 ${statusFilter === s ? 'border border-dark' : ''}`}
                      onClick={() => setStatusFilter(s)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats[s]}</div>
                      <div className="stat-label text-capitalize">{s}</div>
                    </button>
                  </div>
                ))}
              </div>

              <div className="row">
                {filteredBookings.map((booking) => {
                  const active = isActive(booking.status);
                  const imgUrl = booking.rooms?.imageurls?.[0] || "https://via.placeholder.com/300x200?text=Room";

                  return (
                    <div className="col-lg-6 mb-4" key={booking.id}>
                      <div className="glass-card h-100" style={{ marginTop: 0 }}>
                        <div className="row g-0 h-100">
                          <div className="col-md-5">
                            <LazyLoadImage
                              src={imgUrl}
                              className="img-fluid rounded-start"
                              alt={booking.rooms?.name || 'Room'}
                              style={{ objectFit: 'cover', width: '100%', height: 220 }}
                              effect="blur"
                            />
                          </div>
                          <div className="col-md-7">
                            <div className="card-body d-flex flex-column h-100">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="card-title mb-0">
                                  {booking.rooms?.name || 'Room'}
                                </h5>
                                <span className={`badge ${active ? 'bg-success' : booking.status === 'cancelled' ? 'bg-danger' : 'bg-warning'}`}>
                                  {booking.status?.toUpperCase() || 'BOOKED'}
                                </span>
                              </div>

                              <div className="mt-2">
                                <p className="card-text small mb-1">
                                  <i className="fa fa-calendar me-2 text-muted"></i>
                                  <strong>{booking.fromdate}</strong> → <strong>{booking.todate}</strong>
                                </p>
                                <p className="card-text small mb-1">
                                  <i className="fa fa-clock-o me-2 text-muted"></i>
                                  {booking.totaldays} Day{booking.totaldays > 1 ? 's' : ''}
                                </p>
                                <p className="card-text small mb-1">
                                  <i className="fa fa-id-card me-2 text-muted"></i>
                                  ID: {booking.id?.substring(0, 8)}...
                                </p>
                              </div>

                              <hr className="my-2" />

                              <div className="d-flex justify-content-between align-items-center mt-auto">
                                <span className="h5 mb-0 text-success fw-bold">₹{booking.totalamount}</span>
                                <div className="d-flex gap-2">
                                  {active && (
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => setCancelTarget(booking.id)}
                                    >
                                      <i className="fa fa-times me-1"></i> Cancel
                                    </button>
                                  )}
                                  {booking.status === 'cancelled' && (
                                    <Link
                                      className="btn btn-outline-dark btn-sm"
                                      to="/home"
                                    >
                                      <i className="fa fa-search me-1"></i> Rebook
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {cancelTarget && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }} tabIndex="-1" onClick={() => !cancelling && setCancelTarget(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-content" style={{ borderRadius: 20 }}>
              <div className="modal-body text-center py-5">
                <div className="mb-3">
                  <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center" style={{ width: 72, height: 72 }}>
                    <i className="fa fa-exclamation-triangle text-danger" style={{ fontSize: '1.8rem' }}></i>
                  </div>
                </div>
                <h5 className="fw-bold mb-2">Cancel Booking?</h5>
                <p className="text-muted mb-4">
                  This action cannot be undone. Are you sure you want to cancel this booking?
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setCancelTarget(null)}
                    disabled={cancelling}
                  >
                    Keep Booking
                  </button>
                  <button
                    className="btn btn-danger px-4"
                    onClick={confirmCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <><span className="spinner-border spinner-border-sm me-1"></span> Cancelling...</>
                    ) : (
                      <><i className="fa fa-times me-1"></i> Yes, Cancel</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingsScreen;