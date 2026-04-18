import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Bridge } from './pages/Bridge';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/" />;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Bridge Page - No Navbar/Footer for immersion */}
          <Route path="/b/:slug" element={<Bridge />} />

          {/* Site Pages */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

