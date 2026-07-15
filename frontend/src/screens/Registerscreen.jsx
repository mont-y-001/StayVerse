import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Error from '../components/Error';
import Success from '../components/Success';
import { authApi } from '../api/client';

function Registerscreen() {
  const [name, setname] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [cpassword, setcpassword] = useState('');
  const [role, setRole] = useState('user');

  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [success, setsuccess] = useState(null);
  const navigate = useNavigate();

  async function register() {
    seterror(null);
    setsuccess(null);

    if (password !== cpassword) {
      return seterror("Passwords do not match");
    }

    try {
      setloading(true);

      await authApi.register({
        name,
        email,
        password,
        role,
      });

      setsuccess("Registration successful! Redirecting to login...");

      setname('');
      setemail('');
      setpassword('');
      setcpassword('');

      setTimeout(() => navigate('/login'), 2000);

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
          <h1 className="display-5 fw-bold mb-2">Join <span className="accent">StayVerse</span></h1>
          <p className="lead">Create an account to book rooms and list your property</p>
        </div>
      </section>
      <section className="page-content">
        <div className="container">
          {error && <Error message={error} />}
          {success && <Success message={success} />}
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="glass-card-static">
                <h3 className="text-center mb-4">Register</h3>
                <div className="mb-3">
                  <input type="text" className="form-control" placeholder="Name"
                    value={name} onChange={(e) => setname(e.target.value)} />
                </div>
                <div className="mb-3">
                  <input type="email" className="form-control" placeholder="Email"
                    value={email} onChange={(e) => setemail(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">I want to</label>
                  <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="user">Book stays as a guest</option>
                    <option value="owner">List and manage properties as an owner</option>
                  </select>
                </div>
                <div className="mb-3">
                  <input type="password" className="form-control" placeholder="Password"
                    value={password} onChange={(e) => setpassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <input type="password" className="form-control" placeholder="Confirm Password"
                    value={cpassword} onChange={(e) => setcpassword(e.target.value)} />
                </div>
                <button className="btn btn-dark w-100" onClick={register}>
                  <i className="fa fa-user-plus me-2"></i> Register
                </button>
                <div className="text-center mt-3">
                  <span className="text-muted small">Already have an account? </span>
                  <Link to="/login" className="small fw-bold text-decoration-none">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Registerscreen;
