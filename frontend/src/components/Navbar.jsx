import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = React.memo(function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const logOut = React.useCallback(async () => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to={user?.role === 'owner' ? '/owner/dashboard' : '/home'}>
          <i className="fa fa-hotel me-2"></i>
          STAYVERSE
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            {user?.role !== 'owner' && (
              <li className="nav-item">
                <Link className="nav-link" to="/home">Find Rooms</Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto align-items-center">
            {user ? (
              <>
                {(user.role === 'admin' || user.is_admin) ? (
                  <li className="nav-item me-lg-3">
                    <Link className="btn btn-outline-warning btn-sm" to="/admin">
                      <i className="fa fa-dashboard me-2"></i> Admin Panel
                    </Link>
                  </li>
                ) : user.role === 'owner' ? (
                  <>
                    <li className="nav-item me-lg-3">
                      <Link className="nav-link fw-semibold" to="/owner/dashboard">
                        <i className="fa fa-dashboard me-1"></i> Dashboard
                      </Link>
                    </li>
                    <li className="nav-item me-lg-3">
                      <Link className="nav-link" to="/list-property">My Properties</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item me-lg-3">
                      <Link className="nav-link fw-semibold" to="/user/dashboard">
                        <i className="fa fa-dashboard me-1"></i> Dashboard
                      </Link>
                    </li>
                    <li className="nav-item me-lg-3">
                      <Link className="nav-link d-flex align-items-center" to="/bookings">
                        <i className="fa fa-calendar-check me-2"></i> My Bookings
                      </Link>
                    </li>
                  </>
                )}
                <li className="nav-item dropdown">
                  <button 
                    className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                    type='button' 
                    id='userDropdown' 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="fa fa-user-circle me-2"></i>
                    {user.name}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby='userDropdown'>
                    {user.role === 'owner' ? (
                      <li>
                        <Link to="/owner/dashboard" className="dropdown-item d-flex align-items-center">
                          <i className="fa fa-dashboard me-2"></i> Dashboard
                        </Link>
                      </li>
                    ) : (
                      <li>
                        <Link to="/user/dashboard" className="dropdown-item d-flex align-items-center">
                          <i className="fa fa-dashboard me-2"></i> Dashboard
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center" onClick={logOut}>
                        <i className="fa fa-sign-out me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item me-lg-2">
                  <Link className="nav-link" to="/owner-login">Login as Owner</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link btn btn-light text-dark ms-lg-3 px-4" to="/login">Login</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
