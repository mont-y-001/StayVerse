import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Error from '../components/Error';
import { authApi } from '../api/client';

function Loginscreen() {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  async function login() {
    seterror(null);

    try {
      setloading(true);

      const session = await authApi.login({
        email,
        password
      });

      setAuthUser(session);

      navigate('/user/dashboard');

    } catch (err) {
      seterror(err.message);
    } finally {
      setloading(false);
    }
  }

  return (
    <div className="page-screen">
      {loading && <Loader />}
      <section className="page-hero text-center">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">Welcome <span className="accent">Back</span></h1>
          <p className="lead">Sign in to manage your bookings and listings</p>
        </div>
      </section>
      <section className="page-content">
        <div className="container">
          {error && <Error message={error} />}
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="glass-card-static">
                <h3 className="text-center mb-4">Login</h3>
                <div className="mb-3">
                  <input type="email" className="form-control"
                    value={email} onChange={(e) => setemail(e.target.value)}
                    placeholder="Email" />
                </div>
                <div className="mb-3">
                  <input type="password" className="form-control"
                    value={password} onChange={(e) => setpassword(e.target.value)}
                    placeholder="Password" />
                </div>
                <button className="btn btn-dark w-100" onClick={login}>
                  <i className="fa fa-sign-in me-2"></i> Login
                </button>
                <div className="text-center mt-3">
                  <span className="text-muted small">Don't have an account? </span>
                  <Link to="/register" className="small fw-bold text-decoration-none">Register</Link>
                </div>
                <div className="text-center mt-1">
                  <Link to="/owner-login" className="small text-muted text-decoration-none">
                    <i className="fa fa-shield me-1"></i> Login as Owner
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Loginscreen;
