import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Header from './components/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import EstablishmentPanel from './pages/EstablishmentPanel.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<RegisterPage />} />
              
              {/* Rotas protegidas - Admin */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rotas protegidas - Estabelecimento */}
              <Route 
                path="/painel" 
                element={
                  <ProtectedRoute requireEstablishment={true}>
                    <EstablishmentPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rota de fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

