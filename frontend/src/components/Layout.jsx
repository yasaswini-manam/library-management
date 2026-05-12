import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, LogOut, LayoutDashboard, BookmarkPlus } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <BookOpen className="logo-icon" size={32} />
          <h2>LibraryPro</h2>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <span className="user-name">{user?.username}</span>
            <span className="user-role badge info">{user?.isLibrarian ? 'Librarian' : 'Member'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/books" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BookOpen size={20} />
            <span>Books</span>
          </NavLink>

          {user?.isLibrarian && (
            <>
              <NavLink to="/members" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Users size={20} />
                <span>Members</span>
              </NavLink>
              
              <NavLink to="/issues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <BookmarkPlus size={20} />
                <span>Issue & Return</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn secondary">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
