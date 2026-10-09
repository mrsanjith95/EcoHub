import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, User as UserIcon, Shield, Truck, Factory, PlusCircle, MapPin, List, Award, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'collector':
        return '/collector-dashboard';
      case 'hub_operator':
        return '/hub-dashboard';
      case 'admin':
        return '/admin-dashboard';
      case 'generator':
      default:
        return '/dashboard';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-sticky">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand-logo">
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Leaf size={20} />
          </div>
          <span>EcoHub</span>
        </Link>

        {/* Desktop Nav Items */}
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <ul className="nav-menu-list">
            <li>
              <Link to="/" className={`nav-item-link ${isActive('/') ? 'active' : ''}`}>
                Home
              </Link>
            </li>

            {user ? (
              <>
                <li>
                  <Link to={getDashboardPath()} className={`nav-item-link ${isActive(getDashboardPath()) ? 'active' : ''}`}>
                    Dashboard
                  </Link>
                </li>

                {user.role === 'generator' && (
                  <>
                    <li>
                      <Link to="/nearby-hubs" className={`nav-item-link ${isActive('/nearby-hubs') ? 'active' : ''}`}>
                        Nearby Hubs
                      </Link>
                    </li>
                    <li>
                      <Link to="/pickup-requests" className={`nav-item-link ${isActive('/pickup-requests') ? 'active' : ''}`}>
                        Requests
                      </Link>
                    </li>
                  </>
                )}

                <li>
                  <Link to="/impact" className={`nav-item-link ${isActive('/impact') ? 'active' : ''}`}>
                    Impact
                  </Link>
                </li>

                {user.role === 'generator' && (
                  <li>
                    <Link to="/report-waste" className="btn-apple btn-apple-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
                      <PlusCircle size={16} /> Report Waste
                    </Link>
                  </li>
                )}

                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-medium)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name}
                  </span>
                  <span className="badge-pill badge-pill-completed" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                    {user.role.replace('_', ' ')}
                  </span>
                  <button onClick={handleLogout} className="btn-apple btn-apple-ghost" style={{ padding: '0.35rem 0.6rem' }} title="Sign Out">
                    <LogOut size={16} />
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="nav-item-link">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="btn-apple btn-apple-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
