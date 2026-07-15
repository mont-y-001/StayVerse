import './App.css';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import UtilityBar from './components/UtilityBar';
import CategoryNavbar from './components/CategoryNavbar';
import Loader from './components/Loader';

// Lazy-load all screens for code splitting
const Homescreen = lazy(() => import('./screens/Homescreen'));
const BookingScreen = lazy(() => import('./screens/BookingScreen'));
const Registerscreen = lazy(() => import('./screens/Registerscreen'));
const Loginscreen = lazy(() => import('./screens/Loginscreen'));
const AboutScreen = lazy(() => import('./screens/AboutScreen'));
const OwnerLoginScreen = lazy(() => import('./screens/OwnerLoginScreen'));
const BookingsScreen = lazy(() => import('./screens/BookingsScreen'));
const ListPropertyScreen = lazy(() => import('./screens/ListPropertyScreen'));
const AdminDashboardScreen = lazy(() => import('./screens/AdminDashboardScreen'));

function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  return (
    <>
      <UtilityBar />
      <Navbar />
      {isHomePage && <CategoryNavbar />}
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Homescreen />} />
          <Route path="/book/:roomid/:fromdate/:todate" element={<BookingScreen />} />
          <Route path="/register" element={<Registerscreen />} />
          <Route path="/login" element={<Loginscreen />} />
          <Route path="/about" element={<AboutScreen />} />
          <Route path="/owner-login" element={<OwnerLoginScreen />} />
          <Route path="/bookings" element={<BookingsScreen />} />
          <Route path="/list-property" element={<ListPropertyScreen />} />
          <Route path="/admin" element={<AdminDashboardScreen />} />
          <Route path="*" element={
            <div className="page-screen">
              <div className="container py-5 text-center">
                <h2>Page Not Found</h2>
                <p className="text-muted">The page you're looking for doesn't exist.</p>
                <Link to="/home" className="btn btn-dark">Go Home</Link>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;