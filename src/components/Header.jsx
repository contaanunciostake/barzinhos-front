import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  User, 
  LogOut, 
  Settings, 
  Home, 
  PlusCircle,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin, isEstablishment } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Barzinhos</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary transition-colors flex items-center space-x-1"
            >
              <Home size={16} />
              <span>Início</span>
            </Link>
            
            {!isAuthenticated && (
              <Link 
                to="/cadastro" 
                className="text-gray-700 hover:text-primary transition-colors flex items-center space-x-1"
              >
                <PlusCircle size={16} />
                <span>Cadastrar Estabelecimento</span>
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User size={16} />
                    <span className="hidden sm:inline">
                      {user?.name || user?.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name || 'Usuário'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      {user?.role && (
                        <p className="text-xs text-primary font-medium">
                          {user.role === 'admin' ? 'Administrador' : 'Estabelecimento'}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {isAdmin() && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Painel Administrativo</span>
                    </DropdownMenuItem>
                  )}
                  
                  {isEstablishment() && (
                    <DropdownMenuItem onClick={() => navigate('/painel')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Meu Painel</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Entrar
                </Button>
                <Button onClick={() => navigate('/cadastro')}>
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

