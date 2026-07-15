import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Loader from '../components/Loader';
import Error from '../components/Error';
import { Modal, Input, Row, Col, message } from 'antd';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { bookingsApi, roomsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const BookingScreen = React.memo(function BookingScreen() {
  const { roomid, fromdate, todate } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  // Payment States
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    // Validate dates
    if (!fromdate || !todate) {
      setError("Invalid booking dates. Please go back and select dates.");
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      try {
        setLoading(true);

        const data = await roomsApi.get(roomid);
        setRoom(data);

        const start = moment(fromdate, 'DD-MM-YYYY');
        const end = moment(todate, 'DD-MM-YYYY');

        if (!start.isValid() || !end.isValid()) {
          throw new Error("Invalid date format");
        }

        const days = end.diff(start, 'days') + 1;

        if (days <= 0) {
          throw new Error("To date must be after from date");
        }

        setTotalDays(days);
        setTotalAmount(days * data.rentperday);

      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRoom();
  }, [roomid, fromdate, todate, navigate, user, authLoading]);

  const showPaymentModal = useCallback(() => {
    setIsPaymentModalVisible(true);
  }, []);

  const handlePaymentCancel = useCallback(() => {
    setIsPaymentModalVisible(false);
  }, []);

  const bookRoom = useCallback(async () => {
    if (!user || !user.id) {
      setError("User not authenticated. Please login again.");
      return;
    }

    const bookingDetails = {
      room_id: roomid,
      fromdate,
      todate,
      totalamount: totalAmount,
      totaldays: totalDays,
      status: 'booked'
    };

    try {
      setBookingLoading(true);
      setIsPaymentModalVisible(false);
      setError(null);

      await bookingsApi.create(bookingDetails);

      setBookingSuccess(true);

      message.success('🎉 Booking Confirmed!', 2);

      Modal.confirm({
        title: '✅ Booking Confirmed!',
        content: (
          <div>
            <p>Your room at <strong>{room?.name}</strong> has been booked successfully.</p>
            <p>Dates: <strong>{fromdate}</strong> to <strong>{todate}</strong></p>
            <p>Total Paid: <strong>₹{totalAmount}</strong></p>
            <p>A confirmation has been sent to your registered email.</p>
          </div>
        ),
        onOk() {
          navigate('/home');
        },
        onCancel() {
          navigate('/home');
        },
        okText: 'Back to Home',
        cancelText: 'Stay Here',
        centered: true,
        okButtonProps: { className: "btn-dark" },
      });

    } catch (err) {
      console.error(err);
      setError(`Booking failed: ${err.message}`);
    } finally {
      setBookingLoading(false);
    }
  }, [roomid, fromdate, todate, totalAmount, totalDays, user, room?.name, navigate]);

  const isPaymentReady = cardName.trim() && cardNumber.trim() && expiry.trim() && cvv.trim();

  return (
    <div className="container py-5">
      {loading ? (
        <Loader />
      ) : error ? (
        <Error message={error} />
      ) : room && (
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="bs p-5">
              <div className="row">
                <div className="col-md-7 border-end pe-md-5">
                  <h2 className="mb-4">{room.name}</h2>
                  <LazyLoadImage
                    className="img-fluid rounded shadow-lg mb-4"
                    alt={room.name}
                    src={room.imageurls?.[0] || "https://via.placeholder.com/600"}
                    effect="blur"
                    width="100%"
                    height={400}
                    style={{ objectFit: "cover" }}
                  />
                  <p className="text-muted lead">{room.description}</p>
                </div>

                <div className="col-md-5 ps-md-5 d-flex flex-column">
                  <div className="mb-5">
                    <h4 className="text-dark border-bottom pb-3 mb-4">Booking Details</h4>
                    <div className="details-list">
                      <p className="d-flex justify-content-between"><strong>Guest:</strong> <span>{user?.name || 'Guest'}</span></p>
                      <p className="d-flex justify-content-between"><strong>From Date:</strong> <span>{fromdate}</span></p>
                      <p className="d-flex justify-content-between"><strong>To Date:</strong> <span>{todate}</span></p>
                      <p className="d-flex justify-content-between"><strong>Capacity:</strong> <span>{room.maxcount} Persons</span></p>
                    </div>
                  </div>

                  <div className="mb-5 bg-light p-4 rounded-3">
                    <h4 className="text-dark border-bottom pb-3 mb-4">Payment Summary</h4>
                    <p className="d-flex justify-content-between"><span>Total Stay:</span> <span>{totalDays} Day{totalDays > 1 ? 's' : ''}</span></p>
                    <p className="d-flex justify-content-between"><span>Rent per Night:</span> <span>₹{room.rentperday}</span></p>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h5 mb-0">Total Amount:</span>
                      <span className="h3 mb-0 text-success fw-bold">₹{totalAmount}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {bookingSuccess ? (
                      <div className="alert alert-success text-center mb-0 py-3">
                        <i className="fa fa-check-circle me-2"></i>
                        <strong>Booking Confirmed!</strong>
                        <button className="btn btn-dark mt-2 d-block w-100" onClick={() => navigate('/home')}>
                          Back to Home
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-dark btn-lg w-100 py-3 fw-bold shadow-sm" 
                        onClick={showPaymentModal}
                        disabled={bookingLoading}
                      >
                        {bookingLoading ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span> Processing...</>
                        ) : (
                          `Pay ₹${totalAmount} & Confirm Booking`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        title={<h4 className="m-0"><i className="fa fa-credit-card me-2"></i> Secure Payment</h4>}
        open={isPaymentModalVisible && !bookingLoading && !bookingSuccess}
        onOk={bookRoom}
        onCancel={handlePaymentCancel}
        okText={`Pay ₹${totalAmount}`}
        cancelText="Cancel"
        okButtonProps={{ 
          className: "btn-dark", 
          disabled: !isPaymentReady || bookingLoading,
          size: "large"
        }}
        cancelButtonProps={{ size: "large" }}
        width={500}
        centered
        destroyOnClose
      >
        <div className="py-3">
          <div className="mb-4 p-3 bg-light rounded-3 text-center">
            <p className="text-muted mb-1">Paying to STAYVERSE</p>
            <h3 className="fw-bold">₹{totalAmount}</h3>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">CARDHOLDER NAME</label>
            <Input 
              placeholder="e.g. John Doe" 
              size="large" 
              value={cardName} 
              onChange={(e) => setCardName(e.target.value)} 
              autoComplete="cc-name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">CARD NUMBER</label>
            <Input 
              placeholder="0000 0000 0000 0000" 
              size="large" 
              value={cardNumber} 
              onChange={(e) => setCardNumber(e.target.value)} 
              maxLength={19}
              autoComplete="cc-number"
            />
          </div>

          <Row gutter={16}>
            <Col span={14}>
              <div className="mb-3">
                <label className="form-label small fw-bold">EXPIRY DATE</label>
                <Input 
                  placeholder="MM / YY" 
                  size="large" 
                  value={expiry} 
                  onChange={(e) => setExpiry(e.target.value)} 
                  maxLength={5}
                  autoComplete="cc-exp"
                />
              </div>
            </Col>
            <Col span={10}>
              <div className="mb-3">
                <label className="form-label small fw-bold">CVV</label>
                <Input 
                  type="password" 
                  placeholder="***" 
                  size="large" 
                  value={cvv} 
                  onChange={(e) => setCvv(e.target.value)} 
                  maxLength={4}
                  autoComplete="cc-csc"
                />
              </div>
            </Col>
          </Row>

          <div className="mt-2 text-center">
            <img src="https://help.zazzle.com/hc/article_attachments/360010513393/Logos-01.png" alt="cards" style={{ height: "30px", opacity: 0.7 }} />
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default BookingScreen;