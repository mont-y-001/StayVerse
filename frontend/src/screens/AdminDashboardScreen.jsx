import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomsApi, bookingsApi, propertyRequestsApi } from '../api/client';
import Loader from '../components/Loader';
import Error from '../components/Error';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Villa', 'Apartment', 'Cottage', 'Premium', 'Penthouse'];
const TABS = ['overview', 'rooms', 'bookings', 'requests'];

const emptyRoom = {
  name: '',
  type: 'Standard',
  description: '',
  maxcount: '',
  rentperday: '',
  phonenumber: '',
  imageurls: '',
};

function StatCard({ icon, value, label, color, onClick, active }) {
  return (
    <div
      className={`stat-card interactive ${active ? 'border border-dark' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className={`stat-icon text-${color}`}><i className={`fa ${icon}`}></i></div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function AdminDashboardScreen() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.is_admin) {
      navigate('/home');
      return;
    }

    fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [roomsData, bookingsData, requestsData] = await Promise.all([
        roomsApi.list(),
        bookingsApi.listAll(),
        propertyRequestsApi.listAll(),
      ]);

      const roomMap = Object.fromEntries((roomsData || []).map(r => [r.id, r]));
      const bookingsWithRooms = (bookingsData || []).map(b => ({
        ...b,
        rooms: roomMap[b.room_id] || null,
      }));

      setRooms(roomsData || []);
      setBookings(bookingsWithRooms);
      setRequests(requestsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddRoom = useCallback(() => {
    setEditingRoom(null);
    setRoomForm(emptyRoom);
    setShowRoomModal(true);
  }, []);

  const openEditRoom = useCallback((room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      type: room.type,
      description: room.description,
      maxcount: room.maxcount,
      rentperday: room.rentperday,
      phonenumber: room.phonenumber,
      imageurls: (room.imageurls || []).join('\n'),
    });
    setShowRoomModal(true);
  }, []);

  const saveRoom = async () => {
    setSaving(true);
    try {
      const imageurls = roomForm.imageurls
        .split('\n')
        .map(u => u.trim())
        .filter(Boolean);

      const payload = {
        name: roomForm.name.trim(),
        type: roomForm.type,
        description: roomForm.description.trim(),
        maxcount: parseInt(roomForm.maxcount, 10),
        rentperday: parseFloat(roomForm.rentperday),
        phonenumber: roomForm.phonenumber.trim(),
        imageurls,
      };

      if (editingRoom) {
        await roomsApi.update(editingRoom.id, payload);
        setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...r, ...payload } : r));
      } else {
        const data = await roomsApi.create(payload);
        setRooms(prev => [data, ...prev]);
      }

      setShowRoomModal(false);
    } catch (err) {
      alert('Failed to save room: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room? This cannot be undone.')) return;
    try {
      await roomsApi.remove(roomId);
      setRooms(prev => prev.filter(r => r.id !== roomId));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const approveRequest = async (req) => {
    try {
      await propertyRequestsApi.approve(req.id);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
      fetchData();
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    }
  };

  const rejectRequest = async (reqId) => {
    try {
      await propertyRequestsApi.reject(reqId);
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    }
  };

  if (authLoading || loading) return <Loader />;

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'booked');
  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (parseFloat(b.totalamount) || 0), 0);
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="page-screen">
      <section className="page-hero">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="display-5 fw-bold mb-1">
                <i className="fa fa-dashboard me-2"></i>
                Admin <span className="accent">Dashboard</span>
              </h1>
              <p className="lead mb-0">Manage rooms, bookings, and property submissions</p>
            </div>
            <button className="btn btn-warning" onClick={openAddRoom}>
              <i className="fa fa-plus me-2"></i> Add Room
            </button>
          </div>
        </div>
      </section>

      <section className="page-content">
        <div className="container">
          {error && <Error message={error} />}

          <div className="row g-4 mb-4">
            <div className="col-6 col-md-3">
              <StatCard
                icon="fa-building"
                value={rooms.length}
                label="Total Rooms"
                color="primary"
                onClick={() => setActiveTab('rooms')}
                active={activeTab === 'rooms'}
              />
            </div>
            <div className="col-6 col-md-3">
              <StatCard
                icon="fa-calendar-check-o"
                value={confirmedBookings.length}
                label="Active Bookings"
                color="success"
                onClick={() => setActiveTab('bookings')}
                active={activeTab === 'bookings'}
              />
            </div>
            <div className="col-6 col-md-3">
              <StatCard
                icon="fa-inr"
                value={`₹${totalRevenue.toLocaleString()}`}
                label="Total Revenue"
                color="warning"
                onClick={() => setActiveTab('bookings')}
              />
            </div>
            <div className="col-6 col-md-3">
              <StatCard
                icon="fa-clock-o"
                value={pendingRequests.length}
                label="Pending Requests"
                color="danger"
                onClick={() => setActiveTab('requests')}
                active={activeTab === 'requests'}
              />
            </div>
          </div>

          <ul className="nav tab-pills mb-4 justify-content-center">
            {TABS.map(tab => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            ))}
          </ul>

          {activeTab === 'overview' && (
            <div className="row g-4 fade-in-up">
              <div className="col-lg-6">
                <div className="glass-card-static">
                  <h5 className="mb-3"><i className="fa fa-line-chart me-2"></i> Quick Stats</h5>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span>Cancelled Bookings</span>
                    <strong>{bookings.filter(b => b.status === 'cancelled').length}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span>Approved Listings</span>
                    <strong>{requests.filter(r => r.status === 'approved').length}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2">
                    <span>Avg. Room Price</span>
                    <strong>
                      ₹{rooms.length ? Math.round(rooms.reduce((s, r) => s + parseFloat(r.rentperday), 0) / rooms.length) : 0}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="glass-card-static">
                  <h5 className="mb-3"><i className="fa fa-bolt me-2"></i> Quick Actions</h5>
                  <div className="d-grid gap-2">
                    <button className="btn btn-dark" onClick={openAddRoom}>
                      <i className="fa fa-plus me-2"></i> Add New Room
                    </button>
                    <button className="btn btn-outline-dark" onClick={() => setActiveTab('requests')}>
                      <i className="fa fa-inbox me-2"></i> Review Pending Requests ({pendingRequests.length})
                    </button>
                    <button className="btn btn-outline-dark" onClick={() => navigate('/home')}>
                      <i className="fa fa-eye me-2"></i> View Public Site
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="glass-card-static fade-in-up">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0"><i className="fa fa-building me-2"></i> Rooms ({rooms.length})</h5>
                <button className="btn btn-dark btn-sm" onClick={openAddRoom}>
                  <i className="fa fa-plus me-1"></i> Add
                </button>
              </div>
              {rooms.length === 0 ? (
                <div className="empty-state">
                  <i className="fa fa-building-o"></i>
                  <p className="text-muted">No rooms yet. Add your first room.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table dashboard-table mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Guests</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(room => (
                        <tr key={room.id}>
                          <td className="fw-semibold">{room.name}</td>
                          <td><span className="badge bg-secondary">{room.type}</span></td>
                          <td>₹{room.rentperday}</td>
                          <td>{room.maxcount}</td>
                          <td>
                            <button className="btn btn-outline-dark btn-sm me-1" onClick={() => openEditRoom(room)}>
                              <i className="fa fa-pencil"></i>
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => deleteRoom(room.id)}>
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="glass-card-static fade-in-up">
              <h5 className="mb-3"><i className="fa fa-calendar me-2"></i> All Bookings ({bookings.length})</h5>
              {bookings.length === 0 ? (
                <div className="empty-state">
                  <i className="fa fa-calendar-o"></i>
                  <p className="text-muted">No bookings yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table dashboard-table mb-0">
                    <thead>
                      <tr>
                        <th>Room</th>
                        <th>Dates</th>
                        <th>Days</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td>{b.rooms?.name || '—'}</td>
                          <td className="small">{b.fromdate} → {b.todate}</td>
                          <td>{b.totaldays}</td>
                          <td className="fw-semibold text-success">₹{b.totalamount}</td>
                          <td>
                            <span className={`badge-status ${
                              b.status === 'cancelled' ? 'bg-danger text-white' :
                              b.status === 'confirmed' ? 'bg-success text-white' :
                              'bg-warning text-dark'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="glass-card-static fade-in-up">
              <h5 className="mb-3"><i className="fa fa-inbox me-2"></i> Property Requests ({requests.length})</h5>
              {requests.length === 0 ? (
                <div className="empty-state">
                  <i className="fa fa-inbox"></i>
                  <p className="text-muted">No property submissions yet.</p>
                </div>
              ) : (
                <div className="row g-3">
                  {requests.map(req => (
                    <div className="col-md-6" key={req.id}>
                      <div className="glass-card h-100">
                        <div className="d-flex justify-content-between mb-2">
                          <h6 className="mb-0">{req.name}</h6>
                          <span className={`badge-status ${
                            req.status === 'approved' ? 'bg-success text-white' :
                            req.status === 'rejected' ? 'bg-danger text-white' :
                            'bg-warning text-dark'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-muted small">{req.type} · ₹{req.rentperday}/day · {req.maxcount} guests</p>
                        <p className="small text-truncate">{req.description}</p>
                        {req.status === 'pending' && (
                          <div className="d-flex gap-2 mt-2">
                            <button className="btn btn-success btn-sm" onClick={() => approveRequest(req)}>
                              <i className="fa fa-check me-1"></i> Approve
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => rejectRequest(req.id)}>
                              <i className="fa fa-times me-1"></i> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }} tabIndex="-1" onClick={() => !saving && setShowRoomModal(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content shadow-lg" style={{ borderRadius: 20, border: 'none' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className={`fa ${editingRoom ? 'fa-pencil' : 'fa-plus-circle'} me-2 text-dark`}></i>
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowRoomModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Room Name</label>
                    <input className="form-control" placeholder="e.g. Ocean View Suite" value={roomForm.name} onChange={e => setRoomForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Type</label>
                    <select className="form-select" value={roomForm.type} onChange={e => setRoomForm(f => ({ ...f, type: e.target.value }))}>
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Max Guests</label>
                    <input type="number" min="1" className="form-control" placeholder="4" value={roomForm.maxcount} onChange={e => setRoomForm(f => ({ ...f, maxcount: e.target.value }))} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Rent/Day (₹)</label>
                    <input type="number" min="1" className="form-control" placeholder="2500" value={roomForm.rentperday} onChange={e => setRoomForm(f => ({ ...f, rentperday: e.target.value }))} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Phone</label>
                    <input className="form-control" placeholder="+91 9876543210" value={roomForm.phonenumber} onChange={e => setRoomForm(f => ({ ...f, phonenumber: e.target.value }))} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Description</label>
                    <textarea className="form-control" rows={3} placeholder="Describe the room, amenities, and nearby attractions..." value={roomForm.description} onChange={e => setRoomForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Image URLs (one per line)</label>
                    <textarea className="form-control" rows={3} placeholder="https://example.com/photo1.jpg" value={roomForm.imageurls} onChange={e => setRoomForm(f => ({ ...f, imageurls: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary px-4" onClick={() => setShowRoomModal(false)} disabled={saving}>Cancel</button>
                <button className="btn btn-dark px-4" onClick={saveRoom} disabled={saving || !roomForm.name.trim()}>
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm me-1"></span> Saving...</>
                  ) : (
                    <><i className={`fa ${editingRoom ? 'fa-floppy-o' : 'fa-plus'} me-1`}></i> {editingRoom ? 'Update Room' : 'Create Room'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}