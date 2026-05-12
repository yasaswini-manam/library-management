import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Issues from './pages/Issues';

const PrivateRoute = ({ children, requireLibrarian }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-container justify-center items-center">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (requireLibrarian && !user.isLibrarian) {
    return <Navigate to="/books" />; // Redirect members to books if they try to access librarian areas
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="members" element={
          <PrivateRoute requireLibrarian={true}>
            <Members />
          </PrivateRoute>
        } />
        <Route path="issues" element={
          <PrivateRoute requireLibrarian={true}>
            <Issues />
          </PrivateRoute>
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
