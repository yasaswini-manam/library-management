import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../services/api';
import { BookOpen, Users, BookmarkPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ books: 0, available: 0, members: 0, activeIssues: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [books, availableBooks] = await Promise.all([
          fetchWithAuth('/api/books'),
          fetchWithAuth('/api/books/available')
        ]);
        
        let membersData = [];
        let activeIssuesData = [];
        
        if (user.isLibrarian) {
          [membersData, activeIssuesData] = await Promise.all([
            fetchWithAuth('/api/members'),
            fetchWithAuth('/api/issues/active')
          ]);
        }
        
        setStats({
          books: books.length,
          available: availableBooks.length,
          members: membersData.length || 0,
          activeIssues: activeIssuesData.length || 0
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="mb-6">Welcome back, {user.username}!</h1>
      
      <div className="flex gap-6 mb-6" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: '1 1 200px' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg text-blue-400">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-muted text-sm font-medium">Total Books</p>
              <h2 className="text-2xl m-0">{stats.books}</h2>
            </div>
          </div>
          <p className="text-sm text-muted">{stats.available} available to issue</p>
        </div>

        {user.isLibrarian && (
          <>
            <div className="glass-card" style={{ flex: '1 1 200px' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500 bg-opacity-20 rounded-lg text-emerald-400">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-muted text-sm font-medium">Members</p>
                  <h2 className="text-2xl m-0">{stats.members}</h2>
                </div>
              </div>
              <Link to="/members" className="text-sm text-primary" style={{ textDecoration: 'none' }}>View directory →</Link>
            </div>

            <div className="glass-card" style={{ flex: '1 1 200px' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-500 bg-opacity-20 rounded-lg text-amber-400">
                  <BookmarkPlus size={24} />
                </div>
                <div>
                  <p className="text-muted text-sm font-medium">Active Issues</p>
                  <h2 className="text-2xl m-0">{stats.activeIssues}</h2>
                </div>
              </div>
              <Link to="/issues" className="text-sm text-primary" style={{ textDecoration: 'none' }}>Manage returns →</Link>
            </div>
          </>
        )}
      </div>

      <div className="glass-panel mt-6">
        <h3 className="mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Link to="/books" style={{ textDecoration: 'none' }}>
            <button className="secondary">Browse Books</button>
          </Link>
          {user.isLibrarian && (
            <>
              <Link to="/issues" style={{ textDecoration: 'none' }}>
                <button>Issue a Book</button>
              </Link>
              <Link to="/members" style={{ textDecoration: 'none' }}>
                <button className="secondary">Register Member</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
