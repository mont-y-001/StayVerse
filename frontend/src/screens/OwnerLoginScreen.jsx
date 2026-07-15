import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import Error from '../components/Error'
import { authApi } from '../api/client'

export default function OwnerLoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { setAuthUser } = useAuth()

  async function loginAsOwner() {
    setError(null)

    try {
      setLoading(true)

      const session = await authApi.login({
        email,
        password,
      })

      setAuthUser(session)
      navigate('/list-property')
    } catch (err) {
      setError(err.message || 'Owner login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-screen">
      {loading && <Loader />}
      <section className="page-hero text-center">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">Owner <span className="accent">Portal</span></h1>
          <p className="lead">Manage your properties and track bookings</p>
        </div>
      </section>
      <section className="page-content">
        <div className="container">
          {error && <Error message={error} />}
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="glass-card-static text-center">
                <h3 className="mb-3">Owner Login</h3>
                <p className="text-muted mb-4">Use your StayVerse account to access the owner dashboard</p>
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Owner Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="btn btn-dark w-100 py-2 mb-3" onClick={loginAsOwner} disabled={loading}>
                  <i className="fa fa-sign-in me-2"></i> Login as Owner
                </button>
                <div className="d-flex justify-content-between small">
                  <Link to="/register" className="text-decoration-none">Register as Owner</Link>
                  <Link to="/list-property" className="text-decoration-none">List Your Property</Link>
                </div>
                <div className="text-center mt-3 pt-3 border-top">
                  <Link to="/login" className="small text-muted text-decoration-none">
                    <i className="fa fa-user me-1"></i> Not an owner? Login as Guest
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
